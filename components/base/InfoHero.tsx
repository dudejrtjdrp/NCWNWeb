/**
 * BASE 컴포넌트: InfoHero (i18n 적용)
 * INFO 섹션 히어로 배너
 */

'use client'

import { useTranslations } from 'next-intl'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'

export default function InfoHero() {
  const t = useTranslations('info.hero')

  return (
    <div className="bg-white">
      <div
        className="relative w-full max-w-[1440px] mx-auto overflow-hidden flex items-center"
        style={{ minHeight: 'clamp(220px, 30vw, 420px)' }}
      >
        {/* 배경 워터마크 */}
        <div
          className="absolute select-none pointer-events-none"
          style={{ right: '-20px', bottom: '-20px' }}
          aria-hidden="true"
        >
          <span
            className="font-brand font-black text-[#f4f4f4]"
            style={{ fontSize: 'clamp(80px, 18vw, 280px)', lineHeight: 1 }}
          >
            INFO
          </span>
        </div>

        {/* 상단 장식 선 */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-nwcn-green via-nwcn-yellow to-transparent" />

        {/* 콘텐츠 */}
        <div className="px-4 sm:px-8 lg:px-[79px] flex flex-col justify-center gap-4 sm:gap-5 w-full">
          <AnimateOnScroll variant="fade-up" delay={0}>
            <p className="font-body font-semibold text-[12px] tracking-[0.2em] text-nwcn-green">
              {t('label')}
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={80}>
            <h1
              className="font-brand font-bold text-nwcn-text-default"
              style={{ fontSize: 'clamp(40px, 6vw, 80px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
            >
              {t('title')}
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={160}>
            <p className="font-body text-[15px] text-[#888] leading-relaxed max-w-[420px]">
              {t('description').split('\n').map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={220}>
            <div className="flex items-center gap-3 mt-2">
              <div className="w-8 h-[2px] bg-nwcn-green" />
              <div className="w-4 h-[2px] bg-nwcn-yellow" />
              <div className="w-2 h-[2px] bg-[#e0e0e0]" />
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </div>
  )
}
