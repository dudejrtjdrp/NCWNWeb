'use client'

/**
 * AnchorBar — 페이지 안 목차 줄 (E4)
 * 히어로 아래에 붙는 1px 위아래 선 줄. 스크롤하면 헤더 바로 아래에 붙어 따라오고,
 * 지금 읽고 있는 섹션에 밑줄이 그어진다. 클릭하면 Lenis(없으면 네이티브)로 부드럽게 이동.
 */

import { useEffect, useRef, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export interface AnchorItem {
  id: string
  label: string
}

export interface AnchorBarProps {
  items: AnchorItem[]
  /** 목차 nav 의 aria-label */
  label: string
  /** 오른쪽 테두리 버튼 (예: 입학 안내) */
  cta?: { href: string; label: string }
}

const HEADER_PX = 64

type LenisLike = { scrollTo: (target: HTMLElement) => void }

export default function AnchorBar({ items, label, cta }: AnchorBarProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string | null>(null)

  // 스크롤 위치로 현재 섹션 계산 (Lenis 도 window scroll 이벤트를 그대로 낸다)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const line = HEADER_PX + (barRef.current?.offsetHeight ?? 48) + 24
      let next: string | null = null
      for (const item of items) {
        const el = document.getElementById(item.id)
        if (el && el.getBoundingClientRect().top <= line) next = item.id
      }
      // 페이지 끝까지 내려와 마지막 섹션이 기준선에 못 닿는 경우 → 마지막 항목을 현재로
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      if (atBottom && next) next = items[items.length - 1].id
      setActive(next)
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [items])

  const jump = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    event.preventDefault()
    // 멈출 위치는 섹션의 scroll-margin-top(scroll-mt-36 = 헤더 + 이 줄 + 여백)이 정한다.
    // Lenis 도 scroll-margin-top 을 반영하므로 offset 을 따로 주지 않는다(주면 두 번 빠짐).
    const lenis = (window as Window & { __lenis?: LenisLike }).__lenis
    if (lenis) {
      lenis.scrollTo(el)
    } else {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    }
    window.history.replaceState(null, '', `#${id}`)
  }

  return (
    <div data-no-reveal className="sticky top-16 z-30 bg-nwcn-paper">
      <div className="editorial-container">
        <div
          ref={barRef}
          className="flex items-center justify-between gap-4 border-y border-nwcn-dark py-2.5 font-semibold text-body-sm"
        >
          <nav aria-label={label} className="-mx-1 min-w-0 overflow-x-auto scrollbar-hide">
            <ul className="flex gap-x-5 px-1 lg:gap-x-6">
              {items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => jump(e, item.id)}
                    aria-current={active === item.id ? 'location' : undefined}
                    className={cn(
                      'block whitespace-nowrap py-1 underline-offset-4 decoration-2 transition-colors duration-fast ease-nwcn',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark',
                      active === item.id
                        ? 'underline decoration-nwcn-green-darker'
                        : 'hover:underline hover:decoration-nwcn-green-darker'
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {cta && (
            <Link
              href={cta.href}
              className="hidden shrink-0 border border-nwcn-dark px-3 py-1.5 sm:inline-block transition-colors duration-fast ease-nwcn hover:bg-nwcn-dark hover:text-nwcn-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark focus-visible:ring-offset-2 focus-visible:ring-offset-nwcn-paper"
            >
              {cta.label} <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
