'use server'

/**
 * Admin Server Actions
 * 인증 + 각 탭(Work / Article / Award / Project / Event / Exhibition / Types) CRUD
 *
 * 모든 액션은 인증된 사용자만 호출 가능.
 * 파일 업로드 → Supabase Storage → public URL → DB 저장
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

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
    return { error: `로그인 실패: ${error.message}` }
  }

  return { success: true, redirectTo: '/admin' }
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

// ── 인증 체크 헬퍼 ────────────────────────────────────────

async function requireAuth(supabase: ReturnType<typeof createClient>): Promise<{ error: string } | null> {
  // getUser()는 Supabase Auth 서버에 네트워크 요청을 보내 JWT 검증 →
  // Server Action 컨텍스트에서는 타이밍/토큰 갱신 문제로 null이 될 수 있음.
  // getSession()은 쿠키에서 직접 읽으므로 Server Action에서 더 안정적.
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: '인증이 필요합니다.' }
  return null
}

// ════════════════════════════════════════════════════════
// WORK
// ════════════════════════════════════════════════════════

export async function saveWork(_: unknown, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const title       = (formData.get('title')       as string)?.trim()
  const author      = (formData.get('author')      as string)?.trim()
  const yearStr     = formData.get('year')          as string
  const description = (formData.get('description') as string)?.trim()
  const techRaw     = (formData.get('tech_stack')  as string)?.trim()
  const thumbnail   = formData.get('thumbnail')    as File | null

  if (!title)  return { error: '작품명은 필수입니다.' }
  if (!author) return { error: '작가명은 필수입니다.' }
  const year = parseInt(yearStr)
  if (!year || year < 2000 || year > 2100) return { error: '연도를 올바르게 입력해주세요.' }

  const tech_stack = techRaw
    ? techRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : []

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

export async function updateWork(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const title       = (formData.get('title')       as string)?.trim()
  const author      = (formData.get('author')      as string)?.trim()
  const yearStr     = formData.get('year')          as string
  const description = (formData.get('description') as string)?.trim()
  const techRaw     = (formData.get('tech_stack')  as string)?.trim()
  const thumbnail   = formData.get('thumbnail')    as File | null

  if (!title)  return { error: '작품명은 필수입니다.' }
  if (!author) return { error: '작가명은 필수입니다.' }
  const year = parseInt(yearStr)
  if (!year || year < 2000 || year > 2100) return { error: '연도를 올바르게 입력해주세요.' }

  const tech_stack = techRaw
    ? techRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const updateData: Record<string, unknown> = { title, author, year, tech_stack, description: description || null }

  if (thumbnail && thumbnail.size > 0) {
    const ext  = thumbnail.name.split('.').pop() ?? 'webp'
    const path = `${year}/${crypto.randomUUID()}.${ext}`
    const url = await uploadToStorage(supabase, 'work-thumbnails', path, thumbnail)
    if (url) updateData.thumbnail_url = url
  }

  const { error } = await supabase.from('showcase_works').update(updateData).eq('id', id)
  if (error) return { error: `수정 실패: ${error.message}` }

  revalidatePath('/work/showcase')
  return { success: true }
}

export async function deleteWork(id: string): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const { error } = await supabase.from('showcase_works').delete().eq('id', id)
  if (error) return { error: `삭제 실패: ${error.message}` }

  revalidatePath('/work/showcase')
  return { success: true }
}

// ════════════════════════════════════════════════════════
// NCR 아티클
// ════════════════════════════════════════════════════════

export async function saveArticle(_: unknown, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const title        = (formData.get('title')        as string)?.trim()
  const author       = (formData.get('author')       as string)?.trim()
  const type         = formData.get('type')           as string
  const season       = (formData.get('season')       as string)?.trim()
  const published_at = formData.get('published_at')  as string
  const excerpt      = (formData.get('excerpt')      as string)?.trim()
  const content      = (formData.get('content')      as string)?.trim()
  const tagsRaw      = (formData.get('tags')         as string)?.trim()
  const relatedRaw   = (formData.get('related_ids')  as string)?.trim()
  const thumbnail    = formData.get('thumbnail')     as File | null

  if (!title)        return { error: '제목은 필수입니다.' }
  if (!published_at) return { error: '발행일은 필수입니다.' }

  const tags = tagsRaw
    ? tagsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const related_ids = relatedRaw
    ? relatedRaw.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 2)
    : []

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
    type:         type || 'editorial',
    season:       season || null,
    published_at: new Date(published_at).toISOString(),
    excerpt:      excerpt || null,
    content:      content || null,
    tags,
    related_ids,
    thumbnail_url,
    is_published: true,
  })

  if (error) return { error: `저장 실패: ${error.message}` }

  revalidatePath('/ncr-trend/latest')
  revalidatePath('/')
  return { success: true }
}

export async function updateArticle(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const title        = (formData.get('title')        as string)?.trim()
  const author       = (formData.get('author')       as string)?.trim()
  const type         = formData.get('type')           as string
  const season       = (formData.get('season')       as string)?.trim()
  const published_at = formData.get('published_at')  as string
  const excerpt      = (formData.get('excerpt')      as string)?.trim()
  const content      = (formData.get('content')      as string)?.trim()
  const tagsRaw      = (formData.get('tags')         as string)?.trim()
  const relatedRaw   = (formData.get('related_ids')  as string)?.trim()
  const thumbnail    = formData.get('thumbnail')     as File | null

  if (!title)        return { error: '제목은 필수입니다.' }
  if (!published_at) return { error: '발행일은 필수입니다.' }

  const tags = tagsRaw
    ? tagsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const related_ids = relatedRaw
    ? relatedRaw.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 2)
    : []

  const updateData: Record<string, unknown> = {
    title,
    author:       author || null,
    type:         type || 'editorial',
    season:       season || null,
    published_at: new Date(published_at).toISOString(),
    excerpt:      excerpt || null,
    content:      content || null,
    tags,
    related_ids,
  }

  if (thumbnail && thumbnail.size > 0) {
    const seasonSlug = season
      ? season.replace(/\s+/g, '-').toLowerCase()
      : 'etc'
    const ext  = thumbnail.name.split('.').pop() ?? 'webp'
    const path = `${seasonSlug}/${crypto.randomUUID()}.${ext}`
    const url = await uploadToStorage(supabase, 'ncr-thumbnails', path, thumbnail)
    if (url) updateData.thumbnail_url = url
  }

  const { error } = await supabase.from('ncr_reports').update(updateData).eq('id', id)
  if (error) return { error: `수정 실패: ${error.message}` }

  revalidatePath('/ncr-trend/latest')
  revalidatePath('/')
  return { success: true }
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const { error } = await supabase.from('ncr_reports').delete().eq('id', id)
  if (error) return { error: `삭제 실패: ${error.message}` }

  revalidatePath('/ncr-trend/latest')
  revalidatePath('/')
  return { success: true }
}

/** 홈 노출 아티클 설정 — is_home_featured 플래그 토글
 *  ⚠️  사용 전 Supabase에서 마이그레이션 실행 필요:
 *      ALTER TABLE ncr_reports ADD COLUMN IF NOT EXISTS is_home_featured BOOLEAN NOT NULL DEFAULT false;
 */
