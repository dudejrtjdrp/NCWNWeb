'use client'

/**
 * PortfolioTabs — 개인 페이지 '학과 정리본 / 원본 포트폴리오' 전환 (E4)
 * 헤더 아래에 붙어 따라오는 1px 선 줄. 주소 끝 #original 이면 원본으로 열리고,
 * 페이지 안 '원본 보기' 링크(#original)를 누르면 원본으로 바뀐다. 다른 #목차 링크는 정리본 그대로.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type View = 'summary' | 'original'

export default function PortfolioTabs({
  summary,
  original,
  labels,
}: {
  summary: ReactNode
  original: ReactNode
  labels: { view: string; summary: string; original: string }
}) {
  const [view, setView] = useState<View>('summary')
  const barRef = useRef<HTMLDivElement>(null)

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
      <div id="views" ref={barRef} className="sticky top-16 z-20 mt-14 scroll-mt-16 border-y border-nwcn-dark bg-nwcn-paper">
        <div role="tablist" aria-label={labels.view} className="flex gap-6">
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
