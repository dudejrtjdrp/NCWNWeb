import SubPageLayout from '@/components/layout/SubPageLayout'
import AboutHero from '@/components/base/AboutHero'
import SubNav from '@/components/common/SubNav'
import CurriculumSection from '@/components/base/CurriculumSection'
import { ABOUT_NAV_ITEMS } from '@/constants/nav-items'

export const metadata = {
  title: 'CURRICULLUM | ABOUT | NWCN',
  description: '뉴미디어콘텐츠과의 1~3학년 교육과정을 소개합니다.',
}

export default function CurriculumPage() {
  return (
    <SubPageLayout>
      <AboutHero />
      <SubNav items={ABOUT_NAV_ITEMS} />
      <CurriculumSection />
    </SubPageLayout>
  )
}
