/**
 * awards 쿼리 (캐시 5분, tag: 'awards')
 * - locale='en'일 때 _en 컬럼 우선 반환, 비어있으면 한국어 원문 사용
 */

import { createDbClient as createClient } from '@/lib/supabase/db'
import { unstable_cache } from 'next/cache'
import { applyLocale, applyLocaleList } from './_locale'

export interface AwardItem {
  id: string
  competition: string
  award_name: string
  winner: string | null
  team_members: string[]
  year: number
  category: string | null
  hosted_by: string | null
  description: string | null
  thumbnail_url: string | null
  created_at: string
  // 영어 원문 (admin 편집용)
  competition_en?: string | null
  award_name_en?: string | null
  hosted_by_en?: string | null
  description_en?: string | null
}

/** 수상 전체 목록 — 연도 내림차순 (캐시 5분) */
export async function getAwards(locale: string = 'ko'): Promise<AwardItem[]> {
  const fetcher = unstable_cache(
    async (): Promise<AwardItem[]> => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('awards')
          .select('*')
          .order('year', { ascending: false })
          .order('created_at', { ascending: false })

        if (error) {
          console.error('[getAwards]', error.message)
          return []
        }
        return (data ?? []) as AwardItem[]
      } catch (err) {
        console.error('[getAwards] unexpected:', err)
        return []
      }
    },
    [`awards-list`],
    { revalidate: 300, tags: ['awards'] }
  )

  const items = await fetcher()
  return applyLocaleList(items, ['competition', 'award_name', 'hosted_by', 'description'], locale)
}

/** 단일 수상 조회 (캐시 5분) */
export async function getAwardById(id: string, locale: string = 'ko'): Promise<AwardItem | null> {
  const fetcher = unstable_cache(
    async (): Promise<AwardItem | null> => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('awards')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.error('[getAwardById]', error.message)
          return null
        }
        return data as AwardItem
      } catch (err) {
        console.error('[getAwardById] unexpected:', err)
        return null
      }
    },
    [`award-by-id-${id}`],
    { revalidate: 300, tags: ['awards'] }
  )

  const item = await fetcher()
  if (!item) return null
  return applyLocale(item, ['competition', 'award_name', 'hosted_by', 'description'], locale)
}
