/**
 * BASE 컴포넌트: NincSection (Server Component)
 * Figma node-id: 376:1492 (NINCSection)
 *
 * 데이터 전략:
 * - 1순위: ninc_home_cards 테이블의 관리자 큐레이션 카드 (getHomeNincCards)
 * - 2순위: 실제 NINC 활동(프로젝트+수상+졸업전시) 자동 노출 (getHomeNincActivities)
 * - 이미지가 있는 실제 항목이 0개면 섹션 미렌더(목데이터 미노출)
 *
 * 디자인 스펙:
 * - 섹션 헤더: "Now In NewCon" A2Z체 23px, black
 * - 배경: 유기적 형태 이미지 (blur, -14.75deg 회전)
 * - 슬라이드 카드: 가로 배치, gap 78px
 * - 기본 카드 크기: 512×310 / 282×389 / 287×268 / 390×354
 */

import Image from 'next/image'
import Link from 'next/link'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'
import { getHomeNincCards, getHomeNincActivities } from '@/lib/supabase/queries/home'

export interface NincSectionProps {
  locale?: string
  className?: string
}

export default async function NincSection({ locale = 'ko', className = '' }: NincSectionProps) {
  // 1) 관리자 큐레이션(ninc_home_cards) 우선 → 2) 비면 실제 NINC 활동(프로젝트+수상+졸업전시)
  const curated = await getHomeNincCards()
  const displayCards = curated.length > 0 ? curated : await getHomeNincActivities(locale)

  // 이미지가 있는 실제 카드가 하나도 없으면 섹션을 렌더하지 않음(목데이터 미노출)
  if (displayCards.length === 0) return null

  return (
    <section
      className={`relative bg-white py-12 sm:py-16 lg:py-[80px] ${className}`}
      style={{ overflowX: 'clip' }}
      data-node-id="376:1492"
      aria-label="Now In NewCon"
    >
      {/* 배경 유기적 형태 — Figma: blur 2px, -14.75deg */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <div
          style={{
            transform: 'rotate(-14.75deg)',
            filter: 'blur(2px)',
            width: '1400px',
            height: '900px',
            position: 'relative',
          }}
        >
          <Image
            src="/images/ninc/bg.svg"
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      </div>

      {/* 섹션 헤더 */}
      <AnimateOnScroll variant="fade-up" className="relative z-10 flex items-center justify-center pb-[52px]">
        <p
          className="font-brand text-[#050505] text-center"
          style={{ fontSize: '23px' }}
          data-node-id="376:653"
        >
          Now In NewCon
        </p>
      </AnimateOnScroll>

      {/* 슬라이드 카드 — Figma: 가로 나열, gap 78px */}
      <div
        className="relative z-10 flex items-center justify-center"
        data-node-id="376:1489"
      >
        <div
          className="flex items-center gap-8 sm:gap-[52px] lg:gap-[78px] overflow-x-auto scrollbar-hide px-4 sm:px-8 py-8 sm:py-12"
          data-node-id="376:1488"
        >
          {displayCards.map((card, i) => {
            const inner = (
              <div
                className="rounded-md overflow-hidden w-full h-full"
              >
                <Image
                  src={card.image_url}
                  alt={card.alt_text ?? `NINC 활동 ${i + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )

            return (
              <AnimateOnScroll
                key={card.id}
                variant="fade-up"
                delay={i * 100}
                className="relative flex-shrink-0 py-2"
                style={{
                  width: `clamp(${Math.round(card.card_width * 0.55)}px, ${(card.card_width / 1440 * 100).toFixed(2)}vw, ${card.card_width}px)`,
                  height: `clamp(${Math.round(card.card_height * 0.55)}px, ${(card.card_height / 1440 * 100).toFixed(2)}vw, ${card.card_height}px)`,
                } as React.CSSProperties}
              >
                {card.link_href ? (
                  <Link
                    href={card.link_href}
                    className="relative w-full h-full block transform transition duration-200 ease-out hover:scale-105 hover:shadow-2xl hover:z-20 focus:outline-none cursor-pointer"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div
                    role="img"
                    className="relative w-full h-full transform transition duration-200 ease-out hover:scale-105 hover:shadow-2xl hover:z-20"
                  >
                    {inner}
                  </div>
                )}
              </AnimateOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
