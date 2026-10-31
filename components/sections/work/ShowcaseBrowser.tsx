'use client'

/**
 * ShowcaseBrowser — 쇼케이스 작품 목록 (E4)
 * 위: 스크롤하면 헤더 아래 붙는 필터 줄(분야 글자 버튼 + 검색) / 아래: 3열 작품 카드, 무한 스크롤.
 * 데이터 로딩 규칙은 기존 ShowcaseClient 와 같다 — 방문마다 랜덤 순서(시드), 필터·검색 300ms 디바운스,
 * 경쟁 요청은 토큰으로 폐기.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { WorkListItem, WorkType } from '@/lib/supabase/queries/works'
import { loadShowcaseWorksAction } from '@/app/[locale]/work/showcase/actions'
import { cn } from '@/lib/utils'
import WorkCard from './WorkCard'

interface Props {
  filterTags: string[]
  locale: string
  pageSize?: number
}

const ALL = '전체'

export default function ShowcaseBrowser({ filterTags, locale, pageSize = 15 }: Props) {
  const t = useTranslations('work.showcase')
  const d = useTranslations('work.detail')
  const typeLabel: Record<WorkType, string> = { design: d('typeDesign'), video: d('typeVideo'), '3d': d('type3d') }

  const [activeFilter, setActiveFilter] = useState(ALL)
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<WorkListItem[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [seed] = useState(() => Math.random().toString(36).slice(2, 12))

  const reqId = useRef(0)
  const busyRef = useRef(false)
  const isFirst = useRef(true)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // 최초 마운트 + 필터/검색 변경 → 처음부터 다시 로드
  useEffect(() => {
    const token = ++reqId.current
    busyRef.current = true
    setLoading(true)
    const delay = isFirst.current ? 0 : 300
    isFirst.current = false
    const timer = setTimeout(async () => {
      try {
        const res = await loadShowcaseWorksAction({ locale, seed, tag: activeFilter, q: query, offset: 0, limit: pageSize })
        if (token !== reqId.current) return
        setItems(res.items)
        setHasMore(res.hasMore)
      } catch (err) {
        console.error('[ShowcaseBrowser:filter]', err)
        if (token !== reqId.current) return
        setItems([])
        setHasMore(false)
      } finally {
        if (token === reqId.current) {
          setLoading(false)
          busyRef.current = false
        }
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [activeFilter, query, locale, seed, pageSize])

  const loadMore = useCallback(async () => {
    if (busyRef.current || !hasMore) return
    busyRef.current = true
    const token = ++reqId.current
    setLoading(true)
    try {
      const res = await loadShowcaseWorksAction({ locale, seed, tag: activeFilter, q: query, offset: items.length, limit: pageSize })
      if (token !== reqId.current) return
      if (res.items.length === 0) {
        setHasMore(false)
        return
      }
      setItems((prev) => [...prev, ...res.items])
      setHasMore(res.hasMore)
    } catch (err) {
      console.error('[ShowcaseBrowser:loadMore]', err)
      if (token !== reqId.current) return
      setHasMore(false)
    } finally {
      if (token === reqId.current) {
        setLoading(false)
        busyRef.current = false
      }
    }
  }, [hasMore, locale, seed, activeFilter, query, items.length, pageSize])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver((entries) => entries[0].isIntersecting && loadMore(), { rootMargin: '600px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [loadMore])

  const filters = [ALL, ...filterTags]
  const filtered = activeFilter !== ALL || query.trim() !== ''
  const skeletons = loading ? (items.length ? 3 : 6) : 0

  return (
    <>
      {/* ── 필터 줄 (스크롤하면 헤더 아래 고정) ── */}
      <div data-no-reveal className="sticky top-16 z-30 bg-nwcn-paper">
        <div className="editorial-container">
          <div className="flex flex-col gap-2 border-y border-nwcn-dark py-2.5 font-semibold text-body-sm lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div role="group" aria-label={t('filterLabel')} className="-mx-1 min-w-0 overflow-x-auto scrollbar-hide">
              <ul className="flex gap-1 px-1">
                {filters.map((f) => (
                  <li key={f}>
                    <button
                      type="button"
                      aria-pressed={activeFilter === f}
                      onClick={() => setActiveFilter(f)}
                      className={cn(
                        'whitespace-nowrap px-2 py-1 transition-colors duration-fast ease-nwcn',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark',
                        activeFilter === f ? 'bg-nwcn-dark text-nwcn-paper' : 'hover:underline decoration-nwcn-green-darker decoration-2 underline-offset-4'
                      )}
                    >
                      {f === ALL ? t('all') : f}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <label className="flex shrink-0 items-center gap-2 border-b border-nwcn-dark pb-1 lg:w-72">
              <span className="sr-only">{t('searchLabel')}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
              </svg>
              <input
                id="showcase-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full min-w-0 bg-transparent font-medium text-body-sm placeholder:text-nwcn-neutral-500 focus:outline-none"
              />
            </label>
          </div>
        </div>
      </div>

      {/* ── 작품 목록 ── */}
      <div className="editorial-container pb-24 pt-10">
        {!loading && items.length === 0 ? (
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-y border-nwcn-dark py-6">
            <p className="font-bold text-statement">{t('empty')}</p>
            {filtered && (
              <button
                type="button"
                onClick={() => {
                  setActiveFilter(ALL)
                  setQuery('')
                }}
                className="border border-nwcn-dark px-3 py-1.5 font-semibold text-body-sm transition-colors duration-fast ease-nwcn hover:bg-nwcn-dark hover:text-nwcn-paper"
              >
                {t('emptyReset')}
              </button>
            )}
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((work, i) => (
              <WorkCard key={work.id} work={work} typeLabel={typeLabel} priority={i < 3} />
            ))}
            {Array.from({ length: skeletons }).map((_, i) => (
              <li key={`sk-${i}`} aria-hidden="true" className="flex flex-col">
                <div className="aspect-[4/3] animate-pulse bg-nwcn-neutral-200" />
                <div className="mt-3 h-5 w-2/3 border-t border-nwcn-neutral-300 pt-3" />
              </li>
            ))}
          </ul>
        )}

        {loading && <p className="sr-only" role="status">{t('loading')}</p>}
        {!loading && !hasMore && items.length > 0 && items.length < 6 && !filtered && (
          <p className="mt-12 border-t border-nwcn-rule pt-3.5 text-body-sm text-nwcn-neutral-600">{t('more')}</p>
        )}
        <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      </div>
    </>
  )
}
