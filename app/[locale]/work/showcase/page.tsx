import type { Metadata } from 'next'
import SubPageLayout from '@/components/layout/SubPageLayout'
import WorkHero from '@/components/base/WorkHero'
import SubNav from '@/components/common/SubNav'
import { WORK_NAV_ITEMS } from '@/constants/nav-items'
import { getShowcaseWorksPage, getWorkFilterTags } from '@/lib/supabase/queries/works'
import ShowcaseClient from './ShowcaseClient'

const PAGE_SIZE = 15

// 매 요청마다 새 seed → 데이터 순서 랜덤 (정적 캐시 비활성화)
export const dynamic = 'force-dynamic'

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
  // 클라이언트 추가 로드와 동일 순서를 보장하도록 seed 를 서버에서 생성해 전달
  const seed = Math.random().toString(36).slice(2, 12)
  const [firstPage, filterTags] = await Promise.all([
    getShowcaseWorksPage({ locale, seed, offset: 0, limit: PAGE_SIZE }),
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

      {/* 필터 + 검색 + 무한 스크롤 마소너리 (Client Component) */}
      <ShowcaseClient
        initialWorks={firstPage.items}
        initialHasMore={firstPage.hasMore}
        filterTags={filterTags}
        locale={locale}
        seed={seed}
        pageSize={PAGE_SIZE}
      />
    </SubPageLayout>
  )
}
