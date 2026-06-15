'use client'

/**
 * BASE 컴포넌트: NincHeroBanner
 * Figma node-id: 280:401 (Awards hero), 280:537 (Project hero)
 *
 * 변경 사항:
 *  - 메인 사진 영역 확대(풀블리드, 높이 ↑) + 투명 네비바 아래까지 깔림
 *  - 페이지명 라벨을 반투명 pill 스타일로 변경(새 디자인 반영)
 *  - 콘텐츠를 하단 정렬하여 네비바와 겹치지 않도록 처리
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
        // 메인 사진 확대: 기존(280~725px) → 더 넓고 높게
        height: 'clamp(460px, 60vw, 870px)',
        background: imgError
          ? 'linear-gradient(160deg, #1a3d2b 0%, #0d2219 50%, #060f0c 100%)'
          : '#1a1a1a',
      }}
      data-node-id="280:537"
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
        className="absolute inset-x-0 bottom-0 h-[70%] pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(40,76,61,0), #303030)' }}
        aria-hidden="true"
      />

      {/* ── 콘텐츠 (하단 정렬) ── */}
      <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-8 lg:px-[80px] pb-12 sm:pb-16 lg:pb-[60px]">
        <AnimateOnScroll variant="fade-up" delay={100} threshold={0}>
          <span
            className="inline-flex items-center rounded-full bg-black/30 px-4 py-[6px] font-body font-semibold text-[16px] sm:text-[18px] lg:text-[20px] text-white leading-none backdrop-blur-[2px]"
            data-node-id="280:542"
          >
            {pageName}
          </span>
        </AnimateOnScroll>

        <AnimateOnScroll variant="fade-up" delay={200} threshold={0}>
          <p
            className="mt-5 sm:mt-6 lg:mt-[28px] font-brand font-normal text-[24px] sm:text-[30px] lg:text-[37px] text-white leading-normal"
            data-node-id="543:395"
          >
            {tagline}
          </p>
        </AnimateOnScroll>
      </div>
    </div>
  )
}
