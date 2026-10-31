/**
 * INFO/Contact 문의 — E4 틀
 * 포스터형 히어로(CONTACT / 문의) — 오른쪽 판에 사진 대신 학교 위치 지도.
 * 제목이 지도 위로 넘어가지 않게 판 시작 위치를 60%로 둔다.
 * → 연락처 표 → 오시는 길 표 → 아래 바로가기.
 */

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import SubPageLayout from '@/components/layout/SubPageLayout'
import PosterHero from '@/components/sections/about/PosterHero'
import MoreLinks from '@/components/sections/editorial/MoreLinks'
import InfoLocalBar from '@/components/sections/info/InfoLocalBar'
import SchoolMap from '@/components/map/SchoolMap'

export const metadata: Metadata = {
  title: 'CONTACT — 문의',
  description: '동아방송예술대학교 뉴미디어콘텐츠과 연락처와 오시는 길.',
  keywords: ['뉴미디어콘텐츠과', '문의', '연락처', '오시는 길', '동아방송예술대학교'],
  alternates: { canonical: '/info/contact' },
  openGraph: {
    type: 'website',
    title: 'CONTACT — 문의 | NWCN',
    description: '뉴미디어콘텐츠과 연락처와 오시는 길',
  },
}

const MAP_URL = 'https://maps.google.com/?q=%EB%8F%99%EC%95%84%EB%B0%A9%EC%86%A1%EC%98%88%EC%88%A0%EB%8C%80%ED%95%99%EA%B5%90'

/** '031-670-6600' 처럼 전화번호면 tel: 링크 */
const telHref = (v: string) => (/^[\d-]{9,}$/.test(v.trim()) ? `tel:${v.replace(/\D/g, '')}` : null)

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [t, p, nav, h] = await Promise.all([
    getTranslations({ locale, namespace: 'info.contact' }),
    getTranslations({ locale, namespace: 'info.contactPage' }),
    getTranslations({ locale, namespace: 'info.nav' }),
    getTranslations({ locale, namespace: 'info.heroLabels' }),
  ])
  const items = t.raw('items') as { label: string; value: string; sub: string }[]
  const directions = t.raw('directions') as { label: string; value: string }[]

  return (
    <SubPageLayout tone="paper">
      <InfoLocalBar />
      <PosterHero
        titleEn={p.raw('heroEn') as string[]}
        titleKo={p('heroKo')}
        lead={p('lead')}
        slides={[]}
        split={60}
        media={
          <div className="h-[320px] w-full bg-nwcn-paper sm:h-[400px] lg:h-full">
            <SchoolMap />
          </div>
        }
        labels={{ region: t('directionsHeading'), prev: h('prev'), next: h('next'), pause: h('pause'), play: h('play') }}
      />

      <div className="mx-auto max-w-page">
        <div className="editorial-container">
          {/* ── 연락처 ── */}
          <section aria-labelledby="contacts-t" className="pt-chapter">
            <h2 id="contacts-t" className="m-0 mb-6 font-extrabold text-headline">{p('contacts')}</h2>
            <dl className="border-b border-nwcn-dark">
              {items.map((item) => {
                const tel = telHref(item.value)
                return (
                  <div key={item.label} className="grid grid-cols-12 items-baseline gap-x-6 gap-y-1 border-t border-nwcn-dark py-5">
                    <dt className="col-span-12 text-body-sm text-nwcn-neutral-600 sm:col-span-3">{item.label}</dt>
                    <dd className="col-span-12 font-bold tabular-nums text-statement sm:col-span-9 lg:col-span-5">
                      {tel ? (
                        <a href={tel} className="decoration-nwcn-green-darker decoration-2 underline-offset-4 hover:underline">
                          {item.value}
                        </a>
                      ) : (
                        item.value
                      )}
                    </dd>
                    <dd className="col-span-12 text-body-sm text-nwcn-neutral-600 sm:col-span-9 sm:col-start-4 lg:col-span-4 lg:col-start-auto lg:text-right">
                      {item.sub}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </section>

          {/* ── 오시는 길 ── */}
          <section aria-labelledby="directions-t" className="pt-chapter">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <h2 id="directions-t" className="m-0 font-extrabold text-headline">{t('directionsHeading')}</h2>
              <p className="flex flex-wrap gap-x-6 gap-y-1 font-semibold text-body-sm">
                <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className="editorial-link">
                  {p('mapLink')} <span aria-hidden="true">↗</span>
                </a>
                <a href="https://www.dba.ac.kr" target="_blank" rel="noopener noreferrer" className="editorial-link">
                  {t('directionsLink')} <span aria-hidden="true">↗</span>
                </a>
              </p>
            </div>
            <dl className="border-b border-nwcn-dark">
              {directions.map((d) => (
                <div key={d.label} className="grid grid-cols-12 items-baseline gap-x-6 gap-y-1 border-t border-nwcn-dark py-5">
                  <dt className="col-span-12 text-body-sm text-nwcn-neutral-600 sm:col-span-3">{d.label}</dt>
                  <dd className="col-span-12 text-list sm:col-span-9">{d.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <MoreLinks
            label={nav('more')}
            links={[
              { href: '/info/admission', label: nav('admission') },
              { href: '/about/department', label: nav('department') },
              { href: '/about/faculty', label: nav('faculty') },
              { href: '/info/privacy', label: nav('privacy') },
            ]}
          />
        </div>
      </div>
    </SubPageLayout>
  )
}
