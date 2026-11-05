'use client'

/**
 * MoreWorks — 작품 상세 하단 "다른 작품" (큰 칸 1 + 작은 칸 2)
 * - 같은 제작자 작품은 하나만 (있으면 큰 칸, '같은 제작자' 꼬리표)
 * - 나머지는 제작자가 서로 겹치지 않게 랜덤으로 — 분야·유형이 비슷하면 조금 더 잘 뽑힌다
 * - 이 브라우저에서 이미 본 작품(상세를 연 작품 > 추천에 떴던 작품)은 덜 뽑힌다. 영향은 일주일마다 반으로 줄어든다
 * 서버 렌더는 무작위 없이 고르고(화면 깜빡임·불일치 방지), 브라우저에서 다시 고른다. 섹션이 페이지 맨 아래라 바뀌는 게 보이지 않는다.
 * 본 기록은 localStorage(이 브라우저에만, 최대 300개) — 막혀 있으면 기록 없이 랜덤만.
 */

import { useEffect, useState } from 'react'
import WorkCard from './WorkCard'
import type { MoreWorkCandidate, WorkType } from '@/lib/supabase/queries/works'

const KEY = 'nwcn-seen-works'
const WEEK = 7 * 864e5
type Seen = Record<string, { v: number; s: number; t: number }>

function readSeen(): Seen {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '{}')
    return v && typeof v === 'object' ? v : {}
  } catch {
    return {}
  }
}
function writeSeen(seen: Seen) {
  try {
    const keep = Object.entries(seen)
      .sort((a, b) => b[1].t - a[1].t)
      .slice(0, 300)
    localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(keep)))
  } catch {
    /* 저장이 막힌 브라우저 — 기록 없이 */
  }
}

function weight(c: MoreWorkCandidate, seen: Seen, now: number) {
  const base = 1 + c.score * 0.35
  const s = seen[c.work.id]
  if (!s) return base
  const decay = Math.pow(0.5, Math.max(0, now - s.t) / WEEK)
  return base / (1 + (s.v * 3 + s.s * 0.8) * decay)
}

/** rand 가 없으면 무게가 가장 큰 것(서버 렌더용), 있으면 무게 비례 랜덤 */
function pick(cands: MoreWorkCandidate[], limit: number, seen: Seen, rand?: () => number) {
  const now = Date.now()
  const out: MoreWorkCandidate[] = []
  const used = new Set<string>()
  const free = (c: MoreWorkCandidate) => !out.includes(c) && c.creators.every((k) => !used.has(k))
  const draw = (list: MoreWorkCandidate[]) => {
    if (!list.length) return null
    const ws = list.map((c) => weight(c, seen, now))
    if (!rand) return list[ws.indexOf(Math.max(...ws))]
    let r = rand() * ws.reduce((a, b) => a + b, 0)
    for (let i = 0; i < list.length; i++) if ((r -= ws[i]) <= 0) return list[i]
    return list[list.length - 1]
  }
  const take = (c: MoreWorkCandidate | null) => {
    if (!c) return false
    out.push(c)
    c.creators.forEach((k) => used.add(k))
    return true
  }
  take(draw(cands.filter((c) => c.sameCreator)))
  while (out.length < limit) if (!take(draw(cands.filter((c) => !c.sameCreator && free(c))))) break
  // 작품이 적어 제작자를 안 겹치게 다 못 채우면 겹쳐도 채운다 (같은 제작자 작품은 끝까지 하나만)
  while (out.length < limit) if (!take(draw(cands.filter((c) => !c.sameCreator && !out.includes(c))))) break
  return out
}

export default function MoreWorks({
  workId,
  candidates,
  typeLabel,
  limit = 3,
  title,
  hint,
  badge,
}: {
  workId: string
  candidates: MoreWorkCandidate[]
  typeLabel: Record<WorkType, string>
  limit?: number
  title: string
  hint: string
  badge: string
}) {
  const [more, setMore] = useState(() => pick(candidates, limit, {}))

  useEffect(() => {
    const seen = readSeen()
    const now = Date.now()
    const chosen = pick(candidates, limit, seen, Math.random)
    setMore(chosen)
    const bump = (id: string, k: 'v' | 's') => {
      const cur = seen[id] ?? { v: 0, s: 0, t: now }
      seen[id] = { ...cur, [k]: cur[k] + 1, t: now }
    }
    bump(workId, 'v')
    chosen.forEach((c) => bump(c.work.id, 's'))
    writeSeen(seen)
  }, [workId, candidates, limit])

  if (!more.length) return null
  const [first, ...rest] = more
  return (
    <section aria-labelledby="work-more" className="pt-chapter">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="work-more" className="m-0 font-extrabold text-headline">
          {title}
        </h2>
        {first.sameCreator && <p className="text-body-sm text-nwcn-neutral-600">{hint}</p>}
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 border-t border-nwcn-dark pt-6 lg:grid-cols-12">
        <WorkCard
          as="div"
          variant="feature"
          work={first.work}
          typeLabel={typeLabel}
          badge={first.sameCreator ? badge : undefined}
          className="lg:col-span-7"
        />
        {rest.length > 0 && (
          <div className="flex flex-col gap-10 lg:col-span-5">
            {rest.map((m) => (
              <WorkCard key={m.work.id} as="div" variant="compact" work={m.work} typeLabel={typeLabel} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
