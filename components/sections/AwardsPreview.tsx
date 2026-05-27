import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'
import { getAwards } from '@/lib/supabase/queries/awards'

export default async function AwardsPreview() {
  const awards = await getAwards()
  const preview = awards.slice(0, 3)

  return (
    <section className="py-24 border-t border-white/5">
      <div className="page-container">
        {/* 섹션 헤더 */}
        <AnimateOnScroll variant="fade-up" className="flex items-end justify-between mb-12">
          <div>
            <p className="font-body text-xs font-semibold tracking-widest text-nwcn-green mb-3">
              AWARDS
            </p>
            <h2 className="font-brand text-display-md text-white">
              주요 수상 성과
            </h2>
          </div>
          <Link
            href="/ninc/awards"
            className="font-body text-sm text-white/40 hover:text-nwcn-green transition-colors duration-200 flex items-center gap-2"
          >
            전체 보기
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </AnimateOnScroll>

        {/* 수상 목록 */}
        <div className="space-y-4">
          {preview.map((award, index) => (
            <AnimateOnScroll key={award.id} variant="fade-up" delay={index * 80}>
              <Link href={`/ninc/awards/${award.id}`}>
                <div className="flex items-center gap-6 p-6 bg-nwcn-dark-3 border border-white/5 rounded-2xl hover:border-nwcn-green/20 transition-all duration-300 group">
                  <span className="font-brand text-4xl text-white/10 group-hover:text-nwcn-green/20 transition-colors w-12 text-right flex-shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-base text-white font-medium truncate">
                      {award.competition}
                    </p>
                    <p className="font-body text-sm text-white/40 mt-0.5">
                      {award.winner}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="green">{award.award_name}</Badge>
                    <Badge variant="gray">{String(award.year)}</Badge>
                  </div>
                </div>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
