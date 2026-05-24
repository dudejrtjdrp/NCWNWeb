/**
 * TARGET 페이지: NINC/Awards
 * Figma node-id: 280:384 (NINC/Awards/Desktop)
 *
 * BASE 컴포넌트 통합:
 * - NincHeroBanner (280:401): 히어로 배너
 * - NincCardGrid (280:409 + 카드그리드): 검색 + 3열 그리드 + 페이지네이션
 *
 * 상태 관리 (이 컴포넌트에서만):
 * - searchQuery: 검색어 (필터링에 사용)
 * - currentPage: 현재 페이지 (1-based)
 *
 * 기존 데이터/로직 유지, UI만 BASE 컴포넌트로 교체
 */

'use client'

import { useState, useMemo } from 'react'
import SubPageLayout from '@/components/layout/SubPageLayout'
import NincHeroBanner from '@/components/base/NincHeroBanner'
import NincCardGrid from '@/components/base/NincCardGrid'
import Badge from '@/components/ui/Badge'

const HERO_IMAGE_URL = '/images/ninc/awards-hero.jpg'

// ── 데이터 ────────────────────────────────────────────────
const AWARDS_DATA = [
  { id: '1', year: 2025, competition: '대한민국 광고대상', award_name: '금상', winner: '홍길동', team_members: ['홍길동', '이영희'] },
  { id: '2', year: 2025, competition: 'K-콘텐츠 공모전', award_name: '최우수상', winner: '이영희', team_members: ['이영희'] },
  { id: '3', year: 2024, competition: '방송영상 콘텐츠 경진대회', award_name: '우수상', winner: '김민수', team_members: ['김민수', '박태양'] },
  { id: '4', year: 2024, competition: '전국 대학생 미디어 공모전', award_name: '장려상', winner: '최지우', team_members: ['최지우'] },
  { id: '5', year: 2024, competition: '한국광고학회 공모전', award_name: '대상', winner: '박서연', team_members: ['박서연', '김도현'] },
  { id: '6', year: 2024, competition: '디지털 콘텐츠 창작 경진대회', award_name: '우수상', winner: '이준호', team_members: ['이준호'] },
  { id: '7', year: 2023, competition: '대학생 영상 페스티벌', award_name: '최우수상', winner: '박나연', team_members: ['박나연', '강민준'] },
  { id: '8', year: 2023, competition: 'NCR 트렌드 리포트 공모전', award_name: '대상', winner: '정은서', team_members: ['정은서'] },
  { id: '9', year: 2023, competition: '스마트 미디어 어워드', award_name: '금상', winner: '한서윤', team_members: ['한서윤', '임지민'] },
  { id: '10', year: 2023, competition: '전국 방송 콘텐츠 공모전', award_name: '장려상', winner: '오현석', team_members: ['오현석'] },
  { id: '11', year: 2022, competition: '대한민국 학생 창작 공모전', award_name: '우수상', winner: '노지연', team_members: ['노지연', '황민서'] },
]

// 수상 등급 → Badge variant 매핑
const AWARD_BADGE_VARIANT: Record<string, 'new' | 'hot' | 'number'> = {
  '대상': 'new',
  '금상': 'new',
  '최우수상': 'hot',
  '우수상': 'hot',
  '장려상': 'number',
}

const PAGE_SIZE = 9

// ── 태그라인 (A2Z, "빛나는" = #09F593 Bold) ─────────────
const AwardsTagline = (
  <>
    {'당신의 노력이 '}
    <span className="font-brand font-bold text-nwcn-green">빛나는</span>
    {' 순간'}
  </>
)

// ── 페이지 컴포넌트 ────────────────────────────────────────
export default function AwardsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // 필터링
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return AWARDS_DATA
    return AWARDS_DATA.filter(
      (a) =>
        a.competition.toLowerCase().includes(q) ||
        a.award_name.toLowerCase().includes(q) ||
        a.winner.toLowerCase().includes(q) ||
        a.team_members.some((m) => m.toLowerCase().includes(q))
    )
  }, [searchQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  // 페이지네이션 슬라이스 → NincGridItem 형태로 변환
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE).map((a) => ({
      id: a.id,
      caption: a.competition,
      subCaption: `${a.year}`,
      badge: (
        <Badge variant={AWARD_BADGE_VARIANT[a.award_name] ?? 'number'}>
          {a.award_name}
        </Badge>
      ),
    }))
  }, [filtered, currentPage])

  // 검색 변경 시 첫 페이지로 초기화
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  return (
    <SubPageLayout>
      {/* 1. 히어로 배너 */}
      <NincHeroBanner
        pageName="AWARDS"
        heroImageUrl={HERO_IMAGE_URL}
        tagline={AwardsTagline}
      />

      {/* 2. 섹션 타이틀 + 검색바 + 카드 그리드 + 페이지네이션 */}
      <NincCardGrid
        items={pagedItems}
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="대회명, 수상 등급, 수상자 검색"
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        sectionTitle="AWARDS"
        emptyMessage="검색 결과가 없습니다"
      />
    </SubPageLayout>
  )
}
