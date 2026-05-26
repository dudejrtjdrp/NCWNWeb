import SubPageLayout from '@/components/layout/SubPageLayout'
import InfoHero from '@/components/base/InfoHero'
import SubNav from '@/components/common/SubNav'
import Button from '@/components/ui/Button'
import { INFO_NAV_ITEMS } from '@/constants/nav-items'

const CONTACT_ITEMS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 0h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 14.92z" />
      </svg>
    ),
    label: '전화',
    value: '031-000-0000',
    sub: '평일 09:00 — 18:00',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    label: '이메일',
    value: 'nwcn@dba.ac.kr',
    sub: '문의 접수 후 2영업일 이내 회신',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: '주소',
    value: '경기도 김포시 통진읍 서암리 산30',
    sub: '동아방송예술대학교 뉴미디어콘텐츠과',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    label: '운영시간',
    value: '평일 09:00 — 18:00',
    sub: '주말 및 공휴일 제외',
  },
]

export default function ContactPage() {
  return (
    <SubPageLayout>
      {/* 히어로 */}
      <InfoHero />

      {/* 서브 탭 */}
      <SubNav items={INFO_NAV_ITEMS} />

      {/* 섹션 타이틀 */}
      <div className="bg-white pt-[60px] pb-[28px] text-center">
        <p className="font-body font-light text-[24px] text-black">CONTACT</p>
      </div>

      <div className="bg-white pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* 연락처 카드 */}
            <div className="border border-[#ececec] rounded-3xl p-10 space-y-8">
              <div>
                <p className="font-body text-[12px] font-semibold tracking-[0.2em] text-nwcn-green mb-2">
                  CONTACT INFO
                </p>
                <h2 className="font-brand font-bold text-[24px] text-nwcn-text-default">문의 연락처</h2>
              </div>

              <div className="space-y-6">
                {CONTACT_ITEMS.map((item) => (
                  <div key={item.label} className="flex items-start gap-5">
                    {/* 아이콘 */}
                    <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-[#f7f7f7] flex items-center justify-center text-nwcn-green">
                      {item.icon}
                    </div>
                    {/* 텍스트 */}
                    <div>
                      <p className="font-body text-[11px] font-semibold tracking-widest text-[#bbb] mb-1">
                        {item.label}
                      </p>
                      <p className="font-body text-[15px] font-medium text-nwcn-text-default mb-0.5">
                        {item.value}
                      </p>
                      <p className="font-body text-[13px] text-[#aaa]">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 오시는 길 카드 */}
            <div className="border border-[#ececec] rounded-3xl p-10 flex flex-col gap-6">
              <div>
                <p className="font-body text-[12px] font-semibold tracking-[0.2em] text-nwcn-green mb-2">
                  DIRECTIONS
                </p>
                <h2 className="font-brand font-bold text-[24px] text-nwcn-text-default">오시는 길</h2>
              </div>

              {/* 지도 플레이스홀더 */}
              <div className="flex-1 min-h-[260px] rounded-2xl bg-[#f7f7f7] border border-[#e8e8e8] flex flex-col items-center justify-center gap-3">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <p className="font-body text-[13px] text-[#ccc]">지도 영역</p>
              </div>

              {/* 교통 안내 */}
              <div className="space-y-3 pt-2">
                {[
                  { icon: '🚌', label: '버스', value: 'XX번, OO번 정류장 하차 후 도보 5분' },
                  { icon: '🚇', label: '지하철', value: '김포골드라인 OO역 하차 후 버스 환승' },
                  { icon: '🚗', label: '자가용', value: '네비게이션에 "동아방송예술대학교" 검색' },
                ].map((t) => (
                  <div key={t.label} className="flex items-center gap-3">
                    <span className="text-[16px]">{t.icon}</span>
                    <span className="font-body font-semibold text-[12px] text-[#bbb] w-12">{t.label}</span>
                    <span className="font-body text-[13px] text-[#888]">{t.value}</span>
                  </div>
                ))}
              </div>

              <Button href="https://www.dba.ac.kr" external variant="ghost" size="sm">
                학교 홈페이지에서 찾아오는 길 보기
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </Button>
            </div>

          </div>
        </div>
      </div>
    </SubPageLayout>
  )
}
