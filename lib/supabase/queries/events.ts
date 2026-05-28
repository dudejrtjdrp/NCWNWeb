/**
 * events 쿼리 (캐시 5분, tag: 'events')
 * - locale='en'일 때 _en 컬럼 우선 반환, 비어있으면 한국어 원문 사용
 */

import { createDbClient as createClient } from '@/lib/supabase/db'
import { unstable_cache } from 'next/cache'
import { applyLocaleList } from './_locale'

export interface EventItem {
  id: string
  title: string
  type: string
  start_date: string
  end_date: string | null
  location: string | null
  description: string | null
  is_published: boolean
  created_at: string
  // 영어 원문 (admin 편집용)
  title_en?: string | null
  description_en?: string | null
}

/** 이벤트 전체 목록 — 날짜 오름차순 (upcoming 순서) (캐시 5분) */
export async function getEvents(locale: string = 'ko'): Promise<EventItem[]> {
  const fetcher = unstable_cache(
    async (): Promise<EventItem[]> => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('is_published', true)
          .order('start_date', { ascending: true })

        if (error) {
          console.error('[getEvents]', error.message)
          return []
        }
        return (data ?? []) as EventItem[]
      } catch (err) {
        console.error('[getEvents] unexpected:', err)
        return []
      }
    },
    ['events-list'],
    { revalidate: 300, tags: ['events'] }
  )

  const items = await fetcher()
  return applyLocaleList(items, ['title', 'description'], locale)
}
