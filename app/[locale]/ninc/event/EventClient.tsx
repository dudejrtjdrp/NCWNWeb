'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Badge from '@/components/ui/Badge'
import type { EventItem } from '@/lib/supabase/queries/events'

// ── 상수 ────────────────────────────────────────────────────────
const DB_FILTER_TYPES = ['특강', '워크숍', '캠퍼스투어']

const TYPE_COLORS: Record<string, 'new' | 'hot' | 'number' | 'gray'> = {
  '특강': 'new', '워크숍': 'hot', '캠퍼스투어': 'number', '기타': 'gray',
}
const TYPE_ICON: Record<string, string> = {
  '특강': '🎤', '워크숍': '🛠', '캠퍼스투어': '🏫', '기타': '📌',
}
/** 달력 이벤트 칩 색상 (타입별) */
const TYPE_CHIP: Record<string, string> = {
  '특강':      'bg-blue-50   text-blue-600   border border-blue-100',
  '워크숍':    'bg-amber-50  text-amber-700  border border-amber-100',
  '캠퍼스투어': 'bg-violet-50 text-violet-600 border border-violet-100',
  '기타':      'bg-emerald-50 text-emerald-700 border border-emerald-100',
}

const MONTH_KO = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
const MONTH_EN = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December']
const WEEKDAYS_KO = ['일','월','화','수','목','금','토']
const WEEKDAYS_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

type ViewMode = 'list' | 'calendar'

interface Props { initialEvents: EventItem[] }

// ── 헬퍼 ────────────────────────────────────────────────────────
function groupByMonth(events: EventItem[]): [string, EventItem[]][] {
  const g: Record<string, EventItem[]> = {}
  for (const e of events) {
    const d   = new Date(e.start_date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    ;(g[key] ??= []).push(e)
  }
  return Object.entries(g).sort(([a], [b]) => a.localeCompare(b))
}

function monthSectionId(ym: string) { return `month-${ym}` }

/** 오늘의 YYYY-MM 키 (항상 new Date()로 계산) */
function todayKey() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
}

/**
 * 오늘 달 섹션이 없을 때 가장 가까운 이벤트 달을 반환.
 * 단, 미래 이벤트 달이 있으면 과거보다 미래를 우선.
 */
function nearestFallbackKey(events: EventItem[]): string | null {
  if (!events.length) return null
  const now = new Date()
  const nowMs = new Date(now.getFullYear(), now.getMonth(), 15).getTime()
  const keys = [...new Set(events.map(e => {
    const d = new Date(e.start_date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }))]
  return keys.reduce((best, key) => {
    const [ky, km] = key.split('-').map(Number)
    const [by, bm] = best.split('-').map(Number)
    const dKey  = Math.abs(new Date(ky, km - 1, 15).getTime() - nowMs)
    const dBest = Math.abs(new Date(by, bm - 1, 15).getTime() - nowMs)
    return dKey < dBest ? key : best
  })
}

// ── 아이콘 ───────────────────────────────────────────────────────
const ChevL = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)
const ChevR = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)
const ListSvg = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="9" y1="6"  x2="21" y2="6"  /><line x1="9" y1="12" x2="21" y2="12" /><line x1="9" y1="18" x2="21" y2="18" />
    <circle cx="4" cy="6"  r="1.3" fill="currentColor" stroke="none" />
    <circle cx="4" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="4" cy="18" r="1.3" fill="currentColor" stroke="none" />
  </svg>
)
const CalSvg = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const PinSvg = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
)

