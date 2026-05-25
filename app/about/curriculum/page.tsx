import SubPageLayout from '@/components/layout/SubPageLayout'
import AboutHero from '@/components/base/AboutHero'
import CurriculumSection from '@/components/base/CurriculumSection'

export const metadata = {
  title: 'CURRICULLUM | ABOUT | NWCN',
  description: '뉴미디어콘텐츠과의 1~3학년 교육과정을 소개합니다.',
}

export default function CurriculumPage() {
  return (
    <SubPageLayout>
      {/* [1] Hero + 서브탭 (AboutHero 공유 컴포넌트) */}
      <AboutHero />

      {/* [2] 커리큘럼 본문 */}
      <CurriculumSection />
    </SubPageLayout>
  )
}
