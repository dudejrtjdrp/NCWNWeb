import { createDbClient as createClient } from '@/lib/supabase/db'

export interface ProjectItem {
  id: string
  title: string
  type: 'industry' | 'international'
  partner: string | null
  year: number
  description: string | null
  thumbnail_url: string | null
  participants: string[] | null
  duration: string | null
  outcome: string | null
  skills: string[] | null
  created_at: string
}

/** 프로젝트 전체 목록 — 연도 내림차순 */
export async function getProjects(): Promise<ProjectItem[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('year', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[getProjects]', error.message)
      return []
    }
    return (data ?? []) as ProjectItem[]
  } catch (err) {
    console.error('[getProjects] unexpected:', err)
    return []
  }
}

/** 단일 프로젝트 조회 */
export async function getProjectById(id: string): Promise<ProjectItem | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('[getProjectById]', error.message)
      return null
    }
    return data as ProjectItem
  } catch (err) {
    console.error('[getProjectById] unexpected:', err)
    return null
  }
}
