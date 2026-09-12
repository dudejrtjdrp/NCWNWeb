import type { Metadata } from 'next'
import SubPageLayout from '@/components/layout/SubPageLayout'
import NcrHero from '@/components/base/NcrHero'
import SubNav from '@/components/common/SubNav'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import Image from 'next/image'
import { NCR_NAV_ITEMS } from '@/constants/nav-items'
import { getNcrReports, getArticleTypes } from '@/lib/supabase/queries/ncr'

export const metadata: Metadata = {
  title: 'NCR TREND — 최신 아티클',
  description:
    '뉴미디어콘텐츠과 NCR TREND의 최신 에디토리얼, 트렌드 리포트, 카드뉴스를 만나보세요.',
  keywords: ['NCR TREND', '뉴미디어콘텐츠과', '에디토리얼', '트렌드 리포트', '미디어 트렌드'],
  alternates: { canonical: '/ncr-trend/latest' },
  openGraph: {
    type: 'website',
    title: 'NCR TREND — 최신 아티클 | NWCN',
    description: '뉴미디어콘텐츠과 NCR TREND의 최신 에디토리얼·트렌드·카드뉴스',
  },
}

const TYPE_BADGE: Record<string, 'new' | 'hot' | 'number'> = {
  editorial: 'new',
  trend: 'hot',
  card_news: 'number',
}

export default async function LatestReportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [reports, articleTypes] = await Promise.all([getNcrReports(locale), getArticleTypes()])

  // 유형 관리(설정) 기반 라벨 맵 — 등록된 모든 유형 지원
  const TYPE_LABELS: Record<string, string> = Object.fromEntries(
    articleTypes.map((at) => [at.value, at.label])
  )

  const featured = reports[0]
  const rest = reports.slice(1)

  return (
    <SubPageLayout>
      {/* NCR 히어로 */}
      <NcrHero />

      {/* 서브 탭 */}
      <SubNav items={NCR_NAV_ITEMS} />

      {/* 섹션 타이틀 */}
      <div className="bg-white pt-section-sm pb-6 text-center">
        <p className="section-label">LATEST REPORT</p>
      </div>

      <div className="bg-white pb-24">
        <div className="page-container">

          {/* 피처드 리포트 (최신) */}
          {featured ? (
            <Link href={`/ncr-trend/${featured.id}`} className="block mb-12 group">
              <div className="border border-nwcn-neutral-200 rounded-3xl overflow-hidden flex flex-col lg:flex-row hover:border-nwcn-green/30 hover:shadow-lg transition-[color,background-color,border-color,transform,box-shadow,opacity] duration-base ease-nwcn">
                {/* 썸네일 */}
                <div className="lg:w-[480px] flex-shrink-0 aspect-video lg:aspect-auto bg-nwcn-dark relative overflow-hidden flex items-center justify-center">
                  {featured.thumbnail_url ? (
                    <Image
                      src={featured.thumbnail_url}
                      alt={featured.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-slow ease-nwcn"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-brand font-black text-hero-1 text-nwcn-green/[0.12] leading-none">NCR</span>
                      <div className="w-8 h-[2px] bg-nwcn-green/30" />
                    </div>
                  )}
                  {/* FEATURED 라벨 */}
                  <div className="absolute top-4 left-4 bg-nwcn-green px-3 py-1 rounded-full">
                    <span className="font-body font-bold text-caption text-nwcn-text-default tracking-widest">FEATURED</span>
                  </div>
                </div>

                {/* 내용 */}
                <div className="flex-1 p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-5">
                    <Badge variant={TYPE_BADGE[featured.type] ?? 'new'}>{TYPE_LABELS[featured.type] ?? featured.type}</Badge>
                    {featured.season && (
                      <span className="font-body text-caption text-nwcn-neutral-400">{featured.season}</span>
                    )}
                    {featured.read_time && (
                      <span className="font-body text-caption text-nwcn-neutral-300">· {featured.read_time} 읽기</span>
                    )}
                  </div>
                  <h2 className="font-body font-bold text-section text-nwcn-text-default leading-snug mb-4 group-hover:text-nwcn-green transition-colors">
                    {featured.title}
                  </h2>
                  <p className="font-body text-body-sm text-nwcn-neutral-600 leading-relaxed mb-6">
                    {featured.excerpt}
                  </p>
                  <p className="font-body text-caption text-nwcn-neutral-400">
                    {new Date(featured.published_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex items-center justify-center py-24">
              <p className="font-body text-body text-nwcn-neutral-400">등록된 리포트가 없습니다</p>
            </div>
          )}

          {/* 나머지 카드 그리드 */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((report) => (
                <Link
                  key={report.id}
                  href={`/ncr-trend/${report.id}`}
                  className="block group border border-nwcn-neutral-200 rounded-2xl overflow-hidden hover:border-nwcn-green/30 hover:shadow-md transition-[color,background-color,border-color,transform,box-shadow,opacity] duration-base ease-nwcn"
                >
                  {/* 썸네일 */}
                  <div className="aspect-[16/9] bg-nwcn-dark relative overflow-hidden flex items-center justify-center">
                    {report.thumbnail_url ? (
                      <Image
                        src={report.thumbnail_url}
                        alt={report.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-slow ease-nwcn"
                      />
                    ) : (
                      <span className="font-brand font-black text-hero-2 text-nwcn-green/[0.1] leading-none">NCR</span>
                    )}
                  </div>

                  {/* 내용 */}
                  <div className="p-6 bg-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={TYPE_BADGE[report.type] ?? 'new'}>{TYPE_LABELS[report.type] ?? report.type}</Badge>
                      {report.season && (
                        <span className="font-body text-caption text-nwcn-neutral-400">{report.season}</span>
                      )}
                    </div>
                    <h3 className="font-body font-semibold text-body text-nwcn-text-default leading-snug mb-3 group-hover:text-nwcn-green transition-colors">
                      {report.title}
                    </h3>
                    <p className="font-body text-caption text-nwcn-neutral-500 leading-relaxed mb-4 line-clamp-2">
                      {report.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-body text-caption text-nwcn-neutral-300">
                        {new Date(report.published_at).toLocaleDateString('ko-KR')}
                      </p>
                      {report.read_time && (
                        <span className="font-body text-caption text-nwcn-neutral-400">{report.read_time} 읽기</span>
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
