'use client'

/**
 * BASE 컴포넌트: FacultySection
 * Figma node-id: 427:889 (ABOUT/Faculty/Desktop)
 *
 * ─ 섹션 구성 ─────────────────────────────────────────
 * 1. HeroArea     : ABOUT 타이틀(우측) + 대형 NWCN 로고 이미지
 * 2. SubNav       : DEPARTMENT | FACULTY(활성) | CURRICULLIM | LAB
 * 3. FacultyGrid  : 교수진 섹션 화살표 + "교수진" 라벨 + 3열 카드 그리드
 * 4. TASection    : "조교" 라벨 + 1개 카드 (중앙)
 * ──────────────────────────────────────────────────────
 *
 * Props: className?
 * 데이터: FACULTY_LIST — TODO: Supabase fetch로 교체
 */

import Image from 'next/image'
import FacultyCard from '@/components/base/FacultyCard'
import { FACULTY_LIST } from '@/lib/faculty-data'

// ──────────────────────────────────────────────────────
// Figma 에셋 URLs (7일 만료 → TODO: /public/images 교체)
// ──────────────────────────────────────────────────────
const ASSETS = {
  arrowDown: 'https://www.figma.com/api/mcp/asset/13507bd5-afec-447d-94a7-0a19a08d633b',
}

// ──────────────────────────────────────────────────────
// 섹션 라벨 화살표 컴포넌트
// ──────────────────────────────────────────────────────
function SectionArrow() {
  return (
    <div className="flex items-center justify-center w-[64px] h-[61px] mx-auto mb-4">
      <div className="rotate-180 relative w-[64px] h-[61px]" aria-hidden="true">
        <Image
          src={ASSETS.arrowDown}
          alt=""
          fill
          className="object-contain"
          unoptimized
        />
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────────────
export interface FacultySectionProps {
  className?: string
}

// ──────────────────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────────────────
export default function FacultySection({ className }: FacultySectionProps) {
  const professors = FACULTY_LIST.filter((f) => f.role === '교수')
  const assistants = FACULTY_LIST.filter((f) => f.role === '조교')

  return (
    <div className={`bg-white overflow-hidden ${className ?? ''}`} data-node-id="427:889">

      {/* ══════════════════════════════════════════
          1. 교수진 섹션 (Hero/SubNav는 AboutHero로 분리)
      ══════════════════════════════════════════ */}
      <section
        className="flex flex-col items-center"
        style={{ paddingTop: '80px', paddingBottom: '80px' }}
        aria-labelledby="faculty-heading"
      >
        {/* 화살표 + 섹션 타이틀 */}
        <SectionArrow />
        <h2
          id="faculty-heading"
          className="font-body font-bold text-[24px] text-[#444] text-center mb-[60px]"
          data-node-id="427:910"
        >
          교수진
        </h2>

        {/* 교수 카드 그리드 — 3열 (desktop), 2열 (tablet), 1열 (mobile) */}
        <div className="page-container w-full">
          <div className="flex flex-wrap justify-center gap-[41px]">
            {professors.map((faculty) => (
              <FacultyCard
                key={faculty.id}
                id={faculty.id}
                nameEn={faculty.nameEn}
                nameKo={faculty.nameKo}
                role={faculty.role}
                photoUrl={faculty.photoUrl}
                colorVariant={faculty.colorVariant}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. 조교 섹션
      ══════════════════════════════════════════ */}
      <section
        className="flex flex-col items-center"
        style={{ paddingBottom: '120px' }}
        aria-labelledby="assistant-heading"
      >
        {/* 화살표 + 섹션 타이틀 */}
        <SectionArrow />
        <h2
          id="assistant-heading"
          className="font-body font-bold text-[24px] text-[#444] text-center mb-[60px]"
          data-node-id="427:1250"
        >
          조교
        </h2>

        {/* 조교 카드 (중앙 정렬) */}
        <div className="flex justify-center">
          {assistants.map((ta) => (
            <FacultyCard
              key={ta.id}
              id={ta.id}
              nameEn={ta.nameEn}
              nameKo={ta.nameKo}
              role={ta.role}
              photoUrl={ta.photoUrl}
              colorVariant={ta.colorVariant}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
