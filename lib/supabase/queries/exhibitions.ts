/**
 * exhibitions 쿼리 (캐시 5분, tag: 'exhibitions')
 */

import { createDbClient as createClient } from '@/lib/supabase/db'
import { unstable_cache } from 'next/cache'

export interface ExhibitionItem {
  id: string
  year: number
  title: string
  description: string | null
  theme: string | null
  poster_url: string | null
  link: string | null
  created_at: string
}

/**
 * 졸업전시 전체 목록 — 연도 내림차순 (캐시 5분)
 * 조회가 실패하면 캐시 안에서 에러를 던져 '빈 목록'이 캐시에 남지 않게 한다
 * (예전에는 실패 때 [] 를 돌려줘 그 빈 결과가 캐시에 저장되고 페이지에 "등록된 졸업전시가 없습니다"가 떴다).
 * 캐시에 있던 정상 데이터는 갱신 실패 시에도 그대로 쓰이고, 캐시도 없을 때만 [] 로 넘어간다.
 */
const fetchExhibitions = unstable_cache(
  async (): Promise<ExhibitionItem[]> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('exhibitions')
      .select('*')
      .order('year', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []) as ExhibitionItem[]
  },
  // v2: 예전 키에 저장됐을 수 있는 빈 결과를 새 배포에서 이어받지 않도록 키를 바꿈
  ['exhibitions-list-v2'],
  { revalidate: 300, tags: ['exhibitions'] }
)

export async function getExhibitions(): Promise<ExhibitionItem[]> {
  try {
    return await fetchExhibitions()
  } catch (err) {
    console.error('[getExhibitions]', err)
    return []
  }
}
