/**
 * 행사 날짜 도우미 — 서버·브라우저 어디서나 같은 결과가 나오게 날짜는 'YYYY-MM-DD' 문자열로만 다룬다.
 * '오늘'은 한국 시간 기준.
 */

import type { EventItem } from '@/lib/supabase/queries/events'

export type EventLite = Pick<EventItem, 'id' | 'title' | 'type' | 'start_date' | 'end_date' | 'location'>

export const EVENT_TYPES = ['특강', '워크숍', '캠퍼스투어', '기타'] as const

/** 한국 시간 오늘 (YYYY-MM-DD) */
export function seoulToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

export const ymd = (s: string) => s.slice(0, 10)
export const endOf = (e: Pick<EventItem, 'start_date' | 'end_date'>) => ymd(e.end_date || e.start_date)
export const monthKey = (s: string) => s.slice(0, 7)

/** 'YYYY-MM-DD' → 요일 번호(0=일) */
export function weekday(s: string): number {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

/** 두 날짜 사이 일수 (b - a) */
export function daysBetween(a: string, b: string): number {
  const toUtc = (s: string) => {
    const [y, m, d] = s.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((toUtc(b) - toUtc(a)) / 86400000)
}

/** '06.16' */
export const md = (s: string) => `${s.slice(5, 7)}.${s.slice(8, 10)}`

/** 오늘 이후(오늘 포함, 진행 중 포함) 가장 가까운 행사 */
export function nextEvent<T extends Pick<EventItem, 'start_date' | 'end_date'>>(events: T[], today: string): T | null {
  return (
    [...events]
      .filter((e) => endOf(e) >= today)
      .sort((a, b) => ymd(a.start_date).localeCompare(ymd(b.start_date)))[0] ?? null
  )
}

/** 이미 끝난 행사 중 가장 최근 것 */
export function lastEvent<T extends Pick<EventItem, 'start_date' | 'end_date'>>(events: T[], today: string): T | null {
  return (
    [...events]
      .filter((e) => endOf(e) < today)
      .sort((a, b) => endOf(b).localeCompare(endOf(a)))[0] ?? null
  )
}
