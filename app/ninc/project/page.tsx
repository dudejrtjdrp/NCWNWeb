/**
 * TARGET 페이지: NINC/Project
 * Figma node-id: 280:520 (NINC/Project/Desktop)
 *
 * BASE 컴포넌트 통합:
 * - NincHeroBanner (280:537): 히어로 배너
 * - NincCardGrid (280:545 + 카드그리드): 검색 + 3열 그리드 + 페이지네이션
 *
 * 상태 관리 (이 컴포넌트에서만):
 * - searchQuery: 검색어
 * - currentPage: 현재 페이지 (1-based)
 *
 * 기존 데이터/로직 유지, UI만 BASE 컴포넌트로 교체
 */

'use client'

import { useState, useMemo } from 'react'
import SubPageLayout from '@/components/layout/SubPageLayout'
import NincHeroBanner from '@/components/base/NincHeroBanner'
import NincCardGrid from '@/components/base/NincCardGrid'
import Tag from '@/components/base/Tag'

const HERO_IMAGE_URL = '/images/ninc/project-hero.jpg'

// ── 데이터 ────────────────────────────────────────────────
const PROJECTS_DATA = [
  {
    id: '1',
    title: '○○ 기업 브랜드 영상 제작',
    type: 'industry' as const,
    partner: '○○ 주식회사',
    year: 2025,
    description: '산학협력을 통한 기업 홍보 영상 제작 프로젝트',
  },
  {
    id: '2',
    title: '해외 미디어아트 교류전',
    type: 'international' as const,
    partner: '일본 ○○대학교',
    year: 2024,
    description: '일본 자매결연 대학과의 공동 미디어아트 전시',
  },
  {
    id: '3',
    title: '지역 문화콘텐츠 제작 지원',
    type: 'industry' as const,
    partner: '○○ 시청',
    year: 2024,
    description: '지역 문화 홍보 콘텐츠 기획 및 제작',
  },
  {
    id: '4',
    title: '베트남 RMIT 글로벌 워크숍',
    type: 'international' as const,
    partner: 'RMIT Vietnam',
    year: 2024,
    description: 'M-NODE: DIMA KR × RMIT VN 글로벌 워크숍 참가',
  },
  {
    id: '5',
    title: '보성 미디어파사드 워크숍',
    type: 'industry' as const,
    partner: '보성군',
    year: 2025,
    description: '지자체 연계 미디어파사드 콘텐츠 제작 실습',
  },
  {
    id: '6',
    title: '○○ 공공기관 홍보영상',
    type: 'industry' as const,
    partner: '○○ 공단',
    year: 2023,
    description: '공공기관 대상 홍보 영상 기획 및 제작',
  },
]

// 프로젝트 타입 → Tag 타입 매핑
const PROJECT_TAG: Record<'industry' | 'international', 'primary' | 'secondary'> = {
  industry: 'primary',      // 산학협력 — green tag
  international: 'secondary', // 해외교류 — yellow tag
}

const PROJECT_LABEL: Record<'industry' | 'international', string> = {
  industry: '산학협력',
  international: '해외교류',
}

const PAGE_SIZE = 9

// ── 태그라인 (A2Z, "현장" / "세계" = 그라디언트 텍스트) ─
const ProjectTagline = (
  <>
    {'학과를 넘어 '}
    <span
      className="font-brand font-bold"
      style={{
        background: 'linear-gradient(to right, #E3E94D, #09F593)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      현장
    </span>
    {'과, '}
    <span
      className="font-brand font-bold"
      style={{
        background: 'linear-gradient(to right, #09F593 74.038%, #E3E94D)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      세계
    </span>
    {'로'}
  </>
)

// ── 페이지 컴포넌트 ────────────────────────────────────────
export default function ProjectPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // 필터링
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return PROJECTS_DATA
    return PROJECTS_DATA.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.partner.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        PROJECT_LABEL[p.type].includes(q)
    )
  }, [searchQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  // 페이지네이션 슬라이스 → NincGridItem 형태로 변환
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE).map((p) => ({
      id: p.id,
      caption: p.title,
      subCaption: `${p.partner} · ${p.year}`,
      badge: (
        <Tag type={PROJECT_TAG[p.type]}>
          {PROJECT_LABEL[p.type]}
        </Tag>
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
        pageName="PROJECT"
        heroImageUrl={HERO_IMAGE_URL}
        tagline={ProjectTagline}
      />

      {/* 2. 섹션 타이틀 + 검색바 + 카드 그리드 + 페이지네이션 */}
      <NincCardGrid
        items={pagedItems}
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="프로젝트명, 파트너, 유형 검색"
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        sectionTitle="PROJECT"
        emptyMessage="검색 결과가 없습니다"
      />
    </SubPageLayout>
  )
}
