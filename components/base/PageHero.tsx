'use client'

/**
 * BASE 컴포넌트: PageHero — 전 섹션 공통 히어로
 * ────────────────────────────────────────────────────────────
 * 기존에 AboutHero / InfoHero / WorkHero / NcrHero / NincHeroBanner 5종이
 * 라벨·제목·설명이라는 같은 구조를 각자 다른 크기·간격·딜레이로 구현하고 있었다.
 * 이를 하나로 합쳐 톤을 통일한다.
 *
 * 통일 규칙
 *  - 라벨: text-label(12px / 0.2em) · 브랜드 그린
 *  - 제목: font-brand · text-hero-1 · originkit "Mask Text Reveal" 로 등장
 *  - 설명: text-body · 중립 500(라이트) / white-60(다크)
 *  - 등장 스태거: 0 → 80 → 160 → 240ms 고정
 *  - 좌우 거터: page-container 단일 값
 */

import Image from 'next/image'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'
import MaskTextReveal from '@/components/interactive/MaskTextReveal'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark' | 'image'
type Size = 'sm' | 'md' | 'lg'
type Decoration = 'bar' | 'dots' | 'grid' | 'none'

const heights: Record<Size, string> = {
  sm: 'clamp(260px, 32vw, 420px)',
  md: 'clamp(340px, 44vw, 560px)',
  lg: 'clamp(460px, 58vw, 780px)',
}

export interface PageHeroProps {
  label?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /** 배경에 크게 깔리는 워터마크 텍스트 */
  watermark?: string
  theme?: Theme
  size?: Size
  decoration?: Decoration
  /** theme="image" 일 때 배경 사진 */
  backgroundImage?: string
  /** 제목 아래에 붙일 추가 요소 */
  footer?: React.ReactNode
  /** 텍스트 대신(또는 함께) 보여줄 미디어 — AboutHero 로고 등 */
  media?: React.ReactNode
  className?: string
}

/** 줄바꿈(\n)이 들어간 i18n 문자열을 <br/> 로 렌더 */
function multiline(value: React.ReactNode) {
  if (typeof value !== 'string') return value
  const lines = value.split('\n')
  return lines.map((line, i) => (
    <span key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ))
}

export default function PageHero({
  label,
  title,
  description,
  watermark,
  theme = 'light',
  size = 'md',
  decoration = 'none',
  backgroundImage,
  footer,
  media,
  className,
}: PageHeroProps) {
  const dark = theme !== 'light'

  return (
    <section
      className={cn('relative isolate w-full overflow-hidden', theme === 'light' && 'bg-white', className)}
      style={{
        minHeight: heights[size],
        background:
          theme === 'dark'
            ? 'linear-gradient(135deg, #0d1a0f 0%, #151515 42%, #0a1a12 100%)'
            : theme === 'image'
              ? 'var(--color-neutral-900)'
              : undefined,
      }}
    >
      {/* 배경 사진 */}
      {theme === 'image' && backgroundImage && (
        <>
          <Image src={backgroundImage} alt="" fill priority unoptimized className="-z-10 object-cover" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{ background: 'linear-gradient(to bottom, rgba(20,20,20,0.55) 0%, rgba(20,20,20,0.15) 40%, rgba(20,20,20,0.85) 100%)' }}
          />
        </>
      )}

      {/* 배경 패턴 */}
      {decoration === 'grid' && (
        <div aria-hidden className={cn('pointer-events-none absolute inset-0 -z-10', dark ? 'bg-grid-dark' : 'bg-grid')} />
      )}

      {/* 워터마크 */}
      {watermark && (
        <div aria-hidden className="pointer-events-none absolute right-[-2%] top-1/2 hidden -translate-y-1/2 select-none sm:block">
          <span
            className={cn('font-brand font-black leading-none', dark ? 'text-nwcn-green/[0.07]' : 'text-nwcn-neutral-100')}
            style={{ fontSize: 'clamp(120px, 20vw, 300px)' }}
          >
            {watermark}
          </span>
        </div>
      )}

      {/* 상단 브랜드 라인 — 모든 히어로 공통 시그니처 */}
      <div aria-hidden className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-nwcn-green via-nwcn-yellow to-transparent" />

      {/* 콘텐츠 */}
      <div
        className="page-container relative z-10 flex flex-col justify-center gap-4 sm:gap-5"
        style={{ minHeight: heights[size] }}
      >
        {label && (
          <AnimateOnScroll variant="fade-up" delay={0}>
            <p className="font-body text-label font-semibold uppercase text-nwcn-green">{label}</p>
          </AnimateOnScroll>
        )}

        <MaskTextReveal
          as="h1"
          direction="up"
          delay={80}
          className={cn('font-brand text-hero-1 font-bold', dark ? 'text-white' : 'text-nwcn-text-default')}
        >
          {multiline(title)}
        </MaskTextReveal>

        {description && (
          <AnimateOnScroll variant="fade-up" delay={160}>
            <p className={cn('max-w-prose font-body text-body', dark ? 'text-white/55' : 'text-nwcn-neutral-500')}>
              {multiline(description)}
            </p>
          </AnimateOnScroll>
        )}

        {(decoration === 'bar' || footer) && (
          <AnimateOnScroll variant="fade-up" delay={240}>
            <div className="mt-2 flex items-center gap-3">
              {decoration === 'bar' && (
                <>
                  <span className="h-[2px] w-8 bg-nwcn-green" />
                  <span className="h-[2px] w-4 bg-nwcn-yellow" />
                  <span className={cn('h-[2px] w-2', dark ? 'bg-white/25' : 'bg-nwcn-neutral-200')} />
                </>
              )}
              {footer}
            </div>
          </AnimateOnScroll>
        )}

        {media && (
          <AnimateOnScroll variant="fade" delay={240} duration={900} className="mt-6 w-full">
            {media}
          </AnimateOnScroll>
        )}
      </div>

      {/* 도트 패턴 */}
      {decoration === 'dots' && (
        <AnimateOnScroll
          variant="fade"
          delay={300}
          className="pointer-events-none absolute bottom-10 right-4 z-0 hidden select-none grid-cols-5 gap-3 opacity-20 sm:right-8 sm:grid lg:right-20"
          aria-hidden="true"
        >
          {Array.from({ length: 25 }).map((_, i) => (
            <span key={i} className="block h-2 w-2 rounded-full bg-nwcn-green" />
          ))}
        </AnimateOnScroll>
      )}
    </section>
  )
}
