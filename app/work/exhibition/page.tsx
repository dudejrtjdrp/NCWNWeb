import SubPageLayout from '@/components/layout/SubPageLayout'
import WorkHero from '@/components/base/WorkHero'
import SubNav from '@/components/common/SubNav'
import { WORK_NAV_ITEMS } from '@/constants/nav-items'

const EXHIBITION_DATA = [
  { year: 2025, title: 'FLUX — 흐름과 변화', description: '2025 졸업전시', theme: '변화와 흐름의 미학', poster_url: null },
  { year: 2024, title: 'SIGNAL — 신호와 연결', description: '2024 졸업전시', theme: '연결과 소통의 시대', poster_url: null },
  { year: 2023, title: 'BOUNDARY — 경계를 넘어', description: '2023 졸업전시', theme: '경계 해체와 융합', poster_url: null },
  { year: 2022, title: 'NODE — 연결의 시작', description: '2022 졸업전시', theme: '네트워크와 관계망', poster_url: null },
  { year: 2021, title: 'PIXEL — 디지털의 근원', description: '2021 졸업전시', theme: '디지털 본질 탐구', poster_url: null },
]

export default function ExhibitionPage() {
  return (
    <SubPageLayout>
      {/* 히어로 */}
      <WorkHero />

      {/* 서브 탭 */}
      <SubNav items={WORK_NAV_ITEMS} />

      {/* 섹션 타이틀 */}
      <div className="bg-white pt-[60px] pb-[28px] text-center">
        <p className="font-body font-light text-[24px] text-black">EXHIBITION</p>
      </div>

      {/* 타임라인 */}
      <div className="bg-white pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px]">
          {/* 최신 전시 — 대형 피처드 카드 */}
          {EXHIBITION_DATA[0] && (
            <div className="mb-16">
              <div className="relative border border-nwcn-green/20 rounded-3xl overflow-hidden bg-gradient-to-br from-[#f8fffe] to-[#f0fff8] p-10 flex gap-10 items-center group hover:border-nwcn-green/50 transition-all duration-300">
                {/* 포스터 */}
                <div className="flex-shrink-0 w-36 h-48 bg-white border border-[#e8e8e8] rounded-2xl flex flex-col items-center justify-center shadow-sm">
                  <span className="font-brand font-black text-[42px] text-nwcn-green/20 leading-none">
                    {EXHIBITION_DATA[0].year}
                  </span>
                </div>
                {/* 콘텐츠 */}
                <div>
                  <div className="inline-flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-nwcn-green" />
                    <span className="font-body text-[12px] font-semibold tracking-widest text-nwcn-green">
                      LATEST
                    </span>
                  </div>
                  <p className="font-body text-[13px] text-[#aaa] mb-2">{EXHIBITION_DATA[0].description}</p>
                  <h2
                    className="font-brand font-bold text-nwcn-text-default mb-3 group-hover:text-nwcn-green transition-colors"
                    style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 1.1 }}
                  >
                    {EXHIBITION_DATA[0].title}
                  </h2>
                  <p className="font-body text-[14px] text-[#888]">{EXHIBITION_DATA[0].theme}</p>
                </div>
                {/* 연도 워터마크 */}
                <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none select-none">
                  <span className="font-brand font-black text-[120px] text-nwcn-green/[0.06] leading-none">
                    {EXHIBITION_DATA[0].year}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 타임라인 */}
          <div className="relative">
            {/* 세로 선 */}
            <div className="absolute left-[80px] top-0 bottom-0 w-[1px] bg-[#e8e8e8]" />

            <div className="space-y-6">
              {EXHIBITION_DATA.slice(1).map((item) => (
                <div key={item.year} className="flex gap-8 group">
                  {/* 연도 */}
                  <div className="flex-shrink-0 w-[80px] text-right relative pt-6">
                    <span className="font-brand font-bold text-[15px] text-nwcn-text-default">
                      {item.year}
                    </span>
                    {/* 타임라인 점 */}
                    <div className="absolute right-[-6px] top-[28px] w-3 h-3 rounded-full border-2 border-[#ddd] bg-white group-hover:border-nwcn-green group-hover:bg-nwcn-green/10 transition-all duration-300" />
                  </div>

                  {/* 카드 */}
                  <div className="flex-1 pl-8 pt-3">
                    <div className="border border-[#ececec] rounded-2xl p-6 flex gap-6 items-center group-hover:border-nwcn-green/20 group-hover:shadow-sm transition-all duration-300 bg-white">
                      {/* 포스터 */}
                      <div className="flex-shrink-0 w-16 h-24 bg-[#f7f7f7] border border-[#e8e8e8] rounded-xl flex items-center justify-center">
                        <span className="font-brand font-black text-[20px] text-[#ddd] leading-none">
                          {String(item.year).slice(2)}
                        </span>
                      </div>
                      {/* 텍스트 */}
                      <div>
                        <p className="font-body text-[12px] text-[#bbb] mb-1.5">{item.description}</p>
                        <h3 className="font-brand font-bold text-[20px] text-nwcn-text-default mb-1.5 group-hover:text-nwcn-green transition-colors leading-tight">
                          {item.title}
                        </h3>
                        <p className="font-body text-[13px] text-[#999]">{item.theme}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SubPageLayout>
  )
}
