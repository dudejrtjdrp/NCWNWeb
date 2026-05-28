import SubPageLayout from '@/components/layout/SubPageLayout'
import AboutHero from '@/components/base/AboutHero'
import SubNav from '@/components/common/SubNav'
import { ABOUT_NAV_ITEMS } from '@/constants/nav-items'

export const metadata = {
  title: 'LAB | ABOUT | NWCN',
  description: '뉴미디어콘텐츠과의 실습 시설 및 장비를 소개합니다.',
}

export default function LabPage() {
  return (
    <SubPageLayout>
      <AboutHero />
      <SubNav items={ABOUT_NAV_ITEMS} />
      <section className="bg-white min-h-[400px] flex items-center justify-center">
        <p className="font-body text-[20px] text-[#888]">준비 중입니다</p>
      </section>
    </SubPageLayout>
  )
}
