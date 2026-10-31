/**
 * WORK/졸업생 — E4 틀 (주소는 /work/portfolio, 개인 페이지는 /work/portfolio/[slug])
 * 포스터형 히어로(GRADUATES / 졸업생, 오른쪽 판은 포트폴리오에 들어간 프로젝트 썸네일 —
 *   아직 공개된 포트폴리오가 없으면 쇼케이스 작품 썸네일) + 졸업 연도 목차 줄
 * + 분야 거르개 · 연도별 졸업생 카드 + 아래 바로가기.
 * 졸업생 = 학과 명단(students, 공개 함수 get_graduates — 학번 제외) + 공개된 포트폴리오(portfolios).
 * 카드는 모두 졸업생 상세로 이어진다(포트폴리오가 있으면 포트폴리오·올리면 원본 표지, 없으면 사진·이름·연결된 작품).
 */

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import SubPageLayout from '@/components/layout/SubPageLayout'
import PosterHero, { type PosterSlide } from '@/components/sections/about/PosterHero'
import AnchorBar from '@/components/sections/about/AnchorBar'
import MoreLinks from '@/components/sections/editorial/MoreLinks'
import WorkLocalBar from '@/components/sections/work/WorkLocalBar'
import PortfolioBrowser from '@/components/sections/work/portfolio/PortfolioBrowser'
import { portfolioYearAnchor } from '@/components/sections/work/portfolio/portfolio-utils'
import { getGraduates, getPortfolioThumbs } from '@/lib/supabase/queries/portfolios'
import { getShowcaseWorks } from '@/lib/supabase/queries/works'

export const metadata: Metadata = {
  title: 'GRADUATES — 졸업생',
  description: '동아방송예술대학교 뉴미디어콘텐츠과 졸업생과 포트폴리오. 학과가 정리한 소개와 학생이 만든 원본 포트폴리오를 함께 봅니다.',
  keywords: ['뉴미디어콘텐츠과', '졸업생', '포트폴리오', '동아방송예술대학교'],
  alternates: { canonical: '/work/portfolio' },
  openGraph: {
    type: 'website',
    title: 'GRADUATES — 졸업생 | NWCN',
    description: '뉴미디어콘텐츠과 졸업생과 포트폴리오',
  },
}

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [items, thumbs, t, h, nav, dept, aboutNav] = await Promise.all([
    getGraduates(locale),
    getPortfolioThumbs(locale),
    getTranslations({ locale, namespace: 'work.portfolio' }),
    getTranslations({ locale, namespace: 'work.hero' }),
    getTranslations({ locale, namespace: 'work.nav' }),
    getTranslations({ locale, namespace: 'about.department' }),
    getTranslations({ locale, namespace: 'about.nav' }),
  ])

  // 히어로: 포트폴리오에 들어간 프로젝트 썸네일(쇼케이스처럼 판을 채움, 원본 표지는 잘리지 않게 통째로).
  // 공개된 포트폴리오가 아직 없으면 쇼케이스 작품 썸네일로 채운다(빈 판·안내 문구 없이).
  let slides: PosterSlide[] = thumbs.slice(0, 8).map((th) => ({
    src: th.src,
    alt: th.title ? `${th.name} — ${th.title}` : t('posterAlt', { name: th.name }),
    caption: th.title ? `${th.name} · ${th.title}` : t('caption', { year: th.year, name: th.name }),
    fit: th.title ? 'cover' : 'portrait',
  }))
  if (slides.length === 0) {
    const works = await getShowcaseWorks(locale)
    slides = works
      .filter((wk) => wk.thumbnail_url)
      .slice(0, 8)
      .map((wk) => ({
        src: wk.thumbnail_url as string,
        alt: wk.title,
        caption: wk.author ? `${wk.title} · ${wk.author}` : wk.title,
      }))
  }
  const years = [...new Set(items.map((p) => p.year))].sort((a, b) => b - a)
  const anchors = years.map((y) => ({ id: portfolioYearAnchor(y), label: String(y) }))

  return (
    <SubPageLayout tone="paper">
      <WorkLocalBar />
      <PosterHero
        titleEn={t.raw('heroEn') as string[]}
        titleEnEm={5.7}
        titleKo={t('heroKo')}
        lead={t('lead')}
        slides={slides}
        emptyImage={{ src: '/images/home/crest.png', alt: '' }}
        labels={{ region: t('region'), prev: h('prev'), next: h('next'), pause: h('pause'), play: h('play') }}
      />
      {anchors.length > 1 && (
        <AnchorBar items={anchors} label={nav('toc')} cta={{ href: '/info/admission', label: dept('admission') }} />
      )}
      <div className="mx-auto max-w-page">
        <div className="editorial-container">
          <PortfolioBrowser items={items} />
          <MoreLinks
            label={nav('menu')}
            links={[
              { href: '/work/showcase', label: nav('showcase') },
              { href: '/work/exhibition', label: nav('exhibition') },
              { href: '/about/curriculum', label: aboutNav('curriculum') },
              { href: '/info/admission', label: dept('admission') },
            ]}
          />
        </div>
      </div>
    </SubPageLayout>
  )
}
