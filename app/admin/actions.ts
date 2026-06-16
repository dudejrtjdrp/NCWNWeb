'use server'

/**
 * Admin Server Actions
 * 인증 + 각 탭(Work / Article / Award / Project / Event / Exhibition / Types) CRUD
 *
 * 보안 강화 내역:
 * - requireAuth: getSession() → getUser() 교체 (JWT 서버 검증)
 * - ID 파라미터 UUID 형식 검증
 * - 파일 업로드: 크기(10MB)·MIME·확장자 검증
 * - 텍스트 필드 최대 길이 제한
 * - update 시 기존 스토리지 파일 삭제 (스토리지 비용 절감)
 * - Supabase 내부 오류 메시지 외부 노출 방지
 * - 뮤테이션 후 revalidateTag로 캐시 무효화
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath, revalidateTag } from 'next/cache'
import {
  assertValidUUID,
  validateFileUpload,
  checkTextLength,
} from '@/lib/server/validation'
import { logError } from '@/lib/server/logger'
// 이미지 스토리지: Cloudflare R2 (S3 호환). 단일 버킷(R2_BUCKET) + key prefix 모델.
// 기존 Supabase 버킷명(work-thumbnails / ncr-thumbnails / ninc-images)을 그대로 prefix로 사용한다.
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getR2Client, R2_BUCKET, buildPublicUrl, extractKeyFromUrl } from '@/lib/r2/client'
import { processImage, replaceExt } from '@/lib/server/image'
import { normalizeVideoEmbed } from '@/lib/youtube'

// 업로드 객체는 UUID 키라 내용이 불변 → 1년 immutable 캐시로 origin 부하 절감
const IMAGE_CACHE_CONTROL = 'public, max-age=31536000, immutable'

// ── 반환 타입 ─────────────────────────────────────────────
export type ActionResult = { success: true; redirectTo?: string } | { error: string }

// ── Auth ─────────────────────────────────────────────────

export async function signIn(_: unknown, formData: FormData): Promise<ActionResult> {
  const email    = (formData.get('email')    as string)?.trim()
  const password = (formData.get('password') as string)?.trim()

  if (!email || !password) return { error: '이메일과 비밀번호를 입력해주세요.' }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: '이메일 인증이 완료되지 않았습니다.' }
    }
    // Supabase 내부 메시지는 로그에만 남기고 사용자에게는 일반 메시지 반환
    logError('[signIn] 로그인 실패', error.message)
    return { error: '로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  return { success: true, redirectTo: '/admin' }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

// ── 인증 체크 헬퍼 ────────────────────────────────────────

/**
 * getUser()는 Supabase Auth 서버에 네트워크 요청을 보내 JWT를 직접 검증합니다.
 * getSession()은 쿠키 값을 그대로 신뢰하므로 변조된 세션을 걸러내지 못합니다.
 * Server Action에서 관리자 권한이 필요한 모든 작업은 반드시 getUser()를 사용합니다.
 */
async function requireAuth(supabase: ReturnType<typeof createClient>): Promise<{ error: string } | null> {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    // 세션 만료·갱신 실패 시 상세 로그 → 브라우저에는 일반 메시지만 노출
    logError('[requireAuth] getUser 오류:', error.message)
    // 세션 만료인 경우 별도 안내
    if (error.message.includes('session_not_found') || error.message.includes('invalid JWT')) {
      return { error: '세션이 만료되었습니다. 다시 로그인해주세요.' }
    }
    return { error: '인증이 필요합니다.' }
  }
  if (!user) return { error: '인증이 필요합니다.' }
  return null
}

// ── Storage 업로드 헬퍼 (Cloudflare R2) ───────────────────
//
// 단일 R2 버킷(R2_BUCKET) + key prefix 모델.
// 인자 `bucket`은 prefix로 사용되며, 실제 object key = `${bucket}/${path}` 가 된다.
// (예: work-thumbnails/2025/uuid.webp → 공개 URL: R2_PUBLIC_URL/work-thumbnails/2025/uuid.webp)
//
// 호출부 시그니처 호환을 위해 첫 인자로 supabase 클라이언트를 그대로 받지만,
// R2 업로드/삭제에는 사용하지 않는다(향후 호출부 정리 시 제거 가능).

/**
 * R2에 파일을 업로드하고 공개 URL을 반환합니다.
 * 실패 시 null을 반환합니다 (호출부에서 처리).
 */
async function uploadToStorage(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  path: string,
  file: File
): Promise<string | null> {
  void supabase // R2 경로에서는 미사용 (시그니처 호환용)
  // webp 변환·리사이즈 후 확장자를 결과 포맷으로 교체 (예: .png → .webp)
  const processed = await processImage(file)
  const key = `${bucket}/${replaceExt(path, processed.ext)}`
  try {
    await getR2Client().send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: processed.buffer,
        ContentType: processed.contentType,
        CacheControl: IMAGE_CACHE_CONTROL,
      })
    )

    return buildPublicUrl(key)
  } catch (err) {
    logError(`[R2] ${key} 업로드 실패:`, err)
    return null
  }
}

/**
 * 공개 URL로부터 R2 object key를 추출해 파일을 삭제합니다.
 * update 시 기존 파일 정리에 사용 (스토리지 비용 절감).
 * R2 URL이 아니거나(레거시 Supabase URL 등) 다른 prefix이면 안전하게 건너뜁니다.
 */
async function deleteFromStorage(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  publicUrl: string
): Promise<void> {
  void supabase // R2 경로에서는 미사용 (시그니처 호환용)
  try {
    const key = extractKeyFromUrl(publicUrl)
    if (!key || !key.startsWith(`${bucket}/`)) return // 다른 도메인/prefix이면 건너뜀
    await getR2Client().send(
      new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key })
    )
  } catch (err) {
    // 삭제 실패는 치명적이지 않으므로 경고만 기록
    logError(`[R2] 기존 파일 삭제 실패 (prefix: ${bucket})`, err)
  }
}

// ── 공통 파일 검증 ────────────────────────────────────────

function validateImage(file: File): string | null {
  return validateFileUpload(file, { maxSizeBytes: 10 * 1024 * 1024 })
}

