/**
 * About/Department 학과 소개 페이지
 * route: /about/department
 *
 * 레이아웃: SubPageLayout (NavBar fixed + HomeFooter)
 * 콘텐츠: DepartmentSection (Figma node-id: 291:76)
 *
 * 변경 이력:
 * - 기존 PageHeader + 카드 그리드 방식 → Figma 디자인 기반 DepartmentSection으로 교체
 * - ABOUT 히어로, 서브탭, 학과소개, 교육목표(01~05), 세부교육목표, 교육방침,
 *   졸업 후 진로(글래스모피즘 태그), 자격증(가로 슬라이드) 전면 구현
 */

import SubPageLayout from '@/components/layout/SubPageLayout'
import AboutHero from '@/components/base/AboutHero'
import DepartmentSection from '@/components/base/DepartmentSection'

export const metadata = {
  title: 'DEPARTMENT | ABOUT | NWCN',
  description: '뉴미디어콘텐츠과의 교육 목표, 교육방침, 졸업 후 진로, 취득 가능 자격증을 소개합니다.',
}

export default function DepartmentPage() {
  return (
    <SubPageLayout>
      <AboutHero />
      <DepartmentSection />
    </SubPageLayout>
  )
}
