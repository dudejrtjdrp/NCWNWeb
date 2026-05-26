'use client'

import { useState } from 'react'
import SubPageLayout from '@/components/layout/SubPageLayout'
import PageHeader from '@/components/common/PageHeader'
import FilterBar from '@/components/common/FilterBar'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'

const SEASONS = ['전체', 'Season 3', 'Season 2', 'Season 1']

const ARCHIVE_REPORTS = [
  { id: '1', title: 'AI가 바꾸는 미디어 콘텐츠 산업의 미래', type: 'editorial' as const, season: 'Season 3', external_url: '#', published_at: '2025-05-10' },
  { id: '2', title: '쇼츠 시대의 스토리텔링 전략', type: 'trend' as const, season: 'Season 3', external_url: '#', published_at: '2025-04-22' },
  { id: '3', title: 'K-콘텐츠, 글로벌 플랫폼을 공략하라', type: 'editorial' as const, season: 'Season 2', external_url: '#', published_at: '2025-03-18' },
  { id: '4', title: '유튜브 알고리즘의 비밀', type: 'card_news' as const, season: 'Season 1', external_url: '#', published_at: '2024-11-05' },
]

const TYPE_LABELS = { editorial: '에디토리얼', trend: '트렌드', card_news: '카드뉴스' }

export default function ArchivePage() {
  const [activeSeason, setActiveSeason] = useState('전체')

  const filtered = activeSeason === '전체'
    ? ARCHIVE_REPORTS
    : ARCHIVE_REPORTS.filter((r) => r.season === activeSeason)

  return (
    <SubPageLayout>
      <PageHeader
        category="NCR TREND — ARCHIVE"
        title="리포트 아카이브"
        description="지난 시즌 NCR 리포트를 모아봅니다."
      />
      <section className="py-12">
        <div className="page-container">
          <FilterBar filters={SEASONS} activeFilter={activeSeason} onFilterChange={setActiveSeason} className="mb-10" />
          <div className="space-y-3">
            {filtered.map((report) => (
              <Link
                key={report.id}
                href={`/ncr-trend/${report.id}`}
                className="flex items-center gap-4 p-5 bg-nwcn-dark-3 border border-white/5 rounded-xl hover:border-nwcn-green/20 transition-all duration-200 group"
              >
                <span className="font-body text-xs text-white/20 w-24 flex-shrink-0">
                  {new Date(report.published_at).toLocaleDateString('ko-KR')}
                </span>
                <Badge variant="green">{TYPE_LABELS[report.type]}</Badge>
                <p className="flex-1 font-body text-sm text-white/70 group-hover:text-white transition-colors">
                  {report.title}
                </p>
                <span className="font-body text-xs text-white/20 flex-shrink-0">{report.season}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SubPageLayout>
  )
}
