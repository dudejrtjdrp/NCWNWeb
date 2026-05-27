'use server'

/**
 * Admin Server Actions
 * 인증 + 각 탭(Work / Article / Award / Project) CRUD
 *
 * 모든 액션은 인증된 사용자만 호출 가능.
 * 파일 업로드 → Supabase Storage → public URL → DB 저장
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// ── 반환 타입 ─────────────────────────────────────────────
export type ActionResult = { success: true } | { error: string }

// ── Auth ─────────────────────────────────────────────────

export async function signIn(_: unknown, formData: FormData): Promise<ActionResult> {
  const email    = (formData.get('email')    as string)?.trim()
  const password = (formData.get('password') as string)?.trim()

  if (!email || !password) return { error: '이메일과 비밀번호를 입력해주세요.' }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Supabase 오류 메시지를 한국어로
    if (error.message.includes('Invalid login credentials')) {
      return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' }
    }
    return { error: error.message }
  }

  redirect('/admin')
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

// ── Storage 업로드 헬퍼 ────────────────────────────────────

async function uploadToStorage(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  path: string,
  file: File
): Promise<string | null> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      upsert: true,
      contentType: file.type || 'image/webp',
    })

  if (error) {
    console.error(`[Storage] ${bucket}/${path} 업로드 실패:`, error.message)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return publicUrl
}

// ── Work 등록 ─────────────────────────────────────────────

export async function saveWork(_: unknown, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()

  // 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '인증이 필요합니다.' }

  const title       = (formData.get('title')      as string)?.trim()
  const author      = (formData.get('author')     as string)?.trim()
  const yearStr     = formData.get('year')         as string
  const description = (formData.get('description') as string)?.trim()
  const techRaw     = (formData.get('tech_stack')  as string)?.trim()
  const thumbnail   = formData.get('thumbnail')    as File | null

  if (!title)   return { error: '작품명은 필수입니다.' }
  if (!author)  return { error: '작가명은 필수입니다.' }
  const year = parseInt(yearStr)
  if (!year || year < 2000 || year > 2100) return { error: '연도를 올바르게 입력해주세요.' }

  const tech_stack = techRaw
    ? techRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  // 썸네일 업로드
  let thumbnail_url: string | null = null
  if (thumbnail && thumbnail.size > 0) {
    const ext  = thumbnail.name.split('.').pop() ?? 'webp'
    const path = `${year}/${crypto.randomUUID()}.${ext}`
    thumbnail_url = await uploadToStorage(supabase, 'work-thumbnails', path, thumbnail)
  }

  const { error } = await supabase.from('showcase_works').insert({
    title,
    author,
    year,
    description:   description || null,
    tech_stack,
    thumbnail_url,
    view_count: 0,
  })

  if (error) return { error: `저장 실패: ${error.message}` }

  revalidatePath('/work/showcase')
  return { success: true }
}

// ── NCR 아티클 등록 ────────────────────────────────────────

export async function saveArticle(_: unknown, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '인증이 필요합니다.' }

  const title        = (formData.get('title')        as string)?.trim()
  const author       = (formData.get('author')       as string)?.trim()
  const type         = formData.get('type')           as string
  const season       = (formData.get('season')       as string)?.trim()
  const published_at = formData.get('published_at')  as string
  const excerpt      = (formData.get('excerpt')      as string)?.trim()
  const content      = (formData.get('content')      as string)?.trim()
  const tagsRaw      = (formData.get('tags')         as string)?.trim()
  const thumbnail    = formData.get('thumbnail')     as File | null

  if (!title)        return { error: '제목은 필수입니다.' }
  if (!published_at) return { error: '발행일은 필수입니다.' }
  if (!['editorial', 'trend', 'card_news'].includes(type)) {
    return { error: '아티클 유형을 선택해주세요.' }
  }

  const tags = tagsRaw
    ? tagsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  // 썸네일 업로드
  let thumbnail_url: string | null = null
  if (thumbnail && thumbnail.size > 0) {
    const seasonSlug = season
      ? season.replace(/\s+/g, '-').toLowerCase()
      : 'etc'
    const ext  = thumbnail.name.split('.').pop() ?? 'webp'
    const path = `${seasonSlug}/${crypto.randomUUID()}.${ext}`
    thumbnail_url = await uploadToStorage(supabase, 'ncr-thumbnails', path, thumbnail)
  }

  const { error } = await supabase.from('ncr_reports').insert({
    title,
    author:       author || null,
    type,
    season:       season || null,
    published_at: new Date(published_at).toISOString(),
    excerpt:      excerpt || null,
    content:      content || null,
    tags,
    thumbnail_url,
    is_published: true,
  })

  if (error) return { error: `저장 실패: ${error.message}` }

  revalidatePath('/ncr-trend/latest')
  revalidatePath('/')  // 홈 NcrTrendSection 캐시 무효화
  return { success: true }
}

// ── 수상 등록 ─────────────────────────────────────────────

export async function saveAward(_: unknown, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '인증이 필요합니다.' }

  const competition  = (formData.get('competition')  as string)?.trim()
  const award_name   = (formData.get('award_name')   as string)?.trim()
  const winner       = (formData.get('winner')       as string)?.trim()
  const teamRaw      = (formData.get('team_members') as string)?.trim()
  const yearStr      = formData.get('year')           as string
  const description  = (formData.get('description')  as string)?.trim()
  const thumbnail    = formData.get('thumbnail')     as File | null

  if (!competition) return { error: '대회명은 필수입니다.' }
  if (!award_name)  return { error: '수상 등급을 선택해주세요.' }
  const year = parseInt(yearStr)
  if (!year) return { error: '수상 연도를 입력해주세요.' }

  const team_members = teamRaw
    ? teamRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : winner ? [winner] : []

  // 썸네일 업로드
  let thumbnail_url: string | null = null
  if (thumbnail && thumbnail.size > 0) {
    const ext  = thumbnail.name.split('.').pop() ?? 'webp'
    const path = `awards/${crypto.randomUUID()}.${ext}`
    thumbnail_url = await uploadToStorage(supabase, 'ninc-images', path, thumbnail)
  }

  const { error } = await supabase.from('awards').insert({
    competition,
    award_name,
    winner:       winner || null,
    team_members,
    year,
    description:  description || null,
    thumbnail_url,
  })

  if (error) return { error: `저장 실패: ${error.message}` }

  revalidatePath('/ninc/awards')
  return { success: true }
}

// ── 프로젝트 등록 ──────────────────────────────────────────

export async function saveProject(_: unknown, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '인증이 필요합니다.' }

  const title       = (formData.get('title')       as string)?.trim()
  const type        = formData.get('type')          as string
  const partner     = (formData.get('partner')     as string)?.trim()
  const yearStr     = formData.get('year')          as string
  const description = (formData.get('description') as string)?.trim()
  const thumbnail   = formData.get('thumbnail')    as File | null

  if (!title) return { error: '프로젝트명은 필수입니다.' }
  if (!['industry', 'international'].includes(type)) {
    return { error: '유형을 선택해주세요.' }
  }
  const year = parseInt(yearStr)
  if (!year) return { error: '연도를 입력해주세요.' }

  // 썸네일 업로드
  let thumbnail_url: string | null = null
  if (thumbnail && thumbnail.size > 0) {
    const ext  = thumbnail.name.split('.').pop() ?? 'webp'
    const path = `projects/${crypto.randomUUID()}.${ext}`
    thumbnail_url = await uploadToStorage(supabase, 'ninc-images', path, thumbnail)
  }

  const { error } = await supabase.from('projects').insert({
    title,
    type,
    partner:      partner || null,
    year,
    description:  description || null,
    thumbnail_url,
  })

  if (error) return { error: `저장 실패: ${error.message}` }

  revalidatePath('/ninc/project')
  revalidatePath('/')  // 홈 NincSection 캐시 무효화
  return { success: true }
}
