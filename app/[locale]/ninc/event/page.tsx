import type { Metadata } from 'next'
import SubPageLayout from '@/components/layout/SubPageLayout'
import NincHeroBanner from '@/components/base/NincHeroBanner'
import SubNav from '@/components/common/SubNav'
import { NINC_NAV_ITEMS } from '@/constants/nav-items'
import { getEvents } from '@/lib/supabase/queries/events'
import EventClient from './EventClient'

export const metadata: Metadata = {
  title: 'EVENT — Now In NewCon',
  description:
    '동아방송예술대학교 뉴미디어콘텐츠과의 최신 이벤트, 행사, 전시 소식을 확인하세요.',
  keywords: ['뉴미디어콘텐츠과', '이벤트', '행사', '전시', 'Now In NewCon', 'NINC'],
  alternates: { canonical: '/ninc/event' },
  openGraph: {
    type: 'website',
    title: 'EVENT — Now In NewCon | NWCN',
    description: '뉴미디어콘텐츠과의 최신 이벤트·행사·전시 소식',
  },
}

const EventTagline = (
  <>
    {'학과의 모든 '}
    <span className="font-brand font-bold text-nwcn-green">이벤트</span>
    {'를 만나보세요'}
  </>
)

export default async function EventPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const events = await getEvents(locale)

  return (
    <SubPageLayout headerVariant="transparent" overlapHeader>
      {/* 히어로 배너 (확대 + 투명 네비바)
          — 로컬 event-hero.png 미존재로 404가 나던 것을 실제 학과 행사(2026 MT) 사진(R2)으로 교체 */}
      <NincHeroBanner
        pageName="EVENT"
        heroImageUrl="https://assets.dima-nwcn.com/ncr-thumbnails/season-3/ae64ad1a-d9bc-4c9c-b13a-b3f92fa1f05f.jpg"
        tagline={EventTagline}
      />

      {/* 서브 탭 */}
      <SubNav items={NINC_NAV_ITEMS} />

      {/* 섹션 타이틀 */}
      <div className="bg-white pt-10 sm:pt-14 lg:pt-[60px] pb-4 sm:pb-6 lg:pb-[28px] text-center">
        <p className="font-body font-light text-[20px] sm:text-[22px] lg:text-[24px] text-black">EVENT</p>
      </div>

      {/* 필터 + 이벤트 목록 (Client Component) */}
      <EventClient initialEvents={events} />
    </SubPageLayout>
  )
}
