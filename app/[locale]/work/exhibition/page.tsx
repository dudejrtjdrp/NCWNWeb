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

// mock 데이터 (서버 데이터 없을 때 fallback)
const FALLBACK_DATA = [
  { id: 'mock-2025', year: 2025, title: 'FLUX — 흐름과 변화', description: '2025 졸업전시', theme: '변화와 흐름의 미학', poster_url: null, link: null, created_at: '' },
  { id: 'mock-2024', year: 2024, title: 'SIGNAL — 신호와 연결', description: '2024 졸업전시', theme: '연결과 소통의 시대', poster_url: null, link: null, created_at: '' },
  { id: 'mock-2023', year: 2023, title: 'BOUNDARY — 경계를 넘어', description: '2023 졸업전시', theme: '경계 해체와 융합', poster_url: null, link: null, created_at: '' },
  { id: 'mock-2022', year: 2022, title: 'NODE — 연결의 시작', description: '2022 졸업전시', theme: '네트워크와 관계망', poster_url: null, link: null, created_at: '' },
  { id: 'mock-2021', year: 2021, title: 'PIXEL — 디지털의 근원', description: '2021 졸업전시', theme: '디지털 본질 탐구', poster_url: null, link: null, created_at: '' },
]

export default async function ExhibitionPage() {
  const serverData = await getExhibitions()
  const EXHIBITION_DATA = serverData.length > 0 ? serverData : FALLBACK_DATA

  return (
    <SubPageLayout>
      {/* 히어로 */}
      <WorkHero />

      {/* 서브 탭 */}
      <SubNav items={WORK_NAV_ITEMS} />

      {/* 졸업전시 커버플로우 캐러셀 (가로 무한 슬라이드) */}
      <div className="bg-white pt-12 sm:pt-16 lg:pt-[72px] pb-20 sm:pb-24 lg:pb-28">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px]">
          <ExhibitionCarousel items={EXHIBITION_DATA} />
        </div>
      </div>
    </SubPageLayout>
  )
}
