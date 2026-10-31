/**
 * NCR TREND/Latest 최신 리포트 — E4 틀
 * 포스터형 히어로(NCR TREND / 최신 리포트, 리포트 사진) → 가장 최근 리포트 한 편을 크게
 * → 지난 리포트 줄 목록 → 아래 바로가기. 내용은 ncr_reports 테이블(관리자 등록)에서 온다.
 */

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import SubPageLayout from '@/components/layout/SubPageLayout'
import PosterHero, { type PosterSlide } from '@/components/sections/about/PosterHero'
import MoreLinks from '@/components/sections/editorial/MoreLinks'
import { Link } from '@/i18n/navigation'
import NcrLocalBar from '@/components/sections/ncr/NcrLocalBar'
import { ReportFeature, ReportRows } from '@/components/sections/ncr/ReportList'
import { typeLabelMap } from '@/components/sections/ncr/report-utils'
import { getNcrReports, getArticleTypes } from '@/lib/supabase/queries/ncr'

export const metadata: Metadata = {
  title: 'NCR TREND — 최신 리포트',
  description: '뉴미디어콘텐츠과 기자단 NCR이 직접 취재한 최신 리포트·카드뉴스를 만나보세요.',
  keywords: ['NCR TREND', '뉴미디어콘텐츠과', '기자단', '에디토리얼', '카드뉴스'],
  alternates: { canonical: '/ncr-trend/latest' },
  openGraph: {
    type: 'website',
    title: 'NCR TREND — 최신 리포트 | NWCN',
    description: '뉴미디어콘텐츠과 기자단 NCR의 최신 리포트',
  },
}

export default async function LatestReportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [reports, articleTypes, t, nav, h, d] = await Promise.all([
    getNcrReports(locale),
    getArticleTypes(),
    getTranslations({ locale, namespace: 'ncr.latestPage' }),
    getTranslations({ locale, namespace: 'ncr.nav' }),
    getTranslations({ locale, namespace: 'ncr.heroLabels' }),
    getTranslations({ locale, namespace: 'ncr.detail' }),
  ])
  const types = typeLabelMap(articleTypes, {
    editorial: d('typeEditorial'),
    trend: d('typeTrend'),
    card_news: d('typeCardNews'),
  })
  const labels = { types, read: t('read'), readTime: (time: string) => t('readTime', { time }) }

  const [featured, ...rest] = reports
  // 히어로는 지난 리포트 사진부터 (바로 아래 큰 칸의 최신 리포트 사진과 겹치지 않게)
  const slides: PosterSlide[] = [...rest.slice(0, 5), ...(featured ? [featured] : [])]
    .filter((r) => r.thumbnail_url)
    .map((r) => ({ src: r.thumbnail_url as string, alt: '', caption: r.title }))

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
      <div className="mx-auto max-w-page">
        <div className="editorial-container">
          {featured ? (
            <section aria-label={t('newest')} className="pt-chapter">
              <ReportFeature report={featured} labels={labels} badge={t('newest')} />
            </section>
          ) : (
            <p className="mt-chapter border-y border-nwcn-dark py-6 font-bold text-statement">{t('empty')}</p>
          )}

          {rest.length > 0 && (
            <section aria-labelledby="others-t" className="pt-chapter">
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <h2 id="others-t" className="m-0 font-extrabold text-headline">{t('others')}</h2>
                <Link href="/ncr-trend/archive" className="editorial-link font-semibold text-body-sm">
                  {t('toArchive')} <span aria-hidden="true">→</span>
                </Link>
              </div>
              <ReportRows reports={rest.slice(0, 6)} labels={labels} />
            </section>
          )}

          <MoreLinks
            label={nav('more')}
            links={[
              { href: '/ncr-trend/archive', label: nav('archive') },
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
