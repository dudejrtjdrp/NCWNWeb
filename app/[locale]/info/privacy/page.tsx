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
      <div className="bg-white pt-section-sm pb-6 text-center">
        <p className="section-label">PRIVACY</p>
      </div>

      <div className="bg-white pb-section-lg">
        <div className="page-container">
          {/* 상단 안내 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12 pb-8 border-b border-nwcn-neutral-200">
            <div>
              <p className="font-body text-caption font-semibold tracking-[0.2em] text-nwcn-green mb-2">LEGAL</p>
              <h1 className="font-brand font-bold text-page-1 text-nwcn-text-default">{t('heading')}</h1>
            </div>
            <div className="text-right">
              <p className="font-body text-caption text-nwcn-neutral-400">{t('lastModifiedLabel')}</p>
              <p className="font-body text-body-sm font-medium text-nwcn-neutral-500">{t('lastModified')}</p>
            </div>
          </div>

          {/* 조항 목록 */}
          <div className="max-w-prose space-y-6">
            {sections.map((section, idx) => (
              <div
                key={idx}
                className="border border-nwcn-neutral-200 rounded-panel overflow-hidden hover:border-nwcn-green/20 transition-[color,background-color,border-color,transform,box-shadow,opacity] duration-base ease-nwcn"
              >
                {/* 조항 헤더 */}
                <div className="flex items-center gap-5 px-8 py-5 border-b border-nwcn-neutral-200 bg-nwcn-neutral-50">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-nwcn-green/10 flex items-center justify-center">
                    <span className="font-brand font-bold text-caption text-nwcn-green">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </span>
                  <h2 className="font-body font-semibold text-body text-nwcn-text-default">
                    {section.title}
                  </h2>
                </div>

                {/* 내용 */}
                <div className="px-8 py-6">
                  <p className="font-body text-body-sm text-nwcn-neutral-600 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 하단 안내 */}
          <div className="max-w-prose mt-10 p-6 rounded-panel bg-nwcn-neutral-50 border border-nwcn-neutral-200">
            <p className="font-body text-caption text-nwcn-neutral-500 leading-relaxed">
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
