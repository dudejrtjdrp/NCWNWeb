import Link from 'next/link'
import Image from 'next/image'
import Badge from '@/components/ui/Badge'

// TODO: Supabase에서 실제 데이터 fetch로 교체
const PLACEHOLDER_REPORTS = [
  {
    id: '1',
    title: 'AI가 바꾸는 미디어 콘텐츠 산업의 미래',
    type: 'editorial' as const,
    thumbnail_url: null,
    published_at: '2025-05-10',
  },
  {
    id: '2',
    title: '쇼츠 시대의 스토리텔링 전략',
    type: 'trend' as const,
    thumbnail_url: null,
    published_at: '2025-04-22',
  },
  {
    id: '3',
    title: '메타버스 콘텐츠 창작자가 되는 법',
    type: 'card_news' as const,
    thumbnail_url: null,
    published_at: '2025-04-05',
  },
]

const TYPE_LABELS = {
  editorial: '에디토리얼',
  trend: '트렌드',
  card_news: '카드뉴스',
}

export default function NcrTrendPreview() {
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
          {PLACEHOLDER_REPORTS.map((report) => (
            <div
              key={report.id}
              className="card-base group cursor-pointer"
            >
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
                  {TYPE_LABELS[report.type]}
                </Badge>
                <h3 className="font-body text-base text-white font-medium leading-snug mb-3 group-hover:text-nwcn-green transition-colors">
                  {report.title}
                </h3>
                <p className="font-body text-xs text-white/30">
                  {new Date(report.published_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
