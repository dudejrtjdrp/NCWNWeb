'use client'

/**
 * 섹션 컴포넌트: WorkMasonry
 * Figma node-id: 1094:2021 (WORK/Showcase/Desktop — "핀터레스트처럼 랜덤 규격")
 *
 * 핀터레스트 스타일 마소너리 (절대좌표 + 스카이라인 갭필 패킹) + 무한 스크롤 스켈레톤.
 * - 규격은 마운트 시 work별로 1회 랜덤 배정 후 고정(useRef) → 추가 로드 시 기존 타일은 그대로,
 *   새 타일만 아래에 append. 새로고침하면 다시 랜덤.
 * - 타일 종류: 2:1 가로(2컬럼) / 1:1 / 3:4 / 4:5 / 1:2 (1컬럼, 높이 다양)
 * - 1컬럼은 항상 가장 낮은 컬럼에 적재, 2컬럼(가로)이 만든 단차는 "그 틈 크기 타일"로 메움 → 내부 여백 제거
 * - skeletonCount: 데이터 페칭 중 미리 깔아둘 빈 타일 수
 */

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { WorkListItem } from '@/lib/supabase/queries/works'

interface WorkMasonryProps {
  works: WorkListItem[]
  /** 데이터 페칭 중 미리 표시할 빈 타일 수 */
  skeletonCount?: number
  /** 결과가 없을 때 안내 문구 (지정 시 빈 상태로 렌더) */
  emptyHint?: string
  /** 하단을 평탄하게 채울지 (더 불러올 게 없을 때 true 권장) */
  fillBottom?: boolean
  className?: string
}

/** id 문자열 → 안정적 해시 (SSR 폴백 규격용) */
function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h
}

/** SSR 폴백 규격(결정적) — 하이드레이션 일치를 위해 id 기반 */
function fallbackTile(id: string): { colSpan: number; ratio: string } {
  const h = hashId(id) % 10
  if (h < 2) return { colSpan: 2, ratio: '2 / 1' }
  if (h < 5) return { colSpan: 1, ratio: '1 / 1' }
  if (h < 8) return { colSpan: 1, ratio: '3 / 4' }
  return { colSpan: 1, ratio: '1 / 2' }
}

type Size = { colSpan: number; ar: number }
type PlanItem = { key: string; work: WorkListItem | null; colSpan: number; ar: number }

/** 랜덤 규격 1개 추첨 (가로 ~22% / 정사각·3:4·4:5·1:2) */
function randomTile(): Size {
  const r = Math.random()
  if (r < 0.22) return { colSpan: 2, ar: 2 / 1 } // 가로로 긴
  if (r < 0.46) return { colSpan: 1, ar: 1 / 1 } // 정사각
  if (r < 0.68) return { colSpan: 1, ar: 3 / 4 } // 세로(약간)
  if (r < 0.86) return { colSpan: 1, ar: 4 / 5 } // 세로(약간)
  return { colSpan: 1, ar: 1 / 2 } // 세로로 긴
}

function colsForWidth(w: number): number {
  if (w < 640) return 2
  if (w < 1280) return 3
  return 4
}
function gapForCols(cols: number): number {
  return cols <= 2 ? 16 : cols === 3 ? 20 : 24
}

type Placed = { key: string; work: WorkListItem | null; x: number; y: number; w: number; h: number; wide: boolean }

/** 단차/하단 빈칸을 흡수·생성으로 메우는 스카이라인 패킹 */
function pack(
  plan: PlanItem[],
  cols: number,
  colWidth: number,
  gap: number,
  fillBottom: boolean
): { placed: Placed[]; height: number } {
  const wide = plan.filter((p) => p.colSpan === 2)
  const narrow = plan.filter((p) => p.colSpan === 1)
  const colH = new Array(cols).fill(0)
  const lastIdx = new Array(cols).fill(-1) // 각 컬럼의 마지막 타일 index
  const stepX = colWidth + gap
  const placed: Placed[] = []
  let wi = 0
  let ni = 0
  const ABSORB_MAX = 80 // 이 이하 단차는 위 타일을 늘려 흡수, 초과면 새 타일 생성

  const placeNarrow = (col: number, item: PlanItem, forcedH?: number) => {
    const h = forcedH ?? colWidth / item.ar
    placed.push({ key: item.key, work: item.work, x: col * stepX, y: colH[col], w: colWidth, h, wide: false })
    lastIdx[col] = placed.length - 1
    colH[col] += h + gap
  }

  const cadence = Math.max(2, Math.round(narrow.length / (wide.length + 1)))
  let sinceWide = 0

  while (ni < narrow.length || wi < wide.length) {
    const wantWide = wi < wide.length && (sinceWide >= cadence || ni >= narrow.length)

    if (wantWide && cols >= 2) {
      let j = 0
      let bestTop = Infinity
      for (let i = 0; i < cols - 1; i++) {
        const top = Math.max(colH[i], colH[i + 1])
        if (top < bestTop) {
          bestTop = top
          j = i
        }
      }
      const low = colH[j] <= colH[j + 1] ? j : j + 1
      const high = Math.max(colH[j], colH[j + 1])
      const stepGap = high - colH[low]

      // 단차 평탄화: 크면 새 타일 생성, 작으면 위 타일을 늘려 흡수
      if (stepGap > 1) {
        if (stepGap > ABSORB_MAX && ni < narrow.length) {
          placeNarrow(low, narrow[ni++], stepGap - gap)
          continue
        } else if (lastIdx[low] >= 0) {
          placed[lastIdx[low]].h += stepGap
          colH[low] = high
        } else if (ni < narrow.length) {
          placeNarrow(low, narrow[ni++], stepGap - gap)
          continue
        }
      }

      const wWide = 2 * colWidth + gap
      const item = wide[wi++]
      const hWide = wWide / item.ar
      const y = Math.max(colH[j], colH[j + 1])
      placed.push({ key: item.key, work: item.work, x: j * stepX, y, w: wWide, h: hWide, wide: true })
      lastIdx[j] = placed.length - 1
      lastIdx[j + 1] = placed.length - 1
      colH[j] = y + hWide + gap
      colH[j + 1] = y + hWide + gap
      sinceWide = 0
    } else if (ni < narrow.length) {
      let c = 0
      for (let i = 1; i < cols; i++) if (colH[i] < colH[c]) c = i
      placeNarrow(c, narrow[ni++])
      sinceWide++
    } else {
      let c = 0
      for (let i = 1; i < cols; i++) if (colH[i] < colH[c]) c = i
      const item = wide[wi++]
      const h = colWidth / item.ar
      placed.push({ key: item.key, work: item.work, x: c * stepX, y: colH[c], w: colWidth, h, wide: false })
      lastIdx[c] = placed.length - 1
      colH[c] += h + gap
    }
  }

  let height = Math.max(0, Math.max(...colH) - gap)

  // 하단 평탄화 — 각 컬럼의 마지막(1컬럼) 타일을 최저 바닥까지 늘림
  if (fillBottom) {
    const maxBottom = Math.max(...colH) - gap
    for (let c = 0; c < cols; c++) {
      const idx = lastIdx[c]
      const diff = maxBottom - (colH[c] - gap)
      if (idx >= 0 && diff > 1 && !placed[idx].wide) {
        placed[idx].h += diff
        colH[c] = maxBottom + gap
      }
    }
    height = maxBottom
  }

  return { placed, height }
}

