/**
 * Home 페이지 전용 Supabase 쿼리
 *
 * 최적화 내역:
 * - getHomeNcrReports: 기존 2번 쿼리 → 1번 쿼리로 통합
 *   (is_home_featured DESC 정렬 후 클라이언트에서 분류)
 * - unstable_cache 적용 (TTL 5분, tag: 'home')
 * - 뮤테이션 시 revalidateTag('home')으로 즉시 무효화
 */

import { createDbClient as createClient } from '@/lib/supabase/db'
import { unstable_cache } from 'next/cache'

export interface HomeNincCard {
  id: string
  image_url: string
  alt_text: string | null
  link_href: string | null
  card_width: number
  card_height: number
  sort_order: number
}

export interface HomeNcrReport {
  id: string
  title: string
  type: 'editorial' | 'trend' | 'card_news'
  thumbnail_url: string | null
  published_at: string
  season: string | null
  excerpt: string | null
}

export interface HomeNcrReportsResult {
  items: HomeNcrReport[]
  /** is_home_featured=true 인 아티클 수 (0이면 최신순 fallback) */
  featuredCount: number
}

/**
 * 홈 NincSection용 슬라이드 카드 조회 (캐시 5분)
 */
export const getHomeNincCards = unstable_cache(
  async (): Promise<HomeNincCard[]> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('ninc_home_cards')
        .select('id, image_url, alt_text, link_href, card_width, card_height, sort_order')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('[getHomeNincCards] Supabase error:', error.message)
        return []
      }
      return data ?? []
    } catch (err) {
      console.error('[getHomeNincCards] Unexpected error:', err)
      return []
    }
  },
  ['home-ninc-cards'],
  { revalidate: 300, tags: ['home'] }
)

/**
 * 홈 NcrTrendSection용 아티클 2개 조회 (캐시 5분)
 *
 * 최적화: 2번 쿼리 → 1번 쿼리
 * - is_home_featured DESC 정렬로 featured 아티클을 먼저 가져옴
 * - 상위 4개를 가져온 뒤 featured가 있으면 최대 2개 선택, 없으면 최신 2개 선택
 */
export const getHomeNcrReports = unstable_cache(
  async (): Promise<HomeNcrReportsResult> => {
    try {
      const supabase = createClient()

      // is_home_featured DESC → published_at DESC 정렬로 단일 쿼리 처리
      // featured 아티클이 앞에 오므로 클라이언트에서 분류만 하면 됨
      const { data, error } = await supabase
        .from('ncr_reports')
        .select('id, title, type, thumbnail_url, published_at, season, excerpt, is_home_featured')
        .eq('is_published', true)
        .order('is_home_featured', { ascending: false })
        .order('published_at',     { ascending: false })
        .limit(4) // featured 최대 2개 + 최신 2개를 한 번에 가져옴

      if (error) {
        console.error('[getHomeNcrReports] Supabase error:', error.message)
        return { items: [], featuredCount: 0 }
      }

      if (!data || data.length === 0) {
        return { items: [], featuredCount: 0 }
      }

      // featured 아티클 분류
      const featured = data.filter((r) => r.is_home_featured)

      if (featured.length > 0) {
        const items = featured.slice(0, 2).map(({ is_home_featured: _, ...r }) => r)
        return { items: items as HomeNcrReport[], featuredCount: items.length }
      }

      // featured 없음 → 최신 2개
      const items = data.slice(0, 2).map(({ is_home_featured: _, ...r }) => r)
      return { items: items as HomeNcrReport[], featuredCount: 0 }
    } catch (err) {
      console.error('[getHomeNcrReports] Unexpected error:', err)
      return { items: [], featuredCount: 0 }
    }
  },
  ['home-ncr-reports'],
  { revalidate: 300, tags: ['home', 'ncr'] }
)
