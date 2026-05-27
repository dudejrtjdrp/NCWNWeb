import { createClient } from '@/lib/supabase/server'

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
}

/** 수상 전체 목록 — 연도 내림차순 */
export async function getAwards(): Promise<AwardItem[]> {
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
}

/** 단일 수상 조회 */
export async function getAwardById(id: string): Promise<AwardItem | null> {
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
}
