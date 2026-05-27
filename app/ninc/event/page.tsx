import SubPageLayout from '@/components/layout/SubPageLayout'
import NincHeroBanner from '@/components/base/NincHeroBanner'
import SubNav from '@/components/common/SubNav'
import { NINC_NAV_ITEMS } from '@/constants/nav-items'
import { getEvents } from '@/lib/supabase/queries/events'
import EventClient from './EventClient'

const EventTagline = (
  <>
    {'학과의 모든 '}
    <span className="font-brand font-bold text-nwcn-green">이벤트</span>
    {'를 만나보세요'}
  </>
)

export default async function EventPage() {
  const events = await getEvents()

  return (
    <SubPageLayout>
      {/* 히어로 배너 */}
      <NincHeroBanner
        pageName="EVENT"
        heroImageUrl="/images/ninc/event-hero.png"
        tagline={EventTagline}
      />

      {/* 서브 탭 */}
      <SubNav items={NINC_NAV_ITEMS} />

      {/* 섹션 타이틀 */}
      <div className="bg-white pt-[60px] pb-[28px] text-center">
        <p className="font-body font-light text-[24px] text-black">EVENT</p>
      </div>

      {/* 필터 + 이벤트 목록 (Client Component) */}
      <EventClient initialEvents={events} />
    </SubPageLayout>
  )
}
