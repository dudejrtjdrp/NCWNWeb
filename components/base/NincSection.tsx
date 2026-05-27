/**
 * BASE 컴포넌트: NincSection (Server Component)
 * Figma node-id: 376:1492 (NINCSection)
 *
 * 데이터 전략:
 * - ninc_home_cards 테이블에서 활성 카드 fetch (getHomeNincCards)
 * - 데이터 없으면 MOCK_SLIDE_CARDS (SVG 목데이터) fallback
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
import { getHomeNincCards, type HomeNincCard } from '@/lib/supabase/queries/home'

// ── 목데이터 (Supabase에 데이터 없을 때 fallback) ─────────────
const MOCK_SLIDE_CARDS: HomeNincCard[] = [
  { id: 'mock-1', image_url: '/images/ninc/card1.svg', card_width: 512, card_height: 310, alt_text: 'NINC 활동 1', link_href: null, sort_order: 0 },
  { id: 'mock-2', image_url: '/images/ninc/card2.svg', card_width: 282, card_height: 389, alt_text: 'NINC 활동 2', link_href: null, sort_order: 1 },
  { id: 'mock-3', image_url: '/images/ninc/card3.svg', card_width: 287, card_height: 268, alt_text: 'NINC 활동 3', link_href: null, sort_order: 2 },
  { id: 'mock-4', image_url: '/images/ninc/card4.svg', card_width: 390, card_height: 354, alt_text: 'NINC 활동 4', link_href: null, sort_order: 3 },
]

export interface NincSectionProps {
  className?: string
}

export default async function NincSection({ className = '' }: NincSectionProps) {
  // Supabase fetch → 실패하거나 데이터 없으면 목데이터 사용
  const serverCards = await getHomeNincCards()
  const displayCards = serverCards.length > 0 ? serverCards : MOCK_SLIDE_CARDS

  return (
    <section
      className={`relative bg-white py-[80px] ${className}`}
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
          className="flex items-center gap-[78px] overflow-x-auto scrollbar-hide px-8 py-12"
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
                style={{ width: card.card_width, height: card.card_height } as React.CSSProperties}
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
