import SubPageLayout from '@/components/layout/SubPageLayout'
import InfoHero from '@/components/base/InfoHero'
import SubNav from '@/components/common/SubNav'
import Button from '@/components/ui/Button'
import { INFO_NAV_ITEMS } from '@/constants/nav-items'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function AdmissionPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'info.admission' })

  const faqs = t.raw('faqs') as { q: string; a: string }[]
  const steps = t.raw('steps') as { step: string; label: string; desc: string }[]

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
              <h2 className="font-body text-[22px] font-bold text-nwcn-text-default mb-2">
                {locale === 'en' ? 'Official Admissions Website' : '입학처 공식 홈페이지'}
              </h2>
              <p className="font-body text-[14px] text-[#888] leading-relaxed">
                {locale === 'en'
                  ? 'Check the latest admission guidelines and schedules on the official admissions website.'
                  : '최신 모집요강 및 전형 일정은 학교 공식 입학처에서 확인하세요.'}
              </p>
            </div>
            <Button href="https://www.dba.ac.kr" external size="md">
              {t('linkLabel')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </Button>
          </div>

          {/* 입학 절차 */}
          <div>
            <h2 className="font-brand font-bold text-[28px] text-nwcn-text-default mb-8">{t('stepsTitle')}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((s, idx) => (
                <div key={s.step} className="relative border border-[#ececec] rounded-2xl p-6 hover:border-nwcn-green/30 hover:shadow-sm transition-all duration-300">
                  {/* 연결 화살표 (마지막 제외) */}
                  {idx < steps.length - 1 && (
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
            <h2 className="font-brand font-bold text-[28px] text-nwcn-text-default mb-8">{t('faqTitle')}</h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
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
