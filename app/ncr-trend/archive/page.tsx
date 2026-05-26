'use client'

import { useState } from 'react'
import SubPageLayout from '@/components/layout/SubPageLayout'
import NcrHero from '@/components/base/NcrHero'
import SubNav from '@/components/common/SubNav'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import { NCR_NAV_ITEMS } from '@/constants/nav-items'

const SEASONS = ['전체', 'Season 3', 'Season 2', 'Season 1']

const ARCHIVE_REPORTS = [
  { id: '1', title: 'AI가 바꾸는 미디어 콘텐츠 산업의 미래', type: 'editorial' as const, season: 'Season 3', published_at: '2025-05-10', read_time: '8분' },
  { id: '2', title: '쇼츠 시대의 스토리텔링 전략', type: 'trend' as const, season: 'Season 3', published_at: '2025-04-22', read_time: '6분' },
  { id: '3', title: '메타버스 콘텐츠 창작자가 되는 법', type: 'card_news' as const, season: 'Season 3', published_at: '2025-04-05', read_time: '4분' },
  { id: '4', title: 'K-콘텐츠, 글로벌 플랫폼을 공략하라', type: 'editorial' as const, season: 'Season 2', published_at: '2025-03-18', read_time: '10분' },
  { id: '5', title: '크리에이터 이코노미의 미래', type: 'trend' as const, season: 'Season 2', published_at: '2025-02-10', read_time: '7분' },
  { id: '6', title: '인스타그램 알고리즘 완전 분석', type: 'card_news' as const, season: 'Season 2', published_at: '2025-01-25', read_time: '5분' },
  { id: '7', title: '유튜브 알고리즘의 비밀', type: 'card_news' as const, season: 'Season 1', published_at: '2024-11-05', read_time: '5분' },
  { id: '8', title: 'OTT 시대, 드라마는 어떻게 만들어지나', type: 'editorial' as const, season: 'Season 1', published_at: '2024-10-12', read_time: '9분' },
]

const TYPE_LABELS: Record<string, string> = { editorial: '에디토리얼', trend: '트렌드', card_news: '카드뉴스' }
const TYPE_BADGE: Record<string, 'new' | 'hot' | 'number'> = { editorial: 'new', trend: 'hot', card_news: 'number' }

const SEASON_COLORS: Record<string, string> = {
  'Season 3': '#09F593',
  'Season 2': '#E3E94D',
  'Season 1': '#d0d0d0',
}

export default function ArchivePage() {
  const [activeSeason, setActiveSeason] = useState('전체')

  const filtered =
    activeSeason === '전체'
      ? ARCHIVE_REPORTS
      : ARCHIVE_REPORTS.filter((r) => r.season === activeSeason)

  // 시즌별 그룹핑
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, r) => {
    if (!acc[r.season]) acc[r.season] = []
    acc[r.season].push(r)
    return acc
  }, {})

  const seasonOrder = ['Season 3', 'Season 2', 'Season 1']
  const sortedSeasons = seasonOrder.filter((s) => grouped[s])

  return (
    <SubPageLayout>
      {/* NCR 히어로 */}
      <NcrHero />

      {/* 서브 탭 */}
      <SubNav items={NCR_NAV_ITEMS} />

      {/* 섹션 타이틀 */}
      <div className="bg-white pt-[60px] pb-[28px] text-center">
        <p className="font-body font-light text-[24px] text-black">ARCHIVE</p>
      </div>

      {/* 시즌 필터 */}
      <div className="bg-white pb-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px] flex flex-wrap gap-2">
          {SEASONS.map((s) => (
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

      {/* 리포트 목록 (시즌 그룹) */}
      <div className="bg-white pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px] space-y-14">
          {sortedSeasons.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <p className="font-body text-[16px] text-[#aaa]">해당 시즌의 리포트가 없습니다.</p>
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
                  <h2 className="font-brand font-bold text-[20px] text-nwcn-text-default">{season}</h2>
                  <div className="flex-1 h-[1px] bg-[#ececec]" />
                  <span className="font-body text-[13px] text-[#bbb]">{grouped[season].length}편</span>
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
                        {new Date(report.published_at).toLocaleDateString('ko-KR')}
                      </span>

                      {/* 뱃지 */}
                      <Badge variant={TYPE_BADGE[report.type]}>{TYPE_LABELS[report.type]}</Badge>

                      {/* 제목 */}
                      <p className="flex-1 font-body text-[15px] text-nwcn-text-default font-medium group-hover:text-nwcn-green transition-colors">
                        {report.title}
                      </p>

                      {/* 읽기 시간 */}
                      <span className="font-body text-[12px] text-[#bbb] flex-shrink-0">{report.read_time} 읽기</span>

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
    </SubPageLayout>
  )
}
