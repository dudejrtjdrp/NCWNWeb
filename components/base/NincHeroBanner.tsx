/**
 * BASE 컴포넌트: NincHeroBanner
 * Figma node-id: 280:401 (Awards hero), 280:537 (Project hero)
 *
 * 디자인 스펙:
 * - 전체 높이: 725px, 전체 너비
 * - 배경: #f0f0f0 + 히어로 이미지 (object-cover)
 * - 상단 그라디언트: rgba(40,76,61,0) → #303030 (위를 어둡게, 201px)
 * - 하단 그라디언트: rgba(40,76,61,0) → #303030 (아래를 어둡게, 640px)
 * - 페이지명 (좌상단): Pretendard Light 24px, white
 * - 태그라인 (좌하단): A2Z Regular 37px, white (JSX ReactNode)
 *
 * Props:
 * - pageName: "AWARDS" | "PROJECT" 등
 * - heroImageUrl: 배경 사진 URL
 * - tagline: 복합 인라인 스타일 포함 ReactNode
 */

import Image from 'next/image'

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
  return (
    <div
      className={`relative w-full overflow-hidden bg-[#f0f0f0] ${className}`}
      style={{ height: '725px' }}
      data-node-id="280:401"
      aria-label={`${pageName} 히어로 배너`}
    >
      {/* ── 배경 이미지 ── */}
      <Image
        src={heroImageUrl}
        alt={pageName}
        fill
        className="object-cover"
        unoptimized
        priority
      />

      {/* ── 상단 그라디언트 (위쪽 어둡게) ── */}
      <div
        className="absolute inset-x-0 top-0 h-[201px] pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(40,76,61,0), #303030)' }}
        aria-hidden="true"
        data-node-id="280:404"
      />

      {/* ── 하단 그라디언트 (아래쪽 어둡게) ── */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: '85px',
          height: '640px',
          background: 'linear-gradient(to bottom, rgba(40,76,61,0), #303030)',
        }}
        aria-hidden="true"
        data-node-id="280:403"
      />

      {/* ── 콘텐츠 레이어: 페이지명(상단) + 태그라인(하단) ── */}
      <div className="absolute inset-0 flex flex-col justify-between px-[87px] pt-[75px] pb-[20px]">
        {/* 페이지명 — Pretendard Light 24px */}
        <p
          className="font-body font-light text-[24px] text-white leading-normal whitespace-nowrap"
          data-node-id="280:406"
        >
          {pageName}
        </p>

        {/* 태그라인 — A2Z Regular 37px (ReactNode: 그라디언트/컬러 인라인 가능) */}
        <p
          className="font-brand font-normal text-[37px] text-white leading-normal whitespace-nowrap"
          data-node-id="543:397"
        >
          {tagline}
        </p>
      </div>
    </div>
  )
}
