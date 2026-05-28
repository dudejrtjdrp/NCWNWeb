/**
 * TARGET 리팩터링: About/Faculty 교수진 페이지
 * Figma node-id: 427:889 (ABOUT/Faculty/Desktop)
 *
 * ─ 변경 사항 ─────────────────────────────────────────
 * Before: 임시 card-base 카드 (다크 테마, Supabase TODO)
 * After : FacultySection BASE 컴포넌트 통합
 *   - 디자인: Figma 교수 카드 (그린/노란 배경, 수직 이름, 호버 애니메이션)
 *   - 라우팅: 카드 클릭 → /about/faculty/[id] 상세 페이지
 *   - 히어로: ABOUT 타이틀 + 대형 NWCN 로고 (Department 동일 패턴)
 *   - SubNav: FACULTY 탭 활성 (AboutSubNav 재사용)
 *   - 교수진 3열 그리드 + 조교 섹션 유지
 *   - 기존 FACULTY_DATA → FacultySection 내 FACULTY_LIST로 통합 이전
 * ──────────────────────────────────────────────────────
 */

import SubPageLayout from '@/components/layout/SubPageLayout'
import AboutHero from '@/components/base/AboutHero'
import SubNav from '@/components/common/SubNav'
import FacultySection from '@/components/base/FacultySection'
import { ABOUT_NAV_ITEMS } from '@/constants/nav-items'

export const metadata = {
  title: 'FACULTY | ABOUT | NWCN',
  description: '뉴미디어콘텐츠과를 이끄는 교수진을 소개합니다.',
}

export default function FacultyPage() {
  return (
    <SubPageLayout>
      <AboutHero />
      <SubNav items={ABOUT_NAV_ITEMS} />
      <FacultySection />
    </SubPageLayout>
  )
}
