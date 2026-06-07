import type { Metadata } from 'next'
import SubPageLayout from '@/components/layout/SubPageLayout'
import WorkHero from '@/components/base/WorkHero'
import SubNav from '@/components/common/SubNav'
import { WORK_NAV_ITEMS } from '@/constants/nav-items'
import { getExhibitions } from '@/lib/supabase/queries/exhibitions'

export const metadata: Metadata = {
  title: 'EXHIBITION — 졸업전시',
  description:
    '동아방송예술대학교 뉴미디어콘텐츠과 졸업전시 아카이브. 연도별 전시 주제와 작품을 확인하세요.',
  keywords: ['뉴미디어콘텐츠과', '졸업전시', '전시회', '아카이브', '동아방송예술대학교'],
  alternates: { canonical: '/work/exhibition' },
  openGraph: {
    type: 'website',
    title: 'EXHIBITION — 졸업전시 | NWCN',
    description: '뉴미디어콘텐츠과 졸업전시 연도별 아카이브',
  },
}

// mock 데이터 (서버 데이터 없을 때 fallback)
const FALLBACK_DATA = [
  { id: 'mock-2025', year: 2025, title: 'FLUX — 흐름과 변화', description: '2025 졸업전시', theme: '변화와 흐름의 미학', poster_url: null, created_at: '' },
  { id: 'mock-2024', year: 2024, title: 'SIGNAL — 신호와 연결', description: '2024 졸업전시', theme: '연결과 소통의 시대', poster_url: null, created_at: '' },
  { id: 'mock-2023', year: 2023, title: 'BOUNDARY — 경계를 넘어', description: '2023 졸업전시', theme: '경계 해체와 융합', poster_url: null, created_at: '' },
  { id: 'mock-2022', year: 2022, title: 'NODE — 연결의 시작', description: '2022 졸업전시', theme: '네트워크와 관계망', poster_url: null, created_at: '' },
  { id: 'mock-2021', year: 2021, title: 'PIXEL — 디지털의 근원', description: '2021 졸업전시', theme: '디지털 본질 탐구', poster_url: null, created_at: '' },
]

export default async function ExhibitionPage() {
  const serverData = await getExhibitions()
  const EXHIBITION_DATA = serverData.length > 0 ? serverData : FALLBACK_DATA

  return (
    <SubPageLayout>
      {/* 히어로 */}
      <WorkHero />

      {/* 서브 탭 */}
      <SubNav items={WORK_NAV_ITEMS} />

      {/* 섹션 타이틀 */}
      <div className="bg-white pt-10 sm:pt-14 lg:pt-[60px] pb-4 sm:pb-6 lg:pb-[28px] text-center">
        <p className="font-body font-light text-[20px] sm:text-[22px] lg:text-[24px] text-black">EXHIBITION</p>
      </div>

      {/* 타임라인 */}
      <div className="bg-white pb-16 sm:pb-20 lg:pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px]">
          {/* 최신 전시 — 대형 피처드 카드 */}
          {EXHIBITION_DATA[0] && (
            <div className="mb-10 sm:mb-14 lg:mb-16">
              <div className="relative border border-nwcn-green/20 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#f8fffe] to-[#f0fff8] p-6 sm:p-8 lg:p-10 flex flex-col sm:flex-row gap-6 sm:gap-10 items-start sm:items-center group hover:border-nwcn-green/50 transition-all duration-300">
                {/* 포스터 */}
                <div className="flex-shrink-0 w-24 h-32 sm:w-28 sm:h-40 lg:w-36 lg:h-48 bg-white border border-[#e8e8e8] rounded-xl sm:rounded-2xl flex flex-col items-center justify-center shadow-sm">
                  <span className="font-brand font-black text-[28px] sm:text-[36px] lg:text-[42px] text-nwcn-green/20 leading-none">
                    {EXHIBITION_DATA[0].year}
                  </span>
                </div>
                {/* 콘텐츠 */}
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
                    <div className="w-2 h-2 rounded-full bg-nwcn-green" />
                    <span className="font-body text-[12px] font-semibold tracking-widest text-nwcn-green">
                      LATEST
                    </span>
                  </div>
                  <p className="font-body text-[13px] text-[#aaa] mb-2">{EXHIBITION_DATA[0].description}</p>
                  <h2
                    className="font-brand font-bold text-nwcn-text-default mb-3 group-hover:text-nwcn-green transition-colors"
                    style={{ fontSize: 'clamp(22px, 4vw, 48px)', lineHeight: 1.1 }}
                  >
                    {EXHIBITION_DATA[0].title}
                  </h2>
                  <p className="font-body text-[14px] text-[#888]">{EXHIBITION_DATA[0].theme}</p>
                </div>
                {/* 연도 워터마크 (데스크탑만) */}
                <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none select-none hidden lg:block">
                  <span className="font-brand font-black text-[120px] text-nwcn-green/[0.06] leading-none">
                    {EXHIBITION_DATA[0].year}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 타임라인 */}
          <div className="relative">
            {/* 세로 선 (sm 이상에서만) */}
            <div className="absolute left-[80px] top-0 bottom-0 w-[1px] bg-[#e8e8e8] hidden sm:block" />

            <div className="space-y-4 sm:space-y-6">
              {EXHIBITION_DATA.slice(1).map((item) => (
                <div key={item.id ?? item.year} className="group">
                  {/* 모바일: 스택 레이아웃 */}
                  <div className="sm:hidden border border-[#ececec] rounded-2xl p-5 bg-white group-hover:border-nwcn-green/20 group-hover:shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ddd] group-hover:bg-nwcn-green transition-colors" />
                      <span className="font-brand font-bold text-[14px] text-nwcn-green">
                        {item.year}
                      </span>
                    </div>
                    <p className="font-body text-[12px] text-[#bbb] mb-1.5">{item.description}</p>
                    <h3 className="font-brand font-bold text-[18px] text-nwcn-text-default mb-1.5 group-hover:text-nwcn-green transition-colors leading-tight">
                      {item.title}
                    </h3>
                    <p className="font-body text-[13px] text-[#999]">{item.theme}</p>
                  </div>

                  {/* 태블릿/데스크탑: 타임라인 레이아웃 */}
                  <div className="hidden sm:flex gap-8">
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
                      <div className="border border-[#ececec] rounded-2xl p-5 lg:p-6 flex gap-5 lg:gap-6 items-center group-hover:border-nwcn-green/20 group-hover:shadow-sm transition-all duration-300 bg-white">
                        {/* 포스터 */}
                        <div className="flex-shrink-0 w-14 h-20 lg:w-16 lg:h-24 bg-[#f7f7f7] border border-[#e8e8e8] rounded-xl flex items-center justify-center">
                          <span className="font-brand font-black text-[18px] lg:text-[20px] text-[#ddd] leading-none">
                            {String(item.year).slice(2)}
                          </span>
                        </div>
                        {/* 텍스트 */}
                        <div>
                          <p className="font-body text-[12px] text-[#bbb] mb-1.5">{item.description}</p>
                          <h3 className="font-brand font-bold text-[18px] lg:text-[20px] text-nwcn-text-default mb-1.5 group-hover:text-nwcn-green transition-colors leading-tight">
                            {item.title}
                          </h3>
                          <p className="font-body text-[13px] text-[#999]">{item.theme}</p>
                        </div>
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
