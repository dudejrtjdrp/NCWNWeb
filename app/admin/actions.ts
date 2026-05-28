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
  if (error || !user) return { error: '인증이 필요합니다.' }
  return null
}

// ── Storage 업로드 헬퍼 ────────────────────────────────────

/**
 * Supabase Storage에 파일을 업로드하고 public URL을 반환합니다.
 * 실패 시 null을 반환합니다 (호출부에서 처리).
 */
async function uploadToStorage(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  path: string,
  file: File
): Promise<string | null> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        upsert: true,
        contentType: file.type || 'image/webp',
      })

    if (error) {
      logError(`[Storage] ${bucket}/${path} 업로드 실패:`, error.message)
      return null
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
    return publicUrl
  } catch (err) {
    logError(`[Storage] ${bucket}/${path} 예외:`, err)
    return null
  }
}

/**
 * Supabase Storage에서 public URL로부터 경로를 추출해 파일을 삭제합니다.
 * update 시 기존 파일 정리에 사용 (스토리지 비용 절감).
 */
async function deleteFromStorage(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  publicUrl: string
): Promise<void> {
  try {
    const marker = `/storage/v1/object/public/${bucket}/`
    const idx = publicUrl.indexOf(marker)
    if (idx === -1) return
    const filePath = decodeURIComponent(publicUrl.slice(idx + marker.length))
    await supabase.storage.from(bucket).remove([filePath])
  } catch (err) {
    // 삭제 실패는 치명적이지 않으므로 경고만 기록
    logError(`[Storage] 기존 파일 삭제 실패 (bucket: ${bucket})`, err)
  }
}

// ── 공통 파일 검증 ────────────────────────────────────────

function validateImage(file: File): string | null {
  return validateFileUpload(file, { maxSizeBytes: 10 * 1024 * 1024 })
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

  const { error } = await supabase.from('showcase_works').insert({
    title, author, year,
    description:    description || null,
    title_en:       title_en || null,
    description_en: description_en || null,
    tech_stack,
    thumbnail_url,
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
    title, author, year, tech_stack,
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

  // 스토리지 파일도 함께 삭제
  const { data: existing } = await supabase
    .from('showcase_works').select('thumbnail_url').eq('id', id).single()
  if (existing?.thumbnail_url) {
    await deleteFromStorage(supabase, 'work-thumbnails', existing.thumbnail_url)
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
    return { error: '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
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
    return { error: '수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
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
    return { error: '설정 저장 중 오류가 발생했습니다.' }
  }

  revalidatePath('/')
  revalidatePath('/admin')
  return { success: true }
}

export async function saveArticleTypes(types: { value: string; label: string }[]): Promise<ActionResult> {
  return upsertSettings('article_types', types)
}

export async function saveProjectTypes(types: { value: string; label: string }[]): Promise<ActionResult> {
  return upsertSettings('project_types', types)
}
