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
import AboutSubNav from '@/components/base/AboutSubNav'
import FacultyCard, { type FacultyCardVariant } from '@/components/base/FacultyCard'

// ──────────────────────────────────────────────────────
// Figma 에셋 URLs (7일 만료 → TODO: /public/images 교체)
// ──────────────────────────────────────────────────────
const ASSETS = {
  // 대형 NWCN 그린 텍스트 이미지 (DepartmentSection과 동일)
  nwcnLarge: 'https://www.figma.com/api/mcp/asset/76b1bc50-3ee2-4364-bb09-b700611af20c',
  // 섹션 진입 화살표 (Vector2 — rotate-180 적용)
  arrowDown: 'https://www.figma.com/api/mcp/asset/13507bd5-afec-447d-94a7-0a19a08d633b',
  // 교수 사진들 (TODO: Supabase storage로 이전)
  photoBAEYUNGYUNG:  'https://www.figma.com/api/mcp/asset/06412c1f-bdb6-46c9-ac74-3f21f843ffed',
  photoLEEGWANGSOO:  'https://www.figma.com/api/mcp/asset/e26a7409-753e-404a-b094-bd9bc18462cd',
  photoLEESEOCKHEE:  'https://www.figma.com/api/mcp/asset/b05bfb92-bbf9-4303-9147-4d884c39d59e',
  photoLEEJUHEON:    'https://www.figma.com/api/mcp/asset/42ab9606-01c9-4f9f-a309-ce7dd18409cc',
  photoAHNJONGGU:    'https://www.figma.com/api/mcp/asset/56a6e1ba-6f84-4656-9e8b-116c7e537542',
  photoYUKSIMWOONG:  'https://www.figma.com/api/mcp/asset/f509354c-b8ca-41b4-bb76-19acce9814b9',
  photoPARKMINYU:    'https://www.figma.com/api/mcp/asset/001a221e-3b73-438b-bc2e-c4fc83088a35',
}

// ──────────────────────────────────────────────────────
// 교수진 데이터 (TODO: Supabase fetch로 교체)
// ──────────────────────────────────────────────────────
interface FacultyData {
  id: string
  nameEn: string
  nameKo: string
  role: '교수' | '조교'
  photoUrl: string
  colorVariant: FacultyCardVariant
  /** 교수님의 한마디 (상세 페이지 표시용) */
  quote: string
  email?: string
  education?: string[]
  career?: string[]
}

export const FACULTY_LIST: FacultyData[] = [
  /* ── 교수진 ── */
  {
    id: 'bae-yung-yung',
    nameEn: 'BAEYUNGYUNG',
    nameKo: '배윤영',
    role: '교수',
    photoUrl: ASSETS.photoBAEYUNGYUNG,
    colorVariant: 'green-solid',
    quote: '창의성과 기술이 만나는 곳, 뉴미디어콘텐츠과에서 여러분의 꿈을 펼치세요.',
  },
  {
    id: 'lee-gwang-soo',
    nameEn: 'LEEGWANG-SOO',
    nameKo: '이광수',
    role: '교수',
    photoUrl: ASSETS.photoLEEGWANGSOO,
    colorVariant: 'green-gradient',
    quote: '미디어의 경계를 넘어 새로운 가능성을 탐구하는 여정을 함께합니다.',
  },
  {
    id: 'lee-seock-hee',
    nameEn: 'LEESEOCKHEE',
    nameKo: '이석희',
    role: '교수',
    photoUrl: ASSETS.photoLEESEOCKHEE,
    colorVariant: 'green-solid',
    quote: '콘텐츠를 통해 세상과 소통하는 창작자로 성장하길 응원합니다.',
  },
  {
    id: 'lee-ju-heon',
    nameEn: 'LEEJUHEON',
    nameKo: '이주헌',
    role: '교수',
    photoUrl: ASSETS.photoLEEJUHEON,
    colorVariant: 'green-gradient',
    quote: '새로운 기술과 예술의 융합으로 미래 미디어를 선도하는 인재를 양성합니다.',
    email: 'jhlee@dba.ac.kr',
    education: ['홍익대학교 영상학과 박사'],
    career: ['현) 동아방송예술대학교 뉴미디어콘텐츠과 교수'],
  },
  {
    id: 'ahn-jong-gu',
    nameEn: 'AHNJONG-GU',
    nameKo: '안종구',
    role: '교수',
    photoUrl: ASSETS.photoAHNJONGGU,
    colorVariant: 'green-solid',
    quote: '실무 중심의 교육으로 현장에서 즉시 활약할 수 있는 전문가를 키웁니다.',
  },
  {
    id: 'yuk-sim-woong',
    nameEn: 'YUKSIM-WOONG',
    nameKo: '육심웅',
    role: '교수',
    photoUrl: ASSETS.photoYUKSIMWOONG,
    colorVariant: 'green-gradient',
    quote: '디지털 시대의 변화를 이끄는 창의적 콘텐츠 크리에이터를 함께 만들어갑니다.',
    email: 'swryuk@dba.ac.kr',
    education: ['중앙대학교 첨단영상대학원 석사'],
    career: ['현) 동아방송예술대학교 뉴미디어콘텐츠과 교수'],
  },
  /* ── 조교 ── */
  {
    id: 'park-min-yu',
    nameEn: 'PARKMIN-YU',
    nameKo: '박민유',
    role: '조교',
    photoUrl: ASSETS.photoPARKMINYU,
    colorVariant: 'yellow',
    quote: '학과 생활의 첫걸음을 함께하며 든든한 지원군이 되겠습니다.',
  },
]

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
          1. HERO — ABOUT + 대형 NWCN 로고
          (DepartmentSection과 동일한 히어로 패턴)
      ══════════════════════════════════════════ */}
      <section className="relative" style={{ minHeight: '450px' }}>
        {/* "ABOUT" 타이틀 — 우측 상단 */}
        <h1
          className="absolute right-[79px] top-[157px] font-body font-extrabold text-[#050505] whitespace-nowrap z-10"
          style={{ fontSize: '56px', lineHeight: 'normal' }}
          data-node-id="427:909"
        >
          ABOUT
        </h1>

        {/* 대형 NWCN 그린 로고 이미지 */}
        <div
          className="relative"
          style={{ width: '1270px', height: '350px', top: '325px' }}
          data-node-id="427:1290"
        >
          <Image
            src={ASSETS.nwcnLarge}
            alt="NWCN 뉴미디어콘텐츠과"
            fill
            className="object-contain object-left"
            priority
            unoptimized
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. 서브 내비게이션
      ══════════════════════════════════════════ */}
      <div className="flex justify-center" style={{ paddingTop: '155px' }}>
        <AboutSubNav />
      </div>

      {/* ══════════════════════════════════════════
          3. 교수진 섹션
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
