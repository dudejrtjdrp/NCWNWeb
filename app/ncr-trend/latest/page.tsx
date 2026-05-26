import SubPageLayout from '@/components/layout/SubPageLayout'
import PageHeader from '@/components/common/PageHeader'
import Image from 'next/image'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'

const REPORTS = [
  { id: '1', title: 'AI가 바꾸는 미디어 콘텐츠 산업의 미래', type: 'editorial' as const, thumbnail_url: null, external_url: 'https://blog.naver.com/', published_at: '2025-05-10', season: 'Season 3' },
  { id: '2', title: '쇼츠 시대의 스토리텔링 전략', type: 'trend' as const, thumbnail_url: null, external_url: 'https://blog.naver.com/', published_at: '2025-04-22', season: 'Season 3' },
  { id: '3', title: '메타버스 콘텐츠 창작자가 되는 법', type: 'card_news' as const, thumbnail_url: null, external_url: 'https://blog.naver.com/', published_at: '2025-04-05', season: 'Season 3' },
  { id: '4', title: 'K-콘텐츠, 글로벌 플랫폼을 공략하라', type: 'editorial' as const, thumbnail_url: null, external_url: 'https://blog.naver.com/', published_at: '2025-03-18', season: 'Season 2' },
]

const TYPE_LABELS = { editorial: '에디토리얼', trend: '트렌드', card_news: '카드뉴스' }

export default function LatestReportPage() {
  return (
    <SubPageLayout>
      <PageHeader
        category="NCR TREND — LATEST REPORT"
        title="최신 리포트"
        description="뉴미디어콘텐츠과 기자단 NCR이 직접 작성한 트렌드 리포트입니다."
      />
      <section className="py-12">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REPORTS.map((report) => (
              <Link
                key={report.id}
                href={`/ncr-trend/${report.id}`}
                className="card-base group block"
              >
                {/* 썸네일 */}
                <div className="aspect-[16/9] bg-nwcn-dark-3 relative overflow-hidden">
                  {report.thumbnail_url ? (
                    <Image src={report.thumbnail_url} alt={report.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-brand text-5xl text-nwcn-green/10">NCR</span>
                    </div>
                  )}
                </div>
                {/* 내용 */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="green">{TYPE_LABELS[report.type]}</Badge>
                    <span className="font-body text-xs text-white/20">{report.season}</span>
                  </div>
                  <h3 className="font-body text-base text-white font-medium leading-snug mb-3 group-hover:text-nwcn-green transition-colors">
                    {report.title}
                  </h3>
                  <p className="font-body text-xs text-white/30">
                    {new Date(report.published_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SubPageLayout>
  )
}
