/**
 * projects 쿼리 (캐시 5분, tag: 'projects')
 */

import { createDbClient as createClient } from '@/lib/supabase/db'
import { unstable_cache } from 'next/cache'

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

/** 프로젝트 전체 목록 — 연도 내림차순 (캐시 5분) */
export const getProjects = unstable_cache(
  async (): Promise<ProjectItem[]> => {
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
  },
  ['projects-list'],
  { revalidate: 300, tags: ['projects'] }
)

/** 단일 프로젝트 조회 (캐시 5분) */
export const getProjectById = unstable_cache(
  async (id: string): Promise<ProjectItem | null> => {
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
  },
  ['project-by-id'],
  { revalidate: 300, tags: ['projects'] }
)
