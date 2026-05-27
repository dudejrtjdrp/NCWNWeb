/**
 * showcase_works 쿼리
 *
 * unstable_cache로 래핑하여 Supabase API 요청을 캐싱합니다.
 * - 캐시 TTL: 5분 (revalidate: 300)
 * - 뮤테이션 시 revalidateTag('works')로 즉시 무효화
 */

import { createDbClient as createClient } from '@/lib/supabase/db'
import { unstable_cache } from 'next/cache'

export type WorkType = 'video' | 'design' | '3d'

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
  view_count: number
  created_at: string
}

/** 목록 조회용 타입 (images 컬럼 제외 — 목록에서 불필요) */
export type WorkListItem = Omit<WorkItem, 'images'>

/** 쇼케이스 전체 목록 — 연도/조회수 내림차순 (캐시 5분) */
export const getShowcaseWorks = unstable_cache(
  async (): Promise<WorkListItem[]> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('showcase_works')
        .select(
          'id, title, author, year, description, type, tech_stack, thumbnail_url, video_embed, model_embed, view_count, created_at'
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

/** 단일 작품 조회 — 모든 컬럼 포함 (캐시 5분) */
export const getWorkById = unstable_cache(
  async (id: string): Promise<WorkItem | null> => {
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
  ['work-by-id'],
  { revalidate: 300, tags: ['works'] }
)
