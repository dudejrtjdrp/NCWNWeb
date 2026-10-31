/**
 * 졸업생 포트폴리오 쿼리 (캐시 5분, tag: 'portfolios')
 * - 공개된(is_published) 것만 읽는다. 표가 아직 없으면(마이그레이션 전) 빈 목록.
 * - locale='en' 이면 name·tagline·bio 와 프로젝트 제목·설명을 영문 값으로 (비어 있으면 한국어 그대로)
 * - 조회가 실패하면 캐시 안에서 에러를 던져 빈 결과가 캐시에 남지 않게 한다.
 */

import { createDbClient as createClient } from '@/lib/supabase/db'
import { unstable_cache } from 'next/cache'
import { applyLocale } from './_locale'
import type { WorkListItem } from './works'

export interface PortfolioProject {
  title: string
  titleEn?: string
  year?: string
  fields: string[]
  format?: string
  role?: string
  tools: string[]
  summary?: string
  description?: string
  descriptionEn?: string
  points: string[]
  outcome?: string
  video?: string
  images: string[]
  cover?: string | null
}

export interface PortfolioHistory {
  awards?: string[]
  exhibitions?: string[]
  experience?: string[]
}

export interface PortfolioItem {
  id: string
  student_id: string | null
  slug: string
  year: number
  name: string
  name_en: string | null
  fields: string[]
  tagline: string | null
  tagline_en: string | null
  bio: string | null
  bio_en: string | null
  interests: string[]
  tools: string[]
  email: string | null
  website: string | null
  instagram: string | null
  other_links: string[]
  profile_url: string | null
  cover_url: string | null
  pages: string[]
  pdf_url: string | null
  projects: PortfolioProject[]
  history: PortfolioHistory
  sort_order: number
  created_at: string
}

export type PortfolioListItem = Pick<
  PortfolioItem,
  'id' | 'student_id' | 'slug' | 'year' | 'name' | 'name_en' | 'fields' | 'tagline' | 'tagline_en' | 'profile_url' | 'cover_url' | 'sort_order'
>

const LIST_COLUMNS = 'id, student_id, slug, year, name, name_en, fields, tagline, tagline_en, profile_url, cover_url, sort_order'

const isMissingTable = (msg: string) => /portfolios/.test(msg) && /(does not exist|schema cache|Could not find)/i.test(msg)

/** 공개된 포트폴리오 목록 — 졸업 연도 최신순 → 정렬 순서 → 이름 */
export async function getPortfolios(locale: string = 'ko'): Promise<PortfolioListItem[]> {
  const fetcher = unstable_cache(
    async (): Promise<PortfolioListItem[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('portfolios')
        .select(LIST_COLUMNS)
        .eq('is_published', true)
        .order('year', { ascending: false })
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })
      if (error) {
        if (isMissingTable(error.message)) return []
        throw new Error(error.message)
      }
      return (data ?? []) as unknown as PortfolioListItem[]
    },
    ['portfolios-list'],
    { revalidate: 300, tags: ['portfolios'] }
  )
  try {
    const items = await fetcher()
    return items.map((p) => applyLocale(p, ['name', 'tagline'], locale))
  } catch (err) {
    console.error('[getPortfolios]', err)
    return []
  }
}

function localizeProject(p: PortfolioProject, locale: string): PortfolioProject {
  if (locale === 'ko') return p
  return { ...p, title: p.titleEn?.trim() || p.title, description: p.descriptionEn?.trim() || p.description }
}

/** 포트폴리오 한 명 (slug) */
export async function getPortfolioBySlug(slug: string, locale: string = 'ko'): Promise<PortfolioItem | null> {
  const fetcher = unstable_cache(
    async (): Promise<PortfolioItem | null> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle()
      if (error) {
        if (isMissingTable(error.message)) return null
        throw new Error(error.message)
      }
      return (data as PortfolioItem | null) ?? null
    },
    ['portfolio-by-slug', slug],
    { revalidate: 300, tags: ['portfolios'] }
  )
  try {
    const item = await fetcher()
    if (!item) return null
    const p = applyLocale(item, ['name', 'tagline', 'bio'], locale)
    return {
      ...p,
      projects: (p.projects ?? []).map((pr) => localizeProject(pr, locale)),
      history: p.history ?? {},
    }
  } catch (err) {
    console.error('[getPortfolioBySlug]', err)
    return null
  }
}

/** 이 학생이 제작자로 연결된 쇼케이스 작품 (관리자 작품 입력에서 학생 DB 로 고른 경우) */
export async function getPortfolioWorks(studentId: string | null, locale: string = 'ko'): Promise<WorkListItem[]> {
  if (!studentId) return []
  const fetcher = unstable_cache(
    async (): Promise<WorkListItem[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('showcase_works')
        .select('id, title, title_en, author, creators, year, description, description_en, type, tech_stack, thumbnail_url, video_embed, model_embed, view_count, created_at')
        .filter('creators', 'cs', JSON.stringify([{ student_id: studentId }]))
        .order('year', { ascending: false })
      if (error) {
        if (/creators/.test(error.message)) return []
        throw new Error(error.message)
      }
      return (data ?? []) as unknown as WorkListItem[]
    },
    ['portfolio-works', studentId],
    { revalidate: 300, tags: ['portfolios', 'works'] }
  )
  try {
    const items = await fetcher()
    return items.map((w) => applyLocale(w, ['title', 'description'], locale))
  } catch (err) {
    console.error('[getPortfolioWorks]', err)
    return []
  }
}

/** 작품 제작자(student_id) → 공개 포트폴리오 주소 slug */
export async function getPortfolioSlugs(studentIds: string[]): Promise<Map<string, string>> {
  const ids = [...new Set(studentIds.filter(Boolean))].sort()
  if (ids.length === 0) return new Map()
  const fetcher = unstable_cache(
    async (): Promise<[string, string][]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('portfolios')
        .select('student_id, slug')
        .in('student_id', ids)
        .eq('is_published', true)
      if (error) {
        if (isMissingTable(error.message)) return []
        throw new Error(error.message)
      }
      return ((data ?? []) as { student_id: string; slug: string }[]).map((r) => [r.student_id, r.slug])
    },
    ['portfolio-slugs', ids.join('|')],
    { revalidate: 300, tags: ['portfolios'] }
  )
  try {
    return new Map(await fetcher())
  } catch (err) {
    console.error('[getPortfolioSlugs]', err)
    return new Map()
  }
}
