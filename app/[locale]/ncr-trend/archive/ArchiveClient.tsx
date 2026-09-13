'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import type { NcrReportListItem as NcrReportItem } from '@/lib/supabase/queries/ncr'
import { FilterChip, FilterGroup } from '@/components/ui/FilterChip'

const TYPE_BADGE: Record<string, 'new' | 'hot' | 'number'> = {
  editorial: 'new',
  trend: 'hot',
  card_news: 'number',
}
const SEASON_COLORS: Record<string, string> = {
  'Season 3': 'var(--color-green)',
  'Season 2': 'var(--color-yellow)',
  'Season 1': 'var(--color-neutral-300)',
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
        <FilterGroup label="시즌 필터" className="page-container">
          {[filterAll, ...seasons].map((s) => (
            <FilterChip key={s} active={activeSeason === s} onClick={() => setActiveSeason(s)}>
              {s}
            </FilterChip>
          ))}
        </FilterGroup>
      </div>

      {/* 리포트 목록 */}
      <div className="bg-white pb-section-lg">
        <div className="page-container space-y-14">
          {sortedSeasons.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <p className="font-body text-body text-nwcn-neutral-400">{t('noReports')}</p>
            </div>
          ) : (
            sortedSeasons.map((season) => (
              <div key={season}>
                {/* 시즌 헤더 */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: SEASON_COLORS[season] ?? 'var(--color-neutral-300)' }}
                  />
                  <h2 className="font-brand font-bold text-section text-nwcn-text-default">
                    {season}
                  </h2>
                  <div className="flex-1 h-[1px] bg-nwcn-neutral-200" />
                  <span className="font-body text-caption text-nwcn-neutral-400">
                    {grouped[season].length}{locale === 'en' ? ` ${t('countSuffix')}` : t('countSuffix')}
                  </span>
                </div>

                {/* 리포트 리스트 */}
                <div className="space-y-3">
                  {grouped[season].map((report, idx) => (
                    <Link
                      key={report.id}
                      href={`/ncr-trend/${report.id}`}
                      className="flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-2 sm:gap-6 p-4 sm:p-5 border border-nwcn-neutral-200 rounded-panel hover:border-nwcn-green/30 hover:shadow-lift-1 transition-[color,background-color,border-color,transform,box-shadow,opacity] duration-fast ease-nwcn group bg-white"
                    >
                      {/* 순번 */}
                      <span className="font-brand font-bold text-caption sm:text-body-sm text-nwcn-neutral-300 w-6 flex-shrink-0 text-center">
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      {/* 날짜 */}
                      <span className="font-body text-caption text-nwcn-neutral-400 w-20 sm:w-24 flex-shrink-0">
                        {new Date(report.published_at).toLocaleDateString(dateLocale)}
                      </span>

                      {/* 뱃지 */}
                      <Badge variant={TYPE_BADGE[report.type]}>
                        {typeLabels[report.type] ?? report.type}
                      </Badge>

                      {/* 제목 — 모바일에선 줄바꿈되어 한 줄 전체 차지, 데스크탑에선 인라인 */}
                      <p className="order-last sm:order-none basis-full sm:basis-auto sm:flex-1 min-w-0 font-body text-body-sm sm:text-body text-nwcn-text-default font-medium group-hover:text-nwcn-green transition-colors duration-fast ease-nwcn">
                        {report.title}
                      </p>

                      {/* 읽기 시간 — 모바일 숨김 */}
                      {report.read_time && (
                        <span className="hidden sm:inline font-body text-caption text-nwcn-neutral-400 flex-shrink-0">
                          {report.read_time} {t('readSuffix')}
                        </span>
                      )}

                      {/* 화살표 — 모바일 숨김(공간 확보) */}
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2"
                        className="hidden sm:block flex-shrink-0 text-nwcn-neutral-300 group-hover:text-nwcn-green group-hover:translate-x-1 transition-[color,background-color,border-color,transform,box-shadow,opacity] duration-fast ease-nwcn"
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
