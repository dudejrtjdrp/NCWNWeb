/**
 * showcase_works 쿼리
 *
 * unstable_cache로 래핑하여 Supabase API 요청을 캐싱합니다.
 * - 캐시 TTL: 5분 (revalidate: 300)
 * - 뮤테이션 시 revalidateTag('works')로 즉시 무효화
 * - locale='en'일 때 _en 컬럼 우선 반환, 비어있으면 한국어 원문 사용
 */

import { createDbClient as createClient } from '@/lib/supabase/db'
import { unstable_cache } from 'next/cache'
import { applyLocale, applyLocaleList } from './_locale'

export type WorkType = 'video' | 'design' | '3d'

export interface RelatedLink { label: string; url: string }

export interface WorkItem {
  id: string
  title: string
  author: string
  year: number
  description: string | null
  type: WorkType
  tech_stack: string[]
  thumbnail_url: string | null
  video_embed: string | null
  model_embed: string | null
  images: string[] | null
  related_links: RelatedLink[] | null
  view_count: number
  created_at: string
  // 영어 원문 (admin 편집용)
  title_en?: string | null
  description_en?: string | null
}

/** 목록 조회용 타입 (images 컬럼 제외 — 목록에서 불필요) */
export type WorkListItem = Omit<WorkItem, 'images'>

/** 쇼케이스 전체 목록 — 연도/조회수 내림차순 (캐시 5분) */
export async function getShowcaseWorks(locale: string = 'ko'): Promise<WorkListItem[]> {
  const fetcher = unstable_cache(
    async (): Promise<WorkListItem[]> => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('showcase_works')
          .select(
            'id, title, title_en, author, year, description, description_en, type, tech_stack, thumbnail_url, video_embed, model_embed, view_count, created_at'
          )
          .order('year', { ascending: false })
          .order('view_count', { ascending: false })

        if (error) {
          console.error('[getShowcaseWorks]', error.message)
          return []
        }
        return (data ?? []) as WorkListItem[]
      } catch (err) {
        console.error('[getShowcaseWorks] unexpected:', err)
        return []
      }
    },
    ['works-list'],
    { revalidate: 300, tags: ['works'] }
  )

  const items = await fetcher()
  return applyLocaleList(items, ['title', 'description'], locale)
}

const SHOWCASE_LIST_COLUMNS =
  'id, title, title_en, author, year, description, description_en, type, tech_stack, thumbnail_url, video_embed, model_embed, view_count, created_at'

export interface ShowcaseWorksPage {
  items: WorkListItem[]
  hasMore: boolean
  total: number
}

/**
 * 쇼케이스 목록 — 페이지네이션(무한 스크롤)용
 * - tag: '전체'/빈값이면 전체, 아니면 tech_stack 포함 필터
 * - q: 제목/작가 부분 검색(ilike)
 * - offset/limit: 범위 조회
 * - seed: 지정 시 시드 기반 랜덤 정렬 RPC 사용(같은 seed → 순서 고정 → 페이지네이션 안전)
 *         미지정 시 연도/조회수 내림차순
 * - hasMore: 반환 개수 === limit 이면 더 있다고 판단
 */
