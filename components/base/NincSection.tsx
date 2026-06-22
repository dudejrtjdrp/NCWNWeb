/**
 * BASE 컴포넌트: NincSection (Server Component)
 * Figma node-id: 376:1492 (NINCSection) + 1152:3640 (장식 레터 C)
 *
 * 데이터 전략:
 * - 1순위: ninc_home_cards 테이블의 관리자 큐레이션 카드 (getHomeNincCards)
 * - 2순위: 실제 NINC 활동(프로젝트+수상+졸업전시) 자동 노출 (getHomeNincActivities)
 * - 이미지가 있는 실제 항목이 0개면 섹션 미렌더(목데이터 미노출)
 *
 * 2026 리뉴얼:
 * - 기존 유기적 블롭 배경 제거 → 글로시 3D 레터 C가 좌측에 떠 있는 구성
 * - 카드: 가로 나열 + 인덱스별 세로 스태거 오프셋(에디토리얼 리듬)
 * - 썸네일: 기본 흑백 → 호버 시 컬러 (모노톤 에디토리얼 톤)
 */

import Image from 'next/image'
import Link from 'next/link'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'
import DecorLetter from '@/components/sections/home/DecorLetter'
import { getHomeNincCards, getHomeNincActivities } from '@/lib/supabase/queries/home'

export interface NincSectionProps {
  locale?: string
  className?: string
}

/** 카드 인덱스별 세로 스태거 오프셋(px) — Figma 슬라이드 배치 리듬 반영 */
const STAGGER = [44, 0, 64, 20]

export default async function NincSection({ locale = 'ko', className = '' }: NincSectionProps) {
  // 1) 관리자 큐레이션(ninc_home_cards) 우선 → 2) 비면 실제 NINC 활동(프로젝트+수상+졸업전시)
  const curated = await getHomeNincCards()
  const displayCards = curated.length > 0 ? curated : await getHomeNincActivities(locale)

  // 이미지가 있는 실제 카드가 하나도 없으면 섹션을 렌더하지 않음(목데이터 미노출)
  if (displayCards.length === 0) return null

  return (
    <section
      className={`relative isolate bg-white py-[clamp(56px,9vw,104px)] ${className}`}
      style={{ overflowX: 'clip' }}
      data-node-id="376:1492"
      aria-label="Now In NewCon"
    >
      {/* 장식 레터 C — 좌측, 카드 뒤로 살짝 블리드 */}
      <DecorLetter
        src="/images/home/letter-2.png"
        delay={700}
        baseRotate={-3}
        style={{
          width: 'clamp(150px, 25vw, 360px)',
          top: 'clamp(24px, 5vw, 104px)',
          left: 'clamp(-44px, -2vw, -8px)',
        }}
      />

      {/* 섹션 헤더 */}
      <AnimateOnScroll variant="fade-up" className="relative z-10 flex items-center justify-center pb-[clamp(36px,5vw,52px)]">
        <p
          className="font-brand text-nwcn-text-default text-center"
          style={{ fontSize: 'clamp(18px, 2vw, 23px)' }}
          data-node-id="376:653"
        >
          Now In NewCon
        </p>
      </AnimateOnScroll>

      {/* 슬라이드 카드 — 가로 나열 + 세로 스태거 */}
      <div className="relative z-10 flex justify-center" data-node-id="376:1489">
        <div
          className="flex items-start gap-8 sm:gap-[52px] lg:gap-[78px] overflow-x-auto scrollbar-hide px-4 sm:px-8 pt-[clamp(16px,3vw,40px)] pb-8 sm:pb-12"
          data-node-id="376:1488"
        >
          {displayCards.map((card, i) => {
            const inner = (
              <div className="rounded-md overflow-hidden w-full h-full">
                <Image
                  src={card.image_url}
                  alt={card.alt_text ?? `NINC 활동 ${i + 1}`}
                  fill
                  className="object-cover grayscale transition duration-500 ease-out group-hover:grayscale-0"
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
                  marginTop: `${STAGGER[i % STAGGER.length]}px`,
                } as React.CSSProperties}
              >
                {card.link_href ? (
                  <Link
                    href={card.link_href}
                    className="group relative w-full h-full block transform transition duration-200 ease-out hover:scale-105 hover:shadow-2xl hover:z-20 focus:outline-none cursor-pointer"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div
                    role="img"
                    className="group relative w-full h-full transform transition duration-200 ease-out hover:scale-105 hover:shadow-2xl hover:z-20"
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
