'use client'

/**
 * NextEventPanel — 행사 페이지 히어로의 어두운 판 (사진 대신)
 * 다음 일정의 날짜를 크게, 그 아래 제목·종류·장소. 예정된 일정이 없으면 그렇게 말하고 최근 일정을 작게.
 * 날짜는 서버에서 받은 오늘로 먼저 그리고, 브라우저에서 한국 시간 오늘로 다시 맞춘다(캐시된 페이지 대비).
 */

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { daysBetween, lastEvent, md, nextEvent, seoulToday, weekday, type EventLite } from './event-date'

export default function NextEventPanel({
  events,
  initialToday,
  photo,
}: {
  events: EventLite[]
  initialToday: string
  photo?: string
}) {
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
  useEffect(() => setToday(seoulToday()), [])

  const next = nextEvent(events, today)
  const last = next ? null : lastEvent(events, today)
  const ev = next ?? last
  const start = ev ? ev.start_date.slice(0, 10) : null
  const end = ev?.end_date && ev.end_date.slice(0, 10) !== start ? ev.end_date.slice(0, 10) : null
  const dday = next && start ? daysBetween(today, start) : null

  return (
    <div className="relative flex h-full min-h-[340px] flex-col justify-end sm:min-h-[400px]">
      {photo && (
        <div aria-hidden="true" className="absolute inset-0">
          <Image src={photo} alt="" fill sizes="(min-width: 1024px) 56vw, 100vw" className="object-cover opacity-35 grayscale" />
        </div>
      )}
      <div aria-hidden="true" className="poster-shade pointer-events-none absolute inset-0" />

      <div className="relative px-5 pb-6 pt-10 sm:px-8 sm:pb-8 lg:pl-[22%]">
        <p className="flex items-baseline justify-between gap-4 border-b border-white/60 pb-2 font-semibold text-body-sm">
          <span>{next ? t('next') : t('noUpcoming')}</span>
          {dday !== null && (
            <span className="tabular-nums">{dday <= 0 ? t('dToday') : t('dday', { n: dday })}</span>
          )}
        </p>

        {ev && start ? (
          <div className={next ? '' : 'opacity-80'}>
            {!next && <p className="mt-4 text-body-sm">{t('recent')}</p>}
            <p className={`m-0 font-black tabular-nums leading-[0.9] tracking-[-0.04em] ${next ? 'mt-5 text-[clamp(64px,8.6vw,128px)]' : 'mt-2 text-[clamp(44px,5.2vw,76px)]'}`}>
              {md(start)}
              <span className="ml-3 align-top font-bold text-[0.32em] tracking-normal">{weekdays[weekday(start)]}</span>
            </p>
            {end && (
              <p className="mt-1 font-semibold tabular-nums text-body-sm">
                ~ {md(end)} {weekdays[weekday(end)]}
              </p>
            )}
            <p className="mt-4 font-bold text-statement">{ev.title}</p>
            <p className="mt-2 text-body-sm text-white/80">
              {[typeLabel[ev.type] ?? ev.type, ev.location].filter(Boolean).join(' · ')}
            </p>
          </div>
        ) : (
          <p className="mt-5 font-bold text-statement">{t('empty')}</p>
        )}
      </div>
    </div>
  )
}
