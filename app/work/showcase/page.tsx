'use client'

import { useState } from 'react'
import SubPageLayout from '@/components/layout/SubPageLayout'
import WorkHero from '@/components/base/WorkHero'
import SubNav from '@/components/common/SubNav'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import Image from 'next/image'
import { WORK_NAV_ITEMS } from '@/constants/nav-items'
import { useFilter } from '@/hooks/useFilter'
import { usePagination } from '@/hooks/usePagination'

const TECH_FILTERS = ['전체', 'Video', 'Graphic', 'Web', 'Motion', 'Photo', 'AI']

const PLACEHOLDER_WORKS = [
  { id: '1', title: '빛의 도시', author: '김민준', tech_stack: ['Video', 'Motion'], view_count: 342, year: 2025, thumbnail_url: null },
  { id: '2', title: 'Digital Fragments', author: '이서연', tech_stack: ['Graphic', 'AI'], view_count: 218, year: 2025, thumbnail_url: null },
  { id: '3', title: '도시의 소리', author: '박태양', tech_stack: ['Web', 'Video'], view_count: 189, year: 2025, thumbnail_url: null },
  { id: '4', title: 'Metamorphosis', author: '최지우', tech_stack: ['Motion', 'Graphic'], view_count: 156, year: 2024, thumbnail_url: null },
  { id: '5', title: '연결의 언어', author: '정하늘', tech_stack: ['Web', 'AI'], view_count: 134, year: 2024, thumbnail_url: null },
  { id: '6', title: 'Still Life 2024', author: '윤채원', tech_stack: ['Photo'], view_count: 98, year: 2024, thumbnail_url: null },
  { id: '7', title: 'Frame by Frame', author: '한지수', tech_stack: ['Motion', 'Video'], view_count: 87, year: 2024, thumbnail_url: null },
  { id: '8', title: '픽셀 사이로', author: '오세준', tech_stack: ['Graphic', 'Web'], view_count: 73, year: 2023, thumbnail_url: null },
  { id: '9', title: 'Neon Dreams', author: '신예림', tech_stack: ['Video', 'AI'], view_count: 61, year: 2023, thumbnail_url: null },
]

const PAGE_SIZE = 9

const TAG_COLORS: Record<string, 'new' | 'hot' | 'number' | 'green' | 'yellow' | 'outline' | 'gray'> = {
  Video: 'new',
  Graphic: 'hot',
  Web: 'outline',
  Motion: 'number',
  Photo: 'gray',
  AI: 'hot',
}

export default function ShowcasePage() {
  const [activeFilter, setActiveFilter] = useState('전체')

  const { filtered } = useFilter(PLACEHOLDER_WORKS, (w) =>
    activeFilter === '전체' || w.tech_stack.includes(activeFilter)
  )

  const { page, setPage, totalPages, paged, reset } = usePagination(filtered, PAGE_SIZE)

  const handleFilterChange = (f: string) => {
    setActiveFilter(f)
    reset()
  }

  return (
    <SubPageLayout>
      {/* 히어로 */}
      <WorkHero />

      {/* 서브 탭 */}
      <SubNav items={WORK_NAV_ITEMS} />

      {/* 섹션 타이틀 */}
      <div className="bg-white pt-[60px] pb-[28px] text-center">
        <p className="font-body font-light text-[24px] text-black">SHOWCASE</p>
      </div>

      {/* 필터 바 */}
      <div className="bg-white pb-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px] flex flex-wrap gap-2">
          {TECH_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
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

      {/* 카드 그리드 */}
      <div className="bg-white pb-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px]">
          {paged.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <p className="font-body text-[16px] text-[#aaa]">검색 결과가 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-[35px] gap-y-10">
              {paged.map((work) => (
                <Link key={work.id} href={`/work/${work.id}`} className="block group">
                  <article className="border border-[#ececec] rounded-2xl overflow-hidden hover:shadow-lg hover:border-nwcn-green/30 transition-all duration-300">
                    {/* 썸네일 */}
                    <div className="aspect-[4/3] bg-[#f7f7f7] relative overflow-hidden">
                      {work.thumbnail_url ? (
                        <Image
                          src={work.thumbnail_url}
                          alt={work.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#f0f0f0] to-[#e8e8e8]">
                          <span className="font-brand font-black text-[56px] text-[#d8d8d8] leading-none">
                            {work.title[0]}
                          </span>
                        </div>
                      )}
                      {/* 조회수 뱃지 */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span className="font-body text-[11px] text-white">{work.view_count}</span>
                      </div>
                    </div>

                    {/* 정보 */}
                    <div className="p-5 bg-white">
                      <h3 className="font-body text-[16px] font-semibold text-nwcn-text-default mb-1 group-hover:text-nwcn-green transition-colors">
                        {work.title}
                      </h3>
                      <p className="font-body text-[13px] text-[#999] mb-3">
                        {work.author} · {work.year}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {work.tech_stack.map((tag) => (
                          <Badge key={tag} variant={TAG_COLORS[tag] ?? 'outline'}>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 페이지네이션 */}
      <div className="bg-white">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </SubPageLayout>
  )
}
