/**
 * BASE 컴포넌트: WorkHero (i18n 적용)
 * WORK 섹션 히어로 배너
 */

'use client'

import { useTranslations } from 'next-intl'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'

export default function WorkHero() {
  const t = useTranslations('work.hero')

  return (
    <div className="bg-white">
      <div
        className="relative w-full max-w-[1440px] mx-auto overflow-hidden"
        style={{ minHeight: 'clamp(360px, 45vw, 680px)' }}
      >
        {/* 배경 장식 — 대형 WORK 워터마크 */}
        <div
          className="absolute select-none pointer-events-none hidden sm:block"
          style={{ right: '-40px', top: '50%', transform: 'translateY(-50%)' }}
          aria-hidden="true"
        >
          <span
            className="font-brand font-black text-[#f0f0f0]"
            style={{ fontSize: 'clamp(120px, 22vw, 320px)', lineHeight: 1 }}
          >
            WORK
          </span>
        </div>

        {/* 좌측 그린 세로 액센트 바 */}
        <div
          className="absolute left-4 sm:left-8 lg:left-[79px] top-[30%] w-[4px] bg-nwcn-green rounded-full hidden sm:block"
          style={{ height: '200px' }}
          aria-hidden="true"
        />

        {/* 콘텐츠 */}
        <div
          className="absolute inset-0 flex flex-col justify-center gap-4 sm:gap-6 px-4 sm:px-8 lg:px-[79px]"
        >
          <AnimateOnScroll variant="fade-up" delay={0}>
            <p className="font-body font-semibold text-[12px] sm:text-[13px] tracking-[0.2em] text-nwcn-green sm:pl-[18px]">
              {t('label')}
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={80}>
            <h1
              className="font-brand font-bold text-nwcn-text-default sm:pl-[18px]"
              style={{ fontSize: 'clamp(36px, 7vw, 96px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
            >
              {t('title').split('\n').map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={160}>
            <p className="font-body text-[14px] sm:text-[15px] text-[#888] leading-relaxed sm:pl-[18px] max-w-[400px]">
              {t('description').split('\n').map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </p>
          </AnimateOnScroll>
        </div>

        {/* 우하단 장식 도트 패턴 */}
        <AnimateOnScroll
          variant="fade"
          delay={300}
          className="absolute right-4 sm:right-8 lg:right-[79px] bottom-[40px] sm:bottom-[60px] grid grid-cols-5 gap-3 opacity-20 pointer-events-none select-none hidden sm:grid"
          aria-hidden="true"
        >
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-nwcn-green" />
          ))}
        </AnimateOnScroll>
      </div>
    </div>
  )
}
