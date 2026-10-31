/**
 * INFO/Admission 입학 안내 — E4 틀
 * 포스터형 히어로(ADMISSION / 입학 안내, 학과 활동 사진) + 목차 줄(입학처 · 입학 절차 · 자주 묻는 질문)
 * → 입학처 바로가기 → 절차 4단계 → 질문과 답 표 → 아래 바로가기.
 */

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import SubPageLayout from '@/components/layout/SubPageLayout'
import PosterHero, { type PosterSlide } from '@/components/sections/about/PosterHero'
import AnchorBar from '@/components/sections/about/AnchorBar'
import MoreLinks from '@/components/sections/editorial/MoreLinks'
import InfoLocalBar from '@/components/sections/info/InfoLocalBar'

export const metadata: Metadata = {
  title: 'ADMISSION — 입학 안내',
  description: '동아방송예술대학교 뉴미디어콘텐츠과 입학 절차와 자주 묻는 질문, 입학처 바로가기.',
  keywords: ['뉴미디어콘텐츠과', '입학', '입시', '모집요강', '동아방송예술대학교'],
  alternates: { canonical: '/info/admission' },
  openGraph: {
    type: 'website',
    title: 'ADMISSION — 입학 안내 | NWCN',
    description: '뉴미디어콘텐츠과 입학 절차와 자주 묻는 질문',
  },
}

const ADMISSION_URL = 'https://www.dba.ac.kr'

/** 히어로 사진 — 문구(alt·캡션)는 messages 의 info.admissionPage.slides (순서 맞출 것) */
const HERO_PHOTOS: Pick<PosterSlide, 'src' | 'position'>[] = [
  { src: '/images/department/photos/boseong-facade-workshop.webp', position: '50% 60%' },
  { src: '/images/department/photos/rmit-global-workshop.webp', position: '50% 55%' },
  { src: 'https://assets.dima-nwcn.com/ncr-thumbnails/season-3/ae64ad1a-d9bc-4c9c-b13a-b3f92fa1f05f.jpg', position: '50% 60%' },
]

export default async function AdmissionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [t, p, nav, h] = await Promise.all([
    getTranslations({ locale, namespace: 'info.admission' }),
    getTranslations({ locale, namespace: 'info.admissionPage' }),
    getTranslations({ locale, namespace: 'info.nav' }),
    getTranslations({ locale, namespace: 'info.heroLabels' }),
  ])
  const faqs = t.raw('faqs') as { q: string; a: string }[]
  const steps = t.raw('steps') as { step: string; label: string; desc: string }[]
  const copy = p.raw('slides') as { alt: string; caption: string }[]
  const slides: PosterSlide[] = HERO_PHOTOS.map((photo, i) => ({ ...photo, ...copy[i] }))
  const anchors = [
    { id: 'official', label: p('official') },
    { id: 'steps', label: t('stepsTitle') },
    { id: 'faq', label: t('faqTitle') },
  ]

  return (
    <SubPageLayout tone="paper">
      <InfoLocalBar />
      <PosterHero
        titleEn={p.raw('heroEn') as string[]}
        titleKo={p('heroKo')}
        lead={p('lead')}
        slides={slides}
        labels={{ region: p('region'), prev: h('prev'), next: h('next'), pause: h('pause'), play: h('play') }}
      />
      <AnchorBar items={anchors} label={nav('toc')} cta={{ href: '/info/contact', label: p('contactCta') }} />

      <div className="mx-auto max-w-page">
        <div className="editorial-container">
          {/* ── 입학처 ── */}
          <section id="official" aria-labelledby="official-t" className="scroll-mt-36 pt-chapter">
            <h2 id="official-t" className="m-0 mb-6 font-extrabold text-headline">{p('official')}</h2>
            <div className="grid grid-cols-12 items-end gap-x-6 gap-y-6 border-y border-nwcn-dark py-8">
              <p className="col-span-12 m-0 whitespace-pre-line font-bold text-statement lg:col-span-8">{p('officialText')}</p>
              <div className="col-span-12 lg:col-span-4 lg:text-right">
                <a
                  href={ADMISSION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-nwcn-dark px-5 py-3.5 font-semibold text-body-sm text-white transition-colors duration-fast ease-nwcn hover:bg-nwcn-green-darker focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark focus-visible:ring-offset-2"
                >
                  {t('linkLabel')}
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </section>

          {/* ── 입학 절차 ── */}
          <section id="steps" aria-labelledby="steps-t" className="scroll-mt-36 pt-chapter">
            <h2 id="steps-t" className="m-0 mb-6 font-extrabold text-headline">{t('stepsTitle')}</h2>
            <ol className="grid grid-cols-1 border-t border-nwcn-dark sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s) => (
                <li key={s.step} className="flex flex-col border-b border-nwcn-dark py-6 sm:pr-6 lg:border-b-0 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0">
                  <span className="font-black tabular-nums leading-none text-headline">{s.step}</span>
                  <span className="mt-6 font-bold text-statement">{s.label}</span>
                  <span className="mt-2 text-list text-nwcn-neutral-600">{s.desc}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* ── 자주 묻는 질문 ── */}
          <section id="faq" aria-labelledby="faq-t" className="scroll-mt-36 pt-chapter">
            <h2 id="faq-t" className="m-0 mb-6 font-extrabold text-headline">{t('faqTitle')}</h2>
            <dl className="border-b border-nwcn-dark">
              {faqs.map((f, i) => (
                <div key={i} className="grid grid-cols-12 gap-x-6 gap-y-2 border-t border-nwcn-dark py-6">
                  <dt className="col-span-12 flex gap-4 font-bold text-list lg:col-span-5">
                    <span aria-hidden="true" className="tabular-nums text-nwcn-neutral-600">Q{i + 1}</span>
                    {f.q}
                  </dt>
                  <dd className="col-span-12 text-list lg:col-span-7">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <MoreLinks
            label={nav('more')}
            links={[
              { href: '/about/department', label: nav('department') },
              { href: '/about/curriculum', label: nav('curriculum') },
              { href: '/work/showcase', label: nav('showcase') },
              { href: '/info/contact', label: nav('contact') },
            ]}
          />
        </div>
      </div>
    </SubPageLayout>
  )
}
