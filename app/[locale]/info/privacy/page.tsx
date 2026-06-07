import SubPageLayout from '@/components/layout/SubPageLayout'
import InfoHero from '@/components/base/InfoHero'
import SubNav from '@/components/common/SubNav'
import { INFO_NAV_ITEMS } from '@/constants/nav-items'
import { getTranslations } from 'next-intl/server'

interface Section {
  title: string
  content: string
}

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'info.privacy' })

  const sections = t.raw('sections') as Section[]

  return (
    <SubPageLayout>
      {/* 히어로 */}
      <InfoHero />

      {/* 서브 탭 */}
      <SubNav items={INFO_NAV_ITEMS} />

      {/* 섹션 타이틀 */}
      <div className="bg-white pt-10 sm:pt-14 lg:pt-[60px] pb-4 sm:pb-6 lg:pb-[28px] text-center">
        <p className="font-body font-light text-[20px] sm:text-[22px] lg:text-[24px] text-black">PRIVACY</p>
      </div>

      <div className="bg-white pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px]">
          {/* 상단 안내 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12 pb-8 border-b border-[#ececec]">
            <div>
              <p className="font-body text-[12px] font-semibold tracking-[0.2em] text-nwcn-green mb-2">LEGAL</p>
              <h1 className="font-brand font-bold text-[28px] text-nwcn-text-default">{t('heading')}</h1>
            </div>
            <div className="text-right">
              <p className="font-body text-[12px] text-[#bbb]">{t('lastModifiedLabel')}</p>
              <p className="font-body text-[14px] font-medium text-[#888]">{t('lastModified')}</p>
            </div>
          </div>

          {/* 조항 목록 */}
          <div className="max-w-3xl space-y-6">
            {sections.map((section, idx) => (
              <div
                key={idx}
                className="border border-[#ececec] rounded-2xl overflow-hidden hover:border-nwcn-green/20 transition-all duration-300"
              >
                {/* 조항 헤더 */}
                <div className="flex items-center gap-5 px-8 py-5 border-b border-[#ececec] bg-[#fafafa]">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-nwcn-green/10 flex items-center justify-center">
                    <span className="font-brand font-bold text-[13px] text-nwcn-green">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </span>
                  <h2 className="font-body font-semibold text-[15px] text-nwcn-text-default">
                    {section.title}
                  </h2>
                </div>

                {/* 내용 */}
                <div className="px-8 py-6">
                  <p className="font-body text-[14px] text-[#666] leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 하단 안내 */}
          <div className="max-w-3xl mt-10 p-6 rounded-2xl bg-[#f7f7f7] border border-[#ececec]">
            <p className="font-body text-[13px] text-[#999] leading-relaxed">
              {t('footerNote')}{' '}
              <a href="mailto:nwcn@dba.ac.kr" className="text-nwcn-green underline underline-offset-2">
                nwcn@dba.ac.kr
              </a>
            </p>
          </div>

        </div>
      </div>
    </SubPageLayout>
  )
}