// ── 작업물 카테고리(제작물 종류) ──────────────────────────
// 단일 선택. 각 카테고리마다 상세 페이지 템플릿과 입력 필드가 달라진다.
//   - video : 메인 영상(유튜브) 임베드
//   - design: 디자인 이미지 갤러리 (PDF 제외)
//   - 3d    : 3D 임베드(iframe)
const WORK_TYPES = ['video', 'design', '3d'] as const
type WorkType = (typeof WORK_TYPES)[number]

function parseWorkType(raw: string | null): WorkType {
  return WORK_TYPES.includes(raw as WorkType) ? (raw as WorkType) : 'design'
}

// 디자인 이미지: 최대 장수 / 장당 용량
const MAX_WORK_IMAGES = 10
const MAX_WORK_IMAGE_BYTES = 10 * 1024 * 1024 // 10MB (webp 변환으로 실제 저장 용량은 더 작음)

/**
 * 디자인 이미지 다중 업로드.
 * - 이미지 형식만 허용(PDF 등 제외) · 장당 용량 검증
 * - webp 변환 후 R2 업로드, 공개 URL 배열을 반환
 * 실패(검증 오류) 시 { error } 를 반환한다.
 */
async function uploadWorkImages(
  supabase: ReturnType<typeof createClient>,
  files: File[],
  year: number
): Promise<{ urls: string[] } | { error: string }> {
  const valid = files.filter((f) => f && f.size > 0).slice(0, MAX_WORK_IMAGES)
  const urls: string[] = []
  for (const file of valid) {
    const fileErr = validateFileUpload(file, { maxSizeBytes: MAX_WORK_IMAGE_BYTES })
    if (fileErr) return { error: `디자인 이미지 오류: ${fileErr}` }
    const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'webp'
    const path = `${year}/gallery/${crypto.randomUUID()}.${ext}`
    const url  = await uploadToStorage(supabase, 'work-thumbnails', path, file)
    if (url) urls.push(url)
  }
  return { urls }
}

/** 폼에서 전달된 유지(kept) 이미지 URL 목록을 파싱한다. (http(s)만 허용, 최대 MAX_WORK_IMAGES) */
function parseKeptImages(raw: string | null): string[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr
      .map((x) => String(x ?? '').trim())
      .filter((x) => /^https?:\/\//i.test(x))
      .slice(0, MAX_WORK_IMAGES)
  } catch {
    return []
  }
}

// ── 관련 링크 파싱 ────────────────────────────────────────
// 폼에서 JSON 문자열(`[{label,url}]`)로 전달받아 검증·정규화한다.
export interface RelatedLink { label: string; url: string }

function parseRelatedLinks(raw: string | null): RelatedLink[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr
      .map((x) => ({
        label: String(x?.label ?? '').trim().slice(0, 100),
        url: String(x?.url ?? '').trim().slice(0, 500),
      }))
      .filter((x) => /^https?:\/\//i.test(x.url)) // http(s) URL만 허용
      .slice(0, 10) // 최대 10개
  } catch {
    return []
  }
}

// ── 아티클 본문 인라인 이미지 업로드 ──────────────────────
// 블로그형 에디터에서 본문 중간에 삽입하는 이미지를 업로드하고 URL을 반환한다.
export async function uploadArticleImage(
  formData: FormData
): Promise<{ url: string } | { error: string }> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { error: '파일이 없습니다.' }

  const fileErr = validateImage(file)
  if (fileErr) return { error: fileErr }

  // 본문 인라인 이미지도 webp 변환 후 R2로 업로드 (prefix: ncr-thumbnails/content/)
  const processed = await processImage(file)
  const key = `ncr-thumbnails/content/${crypto.randomUUID()}.${processed.ext}`

  // 실제 스토리지 오류 메시지를 그대로 노출 (권한/자격증명 등 진단용)
  try {
    await getR2Client().send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: processed.buffer,
        ContentType: processed.contentType,
        CacheControl: IMAGE_CACHE_CONTROL,
      })
    )
    return { url: buildPublicUrl(key) }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logError('[uploadArticleImage] 예외', msg)
    return { error: `이미지 업로드 예외: ${msg}` }
  }
}

// ════════════════════════════════════════════════════════
// WORK
// ════════════════════════════════════════════════════════

