import SubPageLayout from '@/components/layout/SubPageLayout'
import PageHeader from '@/components/common/PageHeader'

const ARCHIVE_DATA = [
  { year: 2025, title: 'FLUX — 흐름과 변화', description: '2025 졸업전시', poster_url: null },
  { year: 2024, title: 'SIGNAL — 신호와 연결', description: '2024 졸업전시', poster_url: null },
  { year: 2023, title: 'BOUNDARY — 경계를 넘어', description: '2023 졸업전시', poster_url: null },
  { year: 2022, title: 'NODE — 연결의 시작', description: '2022 졸업전시', poster_url: null },
  { year: 2021, title: 'PIXEL — 디지털의 근원', description: '2021 졸업전시', poster_url: null },
]

export default function ArchivePage() {
  return (
    <SubPageLayout>
      <PageHeader
        category="WORK — ARCHIVE"
        title="졸업전시 기록"
        description="연도별 졸업전시의 타이틀과 포스터를 아카이빙합니다."
      />
      <section className="py-12">
        <div className="page-container">
          {/* 타임라인 */}
          <div className="relative">
            {/* 세로 선 */}
            <div className="absolute left-[72px] top-0 bottom-0 w-px bg-white/10" />

            <div className="space-y-8">
              {ARCHIVE_DATA.map((item) => (
                <div key={item.year} className="flex gap-8 group">
                  {/* 연도 */}
                  <div className="flex-shrink-0 w-[72px] text-right relative">
                    <span className="font-brand text-sm text-nwcn-green">{item.year}</span>
                    {/* 점 */}
                    <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 translate-x-[calc(100%+20px)] w-2.5 h-2.5 rounded-full bg-nwcn-dark border-2 border-nwcn-green/40 group-hover:border-nwcn-green transition-colors duration-300" />
                  </div>

                  {/* 카드 */}
                  <div className="flex-1 pl-8">
                    <div className="card-base p-6 flex gap-6 items-center">
                      {/* 포스터 플레이스홀더 */}
                      <div className="flex-shrink-0 w-20 h-28 bg-nwcn-dark-2 border border-white/10 rounded-lg flex items-center justify-center">
                        <span className="font-brand text-xl text-nwcn-green/20">{item.year}</span>
                      </div>
                      <div>
                        <p className="font-body text-xs text-white/30 mb-2">{item.description}</p>
                        <h3 className="font-brand text-xl text-white group-hover:text-nwcn-green transition-colors">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SubPageLayout>
  )
}
