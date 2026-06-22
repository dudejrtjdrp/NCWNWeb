/**
 * 홈 장식용 글로시 3D 레터 (N·W·C·N → NWCN)
 * Figma: 1152:3642(N) / 1152:3641(W) / 1152:3640(C) / 1152:3639(N)
 *
 * - 순수 장식: aria-hidden, pointer-events-none, select-none
 * - 부모는 반드시 position: relative + overflow-x: clip (가로 스크롤 방지)
 * - 모션: (1) 래퍼 = 스크롤 위치 연동 미세 회전, (2) 이미지 = 상하 부유(floaty)
 *   둘 다 prefers-reduced-motion 시 자동 정지
 */

'use client'

import React, { useEffect, useRef } from 'react'

export interface DecorLetterProps {
  /** 레터 PNG 경로 (예: /images/home/letter-1.png) */
  src: string
  /** 위치/크기 등 배치용 클래스 (top/left/right + width 등) */
  className?: string
  /** 추가 인라인 스타일 (정밀 배치용 — top/left/width 등) */
  style?: React.CSSProperties
  /** 부드러운 상하 부유 애니메이션 (기본 true) */
  float?: boolean
  /** 부유 애니메이션 시작 지연(ms) — 레터마다 다르게 주어 리듬감 */
  delay?: number
  /** 스크롤 연동 회전 진폭(도). 화면을 지나는 동안 -amp ~ +amp 로 회전 (기본 5) */
  rotate?: number
  /** 기본 정적 기울기(도) — 레터별 개성 (기본 0) */
  baseRotate?: number
}

export default function DecorLetter({
  src,
  className = '',
  style,
  float = true,
  delay = 0,
  rotate = 5,
  baseRotate = 0,
}: DecorLetterProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      el.style.transform = `rotate(${baseRotate}deg)`
      return
    }

    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      // 요소가 화면 하단으로 진입(0) → 상단으로 이탈(1) 하는 진행도
      const progress = (vh - r.top) / (vh + r.height)
      const clamped = Math.max(0, Math.min(1, progress))
      const deg = baseRotate + (clamped - 0.5) * 2 * rotate // -rotate ~ +rotate
      el.style.transform = `rotate(${deg.toFixed(2)}deg)`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [rotate, baseRotate])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none select-none absolute z-0 will-change-transform ${className}`}
      style={style}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        className={`block w-full h-auto ${float ? 'animate-floaty' : ''}`}
        style={{ animationDelay: `${delay}ms` }}
      />
    </div>
  )
}
