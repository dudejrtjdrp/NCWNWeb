'use client'

import SubPageLayout from '@/components/layout/SubPageLayout'
import NincHeroBanner from '@/components/base/NincHeroBanner'
import SubNav from '@/components/common/SubNav'
import Badge from '@/components/ui/Badge'
import { useState } from 'react'
import { NINC_NAV_ITEMS } from '@/constants/nav-items'

const EVENTS = [
  {
    id: '1',
    title: '미디어 산업 트렌드 특강',
    type: '특강' as const,
    start_date: '2025-06-15',
    location: '본관 강당',
    description: '현직 방송 PD 초청 특강 — 변화하는 OTT 시장과 콘텐츠 전략을 현장 관점에서 들어봅니다.',
  },
  {
    id: '2',
    title: '영상 편집 심화 워크숍',
    type: '워크숍' as const,
    start_date: '2025-06-22',
    location: '실습실 201',
    description: '프리미어 프로 & 다빈치 리졸브 고급 과정. 색 보정과 사운드 믹싱까지 실전 중심으로 진행합니다.',
  },
  {
    id: '3',
    title: '오픈 캠퍼스 Day',
    type: '캠퍼스투어' as const,
    start_date: '2025-07-05',
    location: '학과 전체',
    description: '입시생 대상 학과 탐방 행사. 재학생과 교수진이 직접 학과 시설을 안내합니다.',
  },
  {
    id: '4',
    title: 'AI 콘텐츠 제작 세미나',
    type: '특강' as const,
    start_date: '2025-07-18',
    location: '미디어 스튜디오',
    description: '생성 AI를 활용한 영상·이미지 콘텐츠 제작 최신 트렌드 세미나.',
  },
  {
    id: '5',
    title: '졸업전시 기획 워크숍',
    type: '워크숍' as const,
    start_date: '2025-08-02',
    location: '세미나실 302',
    description: '2025 졸업전시 준비를 위한 기획·연출 워크숍. 4학년 전용 프로그램.',
  },
]

const TYPE_COLORS = {
  '특강': 'new' as const,
  '워크숍': 'hot' as const,
  '캠퍼스투어': 'number' as const,
  '기타': 'gray' as const,
}

const TYPE_ICON: Record<string, string> = {
  '특강': '🎤',
  '워크숍': '🛠',
  '캠퍼스투어': '🏫',
  '기타': '📌',
}

const FILTER_TYPES = ['전체', '특강', '워크숍', '캠퍼스투어']

const EventTagline = (
  <>
    {'학과의 모든 '}
    <span className="font-brand font-bold text-nwcn-green">이벤트</span>
    {'를 만나보세요'}
  </>
)

export default function EventPage() {
  const [activeFilter, setActiveFilter] = useState('전체')

  const filtered =
    activeFilter === '전체' ? EVENTS : EVENTS.filter((e) => e.type === activeFilter)

  return (
    <SubPageLayout>
      {/* 히어로 배너 */}
      <NincHeroBanner
        pageName="EVENT"
        heroImageUrl="/images/ninc/event-hero.png"
        tagline={EventTagline}
      />

      {/* 서브 탭 */}
      <SubNav items={NINC_NAV_ITEMS} />

      {/* 섹션 타이틀 */}
      <div className="bg-white pt-[60px] pb-[28px] text-center">
        <p className="font-body font-light text-[24px] text-black">EVENT</p>
      </div>

      {/* 필터 */}
      <div className="bg-white pb-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[87px] flex flex-wrap gap-2">
          {FILTER_TYPES.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={[
                'px-5 py-2 rounded-full font-body text-[14px] font-medium transition-all duration-200',
                activeFilter === f
                  ? 'bg-nwcn-text-default text-white'
                  : 'border border-[#ddd] text-[#555] hover:border-nwcn-text-default hover:text-nwcn-text-default',
              ].join(' ')}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* 이벤트 목록 */}
      <div className="bg-white pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[87px]">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <p className="font-body text-[16px] text-[#aaa]">해당 유형의 이벤트가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {filtered.map((event) => {
                const dateObj = new Date(event.start_date)
                const month = dateObj.toLocaleDateString('ko-KR', { month: 'short' })
                const day = dateObj.getDate()
                const weekday = dateObj.toLocaleDateString('ko-KR', { weekday: 'short' })

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
                        <Badge variant={TYPE_COLORS[event.type]}>{event.type}</Badge>
                      </div>

                      <p className="font-body text-[14px] text-[#777] leading-relaxed mb-4">
                        {event.description}
                      </p>

                      <div className="flex items-center gap-2 text-[#999]">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="font-body text-[13px]">{event.location}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </SubPageLayout>
  )
}
