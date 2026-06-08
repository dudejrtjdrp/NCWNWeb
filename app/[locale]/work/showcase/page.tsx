import type { Metadata } from 'next'
import SubPageLayout from '@/components/layout/SubPageLayout'
import WorkHero from '@/components/base/WorkHero'
import SubNav from '@/components/common/SubNav'
import { WORK_NAV_ITEMS } from '@/constants/nav-items'
import { getShowcaseWorks, getWorkFilterTags } from '@/lib/supabase/queries/works'
import ShowcaseClient from './ShowcaseClient'

export const metadata: Metadata = {
  title: 'SHOWCASE — 학생 작품',
  description:
    '동아방송예술대학교 뉴미디어콘텐츠과 학생들의 영상·디자인·3D 작품을 감상하세요.',
  keywords: ['뉴미디어콘텐츠과', '학생 작품', '쇼케이스', '영상', '디자인', '3D', '포트폴리오'],
  alternates: { canonical: '/work/showcase' },
  openGraph: {
    type: 'website',
    title: 'SHOWCASE — 학생 작품 | NWCN',
    description: '뉴미디어콘텐츠과 학생들의 영상·디자인·3D 작품 쇼케이스',
  },
}

export default async function ShowcasePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [works, filterTags] = await Promise.all([
    getShowcaseWorks(locale),
    getWorkFilterTags(),
  ])

  return (
    <SubPageLayout>
      {/* 히어로 */}
      <WorkHero />

      {/* 서브 탭 */}
      <SubNav items={WORK_NAV_ITEMS} />

      {/* 섹션 타이틀 */}
      <div className="bg-white pt-10 sm:pt-14 lg:pt-[60px] pb-4 sm:pb-6 lg:pb-[28px] text-center">
        <p className="font-body font-light text-[20px] sm:text-[22px] lg:text-[24px] text-black">SHOWCASE</p>
      </div>

      {/* 필터 + 그리드 + 페이지네이션 (Client Component) */}
      <ShowcaseClient initialWorks={works} filterTags={filterTags} />
    </SubPageLayout>
  )
}