export async function setHomeFeaturedArticle(id: string, featured: boolean): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  // featured=true로 설정 시, 기존 featured 2개 초과 방지를 위해 현재 개수 확인
  if (featured) {
    const { data: current, error: countError } = await supabase
      .from('ncr_reports')
      .select('id')
      .eq('is_home_featured', true)
      .neq('id', id)

    if (countError) {
      if (countError.message.includes('does not exist')) {
        return { error: 'is_home_featured 컬럼이 없습니다. Supabase SQL Editor에서 마이그레이션을 먼저 실행해주세요. (docs/migration-add-is_home_featured.sql 참조)' }
      }
      return { error: `조회 실패: ${countError.message}` }
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
      return { error: 'is_home_featured 컬럼이 없습니다. Supabase SQL Editor에서 마이그레이션을 먼저 실행해주세요. (docs/migration-add-is_home_featured.sql 참조)' }
    }
    return { error: `설정 실패: ${error.message}` }
  }

  revalidatePath('/')
  return { success: true }
}

// ════════════════════════════════════════════════════════
// 수상
// ════════════════════════════════════════════════════════

export async function saveAward(_: unknown, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

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

export async function updateAward(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

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

  const updateData: Record<string, unknown> = {
    competition,
    award_name,
    winner:       winner || null,
    team_members,
    year,
    description:  description || null,
  }

  if (thumbnail && thumbnail.size > 0) {
    const ext  = thumbnail.name.split('.').pop() ?? 'webp'
    const path = `awards/${crypto.randomUUID()}.${ext}`
    const url = await uploadToStorage(supabase, 'ninc-images', path, thumbnail)
    if (url) updateData.thumbnail_url = url
  }

  const { error } = await supabase.from('awards').update(updateData).eq('id', id)
  if (error) return { error: `수정 실패: ${error.message}` }

  revalidatePath('/ninc/awards')
  return { success: true }
}

export async function deleteAward(id: string): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const { error } = await supabase.from('awards').delete().eq('id', id)
  if (error) return { error: `삭제 실패: ${error.message}` }

  revalidatePath('/ninc/awards')
  return { success: true }
}

