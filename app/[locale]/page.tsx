/**
 * 홈페이지 (/) — 홈 3차(3-2B)
 * 첫 화면: 유체 잉크 그래픽이 꽉 찬 히어로(메뉴 바 없음)
 * 스크롤: 그래픽이 둥근 직사각형으로 줄며 왼쪽 패널로 이동 → 오른쪽 열에 학과 정보
 * (이전 홈 구성: HomeHeroSection + WhatIsSection + NincSection + NcrTrendSection — 컴포넌트는 그대로 남겨 둠)
 */

import { getTranslations } from 'next-intl/server'
import Footer from '@/components/layout/Footer'
import FluidHome from '@/components/sections/home/fluid/FluidHome'
import HomeColumn from '@/components/sections/home/fluid/HomeColumn'
import { getShowcaseWorks } from '@/lib/supabase/queries/works'
import { getHomeNincActivities, getHomeNcrReports } from '@/lib/supabase/queries/home'
import JsonLd from '@/components/seo/JsonLd'
import { educationalOrganizationLd, webSiteLd } from '@/lib/seo/structured-data'
import { localizedAlternates } from '@/lib/seo/metadata'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ locale: string }>
}

/** 홈 — canonical + hreflang(ko/en/x-default) 지정 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  return { alternates: localizedAlternates(locale, '') }
}

const SECTION_KEYS = ['about', 'work', 'ninc', 'ncr', 'admission'] as const

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home.fluid' })

  const [works, ninc, ncr] = await Promise.all([
    getShowcaseWorks(locale),
    getHomeNincActivities(locale),
    getHomeNcrReports(locale),
  ])

  /* 학생 작품 섹션 패널(ASCII 렌즈)용 이미지 — 픽셀을 읽어야 해서 같은 출처의 이미지 최적화 주소로 넘긴다 */
  const asciiSources = [
    ...works.map((w) => w.thumbnail_url),
    ...ninc.map((n) => n.image_url),
  ]
    .filter((u): u is string => !!u)
    .slice(0, 6)
    .map((u) => `/_next/image?url=${encodeURIComponent(u)}&w=640&q=60`)

  return (
    <>
      {/* SEO/GEO: 기관·사이트 구조화 데이터 */}
      <JsonLd data={[educationalOrganizationLd(locale), webSiteLd(locale)]} />

      <FluidHome
        brand={t('brand')}
        headline={[t('headline1'), t('headline2')]}
        scroll={t('scroll')}
        inkLabel={t('inkLabel')}
        inkNames={[t('ink0'), t('ink1'), t('ink2'), t('ink3')]}
        graphicLabel={t('graphic')}
        sections={SECTION_KEYS.map((k) => ({ label: t(`sections.${k}.label`), caption: t(`sections.${k}.caption`) }))}
        asciiSources={asciiSources}
        footer={<Footer />}
      >
        <HomeColumn locale={locale} works={works} ninc={ninc} ncr={ncr.items} />
      </FluidHome>
    </>
  )
}
