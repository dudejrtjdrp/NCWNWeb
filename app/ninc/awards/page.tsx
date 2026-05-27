/**
 * TARGET 페이지: NINC/Awards
 * Server Component — Supabase에서 수상 데이터를 가져와 AwardsClient에 전달
 */

import SubPageLayout from '@/components/layout/SubPageLayout'
import NincHeroBanner from '@/components/base/NincHeroBanner'
import { getAwards } from '@/lib/supabase/queries/awards'
import AwardsClient from './AwardsClient'

const HERO_IMAGE_URL = '/images/ninc/awards-hero.png'

const AwardsTagline = (
  <>
    {'당신의 노력이 '}
    <span className="font-brand font-bold text-nwcn-green">빛나는</span>
    {' 순간'}
  </>
)

export default async function AwardsPage() {
  const awards = await getAwards()

  return (
    <SubPageLayout>
      {/* 1. 히어로 배너 */}
      <NincHeroBanner
        pageName="AWARDS"
        heroImageUrl={HERO_IMAGE_URL}
        tagline={AwardsTagline}
      />

      {/* 2. 검색 + 그리드 + 페이지네이션 (Client Component) */}
      <AwardsClient initialAwards={awards} />
    </SubPageLayout>
  )
}