// ════════════════════════════════════════════════════════
// 프로젝트
// ════════════════════════════════════════════════════════

export async function saveProject(_: unknown, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const title       = (formData.get('title')       as string)?.trim()
  const type        = formData.get('type')          as string
  const partner     = (formData.get('partner')     as string)?.trim()
  const yearStr     = formData.get('year')          as string
  const description = (formData.get('description') as string)?.trim()
  const thumbnail   = formData.get('thumbnail')    as File | null

  if (!title) return { error: '프로젝트명은 필수입니다.' }
  const year = parseInt(yearStr)
  if (!year) return { error: '연도를 입력해주세요.' }

  let thumbnail_url: string | null = null
  if (thumbnail && thumbnail.size > 0) {
    const ext  = thumbnail.name.split('.').pop() ?? 'webp'
    const path = `projects/${crypto.randomUUID()}.${ext}`
    thumbnail_url = await uploadToStorage(supabase, 'ninc-images', path, thumbnail)
  }

  const { error } = await supabase.from('projects').insert({
    title,
    type:         type || 'industry',
    partner:      partner || null,
    year,
    description:  description || null,
    thumbnail_url,
  })

  if (error) return { error: `저장 실패: ${error.message}` }

  revalidatePath('/ninc/project')
  revalidatePath('/')
  return { success: true }
}

export async function updateProject(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const title       = (formData.get('title')       as string)?.trim()
  const type        = formData.get('type')          as string
  const partner     = (formData.get('partner')     as string)?.trim()
  const yearStr     = formData.get('year')          as string
  const duration    = (formData.get('duration')    as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const thumbnail   = formData.get('thumbnail')    as File | null

  if (!title) return { error: '프로젝트명은 필수입니다.' }
  const year = parseInt(yearStr)
  if (!year) return { error: '연도를 입력해주세요.' }

  const updateData: Record<string, unknown> = {
    title,
    type:         type || 'industry',
    partner:      partner || null,
    year,
    duration:     duration || null,
    description:  description || null,
  }

  if (thumbnail && thumbnail.size > 0) {
    const ext  = thumbnail.name.split('.').pop() ?? 'webp'
    const path = `projects/${crypto.randomUUID()}.${ext}`
    const url = await uploadToStorage(supabase, 'ninc-images', path, thumbnail)
    if (url) updateData.thumbnail_url = url
  }

  const { error } = await supabase.from('projects').update(updateData).eq('id', id)
  if (error) return { error: `수정 실패: ${error.message}` }

  revalidatePath('/ninc/project')
  revalidatePath('/')
  return { success: true }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) return { error: `삭제 실패: ${error.message}` }

  revalidatePath('/ninc/project')
  revalidatePath('/')
  return { success: true }
}

// ════════════════════════════════════════════════════════
// 이벤트
// ════════════════════════════════════════════════════════

export async function saveEvent(_: unknown, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const title      = (formData.get('title')      as string)?.trim()
  const type       = formData.get('type')         as string
  const start_date = formData.get('start_date')  as string
  const end_date   = formData.get('end_date')    as string
  const location   = (formData.get('location')   as string)?.trim()
  const description = (formData.get('description') as string)?.trim()

  if (!title)      return { error: '이벤트 제목은 필수입니다.' }
  if (!start_date) return { error: '시작일은 필수입니다.' }

  const { error } = await supabase.from('events').insert({
    title,
    type:        type || '기타',
    start_date:  new Date(start_date).toISOString(),
    end_date:    end_date ? new Date(end_date).toISOString() : null,
    location:    location || null,
    description: description || null,
    is_published: true,
  })

  if (error) return { error: `저장 실패: ${error.message}` }

  revalidatePath('/ninc/event')
  return { success: true }
}

