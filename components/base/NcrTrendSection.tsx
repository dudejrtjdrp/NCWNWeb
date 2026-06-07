/**
 * BASE 컴포넌트: NcrTrendSection (Server Component)
 * Figma node-id: 376:1609 (NCRTrendSection)
 *
 * 데이터 전략:
 * - ncr_reports에서 published_at DESC 기준 최신 2개 fetch
 * - reports[0] → 메인 카드 (좌), reports[1] → 서브 카드 (우)
 * - 각각 없으면 MOCK_MAIN / MOCK_SUB fallback
 *
 * 디자인 스펙:
 * - 헤더: "NCR Trend" A2Z체 23.077px, black
 * - 메인 카드 (좌): 썸네일 + Talks 태그(green) + 제목(green) + 날짜
 * - 서브 카드 (우): Contents 태그(yellow) + 제목 + 날짜 + 썸네일
 * - 배경: white
 * - 호버: scale-up + shadow 애니메이션
 */

import Link from 'next/link'
import Tag from '@/components/base/Tag'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'
import { getHomeNcrReports, type HomeNcrReport } from '@/lib/supabase/queries/home'

// ── 목데이터 (Supabase에 데이터 없을 때 fallback) ─────────────
const MOCK_MAIN: HomeNcrReport = {
  id: 'mock-main',
  title: 'AI 시대, 학과의 강점과 비전을 묻다',
  type: 'editorial',
  thumbnail_url: '/images/ncr/main.svg',
  published_at: '2025-08-25T00:00:00Z',
  season: null,
  excerpt: null,
}

const MOCK_SUB: HomeNcrReport = {
  id: 'mock-sub',
  title: '보성 미디어파사드 워크숍',
  type: 'trend',
  thumbnail_url: '/images/ncr/sub.png',
  published_at: '2026-05-05T00:00:00Z',
  season: null,
  excerpt: null,
}

// ── 타입별 태그 매핑 ──────────────────────────────────────────
const TYPE_TAG_TYPE: Record<HomeNcrReport['type'], 'talks' | 'contents'> = {
  editorial: 'talks',
  trend: 'talks',
  card_news: 'contents',
}

// 날짜 포맷: "Aug 25 2025"
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// mock ID인지 확인 (링크 분기용)
function getArticleHref(id: string): string {
  return id.startsWith('mock') ? '/ncr-trend/latest' : `/ncr-trend/${id}`
}

export interface NcrTrendSectionProps {
  className?: string
  locale?: string
}

