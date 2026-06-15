'use client'

/**
 * NINC / PROJECT — 산학협력 / 해외교류 쇼케이스 캐러셀
 * Figma node-id: 1093:1914, 1093:1915
 *
 * 디자인 요구사항:
 *  - 사진: 가로(좌우) 슬라이드
 *  - 글자: 슬라이드 전환 시 아래 → 위로 올라오는 애니메이션
 *  - 하단 슬라이드바로 진행 표시
 *  - 이미지 클릭 시 링크 이동(추후 교체)
 *  - 카테고리별로 이미지/텍스트 좌우 위치 교차(imageRight)
 */

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
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

  const goTo = (i: number) => {
    setIndex(i)
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
          <a
            key={i}
            href={s.href}
            target={s.href.startsWith('http') ? '_blank' : undefined}
            rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="relative block h-full w-full shrink-0"
            aria-label={s.title}
          >
            <Image src={s.image} alt={s.title} fill className="object-cover" unoptimized />
          </a>
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
          <p className="font-body font-medium text-[16px] lg:text-[18px] leading-[27px] text-black">
            {current.place}
          </p>
        </div>

        <a
          href={current.href}
          target={current.href.startsWith('http') ? '_blank' : undefined}
          rel={current.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="mt-1 inline-block transition-transform duration-200 hover:translate-x-1"
          aria-label={`${current.title} 자세히 보기`}
        >
          <ArrowCircle />
        </a>
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

        {/* 슬라이드바 */}
        <div className="relative h-[10px] w-full bg-nwcn-border-muted">
          <button
            type="button"
            onClick={() => goTo((index + 1) % count)}
            className={cn('h-full transition-[width,margin] duration-700 ease-out', ACCENT[accent].bar)}
            style={{
              width: `${100 / count}%`,
              marginLeft: `${(index * 100) / count}%`,
            }}
            aria-label="다음 슬라이드"
          />
        </div>
      </div>
    </AnimateOnScroll>
  )
}