export async function updateEvent(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const title       = (formData.get('title')       as string)?.trim()
  const type        = formData.get('type')          as string
  const start_date  = formData.get('start_date')   as string
  const end_date    = formData.get('end_date')     as string
  const location    = (formData.get('location')    as string)?.trim()
  const description = (formData.get('description') as string)?.trim()

  if (!title)      return { error: '이벤트 제목은 필수입니다.' }
  if (!start_date) return { error: '시작일은 필수입니다.' }

  const { error } = await supabase.from('events').update({
    title,
    type:        type || '기타',
    start_date:  new Date(start_date).toISOString(),
    end_date:    end_date ? new Date(end_date).toISOString() : null,
    location:    location || null,
    description: description || null,
  }).eq('id', id)

  if (error) return { error: `수정 실패: ${error.message}` }

  revalidatePath('/ninc/event')
  return { success: true }
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) return { error: `삭제 실패: ${error.message}` }

  revalidatePath('/ninc/event')
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
  const year = parseInt(yearStr)
  if (!year) return { error: '연도를 입력해주세요.' }

  let poster_url: string | null = null
  if (poster && poster.size > 0) {
    const ext  = poster.name.split('.').pop() ?? 'webp'
    const path = `exhibitions/${year}/${crypto.randomUUID()}.${ext}`
    poster_url = await uploadToStorage(supabase, 'ninc-images', path, poster)
  }

  const { error } = await supabase.from('exhibitions').insert({
    title,
    year,
    description: description || null,
    theme:       theme || null,
    poster_url,
  })

  if (error) return { error: `저장 실패: ${error.message}` }

  revalidatePath('/work/exhibition')
  return { success: true }
}

export async function updateExhibition(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const title       = (formData.get('title')       as string)?.trim()
  const yearStr     = formData.get('year')          as string
  const description = (formData.get('description') as string)?.trim()
  const theme       = (formData.get('theme')       as string)?.trim()
  const poster      = formData.get('poster')       as File | null

  if (!title) return { error: '전시 제목은 필수입니다.' }
  const year = parseInt(yearStr)
  if (!year) return { error: '연도를 입력해주세요.' }

  let poster_url: string | undefined = undefined
  if (poster && poster.size > 0) {
    const ext  = poster.name.split('.').pop() ?? 'webp'
    const path = `exhibitions/${year}/${crypto.randomUUID()}.${ext}`
    const url = await uploadToStorage(supabase, 'ninc-images', path, poster)
    if (url) poster_url = url
  }

  const updateData: Record<string, unknown> = {
    title,
    year,
    description: description || null,
    theme:       theme || null,
  }
  if (poster_url !== undefined) updateData.poster_url = poster_url

  const { error } = await supabase.from('exhibitions').update(updateData).eq('id', id)
  if (error) return { error: `수정 실패: ${error.message}` }

  revalidatePath('/work/exhibition')
  return { success: true }
}

export async function deleteExhibition(id: string): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const { error } = await supabase.from('exhibitions').delete().eq('id', id)
  if (error) return { error: `삭제 실패: ${error.message}` }

  revalidatePath('/work/exhibition')
  return { success: true }
}

// ════════════════════════════════════════════════════════
// 유형 관리 (content_types 테이블 또는 settings JSON)
// ════════════════════════════════════════════════════════

/** settings 테이블에서 JSON 설정값 조회 */
export async function getSettings(key: string): Promise<unknown> {
  const supabase = createClient()
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()
  return data?.value ?? null
}

/** settings 테이블에 JSON 설정값 upsert */
export async function upsertSettings(key: string, value: unknown): Promise<ActionResult> {
  const supabase = createClient()
  const authError = await requireAuth(supabase)
  if (authError) return authError

  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' })

  if (error) return { error: `설정 저장 실패: ${error.message}` }

  revalidatePath('/')
  revalidatePath('/admin')
  return { success: true }
}

/** 아티클 유형 목록 저장 */
export async function saveArticleTypes(types: { value: string; label: string }[]): Promise<ActionResult> {
  return upsertSettings('article_types', types)
}

/** 프로젝트 유형 목록 저장 */
export async function saveProjectTypes(types: { value: string; label: string }[]): Promise<ActionResult> {
  return upsertSettings('project_types', types)
}
