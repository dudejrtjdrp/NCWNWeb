/**
 * BASE 컴포넌트: NincCardGrid
 */

'use client'

import NincCardItem, { NincCardItemProps } from './NincCardItem'
import Pagination from '@/components/ui/Pagination'
import SearchBar from '@/components/common/SearchBar'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'

const ASSETS = {
  trophy: '/images/ninc/trophy.svg',
  leftDecor: '/images/ninc/left-decor.svg',
  rightDecor: '/images/ninc/right-decor.svg',
}

export interface NincGridItem extends Omit<NincCardItemProps, 'trophyIconUrl'> {
  id: string
}

export interface NincCardGridProps {
  items: NincGridItem[]
  getHref?: (id: string) => string
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  sectionTitle: string
  emptyMessage?: string
}

export default function NincCardGrid({
  items,
  searchValue,
  onSearchChange,
  searchPlaceholder = '검색어를 입력하세요',
  page,
  totalPages,
  onPageChange,
  sectionTitle,
  emptyMessage = '검색 결과가 없습니다',
  getHref,
}: NincCardGridProps) {
  return (
    <div className="bg-white">
      {/* ── 섹션 타이틀 ── */}
      <AnimateOnScroll variant="fade-up" className="text-center pt-[86px] pb-[28px]">
        <p className="font-body font-light text-[24px] text-black leading-normal">
          {sectionTitle}
        </p>
      </AnimateOnScroll>

      {/* ── 검색바 ── */}
      <AnimateOnScroll variant="fade-up" delay={80} className="pb-[100px]">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          label={`${sectionTitle} 검색`}
        />
      </AnimateOnScroll>

      {/* ── 카드 그리드 영역 ── */}
      <div className="relative max-w-[1440px] mx-auto px-[87px] pb-20">
        {/* 장식 요소들 */}
        <div
          className="absolute left-0 pointer-events-none select-none"
          style={{ top: '203px', width: '247px', height: '239px', transform: 'rotate(180deg)' }}
          aria-hidden="true"
        >
          <img src={ASSETS.leftDecor} alt="" className="w-full h-full object-contain opacity-50" />
        </div>
        <div
          className="absolute right-0 pointer-events-none select-none"
          style={{ top: '647px', width: '247px', height: '239px', transform: 'scaleY(-1)' }}
          aria-hidden="true"
        >
          <img src={ASSETS.rightDecor} alt="" className="w-full h-full object-contain opacity-50" />
        </div>

        {/* ── 빈 상태 ── */}
        {items.length === 0 ? (
          <AnimateOnScroll variant="fade" className="flex items-center justify-center py-24">
            <p className="font-body text-[16px] text-nwcn-text-sub">{emptyMessage}</p>
          </AnimateOnScroll>
        ) : (
          /* ── 3열 카드 그리드 ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[35px] gap-y-[145px]">
            {items.map((item, i) => (
              <AnimateOnScroll
                key={item.id}
                variant="fade-up"
                delay={Math.min((i % 3) * 100, 200)}
              >
                <NincCardItem
                  thumbnail={item.thumbnail}
                  caption={item.caption}
                  subCaption={item.subCaption}
                  badge={item.badge}
                  trophyIconUrl={ASSETS.trophy}
                  href={getHref ? getHref(item.id) : undefined}
                />
              </AnimateOnScroll>
            ))}
          </div>
        )}
      </div>

      {/* ── 페이지네이션 ── */}
      <AnimateOnScroll variant="fade-up">
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </AnimateOnScroll>
    </div>
  )
}
