import SubPageLayout from '@/components/layout/SubPageLayout'
import NcrHero from '@/components/base/NcrHero'
import SubNav from '@/components/common/SubNav'
import { NCR_NAV_ITEMS } from '@/constants/nav-items'
import { getNcrReports } from '@/lib/supabase/queries/ncr'
import ArchiveClient from './ArchiveClient'

export default async function ArchivePage() {
  const reports = await getNcrReports()

  // DB에서 고유 시즌 추출 → Season 3 > 2 > 1 내림차순 정렬
  const seasons = Array.from(
    new Set(reports.map((r) => r.season).filter(Boolean) as string[])
  ).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10)
    const numB = parseInt(b.replace(/\D/g, ''), 10)
    return numB - numA // 내림차순
  })

  return (
    <SubPageLayout>
      {/* NCR 히어로 */}
      <NcrHero />

      {/* 서브 탭 */}
      <SubNav items={NCR_NAV_ITEMS} />

      {/* 섹션 타이틀 */}
      <div className="bg-white pt-[60px] pb-[28px] text-center">
        <p className="font-body font-light text-[24px] text-black">ARCHIVE</p>
      </div>

      {/* 시즌 필터 + 리포트 목록 (Client Component) */}
      <ArchiveClient reports={reports} seasons={seasons} />
    </SubPageLayout>
  )
}
