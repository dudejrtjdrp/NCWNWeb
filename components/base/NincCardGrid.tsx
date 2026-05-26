/**
 * BASE 컴포넌트: NincCardGrid
 * Figma node-id: 280:409 (SearchBar), 280:410~445 (Cards), 280:446~499 (Union icons)
 *                280:500~503 (Decorative Vectors)
 *
 * 디자인 스펙:
 * ─ 섹션 타이틀: Pretendard Light 24px, black, 중앙 정렬 (280:408)
 * ─ 검색바: max-w-1011px, h-47px, border-black rounded-[229px] (280:409)
 * ─ 그리드: 3열, 열 간격 35px, 행 간격 145px (장식 요소 공간), max-w-1440px px-[123px]
 * ─ 좌측 장식 (Vector2): rotate-180, left-0, top-[203px] (280:500)
 * ─ 우측 장식 (Vector3): scaleY(-1), right-0, top-[647px] (280:502)
 * ─ 빈 상태: 중앙 안내 메시지
 *
 * 'use client' — onSearchChange, onPageChange 이벤트 핸들러
 * 기능 로직 없음 (순수 UI, 모든 state는 부모에서 관리)
 *
 * TODO: 영구 에셋으로 교체 (7일 만료)
 */

'use client'

import NincCardItem, { NincCardItemProps } from './NincCardItem'
import Pagination from '@/components/ui/Pagination'
import SearchBar from '@/components/common/SearchBar'

const ASSETS = {
  trophy: '/images/ninc/trophy.svg',
  leftDecor: '/images/ninc/left-decor.svg',
  rightDecor: '/images/ninc/right-decor.svg',
}

export interface NincGridItem extends Omit<NincCardItemProps, 'trophyIconUrl'> {
  id: string
}

export interface NincCardGridProps {
  /** 현재 페이지에 표시할 항목 (이미 페이지네이션 처리된 목록) */
  items: NincGridItem[]
  /** 카드 클릭 시 이동할 href 생성 함수. 전달하면 호버 애니메이션 활성화 */
  getHref?: (id: string) => string
  /** 검색창 현재 값 */
  searchValue: string
  /** 검색창 변경 콜백 (부모에서 state 관리) */
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  /** 현재 페이지 번호 (1-based) */
  page: number
  /** 전체 페이지 수 */
  totalPages: number
  /** 페이지 변경 콜백 */
  onPageChange: (page: number) => void
  /** 섹션 타이틀 텍스트 ("AWARDS" | "PROJECT") */
  sectionTitle: string
  /** 결과 없을 때 메시지 */
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
      <div className="text-center pt-[86px] pb-[28px]" data-node-id="280:408">
        <p className="font-body font-light text-[24px] text-black leading-normal">
          {sectionTitle}
        </p>
      </div>

      {/* ── 검색바 ── */}
      <div className="pb-[100px]" data-node-id="280:409">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          label={`${sectionTitle} 검색`}
        />
      </div>

      {/* ── 카드 그리드 영역 ── */}
      <div
        className="relative max-w-[1440px] mx-auto px-[87px] pb-20"
      >
        {/* 좌측 장식 요소 (Vector2, rotate-180) — Figma: left-[-62px] top-[203px] */}
        <div
          className="absolute left-0 pointer-events-none select-none"
          style={{ top: '203px', width: '247px', height: '239px', transform: 'rotate(180deg)' }}
          aria-hidden="true"
          data-node-id="280:500"
        >
          {/* TODO: 영구 에셋으로 교체 */}
          <img
            src={ASSETS.leftDecor}
            alt=""
            className="w-full h-full object-contain opacity-50"
          />
        </div>

        {/* 우측 장식 요소 (Vector3, scaleY(-1)) — Figma: right side, top-[647px] */}
        <div
          className="absolute right-0 pointer-events-none select-none"
          style={{ top: '647px', width: '247px', height: '239px', transform: 'scaleY(-1)' }}
          aria-hidden="true"
          data-node-id="280:502"
        >
          {/* TODO: 영구 에셋으로 교체 */}
          <img
            src={ASSETS.rightDecor}
            alt=""
            className="w-full h-full object-contain opacity-50"
          />
        </div>

        {/* ── 빈 상태 ── */}
        {items.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <p className="font-body text-[16px] text-nwcn-text-sub">{emptyMessage}</p>
          </div>
        ) : (
          /* ── 3열 카드 그리드 ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[35px] gap-y-[145px]">
            {items.map((item) => (
              <NincCardItem
                key={item.id}
                thumbnail={item.thumbnail}
                caption={item.caption}
                subCaption={item.subCaption}
                badge={item.badge}
                trophyIconUrl={ASSETS.trophy}
                href={getHref ? getHref(item.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── 페이지네이션 ── */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}
