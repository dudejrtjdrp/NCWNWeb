import SubPageLayout from '@/components/layout/SubPageLayout'
import PageHeader from '@/components/common/PageHeader'
import Button from '@/components/ui/Button'

export default function ContactPage() {
  return (
    <SubPageLayout>
      <PageHeader
        category="INFO — CONTACT"
        title="문의 및 오시는 길"
        description="궁금한 점은 언제든지 연락 주세요."
      />
      <section className="py-12">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 연락처 */}
            <div className="card-base p-8 space-y-6">
              <p className="font-body text-xs font-semibold tracking-widest text-nwcn-green">CONTACT INFO</p>

              <div className="space-y-4">
                {[
                  { label: '전화', value: '031-000-0000', icon: '📞' },
                  { label: '이메일', value: 'nwcn@dba.ac.kr', icon: '✉️' },
                  { label: '주소', value: '경기도 김포시 통진읍 서암리 산30\n동아방송예술대학교 뉴미디어콘텐츠과', icon: '📍' },
                  { label: '운영시간', value: '평일 09:00 — 18:00', icon: '🕐' },
                ].map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className="font-body text-xs text-white/30 mb-0.5">{item.label}</p>
                      <p className="font-body text-sm text-white/70 whitespace-pre-line">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 오시는 길 */}
            <div className="card-base p-8 flex flex-col">
              <p className="font-body text-xs font-semibold tracking-widest text-nwcn-green mb-4">DIRECTIONS</p>
              <div className="flex-1 bg-nwcn-dark-2 rounded-xl flex items-center justify-center mb-6 min-h-[200px] border border-white/5">
                <p className="font-body text-sm text-white/20">지도 영역</p>
              </div>
              <Button href="https://www.dba.ac.kr" external variant="outline" size="sm">
                학교 홈페이지에서 찾아오는 길 보기
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SubPageLayout>
  )
}
