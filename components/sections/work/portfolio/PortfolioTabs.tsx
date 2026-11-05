'use client'

/**
 * PortfolioTabs — 개인 페이지 '학과 정리본 / 원본 포트폴리오' 전환 (E4)
 * 헤더 아래에 붙어 따라오는 1px 선 줄. 주소 끝 #original 이면 원본으로 열리고,
 * 페이지 안 '원본 보기' 링크(#original)를 누르면 원본으로 바뀐다. 다른 #목차 링크는 정리본 그대로.
 * 정리본일 때 줄 오른쪽에 프로젝트 번호(01 02 …)가 붙어, 긴 페이지에서 바로 옮겨 가고 지금 보는 프로젝트가 표시된다.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type View = 'summary' | 'original'

export default function PortfolioTabs({
  summary,
  original,
  labels,
  nav = [],
}: {
  summary: ReactNode
  original: ReactNode
  labels: { view: string; summary: string; original: string; projects?: string }
  /** 프로젝트 바로가기 — id 는 정리본 안 프로젝트 칸의 id (p1, p2 …) */
  nav?: { id: string; title: string }[]
}) {
  const [view, setView] = useState<View>('summary')
  const [current, setCurrent] = useState<string | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  // 지금 화면에 걸친 프로젝트 — 화면 위쪽 40% 선을 지나는 칸
  useEffect(() => {
    if (view !== 'summary' || nav.length < 2) return
    const els = nav.map((n) => document.getElementById(n.id)).filter((el): el is HTMLElement => !!el)
    const seen = new Map<string, boolean>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting)
        setCurrent(nav.find((n) => seen.get(n.id))?.id ?? null)
      },
      { rootMargin: '-40% 0px -59% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [view, nav])

  useEffect(() => {
    const sync = () => {
      if (window.location.hash === '#original') {
        setView('original')
        barRef.current?.scrollIntoView({ block: 'start' })
      } else if (window.location.hash === '#summary') {
        setView('summary')
      }
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const choose = (v: View) => {
    setView(v)
    history.replaceState(null, '', v === 'original' ? '#original' : window.location.pathname + window.location.search)
    const top = (barRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 64
    if (window.scrollY > top) window.scrollTo({ top })
  }

  const tab = (active: boolean) =>
    cn(
      'relative whitespace-nowrap py-3 font-semibold text-body-sm transition-colors duration-fast ease-nwcn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark',
      active
        ? 'text-nwcn-dark after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-nwcn-dark'
        : 'text-nwcn-neutral-600 hover:text-nwcn-dark'
    )

  return (
    <>
      <div id="views" ref={barRef} className="sticky top-16 z-20 mt-14 flex scroll-mt-16 items-center justify-between gap-3 border-y border-nwcn-dark bg-nwcn-paper">
        <div role="tablist" aria-label={labels.view} className="flex shrink-0 gap-6">
          {(['summary', 'original'] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              id={`tab-${v}`}
              aria-selected={view === v}
              aria-controls={`panel-${v}`}
              onClick={() => choose(v)}
              className={tab(view === v)}
            >
              {labels[v]}
            </button>
          ))}
        </div>
        {view === 'summary' && nav.length > 1 && (
          <nav aria-label={labels.projects} className="-mr-1 min-w-0 overflow-x-auto">
            <ol className="flex">
              {nav.map((n, i) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    title={n.title}
                    aria-label={`${String(i + 1).padStart(2, '0')} ${n.title}`}
                    aria-current={current === n.id ? 'true' : undefined}
                    className={cn(
                      'block px-1 py-3 font-semibold tabular-nums text-body-sm transition-colors duration-fast ease-nwcn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark sm:px-2',
                      current === n.id ? 'text-nwcn-dark underline decoration-2 underline-offset-[6px]' : 'text-nwcn-neutral-600 hover:text-nwcn-dark'
                    )}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
      <div id="panel-summary" role="tabpanel" aria-labelledby="tab-summary" hidden={view !== 'summary'}>
        {summary}
      </div>
      <div id="panel-original" role="tabpanel" aria-labelledby="tab-original" hidden={view !== 'original'}>
        {original}
      </div>
    </>
  )
}
