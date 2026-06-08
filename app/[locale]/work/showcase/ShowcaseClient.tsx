'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import { useFilter } from '@/hooks/useFilter'
import { usePagination } from '@/hooks/usePagination'
import type { WorkListItem as WorkItem } from '@/lib/supabase/queries/works'

const TECH_FILTERS = ['전체', 'Video', 'Graphic', 'Web', 'Motion', 'Photo', 'AI']

const TAG_COLORS: Record<string, 'new' | 'hot' | 'number' | 'green' | 'yellow' | 'outline' | 'gray'> = {
  Video: 'new',
  Graphic: 'hot',
  Web: 'outline',
  Motion: 'number',
  Photo: 'gray',
  AI: 'hot',
}

const PAGE_SIZE = 9

interface Props {
  initialWorks: WorkItem[]
}

export default function ShowcaseClient({ initialWorks }: Props) {
  const [activeFilter, setActiveFilter] = useState('전체')

  const { filtered } = useFilter(initialWorks, (w) =>
    activeFilter === '전체' || w.tech_stack.includes(activeFilter)
  )

  const { page, setPage, totalPages, paged, reset } = usePagination(filtered, PAGE_SIZE)

  const handleFilterChange = (f: string) => {
    setActiveFilter(f)
    reset()
  }

  return (
    <>
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
                  : 'border border-nwcn-border-muted text-nwcn-gray-text hover:border-nwcn-text-default hover:text-nwcn-text-default',
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
              <p className="font-body text-[16px] text-nwcn-gray-faint">검색 결과가 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-[35px] gap-y-10">
              {paged.map((work) => (
                <Link key={work.id} href={`/work/${work.id}`} className="block group">
                  <article className="border border-nwcn-border-light rounded-2xl overflow-hidden hover:shadow-lg hover:border-nwcn-green/30 transition-all duration-300">
                    {/* 썸네일 */}
                    <div className="aspect-[4/3] bg-nwcn-surface relative overflow-hidden">
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
    </>
  )
}
