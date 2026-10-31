/**
 * WORK/Exhibition 졸업전시 — E4 틀
 * 포스터형 히어로(EXHIBITION / 졸업전시, 역대 포스터를 어두운 판 위에) + 연도 목차 줄 + 해마다 포스터·소개·전시 사이트.
 * 내용은 모두 exhibitions 테이블(관리자 등록)에서 온다.
 */

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import SubPageLayout from '@/components/layout/SubPageLayout'
import PosterHero, { type PosterSlide } from '@/components/sections/about/PosterHero'
import AnchorBar from '@/components/sections/about/AnchorBar'
import WorkLocalBar from '@/components/sections/work/WorkLocalBar'
import ExhibitionList, { exhibitionAnchor } from '@/components/sections/work/ExhibitionList'
import { getExhibitions } from '@/lib/supabase/queries/exhibitions'

export const metadata: Metadata = {
  title: 'EXHIBITION — 졸업전시',
  description: '동아방송예술대학교 뉴미디어콘텐츠과 졸업전시 아카이브. 연도별 전시 주제와 작품을 확인하세요.',
  keywords: ['뉴미디어콘텐츠과', '졸업전시', '전시회', '아카이브', '동아방송예술대학교'],
  alternates: { canonical: '/work/exhibition' },
  openGraph: {
    type: 'website',
    title: 'EXHIBITION — 졸업전시 | NWCN',
    description: '뉴미디어콘텐츠과 졸업전시 연도별 아카이브',
  },
}

export default async function ExhibitionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [exhibitions, t, h, nav, dept] = await Promise.all([
    getExhibitions(),
    getTranslations({ locale, namespace: 'work.exhibition' }),
    getTranslations({ locale, namespace: 'work.hero' }),
    getTranslations({ locale, namespace: 'work.nav' }),
    getTranslations({ locale, namespace: 'about.department' }),
  ])

  const slides: PosterSlide[] = exhibitions
    .filter((ex) => ex.poster_url)
    .map((ex) => ({
      src: ex.poster_url as string,
      alt: t('posterAlt', { year: ex.year, title: ex.title }),
      caption: t('caption', { year: ex.year, title: ex.title }),
      fit: 'portrait',
    }))
  const anchors = exhibitions.map((ex) => ({ id: exhibitionAnchor(ex.year), label: String(ex.year) }))

  return (
    <SubPageLayout tone="paper">
      <WorkLocalBar />
      <PosterHero
        titleEn={t.raw('heroEn') as string[]}
        titleEnEm={5.2}
        titleKo={t('heroKo')}
        lead={t('lead')}
        slides={slides}
        emptyCaption={t('emptyMedia')}
        emptyImage={{ src: '/images/home/crest.png', alt: '' }}
        labels={{ region: t('region'), prev: h('prev'), next: h('next'), pause: h('pause'), play: h('play') }}
      />
      {anchors.length > 0 && (
        <AnchorBar items={anchors} label={nav('toc')} cta={{ href: '/info/admission', label: dept('admission') }} />
      )}
      <ExhibitionList items={exhibitions} />
    </SubPageLayout>
  )
}
