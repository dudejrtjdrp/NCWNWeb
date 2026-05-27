import SubPageLayout from '@/components/layout/SubPageLayout'
import NcrHero from '@/components/base/NcrHero'
import SubNav from '@/components/common/SubNav'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import Image from 'next/image'
import { NCR_NAV_ITEMS } from '@/constants/nav-items'
import { getNcrReports } from '@/lib/supabase/queries/ncr'

const TYPE_LABELS: Record<string, string> = {
  editorial: '에디토리얼',
  trend: '트렌드',
  card_news: '카드뉴스',
}
const TYPE_BADGE: Record<string, 'new' | 'hot' | 'number'> = {
  editorial: 'new',
  trend: 'hot',
  card_news: 'number',
}

export default async function LatestReportPage() {
  const reports = await getNcrReports()

  const featured = reports[0]
  const rest = reports.slice(1)

  return (
    <SubPageLayout>
      {/* NCR 히어로 */}
      <NcrHero />

      {/* 서브 탭 */}
      <SubNav items={NCR_NAV_ITEMS} />

      {/* 섹션 타이틀 */}
      <div className="bg-white pt-[60px] pb-[28px] text-center">
        <p className="font-body font-light text-[24px] text-black">LATEST REPORT</p>
      </div>

      <div className="bg-white pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px]">

          {/* 피처드 리포트 (최신) */}
          {featured ? (
            <Link href={`/ncr-trend/${featured.id}`} className="block mb-12 group">
              <div className="border border-[#e8e8e8] rounded-3xl overflow-hidden flex flex-col lg:flex-row hover:border-nwcn-green/30 hover:shadow-lg transition-all duration-300">
                {/* 썸네일 */}
                <div className="lg:w-[480px] flex-shrink-0 aspect-video lg:aspect-auto bg-[#151515] relative overflow-hidden flex items-center justify-center">
                  {featured.thumbnail_url ? (
                    <Image
                      src={featured.thumbnail_url}
                      alt={featured.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-brand font-black text-[72px] text-nwcn-green/[0.12] leading-none">NCR</span>
                      <div className="w-8 h-[2px] bg-nwcn-green/30" />
                    </div>
                  )}
                  {/* FEATURED 라벨 */}
                  <div className="absolute top-4 left-4 bg-nwcn-green px-3 py-1 rounded-full">
                    <span className="font-body font-bold text-[11px] text-nwcn-text-default tracking-widest">FEATURED</span>
                  </div>
                </div>

                {/* 내용 */}
                <div className="flex-1 p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-5">
                    <Badge variant={TYPE_BADGE[featured.type]}>{TYPE_LABELS[featured.type]}</Badge>
                    {featured.season && (
                      <span className="font-body text-[12px] text-[#aaa]">{featured.season}</span>
                    )}
                    {featured.read_time && (
                      <span className="font-body text-[12px] text-[#ccc]">· {featured.read_time} 읽기</span>
                    )}
                  </div>
                  <h2 className="font-body font-bold text-[24px] text-nwcn-text-default leading-snug mb-4 group-hover:text-nwcn-green transition-colors">
                    {featured.title}
                  </h2>
                  <p className="font-body text-[14px] text-[#777] leading-relaxed mb-6">
                    {featured.excerpt}
                  </p>
                  <p className="font-body text-[12px] text-[#bbb]">
                    {new Date(featured.published_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex items-center justify-center py-24">
              <p className="font-body text-[16px] text-[#aaa]">등록된 리포트가 없습니다</p>
            </div>
          )}

          {/* 나머지 카드 그리드 */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((report) => (
                <Link
                  key={report.id}
                  href={`/ncr-trend/${report.id}`}
                  className="block group border border-[#ececec] rounded-2xl overflow-hidden hover:border-nwcn-green/30 hover:shadow-md transition-all duration-300"
                >
                  {/* 썸네일 */}
                  <div className="aspect-[16/9] bg-[#151515] relative overflow-hidden flex items-center justify-center">
                    {report.thumbnail_url ? (
                      <Image
                        src={report.thumbnail_url}
                        alt={report.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <span className="font-brand font-black text-[40px] text-nwcn-green/[0.1] leading-none">NCR</span>
                    )}
                  </div>

                  {/* 내용 */}
                  <div className="p-6 bg-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={TYPE_BADGE[report.type]}>{TYPE_LABELS[report.type]}</Badge>
                      {report.season && (
                        <span className="font-body text-[11px] text-[#bbb]">{report.season}</span>
                      )}
                    </div>
                    <h3 className="font-body font-semibold text-[16px] text-nwcn-text-default leading-snug mb-3 group-hover:text-nwcn-green transition-colors">
                      {report.title}
                    </h3>
                    <p className="font-body text-[13px] text-[#999] leading-relaxed mb-4 line-clamp-2">
                      {report.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-body text-[12px] text-[#ccc]">
                        {new Date(report.published_at).toLocaleDateString('ko-KR')}
                      </p>
                      {report.read_time && (
                        <span className="font-body text-[12px] text-[#bbb]">{report.read_time} 읽기</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </SubPageLayout>
  )
}
