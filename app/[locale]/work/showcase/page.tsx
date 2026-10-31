/**
 * WORK/Showcase 학생 작품 — E4 틀
 * 포스터형 히어로(SHOWCASE / 학생 작품, 최근 작품 썸네일 자동 넘김) + 필터 줄 + 3열 작품 카드(무한 스크롤).
 * 히어로 이미지는 등록된 작품에서 바로 가져오므로 작품이 늘면 같이 바뀐다.
 */

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import SubPageLayout from '@/components/layout/SubPageLayout'
import PosterHero, { type PosterSlide } from '@/components/sections/about/PosterHero'
import WorkLocalBar from '@/components/sections/work/WorkLocalBar'
import ShowcaseBrowser from '@/components/sections/work/ShowcaseBrowser'
import { getShowcaseWorks, getWorkFilterTags } from '@/lib/supabase/queries/works'

const PAGE_SIZE = 15
const HERO_COUNT = 5

export const metadata: Metadata = {
  title: 'SHOWCASE — 학생 작품',
  description: '동아방송예술대학교 뉴미디어콘텐츠과 학생들의 영상·디자인·3D 작품을 감상하세요.',
  keywords: ['뉴미디어콘텐츠과', '학생 작품', '쇼케이스', '영상', '디자인', '3D', '포트폴리오'],
  alternates: { canonical: '/work/showcase' },
  openGraph: {
    type: 'website',
    title: 'SHOWCASE — 학생 작품 | NWCN',
    description: '뉴미디어콘텐츠과 학생들의 영상·디자인·3D 작품 쇼케이스',
  },
}

export default async function ShowcasePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  // 둘 다 unstable_cache(캐시) — 페이지를 동적으로 만들지 않는다
  const [filterTags, works, t, h] = await Promise.all([
    getWorkFilterTags(),
    getShowcaseWorks(locale),
    getTranslations({ locale, namespace: 'work.showcase' }),
    getTranslations({ locale, namespace: 'work.hero' }),
  ])

  // 히어로: 썸네일이 있는 최근 작품 (연도 → 조회수 순으로 이미 정렬됨)
  const slides: PosterSlide[] = works
    .filter((w) => w.thumbnail_url)
    .slice(0, HERO_COUNT)
    .map((w) => ({ src: w.thumbnail_url as string, alt: w.title, caption: `${w.title} · ${w.author} · ${w.year}` }))

  return (
    <SubPageLayout tone="paper">
      <WorkLocalBar />
      <PosterHero
        titleEn={t.raw('heroEn') as string[]}
        titleKo={t('heroKo')}
        lead={t('lead')}
        slides={slides}
        emptyCaption={t('emptyMedia')}
        emptyImage={{ src: '/images/home/crest.png', alt: '' }}
        labels={{ region: h('photos'), prev: h('prev'), next: h('next'), pause: h('pause'), play: h('play') }}
      />
      <ShowcaseBrowser filterTags={filterTags} locale={locale} pageSize={PAGE_SIZE} />
    </SubPageLayout>
  )
}
