/**
 * INFO/Privacy 개인정보처리방침 — E4 틀
 * 법적 고지라 사진 히어로 없이: 큰 제목 + 최종 수정일 정보표 → 조항마다 번호 · 제목 · 내용 한 줄 → 문의 안내.
 */

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import SubPageLayout from '@/components/layout/SubPageLayout'
import MoreLinks from '@/components/sections/editorial/MoreLinks'
import { InfoTable } from '@/components/sections/editorial/DetailParts'
import InfoLocalBar from '@/components/sections/info/InfoLocalBar'

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '동아방송예술대학교 뉴미디어콘텐츠과 홈페이지 개인정보처리방침.',
  alternates: { canonical: '/info/privacy' },
}

const PRIVACY_EMAIL = 'nwcn@dba.ac.kr'

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [t, nav] = await Promise.all([
    getTranslations({ locale, namespace: 'info.privacy' }),
    getTranslations({ locale, namespace: 'info.nav' }),
  ])
  const sections = t.raw('sections') as { title: string; content: string }[]

  return (
    <SubPageLayout tone="paper">
      <InfoLocalBar />
      <div className="mx-auto max-w-page border-t border-nwcn-dark">
        <div className="editorial-container">
          <header className="grid grid-cols-12 gap-x-6 gap-y-8 pt-10 lg:pt-14">
            <h1 className="col-span-12 m-0 break-words font-extrabold text-headline lg:col-span-8">{t('heading')}</h1>
            <div className="col-span-12 self-end lg:col-span-4">
              <InfoTable rows={[{ label: t('lastModifiedLabel'), value: t('lastModified') }]} />
            </div>
          </header>

          <ol className="mt-chapter border-b border-nwcn-dark">
            {sections.map((s, i) => (
              <li key={i} className="grid grid-cols-12 gap-x-6 gap-y-3 border-t border-nwcn-dark py-7">
                <span aria-hidden="true" className="col-span-2 font-black tabular-nums text-statement lg:col-span-1">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h2 className="col-span-10 m-0 font-bold text-statement lg:col-span-4">{s.title}</h2>
                <p className="col-span-12 whitespace-pre-line text-list lg:col-span-7">{s.content}</p>
              </li>
            ))}
          </ol>

          <p className="mt-8 max-w-3xl text-list text-nwcn-neutral-600">
            {t('footerNote')}{' '}
            <a href={`mailto:${PRIVACY_EMAIL}`} className="editorial-link font-semibold text-nwcn-dark">
              {PRIVACY_EMAIL}
            </a>
          </p>

          <MoreLinks
            label={nav('more')}
            links={[
              { href: '/info/admission', label: nav('admission') },
              { href: '/info/contact', label: nav('contact') },
              { href: '/about/department', label: nav('department') },
              { href: '/work/showcase', label: nav('showcase') },
            ]}
          />
        </div>
      </div>
    </SubPageLayout>
  )
}
