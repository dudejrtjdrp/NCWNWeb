'use client'

/**
 * CircleCursor — 포인터를 뒤따르는 블롭 커서
 * ────────────────────────────────────────────────────────────
 * originkit.dev 의 "Circle Cursor" 를 의존성 없이 구현.
 * 여러 개의 블롭이 서로 다른 속도로 포인터를 쫓고, SVG goo 필터로 하나처럼 뭉친다.
 * 단일 rAF 루프만 사용하며, 터치 기기·모션 최소화 환경에서는 렌더하지 않는다.
 *
 * NWCN 은 뉴미디어콘텐츠과라는 정체성상 커서 자체가 하나의 인터랙션이지만,
 * 가독성을 해치지 않도록 mix-blend-mode: difference 로 절제해 표현한다.
 */

import { useEffect, useRef, useState } from 'react'

export interface CircleCursorProps {
  /** 블롭 개수 */
  count?: number
  /** 선두 블롭 지름(px) */
  size?: number
  /** 꼬리 블롭 지름(px) */
  tailSize?: number
  /** 선두가 포인터를 따라잡는 속도(클수록 빠름) */
  leadSpeed?: number
  /** 꼬리가 뒤처지는 정도(클수록 느림) */
  trailLag?: number
  color?: string
}

export default function CircleCursor({
  count = 3,
  size = 28,
  tailSize = 12,
  leadSpeed = 10,
  trailLag = 10,
  color = 'var(--color-green)',
}: CircleCursorProps) {
  const [enabled, setEnabled] = useState(false)
  const blobs = useRef<(HTMLDivElement | null)[]>([])
  const pos = useRef<{ x: number; y: number }[]>([])
  const pointer = useRef({ x: -999, y: -999 })
  const raf = useRef<number>()

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setEnabled(fine && !still)
  }, [])

  useEffect(() => {
    if (!enabled) return
    pos.current = Array.from({ length: count }, () => ({ x: -999, y: -999 }))

    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    let last = 0
    const frame = (ts: number) => {
      const dt = last ? Math.min((ts - last) / 1000, 0.1) : 1 / 60
      last = ts

      for (let i = 0; i < count; i++) {
        // 선두는 포인터를, 뒤 블롭은 앞 블롭을 쫓는다 (단계적 지연)
        const goal = i === 0 ? pointer.current : pos.current[i - 1]
        const speed = i === 0 ? leadSpeed : leadSpeed * (1 - Math.min(0.85, trailLag / 20))
        const k = 1 - Math.pow(0.001, speed * dt * 0.1)
        const p = pos.current[i]
        p.x += (goal.x - p.x) * k
        p.y += (goal.y - p.y) * k

        const el = blobs.current[i]
        if (!el) continue
        const d = size + ((tailSize - size) * i) / Math.max(1, count - 1)
        el.style.width = `${d}px`
        el.style.height = `${d}px`
        el.style.transform = `translate3d(${p.x - d / 2}px, ${p.y - d / 2}px, 0)`
      }
      raf.current = requestAnimationFrame(frame)
    }
    raf.current = requestAnimationFrame(frame)

    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [enabled, count, size, tailSize, leadSpeed, trailLag])

  if (!enabled) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] hidden lg:block"
      style={{ filter: 'url(#nwcn-goo)', mixBlendMode: 'difference' }}
    >
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="nwcn-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
            />
          </filter>
        </defs>
      </svg>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { blobs.current[i] = el }}
          className="absolute left-0 top-0 rounded-full will-change-transform"
          style={{ background: color }}
        />
      ))}
    </div>
  )
}
