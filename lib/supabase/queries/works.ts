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
