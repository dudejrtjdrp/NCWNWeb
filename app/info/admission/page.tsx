import SubPageLayout from '@/components/layout/SubPageLayout'
import InfoHero from '@/components/base/InfoHero'
import SubNav from '@/components/common/SubNav'
import Button from '@/components/ui/Button'
import { INFO_NAV_ITEMS } from '@/constants/nav-items'

const FAQS = [
  {
    q: '입학 전형은 어떻게 되나요?',
    a: '수시 및 정시 전형으로 모집합니다. 자세한 내용은 아래 입학처 홈페이지에서 확인하세요.',
  },
  {
    q: '실기 시험이 있나요?',
    a: '전형에 따라 실기 시험이 포함될 수 있습니다. 매년 달라질 수 있으니 공식 입학처에서 확인 바랍니다.',
  },
  {
    q: '편입학도 가능한가요?',
    a: '네, 편입학 모집도 진행합니다. 편입 시기와 요건은 입학처 공지사항을 참고해 주세요.',
  },
  {
    q: '포트폴리오가 필요한가요?',
    a: '일부 전형에서 포트폴리오 제출이 요구될 수 있습니다. 구체적인 요건은 해당 연도 모집요강을 확인해 주세요.',
  },
]

const ADMISSION_STEPS = [
  { step: '01', label: '원서 접수', desc: '입학처 홈페이지에서 온라인 원서 제출' },
  { step: '02', label: '서류 제출', desc: '학교생활기록부 및 자기소개서 등 제출' },
  { step: '03', label: '실기/면접', desc: '전형별 실기 심사 또는 면접 진행' },
  { step: '04', label: '합격 발표', desc: '입학처 홈페이지에서 합격자 확인' },
]

export default function AdmissionPage() {
  return (
    <SubPageLayout>
      {/* 히어로 */}
      <InfoHero />

      {/* 서브 탭 */}
      <SubNav items={INFO_NAV_ITEMS} />

      {/* 섹션 타이틀 */}
      <div className="bg-white pt-[60px] pb-[28px] text-center">
        <p className="font-body font-light text-[24px] text-black">ADMISSION</p>
      </div>

      <div className="bg-white pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px] space-y-16">

          {/* 입학처 링크 카드 */}
          <div className="border border-nwcn-green/20 rounded-3xl p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 bg-gradient-to-br from-[#f8fffe] to-[#f0fff8]">
            <div>
              <p className="font-body text-[12px] font-semibold tracking-[0.2em] text-nwcn-green mb-3">OFFICIAL LINK</p>
              <h2 className="font-body text-[22px] font-bold text-nwcn-text-default mb-2">입학처 공식 홈페이지</h2>
              <p className="font-body text-[14px] text-[#888] leading-relaxed">
                최신 모집요강 및 전형 일정은 학교 공식 입학처에서 확인하세요.
              </p>
            </div>
            <Button href="https://www.dba.ac.kr" external size="md">
              입학처 바로가기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </Button>
          </div>

          {/* 입학 절차 */}
          <div>
            <h2 className="font-brand font-bold text-[28px] text-nwcn-text-default mb-8">입학 절차</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {ADMISSION_STEPS.map((s, idx) => (
                <div key={s.step} className="relative border border-[#ececec] rounded-2xl p-6 hover:border-nwcn-green/30 hover:shadow-sm transition-all duration-300">
                  {/* 연결 화살표 (마지막 제외) */}
                  {idx < ADMISSION_STEPS.length - 1 && (
                    <div className="hidden lg:block absolute right-[-14px] top-1/2 -translate-y-1/2 z-10">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                  <span className="font-brand font-black text-[36px] text-nwcn-green/20 leading-none block mb-3">
                    {s.step}
                  </span>
                  <h3 className="font-body font-bold text-[16px] text-nwcn-text-default mb-2">{s.label}</h3>
                  <p className="font-body text-[13px] text-[#999] leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-brand font-bold text-[28px] text-nwcn-text-default mb-8">자주 묻는 질문</h2>
            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="border border-[#ececec] rounded-2xl p-7 hover:border-nwcn-green/20 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-start gap-4 mb-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-nwcn-green flex items-center justify-center">
                      <span className="font-body font-bold text-[11px] text-nwcn-text-default">Q</span>
                    </span>
                    <p className="font-body text-[16px] font-semibold text-nwcn-text-default leading-snug pt-0.5">
                      {faq.q}
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#f0f0f0] flex items-center justify-center">
                      <span className="font-body font-bold text-[11px] text-[#888]">A</span>
                    </span>
                    <p className="font-body text-[14px] text-[#777] leading-relaxed pt-0.5">
                      {faq.a}
                    </p>
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
