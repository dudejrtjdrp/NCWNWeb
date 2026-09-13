/**
 * BASE 컴포넌트: NcrTrendSection (Server Component)
 * Figma node-id: 376:1609 (NCRTrendSection)
 *
 * 데이터 전략:
 * - ncr_reports에서 published_at DESC 기준 최신 2개 fetch
 * - reports[0] → 메인 카드 (좌), reports[1] → 서브 카드 (우)
 * - 데이터가 하나도 없으면 섹션 자체를 렌더하지 않는다 (목데이터 없음)
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
import DecorLetter from '@/components/sections/home/DecorLetter'
import { getHomeNcrReports, type HomeNcrReport } from '@/lib/supabase/queries/home'

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

function getArticleHref(id: string): string {
  return `/ncr-trend/${id}`
}

export interface NcrTrendSectionProps {
  className?: string
  locale?: string
}

export default async function NcrTrendSection({ className = '', locale = 'ko' }: NcrTrendSectionProps) {
  const { items: reports, featuredCount } = await getHomeNcrReports(locale)

  // 실제 등록된 리포트가 없으면 섹션을 숨긴다 (플레이스홀더 노출 금지)
  if (reports.length === 0) return null

  // 홈 고정이 정확히 1개면 왼쪽만, 그 외에는 두 번째 카드가 있을 때만 표시
  const singleFeatured = featuredCount === 1

  const mainCard = reports[0]
  const subCard  = singleFeatured ? null : (reports[1] ?? null)

  const mainHref = getArticleHref(mainCard.id)
  const subHref  = subCard ? getArticleHref(subCard.id) : ''

  return (
    <section
      className={`relative isolate bg-white py-section-sm ${className}`}
      style={{ overflowX: 'clip' }}
      data-node-id="376:1609"
      aria-label="NCR Trend"
    >
      {/* 카드 뒤 희미한 라운드 패널 (Figma 376:1563 UnderBackground) */}
      <div
        aria-hidden="true"
        className="absolute z-0 left-1/2 -translate-x-1/2 w-[min(95vw,1440px)] top-[clamp(64px,9vw,120px)] bottom-[clamp(20px,4vw,48px)] rounded-hero bg-nwcn-neutral-100"
      />

      {/* 장식 레터 N — 우측 상단, 위쪽으로 블리드 */}
      <DecorLetter
        src="/images/home/letter-4.png"
        delay={2000}
        baseRotate={3}
        style={{
          width: 'clamp(150px, 24vw, 360px)',
          top: 'clamp(-96px, -6vw, -28px)',
          right: 'clamp(-28px, -1.5vw, 12px)',
        }}
      />

      <div className="relative z-10 max-w-page mx-auto px-4">
        {/* 섹션 헤더 */}
        <AnimateOnScroll variant="fade-up" className="mb-[29px]">
          <p
            className="font-brand text-nwcn-text-default"
            style={{ fontSize: '23px' }}
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
              className={`flex flex-col gap-[22.589px] w-full flex-shrink-0 cursor-pointer transition-[color,background-color,border-color,transform,box-shadow,opacity] duration-base ease-nwcn hover:scale-[1.02] hover:shadow-lift-3 rounded-card p-5 -m-5 ${subCard ? 'lg:w-[620px]' : 'lg:w-[720px]'}`}
              data-node-id="376:1574"
            >
              {/* 썸네일 */}
              <div
                className="relative rounded-lg overflow-hidden w-full"
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
                  <div className="w-full h-full bg-nwcn-dark flex items-center justify-center">
                    <span className="font-brand font-black text-hero-1 text-nwcn-green/[0.12] leading-none">NCR</span>
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
                style={{ fontSize: 'clamp(20px, 2.5vw, 31.429px)', color: 'var(--color-green)', lineHeight: 'normal' }}
                data-node-id="427:874"
              >
                {mainCard.title}
              </p>

              {/* 날짜 */}
              <p
                className="font-body font-normal"
                style={{ fontSize: '15px', color: 'var(--color-text-sub)' }}
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
                className="flex flex-col gap-[26.375px] items-end w-full lg:w-[430px] flex-shrink-0 cursor-pointer transition-[color,background-color,border-color,transform,box-shadow,opacity] duration-base ease-nwcn hover:scale-[1.02] hover:shadow-lift-3 rounded-card p-5 -m-5"
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
                    style={{ fontSize: '17px', color: 'var(--color-text-muted)' }}
                    data-node-id="376:1600"
                  >
                    {subCard.title}
                  </p>
                  <p
                    className="font-body font-normal"
                    style={{ fontSize: '15px', color: 'var(--color-text-sub)' }}
                    data-node-id="376:1603"
                  >
                    {formatDate(subCard.published_at)}
                  </p>
                </div>

                {/* 서브 썸네일 */}
                <div
                  className="relative w-full rounded-lg overflow-hidden"
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
                    <div className="w-full h-full bg-nwcn-dark flex items-center justify-center">
                      <span className="font-brand font-black text-hero-2 text-nwcn-green/[0.1] leading-none">NCR</span>
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
