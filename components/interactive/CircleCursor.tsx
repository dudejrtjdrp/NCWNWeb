'use client'

/**
 * CircleCursor — 포인터를 뒤따르는 커서 링
 * ────────────────────────────────────────────────────────────
 * originkit.dev "Circle Cursor" 를 참고하되, 원본의 goo 필터 + difference 블렌드는
 * 쓰지 않는다. 뷰포트 전체를 덮는 fixed 레이어에 filter/mix-blend-mode 를 걸면
 * 브라우저가 매 프레임 화면 전체를 다시 합성해야 해서, 특히 Windows(DPR 1) +
 * Lenis 스무스 스크롤 + 홈 히어로 rAF 조합에서 화면이 미세하게 떨린다.
 *
 * 그래서 여기서는
 *  - 덮개 레이어 없이 작은 요소 2개만 fixed 로 띄우고
 *  - transform 만 갱신한다 (레이아웃/페인트 없음, 합성만)
 *  - 포인터가 없는 기기·모션 최소화 설정에서는 아예 렌더하지 않는다
 */

import { useEffect, useRef, useState } from 'react'

export interface CircleCursorProps {
  /** 링 지름(px) */
  size?: number
  /** 중심 점 지름(px) */
  dotSize?: number
  /** 링이 포인터를 따라잡는 속도 (0~1, 클수록 빠름) */
  ease?: number
  color?: string
}

export default function CircleCursor({
  size = 34,
  dotSize = 6,
  ease = 0.18,
  color = 'var(--color-green-darker)',
}: CircleCursorProps) {
  const [enabled, setEnabled] = useState(false)
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const pointer = useRef({ x: -999, y: -999 })
  const ring = useRef({ x: -999, y: -999 })
  const raf = useRef<number>()
  const active = useRef(false)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setEnabled(fine && !still)
  }, [])

  useEffect(() => {
    if (!enabled) return

    const onMove = (e: PointerEvent) => {
      pointer.current.x = e.clientX
      pointer.current.y = e.clientY
      if (!active.current) {
        active.current = true
        ring.current.x = e.clientX
        ring.current.y = e.clientY
      }
    }
    const onLeave = () => { active.current = false }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave, { passive: true })

    let last = 0
    const frame = (ts: number) => {
      raf.current = requestAnimationFrame(frame)
      // 포인터가 아직 화면에 들어오지 않았으면 아무 것도 그리지 않는다
      if (!active.current) return
      const dt = last ? Math.min((ts - last) / 1000, 0.1) : 1 / 60
      last = ts

      // 프레임레이트 독립 보간
      const k = 1 - Math.pow(1 - ease, dt * 60)
      ring.current.x += (pointer.current.x - ring.current.x) * k
      ring.current.y += (pointer.current.y - ring.current.y) * k

      // 정수 px 로 스냅 — DPR 1 환경에서 서브픽셀 진동이 보이지 않게 한다
      const rx = Math.round(ring.current.x - size / 2)
      const ry = Math.round(ring.current.y - size / 2)
      const dx = Math.round(pointer.current.x - dotSize / 2)
      const dy = Math.round(pointer.current.y - dotSize / 2)

      if (ringRef.current) ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`
    }
    raf.current = requestAnimationFrame(frame)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [enabled, ease, size, dotSize])

  if (!enabled) return null

  const base: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    borderRadius: '9999px',
    pointerEvents: 'none',
    zIndex: 60,
    transform: 'translate3d(-999px, -999px, 0)',
  }

  return (
    <div aria-hidden className="hidden lg:block">
      <div
        ref={ringRef}
        style={{ ...base, width: size, height: size, border: `1.5px solid ${color}`, opacity: 0.55 }}
      />
      <div ref={dotRef} style={{ ...base, width: dotSize, height: dotSize, background: color }} />
    </div>
  )
}