export default async function NcrTrendSection({ className = '', locale = 'ko' }: NcrTrendSectionProps) {
  const { items: reports, featuredCount } = await getHomeNcrReports(locale)

  // 홈 고정이 정확히 1개면 왼쪽만, 그 외(0개 fallback or 2개)는 양쪽 모두 표시
  const singleFeatured = featuredCount === 1

  const mainCard = reports[0] ?? MOCK_MAIN
  const subCard  = singleFeatured ? null : (reports[1] ?? MOCK_SUB)

  const mainHref = getArticleHref(mainCard.id)
  const subHref  = subCard ? getArticleHref(subCard.id) : ''

  return (
    <section
      className={`bg-white py-[60px] px-4 ${className}`}
      data-node-id="376:1609"
      aria-label="NCR Trend"
    >
      <div className="max-w-[1266px] mx-auto">
        {/* 섹션 헤더 */}
        <AnimateOnScroll variant="fade-up" className="mb-[29px]">
          <p
            className="font-brand text-[#050505]"
            style={{ fontSize: '23.077px' }}
            data-node-id="376:1496"
          >
            NCR Trend
          </p>
        </AnimateOnScroll>

        {/* 카드 영역 */}
        <div
          className={`flex flex-col lg:flex-row gap-[49px] items-start ${subCard ? 'lg:justify-between' : ''}`}
          data-node-id="376:1607"
        >
          {/* ── 메인 카드 (좌) ── */}
          <AnimateOnScroll
            variant="fade-right"
            delay={0}
            className={`w-full flex-shrink-0 ${subCard ? 'lg:w-[620px]' : 'lg:w-[720px]'}`}
          >
            <Link
              href={mainHref}
              className={`flex flex-col gap-[22.589px] w-full flex-shrink-0 cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_28px_52px_rgba(0,0,0,0.18)] rounded-[12px] p-5 -m-5 ${subCard ? 'lg:w-[620px]' : 'lg:w-[720px]'}`}
              data-node-id="376:1574"
            >
              {/* 썸네일 */}
              <div
                className="relative rounded-[7.912px] overflow-hidden w-full"
                style={{ height: 'clamp(220px, 35vw, 445px)' }}
                data-node-id="376:1494"
              >
                {mainCard.thumbnail_url ? (
                  <img
                    src={mainCard.thumbnail_url}
                    alt={mainCard.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-[#151515] flex items-center justify-center">
                    <span className="font-brand font-black text-[72px] text-nwcn-green/[0.12] leading-none">NCR</span>
                  </div>
                )}
                {/* 그라디언트 오버레이 */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.00) 40%, rgba(0,0,0,0.55) 100%)' }}
                  data-node-id="376:1493"
                />
              </div>

              {/* 태그 */}
              <div data-node-id="376:1559">
                <Tag type={TYPE_TAG_TYPE[mainCard.type]}>
                  {mainCard.type === 'editorial' ? 'Talks' : mainCard.type === 'trend' ? 'Trend' : 'Card News'}
                </Tag>
              </div>

              {/* 제목 */}
              <p
                className="font-body font-semibold"
                style={{ fontSize: 'clamp(20px, 2.5vw, 31.429px)', color: '#09F593', lineHeight: 'normal' }}
                data-node-id="427:874"
              >
                {mainCard.title}
              </p>

              {/* 날짜 */}
              <p
                className="font-body font-normal"
                style={{ fontSize: '14.946px', color: '#B9B8B6' }}
                data-node-id="376:1573"
              >
                {formatDate(mainCard.published_at)}
              </p>
            </Link>
          </AnimateOnScroll>

          {/* ── 서브 카드 (우) — 홈 고정 2개일 때만 표시 ── */}
          {subCard && (
            <AnimateOnScroll variant="fade-left" delay={150} className="w-full lg:w-[430px] flex-shrink-0">
              <Link
                href={subHref}
                className="flex flex-col gap-[26.375px] items-end w-full lg:w-[430px] flex-shrink-0 cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_28px_52px_rgba(0,0,0,0.18)] rounded-[12px] p-5 -m-5"
                data-node-id="376:1606"
              >
                {/* 태그 */}
                <div data-node-id="376:1592">
                  <Tag type="contents">Contents</Tag>
                </div>

                {/* 제목 + 날짜 */}
                <div
                  className="flex flex-col gap-[5.275px] w-full text-right"
                  data-node-id="376:1615"
                >
                  <p
                    className="font-body font-semibold w-full"
                    style={{ fontSize: '17.583px', color: '#323131' }}
                    data-node-id="376:1600"
                  >
                    {subCard.title}
                  </p>
                  <p
                    className="font-body font-normal"
                    style={{ fontSize: '14.946px', color: '#B9B8B6' }}
                    data-node-id="376:1603"
                  >
                    {formatDate(subCard.published_at)}
                  </p>
                </div>

                {/* 서브 썸네일 */}
                <div
                  className="relative w-full rounded-[7.912px] overflow-hidden"
                  style={{ height: 'clamp(200px, 30vw, 430px)' }}
                  data-node-id="376:669"
                >
                  {subCard.thumbnail_url ? (
                    <img
                      src={subCard.thumbnail_url}
                      alt={subCard.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#151515] flex items-center justify-center">
                      <span className="font-brand font-black text-[40px] text-nwcn-green/[0.1] leading-none">NCR</span>
                    </div>
                  )}
                </div>
              </Link>
            </AnimateOnScroll>
          )}
        </div>
      </div>
    </section>
  )
}
