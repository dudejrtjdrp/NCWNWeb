import { createDbClient as createClient } from '@/lib/supabase/db'

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

/** 쇼케이스 전체 목록 — 연도/조회수 내림차순 */
export async function getShowcaseWorks(): Promise<WorkItem[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('showcase_works')
      .select('*')
      .order('year', { ascending: false })
      .order('view_count', { ascending: false })

    if (error) {
      console.error('[getShowcaseWorks]', error.message)
      return []
    }
    return (data ?? []) as WorkItem[]
  } catch (err) {
    console.error('[getShowcaseWorks] unexpected:', err)
    return []
  }
}

/** 단일 작품 조회 */
export async function getWorkById(id: string): Promise<WorkItem | null> {
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
}
