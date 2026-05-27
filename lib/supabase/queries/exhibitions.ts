import { createClient } from '@/lib/supabase/server'

export interface ExhibitionItem {
  id: string
  year: number
  title: string
  description: string | null
  theme: string | null
  poster_url: string | null
  created_at: string
}

/** 졸업전시 전체 목록 — 연도 내림차순 */
export async function getExhibitions(): Promise<ExhibitionItem[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('exhibitions')
      .select('*')
      .order('year', { ascending: false })

    if (error) {
      console.error('[getExhibitions]', error.message)
      return []
    }
    return (data ?? []) as ExhibitionItem[]
  } catch (err) {
    console.error('[getExhibitions] unexpected:', err)
    return []
  }
}
