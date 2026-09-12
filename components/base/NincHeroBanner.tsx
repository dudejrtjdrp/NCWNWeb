'use client'

/**
 * BASE 컴포넌트: NincHeroBanner
 * 공통 PageHero 의 image 테마 래퍼 — NINC(수상/프로젝트/이벤트) 히어로.
 */

import PageHero from '@/components/base/PageHero'

export interface NincHeroBannerProps {
  pageName: string
  heroImageUrl: string
  tagline: React.ReactNode
  className?: string
}

export default function NincHeroBanner({
  pageName,
  heroImageUrl,
  tagline,
  className,
}: NincHeroBannerProps) {
  return (
    <PageHero
      label={pageName}
      title={tagline}
      theme="image"
      size="lg"
      backgroundImage={heroImageUrl}
      className={className}
    />
  )
}
