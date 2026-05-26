/**
 * BASE 컴포넌트: WhatIsSection
 * Figma node-id: 376:663 (What is NeWCon?)
 * + node-id: 427:879 (IntroVideo)
 * + node-id: 452:189 (Slogan)
 *
 * 디자인 스펙:
 * - "What / is / NewCon?" — A2Z체, 19.914px, black, center
 * - IntroVideo 영역 (810px 높이)
 * - 슬로건 텍스트 — Pretendard Bold 28px / ExtraBold 45px
 * - "뉴미디어콘텐츠과" — 그린 그라디언트 (#00e888 → #00824c)
 */

export interface WhatIsSectionProps {
  className?: string
}

import React from 'react'
import Image from 'next/image'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'

export default function WhatIsSection({ className = '' }: WhatIsSectionProps) {
  return (
    <section className={`bg-white ${className}`} aria-label="What is NewCon?">
      {/* What is NewCon? 헤더 */}
      <div
        className="flex flex-col items-center pt-[60px] pb-[40px]"
        data-node-id="376:663"
      >
        {['What', 'is', 'NewCon?'].map((word, i) => (
          <AnimateOnScroll key={word} variant="fade-up" delay={i * 80} as="p"
            className="font-brand text-[#050505] text-center leading-normal"
            style={{ fontSize: '19.914px' } as React.CSSProperties}
          >
            {word}
          </AnimateOnScroll>
        ))}
      </div>

      {/* 인트로 비디오 영역 (Figma: 810px 높이) */}
      <AnimateOnScroll variant="fade" duration={800}>
        <div
          className="w-screen relative left-1/2 -translate-x-1/2 bg-white overflow-hidden"
          style={{ height: 'calc(100vw * 810 / 1920)' }}
          data-node-id="427:879"
        >
          {/* TODO: 실제 인트로 비디오/Rive 애니메이션으로 교체 */}
          <div className="absolute inset-0">
            <Image
              src="/images/intro/intro-video-placeholder.svg"
              alt="Intro placeholder"
              fill
              className="object-cover w-full h-full"
              priority
            />
          </div>
        </div>
      </AnimateOnScroll>

      {/* 슬로건 섹션 */}
      <div
        className="flex flex-col items-center text-center py-16 px-4"
        data-node-id="452:189"
      >
        <AnimateOnScroll variant="fade-up" delay={0}>
          <p
            className="font-body font-bold text-[#323131] mb-4"
            style={{ fontSize: 'clamp(18px, 2.5vw, 28.259px)' }}
          >
            예술의 감각과 기술의 힘이 만나는 순간,
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll variant="fade-up" delay={100}>
          <p
            className="font-body font-bold text-[#323131] mb-8"
            style={{ fontSize: 'clamp(18px, 2.5vw, 28.259px)' }}
          >
            새로운 가능성을 만들어내는
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll variant="fade-up" delay={200}>
          <p
            className="font-body font-extrabold text-[#323131]"
            style={{ fontSize: 'clamp(24px, 4vw, 45.215px)', lineHeight: 1.2 }}
          >
            {'우리는 '}
            <span
              style={{
                background: 'linear-gradient(to right, #00e888, #00824c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              뉴미디어콘텐츠과
            </span>
            입니다.
          </p>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
