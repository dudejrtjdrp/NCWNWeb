/**
 * BASE 컴포넌트: NincSection
 * Figma node-id: 376:1492 (NINCSection)
 *
 * 디자인 스펙:
 * - 섹션 헤더: "Now In NewCon" A2Z체 23px, black
 * - 배경: 유기적 형태 이미지 (blur, -14.75deg 회전)
 * - 슬라이드 카드 4장 (가로 배치, gap 78px)
 * - 카드 크기: 512×310 / 282×389 / 287×268 / 390×354
 */

import React from 'react'
import Image from 'next/image'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'

// 로컬 목데이터로 대체
const ASSETS = {
  bg: '/images/ninc/bg.svg',
  card1: '/images/ninc/card1.svg', // 512×310
  card2: '/images/ninc/card2.svg', // 282×389
  card3: '/images/ninc/card3.svg', // 287×268
  card4: '/images/ninc/card4.svg', // 390×354
} 

const SLIDE_CARDS = [
  { src: ASSETS.card1, width: 512, height: 310, alt: 'NINC 활동 1' },
  { src: ASSETS.card2, width: 282, height: 389, alt: 'NINC 활동 2' },
  { src: ASSETS.card3, width: 287, height: 268, alt: 'NINC 활동 3' },
  { src: ASSETS.card4, width: 390, height: 354, alt: 'NINC 활동 4' },
]

export interface NincSectionProps {
  className?: string
}

export default function NincSection({ className = '' }: NincSectionProps) {
  return (
    <section
      className={`relative bg-white py-[80px] ${className}`}
      style={{ overflowX: 'clip' }}
      data-node-id="376:1492"
      aria-label="Now In NewCon"
    >
      {/* 배경 유기적 형태 — Figma: blur 2px, -14.75deg */}
      {/* overflow-x: clip 으로 수평만 클립 → 회전된 이미지 상하 잘림 방지 */}
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
            src={ASSETS.bg}
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
        {/* 데스크탑: 가로 스크롤 가능 컨테이너 */}
        <div
          className="flex items-center gap-[78px] overflow-x-auto scrollbar-hide px-8 py-12"
          data-node-id="376:1488"
        >
          {SLIDE_CARDS.map((card, i) => (
            <AnimateOnScroll
              key={i}
              variant="fade-up"
              delay={i * 100}
              className="relative flex-shrink-0 py-2"
              style={{ width: card.width, height: card.height } as React.CSSProperties}
            >
              <div
                role="button"
                tabIndex={0}
                className="relative w-full h-full transform transition duration-200 ease-out hover:scale-105 hover:shadow-2xl hover:z-20 focus:outline-none cursor-pointer"
              >
                <div className="rounded-md overflow-hidden w-full h-full">
                  <Image
                    src={card.src}
                    alt={card.alt}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