// ═══════════════════════════════════════════════════════════════
export default function EventClient({ initialEvents }: Props) {
  const t      = useTranslations('ninc.event')
  const locale = useLocale()

  const typeLabels: Record<string, string> = {
    '특강': t('typeSpecial'), '워크숍': t('typeWorkshop'),
    '캠퍼스투어': t('typeCampusTour'), '기타': t('typeOther'),
  }

  const [activeFilter, setActiveFilter] = useState('ALL')
  const [viewMode, setViewMode]         = useState<ViewMode>('list')
  const [selectedDay, setSelectedDay]   = useState<number | null>(null)

  const filtered = activeFilter === 'ALL'
    ? initialEvents
    : initialEvents.filter(e => e.type === activeFilter)

  const grouped    = useMemo(() => groupByMonth(filtered), [filtered])
  const dateLocale = locale === 'en' ? 'en-US' : 'ko-KR'
  const months     = locale === 'en' ? MONTH_EN : MONTH_KO
  const weekdays   = locale === 'en' ? WEEKDAYS_EN : WEEKDAYS_KO

  // ── 달력: 오늘에 가장 가까운 이벤트 달로 초기화 ─────────────
  const calInitKey = useMemo(() => {
    const tk = todayKey()
    const keys = new Set(initialEvents.map(e => {
      const d = new Date(e.start_date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }))
    return keys.has(tk) ? tk : (nearestFallbackKey(initialEvents) ?? tk)
  }, [initialEvents])

  const [calendarDate, setCalendarDate] = useState(() => {
    const [y, m] = calInitKey.split('-').map(Number)
    return new Date(y, m - 1, 1)
  })

  const calYear  = calendarDate.getFullYear()
  const calMonth = calendarDate.getMonth()

  // 월 바뀔 때 선택 날짜 리셋
  useEffect(() => { setSelectedDay(null) }, [calYear, calMonth])

  // ── 목록 뷰: 실시간 new Date()로 현재 달 스크롤 ─────────────
  useEffect(() => {
    if (viewMode !== 'list') return
    const timer = setTimeout(() => {
      // 1) 현재 달 섹션 시도
      const tk = todayKey()
      let el   = document.getElementById(monthSectionId(tk))

      // 2) 없으면 가장 가까운 이벤트 달
      if (!el) {
        const fallback = nearestFallbackKey(initialEvents)
        if (fallback) el = document.getElementById(monthSectionId(fallback))
      }

      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 120
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [viewMode, initialEvents])

  // ── 달력 유틸 ────────────────────────────────────────────────
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDay    = new Date(calYear, calMonth, 1).getDay()
  const totalCells  = Math.ceil((firstDay + daysInMonth) / 7) * 7

  const today    = new Date()
  const isToday  = (d: number) =>
    today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === d

  function getEventsForDay(d: number) {
    return filtered.filter(e => {
      const dt = new Date(e.start_date)
      return dt.getFullYear() === calYear && dt.getMonth() === calMonth && dt.getDate() === d
    })
  }

  const thisMonthEvents  = filtered.filter(e => {
    const dt = new Date(e.start_date)
    return dt.getFullYear() === calYear && dt.getMonth() === calMonth
  })
  const selectedDayEvts  = selectedDay !== null ? getEventsForDay(selectedDay) : []

  // ── 렌더 ────────────────────────────────────────────────────
  const viewBtn = (mode: ViewMode, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setViewMode(mode)}
      className={[
        'flex items-center gap-1.5 px-4 py-1.5 rounded-full font-body text-[13px] font-medium transition-all duration-200',
        viewMode === mode ? 'bg-nwcn-text-default text-white' : 'text-[#777] hover:text-nwcn-text-default',
      ].join(' ')}
    >
      {icon}{label}
    </button>
  )

  return (
    <>
      {/* ── 필터 + 뷰 토글 ──────────────────────────────────── */}
      <div className="bg-white pb-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[87px] flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {[{ label: t('filterAll'), value: 'ALL' },
              ...DB_FILTER_TYPES.map(v => ({ label: typeLabels[v] ?? v, value: v }))
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setActiveFilter(value)}
                className={[
                  'px-5 py-2 rounded-full font-body text-[14px] font-medium transition-all duration-200',
                  activeFilter === value
                    ? 'bg-nwcn-text-default text-white'
                    : 'border border-[#ddd] text-[#555] hover:border-nwcn-text-default hover:text-nwcn-text-default',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 border border-[#ddd] rounded-full p-1">
            {viewBtn('list',     <ListSvg />, locale === 'en' ? 'List' : '목록')}
            {viewBtn('calendar', <CalSvg  />, locale === 'en' ? 'Calendar' : '달력')}
          </div>
        </div>
      </div>

      {/* ── 콘텐츠 ──────────────────────────────────────────── */}
      <div className="bg-white pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[87px]">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <p className="font-body text-[16px] text-[#aaa]">{t('noEvents')}</p>
            </div>

          ) : viewMode === 'list' ? (
            /* ══════════════════════════════════════════════════
               목록 뷰 (월별 섹션)
            ══════════════════════════════════════════════════ */
            <div className="space-y-14">
              {grouped.map(([ym, evts]) => {
                const [y, m] = ym.split('-').map(Number)
                const label  = locale === 'en' ? `${MONTH_EN[m-1]} ${y}` : `${y}년 ${m}월`
                return (
                  <section key={ym} id={monthSectionId(ym)} className="scroll-mt-28">
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="font-brand font-bold text-[30px] sm:text-[34px] text-nwcn-text-default whitespace-nowrap">
                        {label}
                      </h2>
                      <span className="font-body text-[13px] text-[#bbb]">
                        {evts.length}{locale === 'en' ? ' events' : '개'}
                      </span>
                      <div className="flex-1 h-px bg-[#ececec]" />
                    </div>
                    <div className="space-y-4">
                      {evts.map(event => {
                        const d       = new Date(event.start_date)
                        const month   = d.toLocaleDateString(dateLocale, { month: 'short' })
                        const day     = d.getDate()
                        const weekday = d.toLocaleDateString(dateLocale, { weekday: 'short' })
                        return (
                          <div key={event.id}
                            className="border border-[#ececec] rounded-2xl p-7 flex gap-8 items-start hover:border-nwcn-green/30 hover:shadow-sm transition-all duration-300 group bg-white">
                            <div className="flex-shrink-0 w-[72px] flex flex-col items-center gap-1 pt-1">
                              <span className="font-body text-[11px] font-semibold tracking-widest text-[#aaa] uppercase">{month}</span>
                              <span className="font-brand font-bold text-[42px] text-nwcn-text-default leading-none group-hover:text-nwcn-green transition-colors">{day}</span>
                              <span className="font-body text-[11px] text-[#bbb]">{weekday}</span>
                            </div>
                            <div className="flex-shrink-0 w-px bg-[#ececec] self-stretch group-hover:bg-nwcn-green/30 transition-colors" />
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3 flex-wrap">
                                <span className="text-[18px]">{TYPE_ICON[event.type] ?? '📌'}</span>
                                <h3 className="font-body text-[17px] font-semibold text-nwcn-text-default group-hover:text-nwcn-green transition-colors">{event.title}</h3>
                                <Badge variant={TYPE_COLORS[event.type] ?? 'gray'}>{typeLabels[event.type] ?? event.type}</Badge>
                              </div>
                              {event.description && (
                                <p className="font-body text-[14px] text-[#777] leading-relaxed mb-4">{event.description}</p>
                              )}
                              {event.location && (
                                <div className="flex items-center gap-2 text-[#999]">
                                  <PinSvg />
                                  <span className="font-body text-[13px]">{event.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )
              })}
            </div>

          ) : (
            /* ══════════════════════════════════════════════════
               달력 뷰
            ══════════════════════════════════════════════════ */
            <div>
              {/* 월 네비게이션 */}
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setCalendarDate(new Date(calYear, calMonth - 1, 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors text-[#666]">
                  <ChevL />
                </button>
                <div className="flex items-center gap-3">
                  <h2 className="font-brand font-bold text-[26px] sm:text-[30px] text-nwcn-text-default">
                    {locale === 'en' ? `${MONTH_EN[calMonth]} ${calYear}` : `${calYear}년 ${calMonth + 1}월`}
                  </h2>
                  <button onClick={() => { setCalendarDate(new Date()); setSelectedDay(null) }}
                    className="px-3 py-1 rounded-full border border-[#ddd] font-body text-[11px] text-[#999] hover:border-nwcn-green hover:text-nwcn-green transition-colors">
                    {locale === 'en' ? 'Today' : '오늘'}
                  </button>
                </div>
                <button onClick={() => setCalendarDate(new Date(calYear, calMonth + 1, 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors text-[#666]">
                  <ChevR />
                </button>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 mb-px">
                {weekdays.map((w, i) => (
                  <div key={w} className={[
                    'text-center font-body text-[12px] font-semibold py-2.5 bg-[#fafafa] border border-[#ececec]',
                    i === 0   ? 'text-rose-400'  :
                    i === 6   ? 'text-blue-400'  : 'text-[#999]',
                  ].join(' ')}>
                    {w}
                  </div>
                ))}
              </div>

              {/* 달력 그리드 */}
              <div className="grid grid-cols-7">
                {Array.from({ length: totalCells }).map((_, idx) => {
                  const day       = idx - firstDay + 1
                  const isValid   = day >= 1 && day <= daysInMonth
                  const dow       = idx % 7                          // 0=일, 6=토
                  const dayEvts   = isValid ? getEventsForDay(day) : []
                  const isSelected = isValid && selectedDay === day
                  const isTodayCell = isValid && isToday(day)

                  return (
                    <div
                      key={idx}
                      onClick={() => isValid && setSelectedDay(prev => prev === day ? null : day)}
                      className={[
                        'border border-[#ececec] min-h-[110px] lg:min-h-[140px] p-2.5 transition-colors',
                        isValid  ? 'cursor-pointer' : '',
                        isSelected ? 'bg-emerald-50/60 border-nwcn-green/40' :
                        !isValid   ? 'bg-[#fafafa]' :
                        dow === 0  ? 'bg-rose-50/30 hover:bg-rose-50/60' :
                        dow === 6  ? 'bg-blue-50/30 hover:bg-blue-50/60' :
                                     'bg-white hover:bg-[#f9fffe]',
                      ].join(' ')}
                    >
                      {isValid && (
                        <>
                          {/* 날짜 숫자 */}
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={[
                              'font-body text-[13px] font-semibold w-7 h-7 flex items-center justify-center rounded-full',
                              isTodayCell  ? 'bg-nwcn-green text-white' :
                              isSelected   ? 'bg-nwcn-green/10 text-nwcn-green' :
                              dow === 0    ? 'text-rose-400' :
                              dow === 6    ? 'text-blue-400' : 'text-nwcn-text-default',
                            ].join(' ')}>
                              {day}
                            </span>
                            {dayEvts.length > 0 && (
                              <span className="font-body text-[9px] text-[#bbb] leading-none">
                                {dayEvts.length}
                              </span>
                            )}
                          </div>

                          {/* 이벤트 칩 */}
                          <div className="space-y-1">
                            {dayEvts.slice(0, 2).map(ev => (
                              <div key={ev.id}
                                title={ev.title}
                                className={[
                                  'text-[10px] lg:text-[11px] font-body px-1.5 py-0.5 rounded-md truncate leading-snug',
                                  TYPE_CHIP[ev.type] ?? TYPE_CHIP['기타'],
                                ].join(' ')}>
                                {ev.title}
                              </div>
                            ))}
                            {dayEvts.length > 2 && (
                              <div className="text-[10px] font-body text-[#999] px-1">
                                +{dayEvts.length - 2}개 더
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* 선택한 날짜 패널 */}
              {selectedDay !== null && (
                <div className={[
                  'mt-5 rounded-2xl border p-5 transition-all duration-200',
                  selectedDayEvts.length > 0
                    ? 'border-nwcn-green/30 bg-emerald-50/30'
                    : 'border-[#ececec] bg-[#fafafa]',
                ].join(' ')}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-brand font-bold text-[20px] text-nwcn-text-default">
                      {locale === 'en'
                        ? `${MONTH_EN[calMonth]} ${selectedDay}`
                        : `${calMonth + 1}월 ${selectedDay}일`}
                    </h3>
                    <button onClick={() => setSelectedDay(null)}
                      className="font-body text-[12px] text-[#aaa] hover:text-[#555] transition-colors px-2 py-1">
                      닫기 ✕
                    </button>
                  </div>

                  {selectedDayEvts.length === 0 ? (
                    <p className="font-body text-[14px] text-[#bbb]">
                      {locale === 'en' ? 'No events on this day.' : '이 날에 등록된 이벤트가 없습니다.'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedDayEvts.map(ev => (
                        <div key={ev.id}
                          className="bg-white rounded-xl border border-[#ececec] px-5 py-4 flex items-start gap-4">
                          <span className="text-[20px] mt-0.5 flex-shrink-0">{TYPE_ICON[ev.type] ?? '📌'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-body text-[15px] font-semibold text-nwcn-text-default">
                                {ev.title}
                              </span>
                              <Badge variant={TYPE_COLORS[ev.type] ?? 'gray'}>
                                {typeLabels[ev.type] ?? ev.type}
                              </Badge>
                            </div>
                            {ev.description && (
                              <p className="font-body text-[13px] text-[#777] leading-relaxed">{ev.description}</p>
                            )}
                            {ev.location && (
                              <div className="flex items-center gap-1.5 mt-2 text-[#aaa]">
                                <PinSvg />
                                <span className="font-body text-[12px]">{ev.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 이번 달 이벤트 목록 (선택 없을 때) */}
              {selectedDay === null && (
                <div className="mt-8">
                  <h3 className="font-body text-[13px] font-semibold text-[#aaa] uppercase tracking-widest mb-4">
                    {locale === 'en'
                      ? `${MONTH_EN[calMonth]} — ${thisMonthEvents.length} event${thisMonthEvents.length !== 1 ? 's' : ''}`
                      : `${calMonth + 1}월 이벤트 ${thisMonthEvents.length}개`}
                  </h3>
                  {thisMonthEvents.length === 0 ? (
                    <div className="flex items-center justify-center py-12 border border-dashed border-[#e5e5e5] rounded-2xl">
                      <p className="font-body text-[14px] text-[#ccc]">
                        {locale === 'en' ? 'No events this month' : '이번 달 이벤트가 없습니다'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {thisMonthEvents.map(ev => {
                        const d  = new Date(ev.start_date)
                        const dy = d.getDate()
                        const wd = d.toLocaleDateString(dateLocale, { weekday: 'short' })
                        return (
                          <div key={ev.id}
                            onClick={() => setSelectedDay(dy)}
                            className="border border-[#ececec] rounded-xl px-5 py-4 flex items-center gap-5 hover:border-nwcn-green/30 hover:bg-emerald-50/20 cursor-pointer transition-all duration-200 group">
                            <div className="flex-shrink-0 flex items-baseline gap-1 min-w-[44px]">
                              <span className="font-brand font-bold text-[24px] text-nwcn-text-default group-hover:text-nwcn-green transition-colors leading-none">{dy}</span>
                              <span className="font-body text-[11px] text-[#bbb]">{wd}</span>
                            </div>
                            <div className="flex-shrink-0 w-px h-6 bg-[#ececec]" />
                            <div className="flex-1 flex items-center gap-2.5 flex-wrap min-w-0">
                              <span className="text-[14px]">{TYPE_ICON[ev.type] ?? '📌'}</span>
                              <span className="font-body text-[14px] font-semibold text-nwcn-text-default group-hover:text-nwcn-green transition-colors truncate">{ev.title}</span>
                              <Badge variant={TYPE_COLORS[ev.type] ?? 'gray'}>{typeLabels[ev.type] ?? ev.type}</Badge>
                            </div>
                            {ev.description && (
                              <p className="font-body text-[12px] text-[#c0c0c0] hidden lg:block max-w-[160px] truncate flex-shrink-0">{ev.description}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
