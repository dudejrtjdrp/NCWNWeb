/**
 * events 쿼리 (캐시 5분, tag: 'events')
 */

import { createDbClient as createClient } from '@/lib/supabase/db'
import { unstable_cache } from 'next/cache'

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
}

/** 이벤트 전체 목록 — 날짜 오름차순 (upcoming 순서) (캐시 5분) */
export const getEvents = unstable_cache(
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
