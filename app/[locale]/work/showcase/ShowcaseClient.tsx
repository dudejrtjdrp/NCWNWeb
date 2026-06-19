'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import WorkMasonry from '@/components/sections/WorkMasonry'
import SearchBar from '@/components/common/SearchBar'
import type { WorkListItem as WorkItem } from '@/lib/supabase/queries/works'
import { loadShowcaseWorksAction } from './actions'

interface Props {
  initialWorks: WorkItem[]
  initialHasMore: boolean
  filterTags: string[]
  locale: string
  seed: string
  pageSize?: number
}

export default function ShowcaseClient({
  initialWorks,
  initialHasMore,
  filterTags,
  locale,
  seed,
  pageSize = 15,
}: Props) {
  const [activeFilter, setActiveFilter] = useState('전체')
  const [query, setQuery] = useState('')

  const [items, setItems] = useState<WorkItem[]>(initialWorks)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)

  // 동시 요청/경쟁 상태 방지용 토큰
  const reqId = useRef(0)
  // 어떤 로드든 진행 중이면 true → 리셋/추가로드 동시 실행(경쟁) 차단
  const busyRef = useRef(false)
  const isFirst = useRef(true)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const filterButtons = ['전체', ...filterTags]

  // 필터/검색 변경 → 0페이지부터 다시 로드 (검색은 디바운스)
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return // 최초 마운트는 서버에서 받은 initialWorks 사용
    }
    const token = ++reqId.current
    // 리셋이 진행되는 동안 무한스크롤 loadMore 가 끼어들어
    // 필터 적용 전 목록 위에 결과를 덧붙이는 경쟁을 차단
    busyRef.current = true
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await loadShowcaseWorksAction({
          locale,
          seed,
          tag: activeFilter,
          q: query,
          offset: 0,
          limit: pageSize,
        })
        if (token !== reqId.current) return // 더 최신 요청이 있으면 폐기
        setItems(res.items)
        setHasMore(res.hasMore)
      } catch (err) {
        console.error('[ShowcaseClient:filter]', err)
        if (token !== reqId.current) return
        setItems([])
        setHasMore(false)
      } finally {
        if (token === reqId.current) {
          setLoading(false)
          busyRef.current = false
        }
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [activeFilter, query, locale, seed, pageSize])

  // 다음 페이지 로드
  const loadMore = useCallback(async () => {
    if (busyRef.current || !hasMore) return
    busyRef.current = true
    const token = ++reqId.current
    setLoading(true)
    try {
      const res = await loadShowcaseWorksAction({
        locale,
        seed,
        tag: activeFilter,
        q: query,
        offset: items.length,
        limit: pageSize,
      })
      if (token !== reqId.current) {
        // 리셋 등 더 최신 요청이 우선 → 결과 폐기.
        // busy 해제는 리셋 쪽에서 담당하므로 여기서 풀지 않는다.
        return
      }
      // 빈 페이지가 돌아오면 종료 (RPC offset 버그 방어)
      if (res.items.length === 0) {
        setHasMore(false)
        return
      }
      setItems((prev) => [...prev, ...res.items])
      setHasMore(res.hasMore)
    } catch (err) {
      console.error('[ShowcaseClient:loadMore]', err)
      if (token !== reqId.current) return
      setHasMore(false)
    } finally {
      if (token === reqId.current) {
        setLoading(false)
        busyRef.current = false
      }
    }
  }, [hasMore, locale, seed, activeFilter, query, items.length, pageSize])

  // 무한 스크롤 — 센티넬 관찰
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '600px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [loadMore])

  return (
    <div className="bg-white pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px]">
        {/* 검색바 */}
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="작품 제목, 분야, 제작자 검색"
          maxWidth="max-w-[771px]"
          className="mb-7"
        />

        {/* 필터 태그 */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10">
          {filterButtons.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={[
                'px-3.5 py-1.5 rounded-full font-body text-[15px] transition-all duration-200',
                activeFilter === f
                  ? 'bg-nwcn-dark text-white'
                  : 'text-nwcn-text-muted hover:text-nwcn-text-default',
              ].join(' ')}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 핀터레스트 마소너리 (무한 스크롤 + 스켈레톤) */}
        <WorkMasonry
          works={items}
          skeletonCount={loading ? pageSize : 0}
          fillBottom={!hasMore}
          emptyHint={!loading && items.length === 0 ? '검색 결과가 없습니다' : undefined}
        />

        {/* 로딩 스피너 — 데이터 페칭 중 표시 (스켈레톤과 함께) */}
        {loading && (
          <div className="flex justify-center py-8" role="status" aria-live="polite">
            <div className="relative h-9 w-9">
              {/* 배경 링 */}
              <div className="absolute inset-0 rounded-full border-2 border-nwcn-green/15" />
              {/* 회전 링 */}
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-nwcn-green animate-spin" />
            </div>
            <span className="sr-only">작품을 불러오는 중…</span>
          </div>
        )}

        {/* 무한 스크롤 센티넬 */}
        <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      </div>
    </div>
  )
}
