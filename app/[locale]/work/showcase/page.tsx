import type { Metadata } from 'next'
import SubPageLayout from '@/components/layout/SubPageLayout'
import WorkHero from '@/components/base/WorkHero'
import SubNav from '@/components/common/SubNav'
import { WORK_NAV_ITEMS } from '@/constants/nav-items'
import { getWorkFilterTags } from '@/lib/supabase/queries/works'
import ShowcaseClient from './ShowcaseClient'

const PAGE_SIZE = 15

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
  // 필터 태그만 서버에서 로드한다 — getWorkFilterTags 는 unstable_cache(캐시)라
  // 페이지를 동적으로 만들지 않는다. 따라서 이 페이지는 static/ISR 로 렌더되어
  // 클라이언트 내비게이션이 즉시 완료된다.
  // 작품 목록과 "방문마다 랜덤" 시드는 ShowcaseClient 가 마운트 직후 로드한다.
  const filterTags = await getWorkFilterTags()

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

      {/* 필터 + 검색 + 무한 스크롤 마소너리 (Client Component) */}
      <ShowcaseClient
        filterTags={filterTags}
        locale={locale}
        pageSize={PAGE_SIZE}
      />
    </SubPageLayout>
  )
}
