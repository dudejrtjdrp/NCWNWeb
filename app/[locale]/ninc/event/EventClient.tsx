'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Badge from '@/components/ui/Badge'
import type { EventItem } from '@/lib/supabase/queries/events'

// DB에 저장된 타입 값 (한국어) — 필터링에 사용
const DB_FILTER_TYPES = ['특강', '워크숍', '캠퍼스투어']

const TYPE_COLORS: Record<string, 'new' | 'hot' | 'number' | 'gray'> = {
  '특강': 'new',
  '워크숍': 'hot',
  '캠퍼스투어': 'number',
  '기타': 'gray',
}

const TYPE_ICON: Record<string, string> = {
  '특강': '🎤',
  '워크숍': '🛠',
  '캠퍼스투어': '🏫',
  '기타': '📌',
}

interface Props {
  initialEvents: EventItem[]
}

export default function EventClient({ initialEvents }: Props) {
  const t = useTranslations('ninc.event')
  const locale = useLocale()

  // 타입 레이블 매핑 (DB 한국어 값 → 번역)
  const typeLabels: Record<string, string> = {
    '특강': t('typeSpecial'),
    '워크숍': t('typeWorkshop'),
    '캠퍼스투어': t('typeCampusTour'),
    '기타': t('typeOther'),
  }

  const filterAll = t('filterAll')
  const [activeFilter, setActiveFilter] = useState('ALL') // 내부적으로 'ALL' 사용

  const filtered =
    activeFilter === 'ALL'
      ? initialEvents
      : initialEvents.filter((e) => e.type === activeFilter)

  // 날짜 포맷 locale
  const dateLocale = locale === 'en' ? 'en-US' : 'ko-KR'

  return (
    <>
      {/* 필터 */}
      <div className="bg-white pb-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[87px] flex flex-wrap gap-2">
          {/* 전체 필터 */}
          <button
            onClick={() => setActiveFilter('ALL')}
            className={[
              'px-5 py-2 rounded-full font-body text-[14px] font-medium transition-all duration-200',
              activeFilter === 'ALL'
                ? 'bg-nwcn-text-default text-white'
                : 'border border-[#ddd] text-[#555] hover:border-nwcn-text-default hover:text-nwcn-text-default',
            ].join(' ')}
          >
            {filterAll}
          </button>
          {DB_FILTER_TYPES.map((dbType) => (
            <button
              key={dbType}
              onClick={() => setActiveFilter(dbType)}
              className={[
                'px-5 py-2 rounded-full font-body text-[14px] font-medium transition-all duration-200',
                activeFilter === dbType
                  ? 'bg-nwcn-text-default text-white'
                  : 'border border-[#ddd] text-[#555] hover:border-nwcn-text-default hover:text-nwcn-text-default',
              ].join(' ')}
            >
              {typeLabels[dbType] ?? dbType}
            </button>
          ))}
        </div>
      </div>

      {/* 이벤트 목록 */}
      <div className="bg-white pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[87px]">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <p className="font-body text-[16px] text-[#aaa]">{t('noEvents')}</p>
            </div>
          ) : (
            <div className="space-y-5">
              {filtered.map((event) => {
                const dateObj = new Date(event.start_date)
                const month = dateObj.toLocaleDateString(dateLocale, { month: 'short' })
                const day = dateObj.getDate()
                const weekday = dateObj.toLocaleDateString(dateLocale, { weekday: 'short' })
                const badgeVariant = TYPE_COLORS[event.type] ?? 'gray'

                return (
                  <div
                    key={event.id}
                    className="border border-[#ececec] rounded-2xl p-7 flex gap-8 items-start hover:border-nwcn-green/30 hover:shadow-sm transition-all duration-300 group bg-white"
                  >
                    {/* 날짜 블록 */}
                    <div className="flex-shrink-0 w-[72px] flex flex-col items-center gap-1 pt-1">
                      <span className="font-body text-[11px] font-semibold tracking-widest text-[#aaa] uppercase">
                        {month}
                      </span>
                      <span className="font-brand font-bold text-[42px] text-nwcn-text-default leading-none group-hover:text-nwcn-green transition-colors">
                        {day}
                      </span>
                      <span className="font-body text-[11px] text-[#bbb]">{weekday}</span>
                    </div>

                    {/* 구분선 */}
                    <div className="flex-shrink-0 w-[1px] bg-[#ececec] self-stretch group-hover:bg-nwcn-green/30 transition-colors" />

                    {/* 내용 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[18px]">{TYPE_ICON[event.type] ?? '📌'}</span>
                        <h3 className="font-body text-[17px] font-semibold text-nwcn-text-default group-hover:text-nwcn-green transition-colors">
                          {event.title}
                        </h3>
                        <Badge variant={badgeVariant}>{typeLabels[event.type] ?? event.type}</Badge>
                      </div>

                      <p className="font-body text-[14px] text-[#777] leading-relaxed mb-4">
                        {event.description}
                      </p>

                      {event.location && (
                        <div className="flex items-center gap-2 text-[#999]">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span className="font-body text-[13px]">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
