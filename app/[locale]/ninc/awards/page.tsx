/**
 * NINC/Awards 수상 — E4 틀
 * 포스터형 히어로(AWARDS / 수상, 수상 사진) + 연도 목차 줄 + 해마다 수상 목록 + 아래 바로가기.
 * 내용은 awards 테이블(관리자 등록)에서 온다. 사진 있는 수상이 없으면 학과 수상 현장 사진 한 장.
 */

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import SubPageLayout from '@/components/layout/SubPageLayout'
import PosterHero, { type PosterSlide } from '@/components/sections/about/PosterHero'
import AnchorBar from '@/components/sections/about/AnchorBar'
import MoreLinks from '@/components/sections/editorial/MoreLinks'
import NincLocalBar from '@/components/sections/ninc/NincLocalBar'
import AwardsList, { awardYearAnchor } from '@/components/sections/ninc/AwardsList'
import { getAwards } from '@/lib/supabase/queries/awards'

export const metadata: Metadata = {
  title: 'AWARDS — 수상',
  description:
    '동아방송예술대학교 뉴미디어콘텐츠과 학생들의 수상 실적을 확인하세요. 국내외 각종 공모전·경진대회 수상 내역.',
  keywords: ['뉴미디어콘텐츠과', '수상', '공모전', '경진대회', 'Now In NewCon', 'NINC', '동아방송예술대학교'],
  alternates: { canonical: '/ninc/awards' },
  openGraph: {
    type: 'website',
    title: 'AWARDS — 수상 | NWCN',
    description: '뉴미디어콘텐츠과 학생들의 수상 실적을 소개합니다.',
  },
}

export default async function AwardsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [awards, t, nav, h, dept] = await Promise.all([
    getAwards(locale),
    getTranslations({ locale, namespace: 'ninc.awardsPage' }),
    getTranslations({ locale, namespace: 'ninc.nav' }),
    getTranslations({ locale, namespace: 'ninc.heroLabels' }),
    getTranslations({ locale, namespace: 'about.department' }),
  ])

  const photos: PosterSlide[] = awards
    .filter((a) => a.thumbnail_url)
    .slice(0, 6)
    .map((a) => ({ src: a.thumbnail_url as string, alt: '', caption: `${a.year} · ${a.competition} ${a.award_name}` }))
  const slides: PosterSlide[] = photos.length
    ? photos
    : [{ src: '/images/ninc/awards-hero.png', alt: '', caption: t('fallbackCaption'), position: '50% 35%' }]

  const years = [...new Set(awards.map((a) => a.year))].sort((a, b) => b - a)
  const anchors = years.map((y) => ({ id: awardYearAnchor(y), label: String(y) }))

  return (
    <SubPageLayout tone="paper">
      <NincLocalBar />
      <PosterHero
        titleEn={t.raw('heroEn') as string[]}
        titleKo={t('heroKo')}
        lead={t('lead')}
        slides={slides}
        labels={{ region: t('region'), prev: h('prev'), next: h('next'), pause: h('pause'), play: h('play') }}
      />
      {anchors.length > 1 && (
        <AnchorBar items={anchors} label={nav('toc')} cta={{ href: '/info/admission', label: dept('admission') }} />
      )}
      <div className="mx-auto max-w-page">
        <div className="editorial-container">
          <AwardsList awards={awards} />
          <MoreLinks
            label={nav('more')}
            links={[
              { href: '/ninc/project', label: nav('project') },
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
