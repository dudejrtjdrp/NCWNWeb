'use client'

/**
 * RevealOnScroll — 서브 페이지 공통 등장 모션
 * ────────────────────────────────────────────────────────────
 * 기존에는 AnimateOnScroll 을 붙인 페이지와 안 붙인 페이지가 섞여 있어
 * "어떤 페이지는 살아있고 어떤 페이지는 정적"으로 느껴졌다.
 * 이 컴포넌트는 <main> 직계 블록을 자동으로 훑어 동일한 fade-up 을 건다.
 *
 * 안전장치
 *  - 히어로(첫 블록)와 data-no-reveal 요소는 건너뛴다 (자체 모션 보유)
 *  - 등장이 끝나면 inline style 을 완전히 제거해, transform 이 만든
 *    containing block 이 sticky/fixed 자식에 영향을 주지 않게 한다
 *  - prefers-reduced-motion 이면 아무것도 하지 않는다
 */

import { useEffect, useRef } from 'react'

const DURATION = 700

export default function RevealOnScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const blocks = Array.from(root.children).filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && !el.hasAttribute('data-no-reveal')
    )
    // 첫 블록(히어로)은 자체 모션이 있으므로 제외
    const targets = blocks.slice(1)
    if (targets.length === 0) return

    for (const el of targets) {
      el.style.opacity = '0'
      el.style.transform = 'translateY(20px)'
      el.style.transitionProperty = 'opacity, transform'
      el.style.transitionDuration = `${DURATION}ms`
      el.style.transitionTimingFunction = 'var(--ease-nwcn)'
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          io.unobserve(el)
          // 전환이 끝나면 흔적 없이 정리
          window.setTimeout(() => el.removeAttribute('style'), DURATION + 80)
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
    )
    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return <div ref={ref}>{children}</div>
}
