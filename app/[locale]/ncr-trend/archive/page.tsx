/**
 * NCR TREND/Archive 아카이브 — E4 틀
 * 포스터형 히어로(ARCHIVE / 아카이브) + 시즌 목차 줄 + 시즌마다 촘촘한 표 줄(날짜 · 유형 · 제목) + 아래 바로가기.
 */

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import SubPageLayout from '@/components/layout/SubPageLayout'
import PosterHero, { type PosterSlide } from '@/components/sections/about/PosterHero'
import AnchorBar from '@/components/sections/about/AnchorBar'
import MoreLinks from '@/components/sections/editorial/MoreLinks'
import NcrLocalBar from '@/components/sections/ncr/NcrLocalBar'
import { SeasonList } from '@/components/sections/ncr/ReportList'
import { seasonAnchor, seasonNo, typeLabelMap } from '@/components/sections/ncr/report-utils'
import { getNcrReports, getArticleTypes, type NcrReportListItem } from '@/lib/supabase/queries/ncr'

export const metadata: Metadata = {
  title: 'NCR TREND — 아카이브',
  description: '뉴미디어콘텐츠과 기자단 NCR의 지난 리포트를 시즌별로 모아 봅니다.',
  keywords: ['NCR TREND', '뉴미디어콘텐츠과', '기자단', '아카이브'],
  alternates: { canonical: '/ncr-trend/archive' },
  openGraph: {
    type: 'website',
    title: 'NCR TREND — 아카이브 | NWCN',
    description: '뉴미디어콘텐츠과 기자단 NCR 리포트 아카이브',
  },
}

export default async function ArchivePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [reports, articleTypes, t, nav, h, d, dept] = await Promise.all([
    getNcrReports(locale),
    getArticleTypes(),
    getTranslations({ locale, namespace: 'ncr.archivePage' }),
    getTranslations({ locale, namespace: 'ncr.nav' }),
    getTranslations({ locale, namespace: 'ncr.heroLabels' }),
    getTranslations({ locale, namespace: 'ncr.detail' }),
    getTranslations({ locale, namespace: 'about.department' }),
  ])
  const types = typeLabelMap(articleTypes, {
    editorial: d('typeEditorial'),
    trend: d('typeTrend'),
    card_news: d('typeCardNews'),
  })

  // 시즌 묶음: Season 3 > 2 > 1, 시즌 없는 리포트는 맨 아래 '기타'
  const other = t('other')
  const groups = new Map<string, NcrReportListItem[]>()
  for (const r of reports) {
    const key = r.season || other
    groups.set(key, [...(groups.get(key) ?? []), r])
  }
  const seasons = [...groups.keys()].sort((a, b) =>
    a === other ? 1 : b === other ? -1 : seasonNo(b) - seasonNo(a)
  )
  const anchors = seasons.map((s) => ({ id: seasonAnchor(s), label: s }))

  const slides: PosterSlide[] = reports
    .filter((r) => r.thumbnail_url)
    .slice(0, 6)
    .map((r) => ({ src: r.thumbnail_url as string, alt: '', caption: [r.season, r.title].filter(Boolean).join(' · ') }))

  return (
    <SubPageLayout tone="paper">
      <NcrLocalBar />
      <PosterHero
        titleEn={t.raw('heroEn') as string[]}
        titleKo={t('heroKo')}
        lead={t('lead')}
        slides={slides}
        emptyCaption={t('emptyCaption')}
        emptyImage={{ src: '/images/home/crest.png', alt: '' }}
        labels={{ region: t('region'), prev: h('prev'), next: h('next'), pause: h('pause'), play: h('play') }}
      />
      {anchors.length > 1 && (
        <AnchorBar items={anchors} label={nav('toc')} cta={{ href: '/info/admission', label: dept('admission') }} />
      )}
      <div className="mx-auto max-w-page">
        <div className="editorial-container">
          {seasons.length === 0 && (
            <p className="mt-chapter border-y border-nwcn-dark py-6 font-bold text-statement">{t('empty')}</p>
          )}
          {seasons.map((s) => {
            const list = groups.get(s) ?? []
            return (
              <section key={s} id={seasonAnchor(s)} aria-labelledby={`${seasonAnchor(s)}-t`} className="scroll-mt-36 pt-chapter">
                <div className="mb-6 flex items-baseline justify-between gap-6">
                  <h2 id={`${seasonAnchor(s)}-t`} className="m-0 font-extrabold text-headline">{s}</h2>
                  <p className="font-semibold tabular-nums text-body-sm">{t('count', { n: list.length })}</p>
                </div>
                <SeasonList reports={list} types={types} />
              </section>
            )
          })}
          <MoreLinks
            label={nav('more')}
            links={[
              { href: '/ncr-trend/latest', label: nav('latest') },
              { href: '/ninc/event', label: nav('event') },
              { href: '/work/showcase', label: nav('showcase') },
              { href: '/info/admission', label: nav('admission') },
            ]}
          />
        </div>
      </div>
    </SubPageLayout>
  )
}
