'use client'

/**
 * BASE 컴포넌트: NincHeroBanner
 * Figma node-id: 280:401 (Awards hero), 280:537 (Project hero)
 */

import { useState } from 'react'
import Image from 'next/image'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'

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
  className = '',
}: NincHeroBannerProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        minHeight: 'clamp(280px, 40vw, 725px)',
        background: imgError
          ? 'linear-gradient(160deg, #1a3d2b 0%, #0d2219 50%, #060f0c 100%)'
          : '#1a1a1a',
      }}
      data-node-id="280:401"
      aria-label={`${pageName} 히어로 배너`}
    >
      {/* ── 배경 이미지 ── */}
      {!imgError && (
        <Image
          src={heroImageUrl}
          alt={pageName}
          fill
          className="object-cover"
          unoptimized
          priority
          onError={() => setImgError(true)}
        />
      )}

      {/* ── 그라디언트 오버레이들 ── */}
      <div
        className="absolute inset-x-0 top-0 h-[30%] pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(40,76,61,0), #303030)' }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[60%] pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(40,76,61,0), #303030)' }}
        aria-hidden="true"
      />

      {/* ── 콘텐츠 ── */}
      <div className="absolute inset-0 flex flex-col justify-between px-4 sm:px-8 lg:px-[87px] pt-[40px] sm:pt-[60px] lg:pt-[75px] pb-5 sm:pb-6 lg:pb-[20px]">
        <AnimateOnScroll variant="fade-up" delay={100} threshold={0}>
          <p
            className="font-body font-light text-[18px] sm:text-[20px] lg:text-[24px] text-white leading-normal"
            data-node-id="280:406"
          >
            {pageName}
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll variant="fade-up" delay={200} threshold={0}>
          <p
            className="font-brand font-normal text-[22px] sm:text-[28px] lg:text-[37px] text-white leading-normal"
            data-node-id="543:397"
          >
            {tagline}
          </p>
        </AnimateOnScroll>
      </div>
    </div>
  )
}
