'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import type { NcrReportListItem as NcrReportItem } from '@/lib/supabase/queries/ncr'

const TYPE_BADGE: Record<string, 'new' | 'hot' | 'number'> = {
  editorial: 'new',
  trend: 'hot',
  card_news: 'number',
}
const SEASON_COLORS: Record<string, string> = {
  'Season 3': '#09F593',
  'Season 2': '#E3E94D',
  'Season 1': '#d0d0d0',
}

interface Props {
  reports: NcrReportItem[]
  seasons: string[] // DB에서 추출한 고유 시즌 목록 (정렬됨)
}

export default function ArchiveClient({ reports, seasons }: Props) {
  const t = useTranslations('ncr.archive')
  const locale = useLocale()

  const filterAll = t('filterAll')

  const [activeSeason, setActiveSeason] = useState(filterAll)

  const filtered =
    activeSeason === filterAll
      ? reports
      : reports.filter((r) => r.season === activeSeason)

  // 시즌별 그룹핑
  const otherGroup = t('otherGroup')
  const grouped = filtered.reduce<Record<string, NcrReportItem[]>>((acc, r) => {
    const key = r.season ?? otherGroup
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  const sortedSeasons = seasons.filter((s) => grouped[s])

  // 타입별 레이블 (번역)
  const typeLabels: Record<string, string> = {
    editorial: t('typeEditorial'),
    trend: t('typeTrend'),
    card_news: t('typeCardNews'),
  }

  // 날짜 포맷 locale
  const dateLocale = locale === 'en' ? 'en-US' : 'ko-KR'

  return (
    <>
      {/* 시즌 필터 */}
      <div className="bg-white pb-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px] flex flex-wrap gap-2">
          {[filterAll, ...seasons].map((s) => (
            <button
              key={s}
              onClick={() => setActiveSeason(s)}
              className={[
                'px-5 py-2 rounded-full font-body text-[14px] font-medium transition-all duration-200',
                activeSeason === s
                  ? 'bg-nwcn-text-default text-white'
                  : 'border border-[#ddd] text-[#555] hover:border-nwcn-text-default hover:text-nwcn-text-default',
              ].join(' ')}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 리포트 목록 */}
      <div className="bg-white pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px] space-y-14">
          {sortedSeasons.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <p className="font-body text-[16px] text-[#aaa]">{t('noReports')}</p>
            </div>
          ) : (
            sortedSeasons.map((season) => (
              <div key={season}>
                {/* 시즌 헤더 */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: SEASON_COLORS[season] ?? '#d0d0d0' }}
                  />
                  <h2 className="font-brand font-bold text-[20px] text-nwcn-text-default">
                    {season}
                  </h2>
                  <div className="flex-1 h-[1px] bg-[#ececec]" />
                  <span className="font-body text-[13px] text-[#bbb]">
                    {grouped[season].length}{locale === 'en' ? ` ${t('countSuffix')}` : t('countSuffix')}
                  </span>
                </div>

                {/* 리포트 리스트 */}
                <div className="space-y-3">
                  {grouped[season].map((report, idx) => (
                    <Link
                      key={report.id}
                      href={`/ncr-trend/${report.id}`}
                      className="flex items-center gap-6 p-5 border border-[#ececec] rounded-2xl hover:border-nwcn-green/30 hover:shadow-sm transition-all duration-200 group bg-white"
                    >
                      {/* 순번 */}
                      <span className="font-brand font-bold text-[14px] text-[#ddd] w-6 flex-shrink-0 text-center">
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      {/* 날짜 */}
                      <span className="font-body text-[12px] text-[#bbb] w-24 flex-shrink-0">
                        {new Date(report.published_at).toLocaleDateString(dateLocale)}
                      </span>

                      {/* 뱃지 */}
                      <Badge variant={TYPE_BADGE[report.type]}>
                        {typeLabels[report.type] ?? report.type}
                      </Badge>

                      {/* 제목 */}
                      <p className="flex-1 font-body text-[15px] text-nwcn-text-default font-medium group-hover:text-nwcn-green transition-colors">
                        {report.title}
                      </p>

                      {/* 읽기 시간 */}
                      {report.read_time && (
                        <span className="font-body text-[12px] text-[#bbb] flex-shrink-0">
                          {report.read_time} {t('readSuffix')}
                        </span>
                      )}

                      {/* 화살표 */}
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2"
                        className="flex-shrink-0 text-[#ddd] group-hover:text-nwcn-green group-hover:translate-x-1 transition-all duration-200"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