export async function saveWork(_: unknown, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const title          = (formData.get('title')          as string)?.trim()
  const title_en       = (formData.get('title_en')       as string)?.trim()
  const author         = (formData.get('author')         as string)?.trim()
  const yearStr        = formData.get('year')             as string
  const description    = (formData.get('description')    as string)?.trim()
  const description_en = (formData.get('description_en') as string)?.trim()
  const techRaw        = (formData.get('tech_stack')     as string)?.trim()
  const thumbnail      = formData.get('thumbnail')       as File | null
  const related_links  = parseRelatedLinks(formData.get('related_links') as string | null)
  const type           = parseWorkType(formData.get('type') as string | null)
  const videoEmbedRaw  = (formData.get('video_embed')    as string)?.trim()
  const modelEmbedRaw  = (formData.get('model_embed')    as string)?.trim()
  const imageFiles     = formData.getAll('images').filter((v): v is File => v instanceof File)

  if (!title)  return { error: '작품명은 필수입니다.' }
  if (!author) return { error: '작가명은 필수입니다.' }

  const titleErr = checkTextLength(title, 'title', '작품명')
  if (titleErr) return { error: titleErr }
  const authorErr = checkTextLength(author, 'author', '작가명')
  if (authorErr) return { error: authorErr }
  const descErr = checkTextLength(description, 'description', '설명')
  if (descErr) return { error: descErr }

  const year = parseInt(yearStr)
  if (!year || year < 2000 || year > 2100) return { error: '연도를 올바르게 입력해주세요.' }

  if (thumbnail && thumbnail.size > 0) {
    const fileErr = validateImage(thumbnail)
    if (fileErr) return { error: fileErr }
  }

  const tech_stack = techRaw
    ? techRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  let thumbnail_url: string | null = null
  if (thumbnail && thumbnail.size > 0) {
    const ext  = thumbnail.name.split('.').pop()?.toLowerCase() ?? 'webp'
    const path = `${year}/${crypto.randomUUID()}.${ext}`
    thumbnail_url = await uploadToStorage(supabase, 'work-thumbnails', path, thumbnail)
  }

  // 카테고리(제작물 종류)별 미디어 데이터 — 선택된 타입에 해당하는 필드만 채운다.
  let video_embed: string | null = null
  let model_embed: string | null = null
  let images: string[] = []

  if (type === 'video') {
    video_embed = normalizeVideoEmbed(videoEmbedRaw)
  } else if (type === '3d') {
    model_embed = modelEmbedRaw ? modelEmbedRaw.slice(0, 1000) : null
  } else if (type === 'design') {
    const uploaded = await uploadWorkImages(supabase, imageFiles, year)
    if ('error' in uploaded) return { error: uploaded.error }
    images = uploaded.urls
  }

  const { error } = await supabase.from('showcase_works').insert({
    title, author, year, type,
    description:    description || null,
    title_en:       title_en || null,
    description_en: description_en || null,
    tech_stack,
    related_links,
    thumbnail_url,
    video_embed,
    model_embed,
    images,
    view_count: 0,
  })

  if (error) {
    logError('[saveWork] DB 저장 실패', error.message)
    return { error: '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  revalidatePath('/work/showcase')
  revalidateTag('works')
  return { success: true }
}

export async function updateWork(id: string, formData: FormData): Promise<ActionResult> {
  assertValidUUID(id, '작품 ID')

  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const title          = (formData.get('title')          as string)?.trim()
  const title_en       = (formData.get('title_en')       as string)?.trim()
  const author         = (formData.get('author')         as string)?.trim()
  const yearStr        = formData.get('year')             as string
  const description    = (formData.get('description')    as string)?.trim()
  const description_en = (formData.get('description_en') as string)?.trim()
  const techRaw        = (formData.get('tech_stack')     as string)?.trim()
  const thumbnail      = formData.get('thumbnail')       as File | null
  const related_links  = parseRelatedLinks(formData.get('related_links') as string | null)
  const type           = parseWorkType(formData.get('type') as string | null)
  const videoEmbedRaw  = (formData.get('video_embed')    as string)?.trim()
  const modelEmbedRaw  = (formData.get('model_embed')    as string)?.trim()
  const keptImages     = parseKeptImages(formData.get('kept_images') as string | null)
  const imageFiles     = formData.getAll('images').filter((v): v is File => v instanceof File)

  if (!title)  return { error: '작품명은 필수입니다.' }
  if (!author) return { error: '작가명은 필수입니다.' }

  const titleErr = checkTextLength(title, 'title', '작품명')
  if (titleErr) return { error: titleErr }
  const descErr = checkTextLength(description, 'description', '설명')
  if (descErr) return { error: descErr }

  const year = parseInt(yearStr)
  if (!year || year < 2000 || year > 2100) return { error: '연도를 올바르게 입력해주세요.' }

  if (thumbnail && thumbnail.size > 0) {
    const fileErr = validateImage(thumbnail)
    if (fileErr) return { error: fileErr }
  }

  const tech_stack = techRaw
    ? techRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const updateData: Record<string, unknown> = {
    title, author, year, type, tech_stack, related_links,
    description:    description || null,
    title_en:       title_en || null,
    description_en: description_en || null,
  }

  if (thumbnail && thumbnail.size > 0) {
    // 기존 썸네일 조회 후 삭제
    const { data: existing } = await supabase
      .from('showcase_works').select('thumbnail_url').eq('id', id).single()
    if (existing?.thumbnail_url) {
      await deleteFromStorage(supabase, 'work-thumbnails', existing.thumbnail_url)
    }

    const ext  = thumbnail.name.split('.').pop()?.toLowerCase() ?? 'webp'
    const path = `${year}/${crypto.randomUUID()}.${ext}`
    const url  = await uploadToStorage(supabase, 'work-thumbnails', path, thumbnail)
    if (url) updateData.thumbnail_url = url
  }

  // 카테고리(제작물 종류)별 미디어 데이터 — 선택된 타입의 필드만 갱신, 나머지는 비운다.
  if (type === 'video') {
    updateData.video_embed = normalizeVideoEmbed(videoEmbedRaw)
    updateData.model_embed = null
    updateData.images = []
  } else if (type === '3d') {
    updateData.model_embed = modelEmbedRaw ? modelEmbedRaw.slice(0, 1000) : null
    updateData.video_embed = null
    updateData.images = []
  } else if (type === 'design') {
    // 유지(kept) 이미지 + 새 업로드 이미지를 합쳐 최대 MAX_WORK_IMAGES 개
    const uploaded = await uploadWorkImages(supabase, imageFiles, year)
    if ('error' in uploaded) return { error: uploaded.error }
    const finalImages = [...keptImages, ...uploaded.urls].slice(0, MAX_WORK_IMAGES)

    // 제거된 기존 이미지는 스토리지에서 정리
    const { data: existing } = await supabase
      .from('showcase_works').select('images').eq('id', id).single()
    const prevImages = Array.isArray(existing?.images) ? (existing!.images as string[]) : []
    const removed = prevImages.filter((u) => !finalImages.includes(u))
    for (const url of removed) {
      await deleteFromStorage(supabase, 'work-thumbnails', url)
    }

    updateData.images = finalImages
    updateData.video_embed = null
    updateData.model_embed = null
  }

  const { error } = await supabase.from('showcase_works').update(updateData).eq('id', id)
  if (error) {
    logError('[updateWork] DB 수정 실패', error.message)
    return { error: '수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  revalidatePath('/work/showcase')
  revalidateTag('works')
  return { success: true }
}

export async function deleteWork(id: string): Promise<ActionResult> {
  assertValidUUID(id, '작품 ID')

  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  // 스토리지 파일도 함께 삭제 (썸네일 + 디자인 갤러리 이미지)
  const { data: existing } = await supabase
    .from('showcase_works').select('thumbnail_url, images').eq('id', id).single()
  if (existing?.thumbnail_url) {
    await deleteFromStorage(supabase, 'work-thumbnails', existing.thumbnail_url)
  }
  if (Array.isArray(existing?.images)) {
    for (const url of existing!.images as string[]) {
      await deleteFromStorage(supabase, 'work-thumbnails', url)
    }
  }

  const { error } = await supabase.from('showcase_works').delete().eq('id', id)
  if (error) {
    logError('[deleteWork] DB 삭제 실패', error.message)
    return { error: '삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  revalidatePath('/work/showcase')
  revalidateTag('works')
  return { success: true }
}

// ════════════════════════════════════════════════════════
// NCR 아티클
// ════════════════════════════════════════════════════════

export async function saveArticle(_: unknown, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const title          = (formData.get('title')          as string)?.trim()
  const title_en       = (formData.get('title_en')       as string)?.trim()
  const author         = (formData.get('author')         as string)?.trim()
  const type           = formData.get('type')             as string
  const season         = (formData.get('season')         as string)?.trim()
  const published_at   = formData.get('published_at')    as string
  const excerpt        = (formData.get('excerpt')        as string)?.trim()
  const excerpt_en     = (formData.get('excerpt_en')     as string)?.trim()
  const description_en = (formData.get('description_en') as string)?.trim()
  const content        = (formData.get('content')        as string)?.trim()
  const content_en     = (formData.get('content_en')     as string)?.trim()
  const tagsRaw        = (formData.get('tags')           as string)?.trim()
  const relatedRaw     = (formData.get('related_ids')    as string)?.trim()
  const thumbnail      = formData.get('thumbnail')       as File | null

  if (!title)        return { error: '제목은 필수입니다.' }
  if (!published_at) return { error: '발행일은 필수입니다.' }

  const titleErr   = checkTextLength(title,   'title',   '제목')
  if (titleErr)   return { error: titleErr }
  const excerptErr = checkTextLength(excerpt, 'excerpt', '요약')
  if (excerptErr) return { error: excerptErr }
  const contentErr = checkTextLength(content, 'content', '본문')
  if (contentErr) return { error: contentErr }

  if (thumbnail && thumbnail.size > 0) {
    const fileErr = validateImage(thumbnail)
    if (fileErr) return { error: fileErr }
  }

  // 날짜 파싱 검증
  const publishedDate = new Date(published_at)
  if (isNaN(publishedDate.getTime())) return { error: '발행일 형식이 올바르지 않습니다.' }

  const tags = tagsRaw
    ? tagsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const related_ids = relatedRaw
    ? relatedRaw.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 2)
    : []

  let thumbnail_url: string | null = null
  if (thumbnail && thumbnail.size > 0) {
    const seasonSlug = season ? season.replace(/\s+/g, '-').toLowerCase() : 'etc'
    const ext  = thumbnail.name.split('.').pop()?.toLowerCase() ?? 'webp'
    const path = `${seasonSlug}/${crypto.randomUUID()}.${ext}`
    thumbnail_url = await uploadToStorage(supabase, 'ncr-thumbnails', path, thumbnail)
  }

  const { error } = await supabase.from('ncr_reports').insert({
    title,
    title_en:       title_en || null,
    author:         author || null,
    type:           type || 'editorial',
    season:         season || null,
    published_at:   publishedDate.toISOString(),
    excerpt:        excerpt || null,
    excerpt_en:     excerpt_en || null,
    description_en: description_en || null,
    content:        content || null,
    content_en:     content_en || null,
    tags,
    related_ids,
    thumbnail_url,
    is_published: true,
  })

  if (error) {
    logError('[saveArticle] DB 저장 실패', error.message)
    return { error: `저장 실패: ${error.message}` }
  }

  revalidatePath('/ncr-trend/latest')
  revalidatePath('/')
  revalidateTag('ncr')
  revalidateTag('home')
  return { success: true }
}

export async function updateArticle(id: string, formData: FormData): Promise<ActionResult> {
  assertValidUUID(id, '아티클 ID')

  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const title          = (formData.get('title')          as string)?.trim()
  const title_en       = (formData.get('title_en')       as string)?.trim()
  const author         = (formData.get('author')         as string)?.trim()
  const type           = formData.get('type')             as string
  const season         = (formData.get('season')         as string)?.trim()
  const published_at   = formData.get('published_at')    as string
  const excerpt        = (formData.get('excerpt')        as string)?.trim()
  const excerpt_en     = (formData.get('excerpt_en')     as string)?.trim()
  const description_en = (formData.get('description_en') as string)?.trim()
  const content        = (formData.get('content')        as string)?.trim()
  const content_en     = (formData.get('content_en')     as string)?.trim()
  const tagsRaw        = (formData.get('tags')           as string)?.trim()
  const relatedRaw     = (formData.get('related_ids')    as string)?.trim()
  const thumbnail      = formData.get('thumbnail')       as File | null

  if (!title)        return { error: '제목은 필수입니다.' }
  if (!published_at) return { error: '발행일은 필수입니다.' }

  const titleErr   = checkTextLength(title,   'title',   '제목')
  if (titleErr)   return { error: titleErr }
  const excerptErr = checkTextLength(excerpt, 'excerpt', '요약')
  if (excerptErr) return { error: excerptErr }
  const contentErr = checkTextLength(content, 'content', '본문')
  if (contentErr) return { error: contentErr }

  if (thumbnail && thumbnail.size > 0) {
    const fileErr = validateImage(thumbnail)
    if (fileErr) return { error: fileErr }
  }

  const publishedDate = new Date(published_at)
  if (isNaN(publishedDate.getTime())) return { error: '발행일 형식이 올바르지 않습니다.' }

  const tags = tagsRaw
    ? tagsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const related_ids = relatedRaw
    ? relatedRaw.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 2)
    : []

  const updateData: Record<string, unknown> = {
    title,
    title_en:       title_en || null,
    author:         author || null,
    type:           type || 'editorial',
    season:         season || null,
    published_at:   publishedDate.toISOString(),
    excerpt:        excerpt || null,
    excerpt_en:     excerpt_en || null,
    description_en: description_en || null,
    content:        content || null,
    content_en:     content_en || null,
    tags,
    related_ids,
  }

  if (thumbnail && thumbnail.size > 0) {
    const { data: existing } = await supabase
      .from('ncr_reports').select('thumbnail_url').eq('id', id).single()
    if (existing?.thumbnail_url) {
      await deleteFromStorage(supabase, 'ncr-thumbnails', existing.thumbnail_url)
    }

    const seasonSlug = season ? season.replace(/\s+/g, '-').toLowerCase() : 'etc'
    const ext  = thumbnail.name.split('.').pop()?.toLowerCase() ?? 'webp'
    const path = `${seasonSlug}/${crypto.randomUUID()}.${ext}`
    const url  = await uploadToStorage(supabase, 'ncr-thumbnails', path, thumbnail)
    if (url) updateData.thumbnail_url = url
  }

  const { error } = await supabase.from('ncr_reports').update(updateData).eq('id', id)
  if (error) {
    logError('[updateArticle] DB 수정 실패', error.message)
    return { error: `수정 실패: ${error.message}` }
  }

  revalidatePath('/ncr-trend/latest')
  revalidatePath('/')
  revalidateTag('ncr')
  revalidateTag('home')
  return { success: true }
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  assertValidUUID(id, '아티클 ID')

  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const { data: existing } = await supabase
    .from('ncr_reports').select('thumbnail_url').eq('id', id).single()
  if (existing?.thumbnail_url) {
    await deleteFromStorage(supabase, 'ncr-thumbnails', existing.thumbnail_url)
  }

  const { error } = await supabase.from('ncr_reports').delete().eq('id', id)
  if (error) {
    logError('[deleteArticle] DB 삭제 실패', error.message)
    return { error: '삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  revalidatePath('/ncr-trend/latest')
  revalidatePath('/')
  revalidateTag('ncr')
  revalidateTag('home')
  return { success: true }
}

/** 홈 노출 아티클 설정 — is_home_featured 플래그 토글 */
export async function setHomeFeaturedArticle(id: string, featured: boolean): Promise<ActionResult> {
  assertValidUUID(id, '아티클 ID')

  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  if (featured) {
    const { data: current, error: countError } = await supabase
      .from('ncr_reports')
      .select('id')
      .eq('is_home_featured', true)
      .neq('id', id)

    if (countError) {
      if (countError.message.includes('does not exist')) {
        return { error: 'is_home_featured 컬럼이 없습니다. Supabase SQL Editor에서 마이그레이션을 먼저 실행해주세요.' }
      }
      logError('[setHomeFeaturedArticle] 조회 실패', countError.message)
      return { error: '처리 중 오류가 발생했습니다.' }
    }

    if (current && current.length >= 2) {
      return { error: '홈에는 최대 2개의 아티클만 고정할 수 있습니다. 먼저 다른 아티클의 고정을 해제해주세요.' }
    }
  }

  const { error } = await supabase
    .from('ncr_reports')
    .update({ is_home_featured: featured })
    .eq('id', id)

  if (error) {
    if (error.message.includes('does not exist')) {
      return { error: 'is_home_featured 컬럼이 없습니다. Supabase SQL Editor에서 마이그레이션을 먼저 실행해주세요.' }
    }
    logError('[setHomeFeaturedArticle] 설정 실패', error.message)
    return { error: '설정 중 오류가 발생했습니다.' }
  }

  revalidatePath('/')
  revalidateTag('home')
  return { success: true }
}

// ════════════════════════════════════════════════════════
// 수상
// ════════════════════════════════════════════════════════

export async function saveAward(_: unknown, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const competition    = (formData.get('competition')    as string)?.trim()
  const competition_en = (formData.get('competition_en') as string)?.trim()
  const award_name     = (formData.get('award_name')     as string)?.trim()
  const award_name_en  = (formData.get('award_name_en')  as string)?.trim()
  const hosted_by_en   = (formData.get('hosted_by_en')   as string)?.trim()
  const winner         = (formData.get('winner')         as string)?.trim()
  const teamRaw        = (formData.get('team_members')   as string)?.trim()
  const yearStr        = formData.get('year')             as string
  const description    = (formData.get('description')    as string)?.trim()
  const description_en = (formData.get('description_en') as string)?.trim()
  const thumbnail      = formData.get('thumbnail')       as File | null

  if (!competition) return { error: '대회명은 필수입니다.' }
  if (!award_name)  return { error: '수상 등급을 선택해주세요.' }

  const compErr = checkTextLength(competition, 'competition', '대회명')
  if (compErr) return { error: compErr }
  const descErr = checkTextLength(description, 'description', '설명')
  if (descErr) return { error: descErr }

  const year = parseInt(yearStr)
  if (!year || year < 2000 || year > 2100) return { error: '수상 연도를 올바르게 입력해주세요.' }

  if (thumbnail && thumbnail.size > 0) {
    const fileErr = validateImage(thumbnail)
    if (fileErr) return { error: fileErr }
  }

  const team_members = teamRaw
    ? teamRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : winner ? [winner] : []

  let thumbnail_url: string | null = null
  if (thumbnail && thumbnail.size > 0) {
    const ext  = thumbnail.name.split('.').pop()?.toLowerCase() ?? 'webp'
    const path = `awards/${crypto.randomUUID()}.${ext}`
    thumbnail_url = await uploadToStorage(supabase, 'ninc-images', path, thumbnail)
  }

  const { error } = await supabase.from('awards').insert({
    competition, award_name,
    competition_en:  competition_en || null,
    award_name_en:   award_name_en || null,
    hosted_by_en:    hosted_by_en || null,
    winner:          winner || null,
    team_members, year,
    description:     description || null,
    description_en:  description_en || null,
    thumbnail_url,
  })

  if (error) {
    logError('[saveAward] DB 저장 실패', error.message)
    return { error: '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  revalidatePath('/ninc/awards')
  revalidateTag('awards')
  return { success: true }
}

export async function updateAward(id: string, formData: FormData): Promise<ActionResult> {
  assertValidUUID(id, '수상 ID')

  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const competition    = (formData.get('competition')    as string)?.trim()
  const competition_en = (formData.get('competition_en') as string)?.trim()
  const award_name     = (formData.get('award_name')     as string)?.trim()
  const award_name_en  = (formData.get('award_name_en')  as string)?.trim()
  const hosted_by_en   = (formData.get('hosted_by_en')   as string)?.trim()
  const winner         = (formData.get('winner')         as string)?.trim()
  const teamRaw        = (formData.get('team_members')   as string)?.trim()
  const yearStr        = formData.get('year')             as string
  const description    = (formData.get('description')    as string)?.trim()
  const description_en = (formData.get('description_en') as string)?.trim()
  const thumbnail      = formData.get('thumbnail')       as File | null

  if (!competition) return { error: '대회명은 필수입니다.' }
  if (!award_name)  return { error: '수상 등급을 선택해주세요.' }

  const compErr = checkTextLength(competition, 'competition', '대회명')
  if (compErr) return { error: compErr }
  const descErr = checkTextLength(description, 'description', '설명')
  if (descErr) return { error: descErr }

  const year = parseInt(yearStr)
  if (!year || year < 2000 || year > 2100) return { error: '수상 연도를 올바르게 입력해주세요.' }

  if (thumbnail && thumbnail.size > 0) {
    const fileErr = validateImage(thumbnail)
    if (fileErr) return { error: fileErr }
  }

  const team_members = teamRaw
    ? teamRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : winner ? [winner] : []

  const updateData: Record<string, unknown> = {
    competition, award_name,
    competition_en:  competition_en || null,
    award_name_en:   award_name_en || null,
    hosted_by_en:    hosted_by_en || null,
    winner:          winner || null,
    team_members, year,
    description:     description || null,
    description_en:  description_en || null,
  }

  if (thumbnail && thumbnail.size > 0) {
    const { data: existing } = await supabase
      .from('awards').select('thumbnail_url').eq('id', id).single()
    if (existing?.thumbnail_url) {
      await deleteFromStorage(supabase, 'ninc-images', existing.thumbnail_url)
    }
    const ext  = thumbnail.name.split('.').pop()?.toLowerCase() ?? 'webp'
    const path = `awards/${crypto.randomUUID()}.${ext}`
    const url  = await uploadToStorage(supabase, 'ninc-images', path, thumbnail)
    if (url) updateData.thumbnail_url = url
  }

  const { error } = await supabase.from('awards').update(updateData).eq('id', id)
  if (error) {
    logError('[updateAward] DB 수정 실패', error.message)
    return { error: '수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  revalidatePath('/ninc/awards')
  revalidateTag('awards')
  return { success: true }
}

export async function deleteAward(id: string): Promise<ActionResult> {
  assertValidUUID(id, '수상 ID')

  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const { data: existing } = await supabase
    .from('awards').select('thumbnail_url').eq('id', id).single()
  if (existing?.thumbnail_url) {
    await deleteFromStorage(supabase, 'ninc-images', existing.thumbnail_url)
  }

  const { error } = await supabase.from('awards').delete().eq('id', id)
  if (error) {
    logError('[deleteAward] DB 삭제 실패', error.message)
    return { error: '삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  revalidatePath('/ninc/awards')
  revalidateTag('awards')
  return { success: true }
}

// ════════════════════════════════════════════════════════
// 프로젝트
// ════════════════════════════════════════════════════════

export async function saveProject(_: unknown, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const title          = (formData.get('title')          as string)?.trim()
  const title_en       = (formData.get('title_en')       as string)?.trim()
  const type           = formData.get('type')             as string
  const partner        = (formData.get('partner')        as string)?.trim()
  const yearStr        = formData.get('year')             as string
  const description    = (formData.get('description')    as string)?.trim()
  const description_en = (formData.get('description_en') as string)?.trim()
  const outcome_en     = (formData.get('outcome_en')     as string)?.trim()
  const thumbnail      = formData.get('thumbnail')       as File | null

  if (!title) return { error: '프로젝트명은 필수입니다.' }

  const titleErr = checkTextLength(title, 'title', '프로젝트명')
  if (titleErr) return { error: titleErr }
  const descErr  = checkTextLength(description, 'description', '설명')
  if (descErr)  return { error: descErr }

  const year = parseInt(yearStr)
  if (!year || year < 2000 || year > 2100) return { error: '연도를 올바르게 입력해주세요.' }

  if (thumbnail && thumbnail.size > 0) {
    const fileErr = validateImage(thumbnail)
    if (fileErr) return { error: fileErr }
  }

  let thumbnail_url: string | null = null
  if (thumbnail && thumbnail.size > 0) {
    const ext  = thumbnail.name.split('.').pop()?.toLowerCase() ?? 'webp'
    const path = `projects/${crypto.randomUUID()}.${ext}`
    thumbnail_url = await uploadToStorage(supabase, 'ninc-images', path, thumbnail)
  }

  const { error } = await supabase.from('projects').insert({
    title,
    title_en:       title_en || null,
    type:           type || 'industry',
    partner:        partner || null,
    year,
    description:    description || null,
    description_en: description_en || null,
    outcome_en:     outcome_en || null,
    thumbnail_url,
  })

  if (error) {
    logError('[saveProject] DB 저장 실패', error.message)
    return { error: '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  revalidatePath('/ninc/project')
  revalidatePath('/')
  revalidateTag('projects')
  return { success: true }
}

export async function updateProject(id: string, formData: FormData): Promise<ActionResult> {
  assertValidUUID(id, '프로젝트 ID')

  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const title          = (formData.get('title')          as string)?.trim()
  const title_en       = (formData.get('title_en')       as string)?.trim()
  const type           = formData.get('type')             as string
  const partner        = (formData.get('partner')        as string)?.trim()
  const yearStr        = formData.get('year')             as string
  const duration       = (formData.get('duration')       as string)?.trim()
  const description    = (formData.get('description')    as string)?.trim()
  const description_en = (formData.get('description_en') as string)?.trim()
  const outcome_en     = (formData.get('outcome_en')     as string)?.trim()
  const thumbnail      = formData.get('thumbnail')       as File | null

  if (!title) return { error: '프로젝트명은 필수입니다.' }

  const titleErr = checkTextLength(title, 'title', '프로젝트명')
  if (titleErr) return { error: titleErr }
  const descErr  = checkTextLength(description, 'description', '설명')
  if (descErr)  return { error: descErr }

  const year = parseInt(yearStr)
  if (!year || year < 2000 || year > 2100) return { error: '연도를 올바르게 입력해주세요.' }

  if (thumbnail && thumbnail.size > 0) {
    const fileErr = validateImage(thumbnail)
    if (fileErr) return { error: fileErr }
  }

  const updateData: Record<string, unknown> = {
    title,
    title_en:       title_en || null,
    type:           type || 'industry',
    partner:        partner || null,
    year,
    duration:       duration || null,
    description:    description || null,
    description_en: description_en || null,
    outcome_en:     outcome_en || null,
  }

  if (thumbnail && thumbnail.size > 0) {
    const { data: existing } = await supabase
      .from('projects').select('thumbnail_url').eq('id', id).single()
    if (existing?.thumbnail_url) {
      await deleteFromStorage(supabase, 'ninc-images', existing.thumbnail_url)
    }
    const ext  = thumbnail.name.split('.').pop()?.toLowerCase() ?? 'webp'
    const path = `projects/${crypto.randomUUID()}.${ext}`
    const url  = await uploadToStorage(supabase, 'ninc-images', path, thumbnail)
    if (url) updateData.thumbnail_url = url
  }

  const { error } = await supabase.from('projects').update(updateData).eq('id', id)
  if (error) {
    logError('[updateProject] DB 수정 실패', error.message)
    return { error: '수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  revalidatePath('/ninc/project')
  revalidatePath('/')
  revalidateTag('projects')
  return { success: true }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  assertValidUUID(id, '프로젝트 ID')

  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const { data: existing } = await supabase
    .from('projects').select('thumbnail_url').eq('id', id).single()
  if (existing?.thumbnail_url) {
    await deleteFromStorage(supabase, 'ninc-images', existing.thumbnail_url)
  }

  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) {
    logError('[deleteProject] DB 삭제 실패', error.message)
    return { error: '삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  revalidatePath('/ninc/project')
  revalidatePath('/')
  revalidateTag('projects')
  return { success: true }
}

// ════════════════════════════════════════════════════════
// 이벤트
// ════════════════════════════════════════════════════════

export async function saveEvent(_: unknown, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const title          = (formData.get('title')          as string)?.trim()
  const title_en       = (formData.get('title_en')       as string)?.trim()
  const type           = formData.get('type')             as string
  const start_date     = formData.get('start_date')      as string
  const end_date       = formData.get('end_date')        as string
  const location       = (formData.get('location')       as string)?.trim()
  const description    = (formData.get('description')    as string)?.trim()
  const description_en = (formData.get('description_en') as string)?.trim()

  if (!title)      return { error: '이벤트 제목은 필수입니다.' }
  if (!start_date) return { error: '시작일은 필수입니다.' }

  const titleErr = checkTextLength(title, 'title', '제목')
  if (titleErr) return { error: titleErr }
  const descErr  = checkTextLength(description, 'description', '설명')
  if (descErr)  return { error: descErr }

  const startDateObj = new Date(start_date)
  if (isNaN(startDateObj.getTime())) return { error: '시작일 형식이 올바르지 않습니다.' }

  let endDateISO: string | null = null
  if (end_date) {
    const endDateObj = new Date(end_date)
    if (isNaN(endDateObj.getTime())) return { error: '종료일 형식이 올바르지 않습니다.' }
    endDateISO = endDateObj.toISOString()
  }

  const { error } = await supabase.from('events').insert({
    title,
    title_en:       title_en || null,
    type:           type || '기타',
    start_date:     startDateObj.toISOString(),
    end_date:       endDateISO,
    location:       location || null,
    description:    description || null,
    description_en: description_en || null,
    is_published: true,
  })

  if (error) {
    logError('[saveEvent] DB 저장 실패', error.message)
    return { error: '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  revalidatePath('/ninc/event')
  revalidateTag('events')
  return { success: true }
}

export async function updateEvent(id: string, formData: FormData): Promise<ActionResult> {
  assertValidUUID(id, '이벤트 ID')

  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const title          = (formData.get('title')          as string)?.trim()
  const title_en       = (formData.get('title_en')       as string)?.trim()
  const type           = formData.get('type')             as string
  const start_date     = formData.get('start_date')      as string
  const end_date       = formData.get('end_date')        as string
  const location       = (formData.get('location')       as string)?.trim()
  const description    = (formData.get('description')    as string)?.trim()
  const description_en = (formData.get('description_en') as string)?.trim()

  if (!title)      return { error: '이벤트 제목은 필수입니다.' }
  if (!start_date) return { error: '시작일은 필수입니다.' }

  const titleErr = checkTextLength(title, 'title', '제목')
  if (titleErr) return { error: titleErr }
  const descErr  = checkTextLength(description, 'description', '설명')
  if (descErr)  return { error: descErr }

  const startDateObj = new Date(start_date)
  if (isNaN(startDateObj.getTime())) return { error: '시작일 형식이 올바르지 않습니다.' }

  let endDateISO: string | null = null
  if (end_date) {
    const endDateObj = new Date(end_date)
    if (isNaN(endDateObj.getTime())) return { error: '종료일 형식이 올바르지 않습니다.' }
    endDateISO = endDateObj.toISOString()
  }

  const { error } = await supabase.from('events').update({
    title,
    title_en:       title_en || null,
    type:           type || '기타',
    start_date:     startDateObj.toISOString(),
    end_date:       endDateISO,
    location:       location || null,
    description:    description || null,
    description_en: description_en || null,
  }).eq('id', id)

  if (error) {
    logError('[updateEvent] DB 수정 실패', error.message)
    return { error: '수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  revalidatePath('/ninc/event')
  revalidateTag('events')
  return { success: true }
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  assertValidUUID(id, '이벤트 ID')

  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) {
    logError('[deleteEvent] DB 삭제 실패', error.message)
    return { error: '삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  revalidatePath('/ninc/event')
  revalidateTag('events')
  return { success: true }
}

// ════════════════════════════════════════════════════════
// 졸업전시 (Exhibition)
// ════════════════════════════════════════════════════════

export async function saveExhibition(_: unknown, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const title       = (formData.get('title')       as string)?.trim()
  const yearStr     = formData.get('year')          as string
  const description = (formData.get('description') as string)?.trim()
  const theme       = (formData.get('theme')       as string)?.trim()
  const link        = (formData.get('link')        as string)?.trim()
  const poster      = formData.get('poster')       as File | null

  if (!title) return { error: '전시 제목은 필수입니다.' }

  const titleErr = checkTextLength(title, 'title', '제목')
  if (titleErr) return { error: titleErr }
  const descErr  = checkTextLength(description, 'description', '설명')
  if (descErr)  return { error: descErr }

  const year = parseInt(yearStr)
  if (!year || year < 2000 || year > 2100) return { error: '연도를 올바르게 입력해주세요.' }

  if (poster && poster.size > 0) {
    const fileErr = validateImage(poster)
    if (fileErr) return { error: fileErr }
  }

  let poster_url: string | null = null
  if (poster && poster.size > 0) {
    const ext  = poster.name.split('.').pop()?.toLowerCase() ?? 'webp'
    const path = `exhibitions/${year}/${crypto.randomUUID()}.${ext}`
    poster_url = await uploadToStorage(supabase, 'ninc-images', path, poster)
  }

  const { error } = await supabase.from('exhibitions').insert({
    title, year,
    description: description || null,
    theme:       theme || null,
    link:        link || null,
    poster_url,
  })

  if (error) {
    logError('[saveExhibition] DB 저장 실패', error.message)
    return { error: '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  revalidatePath('/work/exhibition')
  revalidateTag('exhibitions')
  return { success: true }
}

export async function updateExhibition(id: string, formData: FormData): Promise<ActionResult> {
  assertValidUUID(id, '전시 ID')

  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const title       = (formData.get('title')       as string)?.trim()
  const yearStr     = formData.get('year')          as string
  const description = (formData.get('description') as string)?.trim()
  const theme       = (formData.get('theme')       as string)?.trim()
  const link        = (formData.get('link')        as string)?.trim()
  const poster      = formData.get('poster')       as File | null

  if (!title) return { error: '전시 제목은 필수입니다.' }

  const titleErr = checkTextLength(title, 'title', '제목')
  if (titleErr) return { error: titleErr }
  const descErr  = checkTextLength(description, 'description', '설명')
  if (descErr)  return { error: descErr }

  const year = parseInt(yearStr)
  if (!year || year < 2000 || year > 2100) return { error: '연도를 올바르게 입력해주세요.' }

  if (poster && poster.size > 0) {
    const fileErr = validateImage(poster)
    if (fileErr) return { error: fileErr }
  }

  const updateData: Record<string, unknown> = {
    title, year,
    description: description || null,
    theme:       theme || null,
    link:        link || null,
  }

  if (poster && poster.size > 0) {
    const { data: existing } = await supabase
      .from('exhibitions').select('poster_url').eq('id', id).single()
    if (existing?.poster_url) {
      await deleteFromStorage(supabase, 'ninc-images', existing.poster_url)
    }
    const ext  = poster.name.split('.').pop()?.toLowerCase() ?? 'webp'
    const path = `exhibitions/${year}/${crypto.randomUUID()}.${ext}`
    const url  = await uploadToStorage(supabase, 'ninc-images', path, poster)
    if (url) updateData.poster_url = url
  }

  const { error } = await supabase.from('exhibitions').update(updateData).eq('id', id)
  if (error) {
    logError('[updateExhibition] DB 수정 실패', error.message)
    return { error: '수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  revalidatePath('/work/exhibition')
  revalidateTag('exhibitions')
  return { success: true }
}

export async function deleteExhibition(id: string): Promise<ActionResult> {
  assertValidUUID(id, '전시 ID')

  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const { data: existing } = await supabase
    .from('exhibitions').select('poster_url').eq('id', id).single()
  if (existing?.poster_url) {
    await deleteFromStorage(supabase, 'ninc-images', existing.poster_url)
  }

  const { error } = await supabase.from('exhibitions').delete().eq('id', id)
  if (error) {
    logError('[deleteExhibition] DB 삭제 실패', error.message)
    return { error: '삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  revalidatePath('/work/exhibition')
  revalidateTag('exhibitions')
  return { success: true }
}

// ════════════════════════════════════════════════════════
// 설정 (settings 테이블)
// ════════════════════════════════════════════════════════

export async function getSettings(key: string): Promise<unknown> {
  const supabase = createClient()
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()
  return data?.value ?? null
}

export async function upsertSettings(key: string, value: unknown): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' })

  if (error) {
    logError('[upsertSettings] 설정 저장 실패', error.message)
    return { error: `설정 저장 실패: ${error.message}` }
  }

  revalidatePath('/')
  revalidatePath('/admin')
  return { success: true }
}

export async function saveArticleTypes(types: { value: string; label: string }[]): Promise<ActionResult> {
  const result = await upsertSettings('article_types', types)
  if ('success' in result) {
    revalidateTag('article-types')
  }
  return result
}

export async function saveProjectTypes(types: { value: string; label: string }[]): Promise<ActionResult> {
  return upsertSettings('project_types', types)
}

export async function saveArticleFilterTags(tags: string[]): Promise<ActionResult> {
  const result = await upsertSettings('article_filter_tags', tags)
  if ('success' in result) {
    revalidateTag('article-filter-tags')
  }
  return result
}

/** 최초 1회만 실행 — settings에 work_filter_tags 없을 때 기본값 시드 (인증 불필요) */
export async function migrateWorkFilterTags(defaults: string[]): Promise<void> {
  try {
    const supabase = createClient()
    // 이미 있으면 건드리지 않음
    const { data } = await supabase.from('settings').select('value').eq('key', 'work_filter_tags').maybeSingle()
    if (data?.value) return
    await supabase.from('settings').upsert({ key: 'work_filter_tags', value: defaults }, { onConflict: 'key' })
    revalidateTag('work-filter-tags')
  } catch {
    // 마이그레이션 실패는 조용히 무시 (운영에 영향 없음)
  }
}

export async function saveWorkFilterTags(tags: string[]): Promise<ActionResult> {
  const result = await upsertSettings('work_filter_tags', tags)
  if ('success' in result) {
    revalidateTag('work-filter-tags')
    revalidatePath('/work/showcase')
  }
  return result
}
