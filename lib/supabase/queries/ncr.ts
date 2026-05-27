import { createDbClient as createClient } from '@/lib/supabase/db'

export interface NcrReportItem {
  id: string
  title: string
  author: string | null
  type: 'editorial' | 'trend' | 'card_news'
  season: string | null
  published_at: string
  excerpt: string | null
  description: string | null
  content: string | null
  tags: string[]
  related_ids: string[]
  thumbnail_url: string | null
  read_time: string | null
  is_published: boolean
  created_at: string
}

/** 발행된 NCR 리포트 전체 목록 — 발행일 내림차순 */
export async function getNcrReports(): Promise<NcrReportItem[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ncr_reports')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    if (error) {
      console.error('[getNcrReports]', error.message)
      return []
    }
    return (data ?? []) as NcrReportItem[]
  } catch (err) {
    console.error('[getNcrReports] unexpected:', err)
    return []
  }
}

/** 단일 NCR 리포트 조회 */
export async function getNcrReportById(id: string): Promise<NcrReportItem | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ncr_reports')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single()

    if (error) {
      console.error('[getNcrReportById]', error.message)
      return null
    }
    return data as NcrReportItem
  } catch (err) {
    console.error('[getNcrReportById] unexpected:', err)
    return null
  }
}

/** 관련 리포트 조회 (related_ids 배열 기반) */
export async function getRelatedNcrReports(relatedIds: string[]): Promise<NcrReportItem[]> {
  if (!relatedIds.length) return []
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ncr_reports')
      .select('id, title, type, season, published_at, excerpt, thumbnail_url')
      .in('id', relatedIds)
      .eq('is_published', true)

    if (error) {
      console.error('[getRelatedNcrReports]', error.message)
      return []
    }
    return (data ?? []) as NcrReportItem[]
  } catch (err) {
    console.error('[getRelatedNcrReports] unexpected:', err)
    return []
  }
}
