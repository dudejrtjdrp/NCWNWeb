/**
 * ncr_reports 쿼리
 *
 * - 목록 조회: content(본문) 컬럼 제외 → 전송량 대폭 절감
 * - unstable_cache로 캐싱 (TTL 5분, tag: 'ncr')
 * - 뮤테이션 시 revalidateTag('ncr')으로 즉시 무효화
 * - locale='en'일 때 _en 컬럼 우선 반환, 비어있으면 한국어 원문 사용
 */

import { createDbClient as createClient } from '@/lib/supabase/db'
import { unstable_cache } from 'next/cache'
import { applyLocale, applyLocaleList } from './_locale'

export interface ArticleType { value: string; label: string }

/** 기본 아티클 유형 — settings에 데이터 없을 때 fallback */
export const DEFAULT_ARTICLE_TYPES: ArticleType[] = [
  { value: 'editorial', label: '에디토리얼' },
  { value: 'trend', label: '트렌드' },
  { value: 'card_news', label: '카드뉴스' },
]

/** 아티클 유형 목록 (settings 테이블 — 캐시 1분, 없으면 기본값) */
export async function getArticleTypes(): Promise<ArticleType[]> {
  const fetcher = unstable_cache(
    async (): Promise<ArticleType[]> => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'article_types')
          .maybeSingle()
        const val = data?.value
        if (Array.isArray(val) && (val as ArticleType[]).length > 0) return val as ArticleType[]
        return DEFAULT_ARTICLE_TYPES
      } catch {
        return DEFAULT_ARTICLE_TYPES
      }
    },
    ['article-types'],
    { revalidate: 60, tags: ['article-types'] }
  )
  return fetcher()
}

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
  // 영어 원문 (admin 편집용)
  title_en?: string | null
  excerpt_en?: string | null
  description_en?: string | null
  content_en?: string | null
}

/**
 * 목록 조회용 타입.
 * content(본문 전체)는 목록 페이지에서 불필요하므로 제외하여
 * Supabase → Next.js 간 전송 데이터를 최소화합니다.
 */
export type NcrReportListItem = Omit<NcrReportItem, 'content' | 'content_en'>

/** 목록 SELECT 컬럼 (content 제외) */
const LIST_COLUMNS =
  'id, title, title_en, author, type, season, published_at, excerpt, excerpt_en, description, description_en, tags, related_ids, thumbnail_url, read_time, is_published, created_at'

/** 발행된 NCR 리포트 전체 목록 — 발행일 내림차순 (캐시 5분) */
export async function getNcrReports(locale: string = 'ko'): Promise<NcrReportListItem[]> {
  const fetcher = unstable_cache(
    async (): Promise<NcrReportListItem[]> => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('ncr_reports')
          .select(LIST_COLUMNS)
          .eq('is_published', true)
          .order('published_at', { ascending: false })

        if (error) {
          console.error('[getNcrReports]', error.message)
          return []
        }
        return (data ?? []) as NcrReportListItem[]
      } catch (err) {
        console.error('[getNcrReports] unexpected:', err)
        return []
      }
    },
    [`ncr-list`],
    { revalidate: 300, tags: ['ncr'] }
  )

  const items = await fetcher()
  return applyLocaleList(items, ['title', 'excerpt', 'description'], locale)
}

/** 단일 NCR 리포트 조회 — content 포함 (캐시 5분) */
export async function getNcrReportById(id: string, locale: string = 'ko'): Promise<NcrReportItem | null> {
  const fetcher = unstable_cache(
    async (): Promise<NcrReportItem | null> => {
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
    },
    [`ncr-by-id-${id}`],
    { revalidate: 300, tags: ['ncr'] }
  )

  const item = await fetcher()
  if (!item) return null
  return applyLocale(item, ['title', 'excerpt', 'description', 'content'], locale)
}

/** 관련 리포트 조회 (related_ids 배열 기반, 캐시 5분) */
export async function getRelatedNcrReports(relatedIds: string[], locale: string = 'ko'): Promise<NcrReportListItem[]> {
  if (!relatedIds.length) return []

  const fetcher = unstable_cache(
    async (): Promise<NcrReportListItem[]> => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('ncr_reports')
          .select('id, title, title_en, type, season, published_at, excerpt, excerpt_en, thumbnail_url, author, tags, related_ids, description, description_en, read_time, is_published, created_at')
          .in('id', relatedIds)
          .eq('is_published', true)

        if (error) {
          console.error('[getRelatedNcrReports]', error.message)
          return []
        }
        return (data ?? []) as NcrReportListItem[]
      } catch (err) {
        console.error('[getRelatedNcrReports] unexpected:', err)
        return []
      }
    },
    [`ncr-related-${relatedIds.join(',')}`],
    { revalidate: 300, tags: ['ncr'] }
  )

  const items = await fetcher()
  return applyLocaleList(items, ['title', 'excerpt', 'description'], locale)
}
