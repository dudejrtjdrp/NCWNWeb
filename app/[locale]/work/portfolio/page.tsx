/**
 * WORK/Portfolio 졸업생 포트폴리오 — E4 틀
 * 포스터형 히어로(PORTFOLIO / 포트폴리오, 졸업생 프로필 사진을 어두운 판 위에) + 졸업 연도 목차 줄
 * + 분야 거르개 · 연도별 카드(프로필 사진 → 올리면 원본 표지) + 아래 바로가기.
 * 내용은 portfolios 표(학과 관리자가 등록, supabase/migrations/create_portfolios.sql).
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
import { getPortfolios } from '@/lib/supabase/queries/portfolios'

export const metadata: Metadata = {
  title: 'PORTFOLIO — 졸업생 포트폴리오',
  description: '동아방송예술대학교 뉴미디어콘텐츠과 졸업생 포트폴리오. 학과가 정리한 소개와 학생이 만든 원본 포트폴리오를 함께 봅니다.',
  keywords: ['뉴미디어콘텐츠과', '졸업생', '포트폴리오', '동아방송예술대학교'],
  alternates: { canonical: '/work/portfolio' },
  openGraph: {
    type: 'website',
    title: 'PORTFOLIO — 졸업생 포트폴리오 | NWCN',
    description: '뉴미디어콘텐츠과 졸업생 포트폴리오',
  },
}

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [items, t, h, nav, dept, aboutNav] = await Promise.all([
    getPortfolios(locale),
    getTranslations({ locale, namespace: 'work.portfolio' }),
    getTranslations({ locale, namespace: 'work.hero' }),
    getTranslations({ locale, namespace: 'work.nav' }),
    getTranslations({ locale, namespace: 'about.department' }),
    getTranslations({ locale, namespace: 'about.nav' }),
  ])

  // 히어로는 졸업생 프로필 사진(모두 세로 4:5라 제목이 사진을 가리지 않음). 원본 표지는 카드에 마우스를 올리면 보인다.
  const slides: PosterSlide[] = items
    .filter((p) => p.profile_url)
    .slice(0, 8)
    .map((p) => ({
      src: p.profile_url as string,
      alt: t('profileAlt', { name: p.name }),
      caption: t('caption', { year: p.year, name: p.name }),
      fit: 'portrait',
    }))
  const years = [...new Set(items.map((p) => p.year))].sort((a, b) => b - a)
  const anchors = years.map((y) => ({ id: portfolioYearAnchor(y), label: String(y) }))

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
