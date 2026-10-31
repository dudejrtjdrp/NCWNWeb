'use client'

/**
 * EventBoard — 행사 목록·달력 (E4)
 * ────────────────────────────────────────────────────────────
 * 위: 헤더 아래에 붙어 따라오는 줄 — 왼쪽 종류 거르개(전체·특강·워크숍·캠퍼스투어·기타, 있는 것만),
 *     오른쪽 보기 방식(목록 / 달력).
 * 목록: '다가오는 일정'(가까운 순) → '지난 일정'(최근 순), 달마다 묶음.
 * 달력: 1px 선 7칸 격자. 날짜를 누르면 그날 일정만, 다시 누르면 그 달 전체를 아래에 보여준다.
 * 오늘은 한국 시간 기준이고, 서버에서 받은 날짜로 먼저 그린 뒤 브라우저에서 다시 맞춘다.
 */

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { EVENT_TYPES, endOf, md, monthKey, seoulToday, weekday, ymd, type EventLite } from './event-date'

type View = 'list' | 'calendar'

function addMonth(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

/** 달력 처음 달: 이번 달에 일정이 있으면 이번 달, 아니면 가장 가까운 다음 달, 그것도 없으면 가장 최근 달 */
function initialMonth(events: EventLite[], today: string): string {
  const now = monthKey(today)
  const keys = [...new Set(events.map((e) => monthKey(ymd(e.start_date))))].sort()
  if (keys.includes(now)) return now
  return keys.find((k) => k > now) ?? keys.filter((k) => k < now).pop() ?? now
}

/** 그 날짜에 걸쳐 있는 행사인가 */
const covers = (e: EventLite, day: string) => ymd(e.start_date) <= day && endOf(e) >= day

function groupByMonth(list: EventLite[], order: 'asc' | 'desc') {
  const map = new Map<string, EventLite[]>()
  for (const e of list) {
    const k = monthKey(ymd(e.start_date))
    map.set(k, [...(map.get(k) ?? []), e])
  }
  return [...map.entries()].sort(([a], [b]) => (order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)))
}

