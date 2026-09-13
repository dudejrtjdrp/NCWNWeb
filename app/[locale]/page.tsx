/**
 * 홈페이지 (/)
 * Header (transparent) + HomeHeroSection (scroll animation)
 * + WhatIsSection + NincPreviewSection + NcrTrendPreviewSection + Footer
 */

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HomeHeroSection from '@/components/sections/home/HomeHeroSection'
import WhatIsSection from '@/components/base/WhatIsSection'
import NincSection from '@/components/base/NincSection'
import NcrTrendSection from '@/components/base/NcrTrendSection'
import { getShowcaseWorks } from '@/lib/supabase/queries/works'
import { getHomeNincActivities } from '@/lib/supabase/queries/home'
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

/** 작품 종류 → 카드 태그 라벨 */
const WORK_TYPE_LABEL: Record<string, string> = { video: 'VIDEO', design: 'DESIGN', '3d': '3D' }

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params

  /* 히어로 게시물 4장 — 썸네일이 실제로 있는 항목만 쓴다.
     쇼케이스 작품을 우선 채우고, 모자라면 NINC 활동(프로젝트·수상·전시)으로 보충해
     빈 회색 카드가 노출되지 않게 한다. */
  const [works, activities] = await Promise.all([
    getShowcaseWorks(locale),
    getHomeNincActivities(locale),
  ])

  const workPosts = works
    .filter((w) => w.thumbnail_url)
    .slice(0, 4)
    .map((w) => ({
      id: w.id,
      title: w.title,
      subtitle: w.author,
      tag: WORK_TYPE_LABEL[w.type] ?? w.type,
      image: w.thumbnail_url,
      href: `/work/${w.id}`,
    }))

  const activityPosts = activities.map((a) => ({
    id: a.id,
    title: a.alt_text ?? 'NEWCON',
    tag: 'NINC',
    image: a.image_url,
    href: a.link_href ?? undefined,
  }))

  const heroPosts = [...workPosts, ...activityPosts].slice(0, 4)

  return (
    <>
      {/* SEO/GEO: 기관·사이트 구조화 데이터 */}
      <JsonLd data={[educationalOrganizationLd(locale), webSiteLd(locale)]} />

      {/* Header: 신규 히어로가 흰 배경이므로 light(흰 배경·다크 텍스트) 사용 */}
      <Header variant="light" />

      {/* 히어로 섹션: 320vh 스크롤 캡처 — 인트로 퇴장 + WORK + 슬로건 + 게시물 가로 스냅 스트립 */}
      <HomeHeroSection scrollHeight="320vh" posts={heroPosts.length ? heroPosts : undefined} />

      {/* 검은색 분리 바: HeroSection 바로 아래 붙음 */}
      <div
        aria-hidden="true"
        style={{ height: '70px', background: 'var(--color-background-dark)' }}
      />

      {/* What is NewCon? */}
      <WhatIsSection />

      {/* Now In NewCon — 실제 NINC 활동(프로젝트+수상) 연동 */}
      <NincSection locale={locale} />

      {/* NCR Trend */}
      <NcrTrendSection locale={locale} />

      {/* 푸터 */}
      <Footer />
    </>
  )
}
