import SubPageLayout from '@/components/layout/SubPageLayout'
import WorkHero from '@/components/base/WorkHero'
import SubNav from '@/components/common/SubNav'
import { WORK_NAV_ITEMS } from '@/constants/nav-items'
import { getShowcaseWorks } from '@/lib/supabase/queries/works'
import ShowcaseClient from './ShowcaseClient'

export default async function ShowcasePage() {
  const works = await getShowcaseWorks()

  return (
    <SubPageLayout>
      {/* 히어로 */}
      <WorkHero />

      {/* 서브 탭 */}
      <SubNav items={WORK_NAV_ITEMS} />

      {/* 섹션 타이틀 */}
      <div className="bg-white pt-[60px] pb-[28px] text-center">
        <p className="font-body font-light text-[24px] text-black">SHOWCASE</p>
      </div>

      {/* 필터 + 그리드 + 페이지네이션 (Client Component) */}
      <ShowcaseClient initialWorks={works} />
    </SubPageLayout>
  )
}