function EyeBadge({ count }: { count: number }) {
  return (
    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/45 backdrop-blur-sm rounded-full px-2.5 py-1">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span className="font-body text-[12px] leading-none text-white">{count}</span>
    </div>
  )
}

function Card({ work }: { work: WorkListItem }) {
  return (
    <article className="relative h-full w-full overflow-hidden rounded-[10px] bg-nwcn-surface-2">
      {work.thumbnail_url ? (
        <Image
          src={work.thumbnail_url}
          alt={work.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#e9e9e9] to-[#dcdcdc]">
          <span className="font-brand font-black text-[48px] leading-none text-white/70">{work.title[0]}</span>
        </div>
      )}

      <EyeBadge count={work.view_count} />

      <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <h3 className="font-body text-[15px] font-semibold leading-tight text-white">{work.title}</h3>
        <p className="mt-0.5 font-body text-[12px] text-white/70">
          {work.author} · {work.year}
        </p>
      </div>
    </article>
  )
}

export default function WorkMasonry({
  works,
  skeletonCount = 0,
  emptyHint,
  fillBottom = true,
  className = '',
}: WorkMasonryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<{ cols: number; colWidth: number; gap: number } | null>(null)
  // work별 규격을 1회만 랜덤 배정 후 고정 (추가 로드 시 기존 타일 유지)
  const sizeMap = useRef<Map<string, Size>>(new Map())

  const getSize = (key: string): Size => {
    const cached = sizeMap.current.get(key)
    if (cached) return cached
    const s = randomTile()
    sizeMap.current.set(key, s)
    return s
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const compute = () => {
      const w = el.clientWidth
      if (!w) return
      const cols = colsForWidth(w)
      const gap = gapForCols(cols)
      const colWidth = (w - gap * (cols - 1)) / cols
      setLayout((prev) =>
        prev && prev.cols === cols && Math.abs(prev.colWidth - colWidth) < 0.5 ? prev : { cols, colWidth, gap }
      )
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (works.length === 0 && skeletonCount === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="font-body text-[16px] text-nwcn-gray-faint">{emptyHint ?? '표시할 작품이 없습니다'}</p>
      </div>
    )
  }

  // 측정 완료 → 절대좌표 갭필 패킹 (랜덤 규격 + 스켈레톤)
  if (layout) {
    const plan: PlanItem[] = [
      ...works.map((work) => ({ key: work.id, work, ...getSize(work.id) })),
      ...Array.from({ length: skeletonCount }, (_, i) => {
        const key = `__skeleton-${i}`
        return { key, work: null, ...getSize(key) }
      }),
    ]
    // 더 불러올 스켈레톤이 있으면(로딩 중) 하단 평탄화 끔
    const { placed, height } = pack(plan, layout.cols, layout.colWidth, layout.gap, fillBottom && skeletonCount === 0)
    return (
      <div ref={containerRef} className={`relative ${className}`} style={{ height }}>
        {placed.map((p) =>
          p.work ? (
            <Link
              key={p.key}
              href={`/work/${p.work.id}`}
              className="group absolute"
              style={{ left: p.x, top: p.y, width: p.w, height: p.h }}
            >
              <Card work={p.work} />
            </Link>
          ) : (
            <div key={p.key} className="absolute" style={{ left: p.x, top: p.y, width: p.w, height: p.h }}>
              <div className="h-full w-full rounded-[10px] bg-nwcn-surface-2 animate-pulse" />
            </div>
          )
        )}
      </div>
    )
  }

  // SSR·첫 렌더 폴백 — 결정적 반응형 그리드 (하이드레이션 일치)
  return (
    <div ref={containerRef} className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 ${className}`}>
      {works.map((work) => {
        const t = fallbackTile(work.id)
        return (
          <Link
            key={work.id}
            href={`/work/${work.id}`}
            className="group block"
            style={{ gridColumn: t.colSpan === 2 ? 'span 2' : undefined, aspectRatio: t.ratio }}
          >
            <Card work={work} />
          </Link>
        )
      })}
    </div>
  )
}
