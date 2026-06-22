/**
 * BASE 컴포넌트: WhatIsSection (i18n 적용)
 * Figma node-id: 376:663 (What is NeWCon?) + 452:189 (Slogan)
 * + 장식 3D 레터: 1152:3642(N, 좌상) / 1152:3641(W, 우하)
 *
 * 2026 리뉴얼: 기존 인트로 영상 밴드 제거 → 글로시 3D 레터가 떠 있는
 * 여백 중심 에디토리얼 레이아웃으로 교체.
 */

'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'
import DecorLetter from '@/components/sections/home/DecorLetter'

export interface WhatIsSectionProps {
  className?: string
}

export default function WhatIsSection({ className = '' }: WhatIsSectionProps) {
  const t = useTranslations('home.whatIs')

  return (
    <section
      className={`relative isolate bg-white overflow-x-clip ${className}`}
      style={{ overflowX: 'clip' }}
      aria-label="What is NewCon?"
    >
      {/* 장식 레터 N — 좌상단 (그린 틴트) */}
      <DecorLetter
        src="/images/home/letter-1.png"
        delay={0}
        style={{
          width: 'clamp(150px, 23vw, 360px)',
          top: 'clamp(8px, 2vw, 48px)',
          left: 'clamp(-8px, 4vw, 110px)',
        }}
      />

      {/* 장식 레터 W — 우하단 (오른쪽으로 살짝 블리드) */}
      <DecorLetter
        src="/images/home/letter-3.png"
        delay={1400}
        style={{
          width: 'clamp(170px, 26vw, 400px)',
          bottom: 'clamp(24px, 5vw, 96px)',
          right: 'clamp(-72px, -3vw, -8px)',
        }}
      />

      {/* What is NewCon? 헤더 */}
      <div className="relative z-10 flex flex-col items-center pt-[clamp(72px,10vw,128px)] pb-[clamp(8px,1.5vw,20px)]">
        {['What', 'is', 'NewCon?'].map((word, i) => (
          <AnimateOnScroll
            key={word}
            variant="fade-up"
            delay={i * 80}
            as="p"
            className="font-brand text-nwcn-text-default text-center leading-normal"
            style={{ fontSize: 'clamp(16px, 1.6vw, 19.914px)' } as React.CSSProperties}
          >
            {word}
          </AnimateOnScroll>
        ))}
      </div>

      {/* 슬로건 */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-[clamp(56px,8vw,104px)] pb-[clamp(180px,26vw,360px)]">
        <AnimateOnScroll variant="fade-up" delay={0}>
          <p
            className="font-body font-bold text-nwcn-text-muted mb-[clamp(8px,1.2vw,16px)]"
            style={{ fontSize: 'clamp(18px, 2.5vw, 28.259px)' }}
          >
            {t('slogan1')}
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll variant="fade-up" delay={100}>
          <p
            className="font-body font-bold text-nwcn-text-muted mb-[clamp(20px,3vw,40px)]"
            style={{ fontSize: 'clamp(18px, 2.5vw, 28.259px)' }}
          >
            {t('slogan2')}
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll variant="fade-up" delay={200}>
          <p
            className="font-body font-extrabold text-nwcn-text-muted"
            style={{ fontSize: 'clamp(24px, 4vw, 45.215px)', lineHeight: 1.2 }}
          >
            {t('slogan3')}{' '}
            <span
              style={{
                background: 'linear-gradient(to right, #00e888, #00824c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t('slogan3Highlight')}
            </span>
            {t('slogan3End')}
          </p>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
