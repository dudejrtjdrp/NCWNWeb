'use client'

/**
 * NINC / PROJECT — 산학협력 / 해외교류 쇼케이스 캐러셀
 * Figma node-id: 1093:1914, 1093:1915
 *
 * 디자인 요구사항:
 *  - 사진: 가로(좌우) 슬라이드
 *  - 글자: 슬라이드 전환 시 아래 → 위로 올라오는 애니메이션
 *  - 하단 슬라이드바(노란/초록)로 진행 표시 + 클릭 시 해당 장으로 이동
 *  - 이미지/화살표 클릭 시 프로젝트 상세 페이지(/ninc/project/[id])로 이동
 *  - 카테고리별로 이미지/텍스트 좌우 위치 교차(imageRight)
 */

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'
import { cn } from '@/lib/utils'
import type { ShowcaseBlock } from '@/constants/ninc-project'

const ACCENT = {
  yellow: { badge: 'bg-nwcn-yellow', bar: 'bg-nwcn-yellow' },
  green: { badge: 'bg-nwcn-green', bar: 'bg-nwcn-green' },
} as const

function ArrowCircle() {
  return (
    <svg width="37" height="37" viewBox="0 0 37 37" fill="none" aria-hidden="true">
      <circle cx="18.5" cy="18.5" r="17.5" stroke="#050505" strokeWidth="1.2" />
      <path d="M15 12l7 6.5-7 6.5" stroke="#050505" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * 슬라이드 링크 래퍼
 * - 외부(http) 링크: 새 탭
 * - 내부 링크: next/link 클라이언트 라우팅(상세 페이지 이동)
 * - href가 비었거나 '#'(폴백 placeholder): 링크 비활성(div)
 * - 비활성 슬라이드(active=false)는 포커스/스크린리더 대상에서 제외
 */
function SlideLink({
  href,
  active,
  className,
  ariaLabel,
  children,
}: {
  href: string
  active: boolean
  className?: string
  ariaLabel?: string
  children: React.ReactNode
}) {
  const a11y = active ? {} : { tabIndex: -1, 'aria-hidden': true }
  const isPlaceholder = !href || href === '#'
  const isExternal = href.startsWith('http')

  if (isPlaceholder) {
    return (
      <div className={className} aria-label={ariaLabel}>
        {children}
      </div>
    )
  }

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={ariaLabel}
        {...a11y}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className} aria-label={ariaLabel} {...a11y}>
      {children}
    </Link>
  )
}

export default function ProjectShowcase({ block }: { block: ShowcaseBlock }) {
  const { label, accent, imageRight, slides } = block
  const [index, setIndex] = useState(0)
  const count = slides.length
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  // 자동 슬라이드(여러 장일 때만)
  useEffect(() => {
    if (count <= 1) return
    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), 5000)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [count])

  // 사용자가 직접 이동하면 자동 슬라이드 중지
  const goTo = (i: number) => {
    setIndex(((i % count) + count) % count)
    if (timer.current) clearInterval(timer.current)
  }

  const current = slides[index]

  /* ── 이미지 슬라이더(가로 이동) ── */
  const ImagePane = (
    <div className="relative h-[300px] sm:h-[420px] lg:h-[566px] w-full overflow-hidden bg-nwcn-surface-2">
      <div
        className="flex h-full w-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s, i) => (
          <SlideLink
            key={i}
            href={s.href}
            active={i === index}
            ariaLabel={`${s.title} 상세 보기`}
            className="relative block h-full w-full shrink-0"
          >
            <Image src={s.image} alt={s.title} fill className="object-cover" unoptimized />
          </SlideLink>
        ))}
      </div>
    </div>
  )

  /* ── 텍스트 패널(아래→위 애니메이션, key로 재생) ── */
  const TextPane = (
    <div className="flex h-[300px] sm:h-[420px] lg:h-[566px] flex-col justify-center gap-5 lg:gap-[34px] px-7 sm:px-12 lg:px-[79px] py-10 lg:py-[130px]">
      {/* key=index → 슬라이드 바뀔 때마다 slide-up 애니메이션 재생 */}
      <div key={index} className="animate-slide-up flex flex-col gap-5 lg:gap-[34px]">
        <span
          className={cn(
            'inline-flex w-fit items-center rounded-full px-3 py-[3px] font-body text-[16px] lg:text-[17.6px] text-[#050505]',
            ACCENT[accent].badge
          )}
        >
          {label}
        </span>

        <p className="font-body font-medium text-[16px] lg:text-[18px] leading-[27px] text-black">
          {current.date}
        </p>

        <div className="flex flex-col gap-[10px]">
          <h3 className="font-body font-extrabold text-[20px] lg:text-[24.5px] leading-tight text-black">
            {current.title}
          </h3>
          {current.place && (
            <p className="font-body font-medium text-[16px] lg:text-[18px] leading-[27px] text-black">
              {current.place}
            </p>
          )}
        </div>

        <SlideLink
          href={current.href}
          active
          ariaLabel={`${current.title} 자세히 보기`}
          className="mt-1 inline-block transition-transform duration-200 hover:translate-x-1"
        >
          <ArrowCircle />
        </SlideLink>
      </div>
    </div>
  )

  return (
    <AnimateOnScroll variant="fade" className="bg-white">
      <div className="relative">
        {/* 이미지/텍스트 2분할 (데스크탑은 교차 배치) */}
        <div className="grid grid-cols-1 lg:grid-cols-[58%_42%]">
          {imageRight ? (
            <>
              <div className="order-2 lg:order-1">{TextPane}</div>
              <div className="order-1 lg:order-2">{ImagePane}</div>
            </>
          ) : (
            <>
              <div className="order-1">{ImagePane}</div>
              <div className="order-2">{TextPane}</div>
            </>
          )}
        </div>

        {/* ── 슬라이드바 ── */}
        {/* 슬라이드가 여러 장이면 장 수만큼 세그먼트로 표시하고, 클릭하면 해당 장으로 이동 */}
        {count > 1 ? (
          <div
            className="flex w-full gap-1.5"
            role="tablist"
            aria-label={`${label} 슬라이드 (${count}장)`}
          >
            {slides.map((s, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`${i + 1} / ${count}: ${s.title}`}
                onClick={() => goTo(i)}
                className={cn(
                  'h-[10px] flex-1 transition-colors duration-300',
                  i === index ? ACCENT[accent].bar : 'bg-nwcn-border-muted hover:bg-nwcn-gray-faint'
                )}
              />
            ))}
          </div>
        ) : (
          <div className={cn('h-[10px] w-full', ACCENT[accent].bar)} aria-hidden="true" />
        )}
      </div>
    </AnimateOnScroll>
  )
}
