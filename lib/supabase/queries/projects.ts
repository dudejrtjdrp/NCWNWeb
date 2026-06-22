/**
 * projects 쿼리 (캐시 5분, tag: 'projects')
 * - locale='en'일 때 _en 컬럼 우선 반환, 비어있으면 한국어 원문 사용
 */

import { createDbClient as createClient } from '@/lib/supabase/db'
import { unstable_cache } from 'next/cache'
import { applyLocale, applyLocaleList } from './_locale'

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
  /** 프로젝트 분야 (예: 영상제작, 브랜딩, UX/UI) */
  category: string | null
  /** 관련 결과물/외부 링크 (http(s) URL) */
  project_url: string | null
  created_at: string
  // 영어 원문 (admin 편집용)
  title_en?: string | null
  description_en?: string | null
  outcome_en?: string | null
}

/** 프로젝트 전체 목록 — 연도 내림차순 (캐시 5분) */
export async function getProjects(locale: string = 'ko'): Promise<ProjectItem[]> {
  const fetcher = unstable_cache(
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

  const items = await fetcher()
  return applyLocaleList(items, ['title', 'description', 'outcome'], locale)
}

/** 단일 프로젝트 조회 (캐시 5분) */
export async function getProjectById(id: string, locale: string = 'ko'): Promise<ProjectItem | null> {
  const fetcher = unstable_cache(
    async (): Promise<ProjectItem | null> => {
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
    [`project-by-id-${id}`],
    { revalidate: 300, tags: ['projects'] }
  )

  const item = await fetcher()
  if (!item) return null
  return applyLocale(item, ['title', 'description', 'outcome'], locale)
}
