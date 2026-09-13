import type { Metadata } from 'next'
import SubPageLayout from '@/components/layout/SubPageLayout'
import WorkHero from '@/components/base/WorkHero'
import SubNav from '@/components/common/SubNav'
import { WORK_NAV_ITEMS } from '@/constants/nav-items'
import { getExhibitions } from '@/lib/supabase/queries/exhibitions'
import ExhibitionCarousel from './ExhibitionCarousel'

export const metadata: Metadata = {
  title: 'EXHIBITION — 졸업전시',
  description:
    '동아방송예술대학교 뉴미디어콘텐츠과 졸업전시 아카이브. 연도별 전시 주제와 작품을 확인하세요.',
  keywords: ['뉴미디어콘텐츠과', '졸업전시', '전시회', '아카이브', '동아방송예술대학교'],
  alternates: { canonical: '/work/exhibition' },
  openGraph: {
    type: 'website',
    title: 'EXHIBITION — 졸업전시 | NWCN',
    description: '뉴미디어콘텐츠과 졸업전시 연도별 아카이브',
  },
}

export default async function ExhibitionPage() {
  const exhibitions = await getExhibitions()

  return (
    <SubPageLayout>
      {/* 히어로 */}
      <WorkHero />

      {/* 서브 탭 */}
      <SubNav items={WORK_NAV_ITEMS} />

      {/* 졸업전시 커버플로우 캐러셀 (가로 무한 슬라이드) */}
      <div className="bg-white pt-12 sm:pt-16 lg:pt-section-sm pb-20 sm:pb-24 lg:pb-28">
        <div className="page-container">
          {exhibitions.length > 0 ? (
            <ExhibitionCarousel items={exhibitions} />
          ) : (
            <p className="py-24 text-center font-body text-body text-nwcn-gray-muted">
              등록된 졸업전시가 아직 없습니다.
            </p>
          )}
        </div>
      </div>
    </SubPageLayout>
  )
}