export async function getShowcaseWorksPage(params: {
  locale?: string
  tag?: string
  q?: string
  offset?: number
  limit?: number
  seed?: string
}): Promise<ShowcaseWorksPage> {
  const { locale = 'ko', tag, q, offset = 0, limit = 15, seed } = params
  const cleaned = (q ?? '').replace(/[%,()]/g, ' ').trim()
  try {
    const supabase = createClient()

    // 시드 랜덤 정렬 (RPC) — 함수 미적용/오류 시 아래 기본 정렬로 폴백
    if (seed) {
      const { data, error } = await supabase.rpc('get_showcase_works_random', {
        p_seed: seed,
        p_tag: tag && tag !== '전체' ? tag : null,
        p_q: cleaned || null,
        p_offset: offset,
        p_limit: limit,
      })
      if (!error) {
        const rows = (data ?? []) as WorkListItem[]
        const items = applyLocaleList(rows, ['title', 'description'], locale)
        return { items, hasMore: items.length === limit, total: -1 }
      }
      // RPC 실패(예: 마이그레이션 미적용) → 기본 정렬로 폴백
      console.warn('[getShowcaseWorksPage:rpc] 폴백:', error.message)
    }

    // 기본: 연도/조회수 내림차순 + 정확한 count
    let query = supabase.from('showcase_works').select(SHOWCASE_LIST_COLUMNS, { count: 'exact' })
    if (tag && tag !== '전체') query = query.contains('tech_stack', [tag])
    if (cleaned) query = query.or(`title.ilike.%${cleaned}%,author.ilike.%${cleaned}%`)

    const { data, error, count } = await query
      .order('year', { ascending: false })
      .order('view_count', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[getShowcaseWorksPage]', error.message)
      return { items: [], hasMore: false, total: 0 }
    }

    const total = count ?? 0
    const items = applyLocaleList((data ?? []) as WorkListItem[], ['title', 'description'], locale)
    return { items, hasMore: offset + items.length < total, total }
  } catch (err) {
    console.error('[getShowcaseWorksPage] unexpected:', err)
    return { items: [], hasMore: false, total: 0 }
  }
}

/** 단일 작품 조회 — 모든 컬럼 포함 (캐시 5분) */
export async function getWorkById(id: string, locale: string = 'ko'): Promise<WorkItem | null> {
  const fetcher = unstable_cache(
    async (): Promise<WorkItem | null> => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('showcase_works')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.error('[getWorkById]', error.message)
          return null
        }
        return data as WorkItem
      } catch (err) {
        console.error('[getWorkById] unexpected:', err)
        return null
      }
    },
    [`work-by-id-${id}`],
    { revalidate: 300, tags: ['works'] }
  )

  const item = await fetcher()
  if (!item) return null
  return applyLocale(item, ['title', 'description'], locale)
}

/**
 * 관련 작품 조회 — 현재 작품과 tech_stack/type 겹침 우선, 부족하면 최신으로 채움
 * (상세 페이지 하단 "관련 게시물" 마소너리용)
 */
export async function getRelatedWorks(
  id: string,
  locale: string = 'ko',
  limit = 8
): Promise<WorkListItem[]> {
  const [all, current] = await Promise.all([
    getShowcaseWorks(locale),
    getWorkById(id, locale),
  ])
  const pool = all.filter((w) => w.id !== id)
  if (!current) return pool.slice(0, limit)

  const curTags = new Set(current.tech_stack ?? [])
  const scored = pool
    .map((w) => {
      const tagOverlap = (w.tech_stack ?? []).filter((t) => curTags.has(t)).length
      const typeMatch = w.type === current.type ? 1 : 0
      return { w, score: tagOverlap * 2 + typeMatch }
    })
    // 점수 내림차순, 동점이면 기존 정렬(연도·조회수) 유지
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map((s) => s.w)
}

/** 기존 하드코딩 필터값 — settings에 데이터 없을 때 fallback (마이그레이션 보호) */
export const DEFAULT_WORK_FILTER_TAGS = ['Video', 'Graphic', 'Web', 'Motion', 'Photo', 'AI']

/** 쇼케이스 필터 태그 목록 (settings 테이블 — 캐시 1분, 없으면 기본값 반환) */
export async function getWorkFilterTags(): Promise<string[]> {
  const fetcher = unstable_cache(
    async (): Promise<string[]> => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'work_filter_tags')
          .maybeSingle()
        const val = data?.value
        if (Array.isArray(val) && (val as string[]).length > 0) return val as string[]
        // settings에 데이터 없으면 기존 하드코딩 값 반환 (마이그레이션 fallback)
        return DEFAULT_WORK_FILTER_TAGS
      } catch {
        return DEFAULT_WORK_FILTER_TAGS
      }
    },
    ['work-filter-tags'],
    { revalidate: 60, tags: ['work-filter-tags'] }
  )
  return fetcher()
}
