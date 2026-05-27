/**
 * Home 페이지 전용 Supabase 쿼리
 * - getHomeNincCards: ninc_home_cards 테이블에서 활성 카드 조회
 * - getHomeNcrReports: ncr_reports 조회
 *   → is_home_featured=true 인 아티클을 우선 노출 (최대 2개)
 *   → featured 아티클이 없으면 최신 2개로 fallback
 *
 * 두 함수 모두 빈 배열을 반환할 수 있으며,
 * 각 컴포넌트에서 빈 배열일 경우 목데이터로 fallback 처리함.
 */

import { createDbClient as createClient } from '@/lib/supabase/db'

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

/**
 * 홈 NincSection용 슬라이드 카드 조회
 * ninc_home_cards 테이블 → is_active=true, sort_order ASC
 * 레코드 없으면 [] 반환 → 컴포넌트에서 SVG 목데이터로 fallback
 */
export async function getHomeNincCards(): Promise<HomeNincCard[]> {
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
}

/**
 * 홈 NcrTrendSection용 아티클 2개 조회
 * 1순위: is_home_featured=true 이고 is_published=true 인 아티클 (최대 2개)
 * 2순위: featured 없으면 published_at DESC 최신 2개로 fallback
 */
export async function getHomeNcrReports(): Promise<HomeNcrReport[]> {
  try {
    const supabase = createClient()

    // is_home_featured 컬럼이 존재하는 경우 우선 조회
    const { data: featured, error: featuredError } = await supabase
      .from('ncr_reports')
      .select('id, title, type, thumbnail_url, published_at, season, excerpt')
      .eq('is_published', true)
      .eq('is_home_featured', true)
      .order('published_at', { ascending: false })
      .limit(2)

    // featured 아티클이 1개 이상이면 그대로 반환
    if (!featuredError && featured && featured.length > 0) {
      return featured as HomeNcrReport[]
    }

    // fallback: 최신 2개
    const { data, error } = await supabase
      .from('ncr_reports')
      .select('id, title, type, thumbnail_url, published_at, season, excerpt')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(2)

    if (error) {
      console.error('[getHomeNcrReports] Supabase error:', error.message)
      return []
    }

    return (data ?? []) as HomeNcrReport[]
  } catch (err) {
    console.error('[getHomeNcrReports] Unexpected error:', err)
    return []
  }
}
