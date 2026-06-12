import Link from 'next/link'
import Image from 'next/image'
import Badge from '@/components/ui/Badge'
import { getNcrReports, getArticleTypes } from '@/lib/supabase/queries/ncr'

export default async function NcrTrendPreview() {
  const [reports, articleTypes] = await Promise.all([getNcrReports(), getArticleTypes()])
  const TYPE_LABELS: Record<string, string> = Object.fromEntries(
    articleTypes.map((at) => [at.value, at.label])
  )
  const preview = reports.slice(0, 3)

  return (
    <section className="py-24 border-t border-white/5">
      <div className="page-container">
        {/* 섹션 헤더 */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-body text-xs font-semibold tracking-widest text-nwcn-green mb-3">
              NCR TREND
            </p>
            <h2 className="font-brand text-display-md text-white">
              최신 트렌드 리포트
            </h2>
          </div>
          <Link
            href="/ncr-trend/latest"
            className="font-body text-sm text-white/40 hover:text-nwcn-green transition-colors duration-200 flex items-center gap-2"
          >
            전체 보기
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* 리포트 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {preview.map((report) => (
            <Link key={report.id} href={`/ncr-trend/${report.id}`} className="card-base group cursor-pointer">
              {/* 썸네일 */}
              <div className="aspect-[16/9] bg-nwcn-dark-3 relative overflow-hidden">
                {report.thumbnail_url ? (
                  <Image
                    src={report.thumbnail_url}
                    alt={report.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-brand text-4xl text-nwcn-green/20">NCR</span>
                  </div>
                )}
              </div>

              {/* 콘텐츠 */}
              <div className="p-5">
                <Badge variant="green" className="mb-3">
                  {TYPE_LABELS[report.type] ?? report.type}
                </Badge>
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
  )
}
