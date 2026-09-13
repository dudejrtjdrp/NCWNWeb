'use client'

/**
 * RevealOnScroll — 서브 페이지 공통 등장 모션
 * ────────────────────────────────────────────────────────────
 * <main> 직계 블록을 자동으로 훑어 동일한 fade-up 을 건다.
 *
 * 안전 규칙 (내용이 영영 안 보이는 사고를 막기 위한 장치들)
 *  1. 처음부터 화면 안에 있는 블록은 숨기지 않는다 — 즉시 그대로 보여준다.
 *  2. threshold 는 0 — 블록이 뷰포트보다 길면(예: 9000px 짜리 아티클 본문)
 *     교차 비율이 0.08 조차 못 넘어 관찰자가 영영 안 잡힌다. 실제로 NCR 상세
 *     페이지가 흰 화면으로 보이던 원인이 이것이었다.
 *  3. 크기가 0인 요소(스크립트 래퍼 등)는 건너뛴다 — 교차가 성립하지 않는다.
 *  4. 2초 안전장치 — 어떤 이유로든 관찰자가 안 잡히면 전부 드러낸다.
 *  5. 등장이 끝나면 inline style 을 제거해, transform 이 만든 containing block 이
 *     sticky/fixed 자식에 영향을 주지 않게 한다.
 *  6. prefers-reduced-motion 이면 아무것도 하지 않는다.
 */

import { useEffect, useRef } from 'react'

const DURATION = 700
const FAILSAFE_MS = 2000

export default function RevealOnScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const reveal = (el: HTMLElement) => {
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
      window.setTimeout(() => el.removeAttribute('style'), DURATION + 80)
    }

    const vh = window.innerHeight
    const targets: HTMLElement[] = []

    for (const node of Array.from(root.children)) {
      if (!(node instanceof HTMLElement)) continue
      if (node.hasAttribute('data-no-reveal')) continue

      const rect = node.getBoundingClientRect()
      if (rect.height === 0 || rect.width === 0) continue // 크기 0 → 교차 불가
      if (rect.top < vh * 0.9) continue                   // 이미 화면 안 → 그대로 노출

      node.style.opacity = '0'
      node.style.transform = 'translateY(20px)'
      node.style.transitionProperty = 'opacity, transform'
      node.style.transitionDuration = `${DURATION}ms`
      node.style.transitionTimingFunction = 'var(--ease-nwcn)'
      targets.push(node)
    }

    if (targets.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          io.unobserve(el)
          reveal(el)
        }
      },
      { threshold: 0, rootMargin: '0px 0px -6% 0px' }
    )
    targets.forEach((el) => io.observe(el))

    const failsafe = window.setTimeout(() => {
      io.disconnect()
      targets.forEach(reveal)
    }, FAILSAFE_MS)

    return () => {
      io.disconnect()
      window.clearTimeout(failsafe)
    }
  }, [])

  return <div ref={ref}>{children}</div>
}