export default function EventBoard({ events, initialToday }: { events: EventLite[]; initialToday: string }) {
  const t = useTranslations('ninc.eventPage')
  const tt = useTranslations('ninc.event')
  const weekdays = t.raw('weekdays') as string[]
  const typeLabel: Record<string, string> = {
    특강: tt('typeSpecial'),
    워크숍: tt('typeWorkshop'),
    캠퍼스투어: tt('typeCampusTour'),
    기타: tt('typeOther'),
  }

  const [today, setToday] = useState(initialToday)
  const [filter, setFilter] = useState<string>('ALL')
  const [view, setView] = useState<View>('list')
  const [month, setMonth] = useState(() => initialMonth(events, initialToday))
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    const now = seoulToday()
    if (now !== initialToday) {
      setToday(now)
      setMonth(initialMonth(events, now))
    }
  }, [events, initialToday])

  const types = EVENT_TYPES.filter((ty) => events.some((e) => e.type === ty))
  const filtered = useMemo(
    () => (filter === 'ALL' ? events : events.filter((e) => e.type === filter)),
    [events, filter]
  )

  const monthTitle = (key: string) => t('monthTitle', { year: Number(key.slice(0, 4)), month: Number(key.slice(5, 7)) })

  // ── 한 줄 ──
  const row = (e: EventLite) => {
    const start = ymd(e.start_date)
    const end = endOf(e)
    const past = end < today
    const ongoing = start <= today && end >= today
    return (
      <li key={e.id} className="grid grid-cols-12 gap-x-6 gap-y-1 border-t border-nwcn-rule py-3.5 first:border-t-0">
        <p className={cn('col-span-12 font-bold tabular-nums text-list sm:col-span-3 lg:col-span-2', past && 'text-nwcn-neutral-600')}>
          {md(start)} <span className="font-medium">{weekdays[weekday(start)]}</span>
          {end !== start && (
            <span className="ml-1 font-medium text-body-sm">
              ~ {md(end)} {weekdays[weekday(end)]}
            </span>
          )}
        </p>
        <p className={cn('col-span-12 min-w-0 font-semibold text-list sm:col-span-6 lg:col-span-7', past && 'text-nwcn-neutral-600')}>
          {ongoing && (
            <span className="mr-2 inline-block bg-nwcn-dark px-1.5 py-0.5 align-[2px] font-bold text-[12px] leading-none text-white">
              {t('ongoing')}
            </span>
          )}
          {e.title}
        </p>
        <p className="col-span-12 text-body-sm text-nwcn-neutral-600 sm:col-span-3 sm:text-right">
          {[typeLabel[e.type] ?? e.type, e.location].filter(Boolean).join(' · ')}
        </p>
      </li>
    )
  }

  const monthGroup = (k: string, list: EventLite[]) => (
    <section key={k} aria-label={monthTitle(k)} className="mt-10 first:mt-0">
      <div className="flex items-baseline justify-between gap-6 border-b border-nwcn-dark pb-2">
        <h3 className="m-0 font-extrabold tabular-nums text-statement">{monthTitle(k)}</h3>
        <p className="font-semibold tabular-nums text-body-sm">{t('count', { n: list.length })}</p>
      </div>
      <ul>
        {list.map(row)}
      </ul>
    </section>
  )

  // ── 목록 ──
  const upcoming = filtered
    .filter((e) => endOf(e) >= today)
    .sort((a, b) => ymd(a.start_date).localeCompare(ymd(b.start_date)))
  const past = filtered
    .filter((e) => endOf(e) < today)
    .sort((a, b) => ymd(b.start_date).localeCompare(ymd(a.start_date)))

  // ── 달력 ──
  const [y, m] = month.split('-').map(Number)
  const first = weekday(`${month}-01`)
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const cells: (string | null)[] = [
    ...Array.from({ length: first }, () => null),
    ...Array.from({ length: days }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`),
  ]
  while (cells.length % 7) cells.push(null)
  const inMonth = filtered
    .filter((e) => ymd(e.start_date) <= `${month}-31` && endOf(e) >= `${month}-01`)
    .sort((a, b) => ymd(a.start_date).localeCompare(ymd(b.start_date)))
  const shown = selected ? inMonth.filter((e) => covers(e, selected)) : inMonth

  const goMonth = (k: string) => {
    setMonth(k)
    setSelected(null)
  }

  const tab = (active: boolean) =>
    cn(
      'relative whitespace-nowrap py-3 font-semibold text-body-sm transition-colors duration-fast ease-nwcn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark',
      active
        ? 'text-nwcn-dark after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-nwcn-dark'
        : 'text-nwcn-neutral-600 hover:text-nwcn-dark'
    )

  return (
    <div className="mx-auto max-w-page">
      {/* ── 거르개 · 보기 방식 ── */}
      <div className="sticky top-16 z-20 border-y border-nwcn-dark bg-nwcn-paper">
        <div className="editorial-container flex items-center justify-between gap-6">
          <div role="group" aria-label={t('filter')} className="-mx-1 flex min-w-0 gap-5 overflow-x-auto px-1">
            {['ALL', ...types].map((ty) => {
              const n = ty === 'ALL' ? events.length : events.filter((e) => e.type === ty).length
              return (
                <button key={ty} type="button" aria-pressed={filter === ty} onClick={() => setFilter(ty)} className={tab(filter === ty)}>
                  {ty === 'ALL' ? tt('filterAll') : typeLabel[ty]}
                  <span className="ml-1.5 font-medium tabular-nums">{n}</span>
                </button>
              )
            })}
          </div>
          <div role="group" aria-label={t('view')} className="flex shrink-0 gap-5">
            {(['list', 'calendar'] as const).map((v) => (
              <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={tab(view === v)}>
                {t(v)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="editorial-container pb-chapter">
        {view === 'list' ? (
          <>
            <section id="upcoming" aria-labelledby="upcoming-t" className="scroll-mt-36 pt-chapter">
              <div className="mb-6 flex items-baseline justify-between gap-6">
                <h2 id="upcoming-t" className="m-0 font-extrabold text-headline">{t('upcoming')}</h2>
                <p className="font-semibold tabular-nums text-body-sm">{t('count', { n: upcoming.length })}</p>
              </div>
              {upcoming.length ? (
                groupByMonth(upcoming, 'asc').map(([k, list]) => monthGroup(k, list))
              ) : (
                <p className="border-y border-nwcn-dark py-5 text-list">{t('noUpcoming')}</p>
              )}
            </section>
            {past.length > 0 && (
              <section id="past" aria-labelledby="past-t" className="scroll-mt-36 pt-chapter">
                <div className="mb-6 flex items-baseline justify-between gap-6">
                  <h2 id="past-t" className="m-0 font-extrabold text-headline">{t('past')}</h2>
                  <p className="font-semibold tabular-nums text-body-sm">{t('count', { n: past.length })}</p>
                </div>
                {groupByMonth(past, 'desc').map(([k, list]) => monthGroup(k, list))}
              </section>
            )}
          </>
        ) : (
          <section aria-labelledby="cal-t" className="pt-chapter">
            {/* 달 이동 */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <h2 id="cal-t" aria-live="polite" className="m-0 font-extrabold tabular-nums text-headline">
                {monthTitle(month)}
              </h2>
              <div className="flex items-center border border-nwcn-dark">
                <button type="button" aria-label={t('prevMonth')} onClick={() => goMonth(addMonth(month, -1))} className="grid h-10 w-10 place-items-center hover:bg-nwcn-dark hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-nwcn-dark">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <path d="M15 5l-7 7 7 7" />
                  </svg>
                </button>
                <button type="button" onClick={() => goMonth(monthKey(today))} className="h-10 border-x border-nwcn-dark px-4 font-semibold text-body-sm hover:bg-nwcn-dark hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-nwcn-dark">
                  {t('thisMonth')}
                </button>
                <button type="button" aria-label={t('nextMonth')} onClick={() => goMonth(addMonth(month, 1))} className="grid h-10 w-10 place-items-center hover:bg-nwcn-dark hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-nwcn-dark">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 격자 */}
            <div className="border-l border-t border-nwcn-dark">
              <div className="grid grid-cols-7" aria-hidden="true">
                {weekdays.map((w) => (
                  <div key={w} className="border-b border-r border-nwcn-dark px-2 py-2 font-semibold text-body-sm">
                    {w}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {cells.map((day, i) => {
                  if (!day) return <div key={`x${i}`} className="min-h-[64px] border-b border-r border-nwcn-rule bg-nwcn-dark/[0.03] sm:min-h-[116px]" />
                  const list = inMonth.filter((e) => covers(e, day))
                  const isToday = day === today
                  const isSel = day === selected
                  const body = (
                    <>
                      <span className={cn('inline-block min-w-6 px-1 text-center font-bold tabular-nums text-body-sm', isToday && 'bg-nwcn-dark text-white')}>
                        {Number(day.slice(8))}
                      </span>
                      {list.length > 0 && (
                        <>
                          <span className="mt-1 block font-semibold tabular-nums text-[12px] sm:hidden">● {list.length}</span>
                          <span className="mt-1.5 hidden flex-col gap-1 sm:flex">
                            {list.slice(0, 3).map((e) => (
                              <span key={e.id} className={cn('block truncate border-l-2 pl-1.5 text-left text-[12px] leading-snug', endOf(e) < today ? 'border-nwcn-rule text-nwcn-neutral-600' : 'border-nwcn-dark')}>
                                {e.title}
                              </span>
                            ))}
                            {list.length > 3 && <span className="text-left text-[12px] text-nwcn-neutral-600">{t('more', { n: list.length - 3 })}</span>}
                          </span>
                        </>
                      )}
                    </>
                  )
                  const cls = cn('flex min-h-[64px] min-w-0 flex-col items-start border-b border-r border-nwcn-rule p-1.5 sm:min-h-[116px] sm:p-2', isSel && 'bg-nwcn-dark/[0.06] outline outline-2 -outline-offset-2 outline-nwcn-dark')
                  return list.length ? (
                    <button
                      key={day}
                      type="button"
                      aria-pressed={isSel}
                      aria-label={`${t('dayTitle', { month: Number(day.slice(5, 7)), day: Number(day.slice(8)) })} · ${t('count', { n: list.length })}`}
                      onClick={() => setSelected(isSel ? null : day)}
                      className={cn(cls, 'transition-colors duration-fast ease-nwcn hover:bg-nwcn-dark/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-nwcn-dark')}
                    >
                      {body}
                    </button>
                  ) : (
                    <div key={day} className={cls}>
                      {body}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 아래: 그 달(또는 고른 날) 일정 */}
            <div className="mt-10">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-nwcn-dark pb-2">
                <h3 className="m-0 font-extrabold tabular-nums text-statement">
                  {selected ? t('dayTitle', { month: Number(selected.slice(5, 7)), day: Number(selected.slice(8)) }) : t('monthEvents')}
                </h3>
                {selected ? (
                  <button type="button" onClick={() => setSelected(null)} className="editorial-link font-semibold text-body-sm">
                    {t('showAll')}
                  </button>
                ) : (
                  <p className="font-semibold tabular-nums text-body-sm">{t('count', { n: shown.length })}</p>
                )}
              </div>
              {shown.length ? (
                <ul>{shown.map(row)}</ul>
              ) : (
                <p className="py-5 text-list">{t('empty')}</p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
