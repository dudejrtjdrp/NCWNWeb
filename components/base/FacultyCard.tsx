'use client'

import { useState } from 'react'

/**
 * BASE 컴포넌트: FacultyCard
 * Figma node-id: 427:1075 (교수진 카드) / 427:1254 (조교 카드)
 *
 * ─ 디자인 스펙 ──────────────────────────────────────
 * 크기: 290×379px
 * 배경 variants:
 *   - green-solid    : #09F593 단색
 *   - green-gradient : from-[#00FF95] to-[#007E4A] 그라디언트
 *   - yellow         : #E3E94D 단색 (조교)
 * 교수 이름: 좌측 90° 회전, 그라디언트 텍스트
 * 화살표 아이콘: 우측 상단, 수평 미러
 * 호버: scale-up + 어두운 오버레이 + "자세히 보기" 텍스트 노출
 * ──────────────────────────────────────────────────────
 */

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { FacultyCardVariant } from '@/lib/faculty-data'

// re-export for backward compat
export type { FacultyCardVariant }

export interface FacultyCardProps {
  /** 교수 고유 ID (상세 페이지 라우팅에 사용) */
  id: string
  /** 영문 이름 — 카드 좌측 수직 텍스트 (e.g. "LEEGWANG-SOO") */
  nameEn: string
  /** 한글 이름 — 호버 오버레이에 표시 (e.g. "이광수") */
  nameKo: string
  /** 직급 — "교수" | "조교" */
  role: string
  /** 교수 사진 URL */
  photoUrl?: string
  /** 카드 배경 색상 variant */
  colorVariant?: FacultyCardVariant
  className?: string
}

// ──────────────────────────────────────────────────────
// 색상 variant별 스타일 맵
// ──────────────────────────────────────────────────────
const VARIANT_STYLES: Record<FacultyCardVariant, {
  bg: string
  nameGradient: string
}> = {
  'green-solid': {
    bg: 'bg-nwcn-green',
    nameGradient: 'from-black to-[#007042]',
  },
  'green-gradient': {
    bg: 'bg-gradient-to-b from-[#00FF95] to-[#007E4A]',
    nameGradient: 'from-white via-white to-[#00FF95]',
  },
  'yellow': {
    bg: 'bg-nwcn-yellow',
    nameGradient: 'from-black to-[#5A5E00]',
  },
}

// ──────────────────────────────────────────────────────
// 화살표 아이콘 (인라인 SVG — 우측 상단 대각선 화살표)
// Figma Vector5 스타일: 수평 미러(-scale-x-100) 적용됨
// ──────────────────────────────────────────────────────
function CardArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 19 L19 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 3 H19 V14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

// ──────────────────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────────────────
export default function FacultyCard({
  id,
  nameEn,
  nameKo,
  role,
  photoUrl,
  colorVariant = 'green-solid',
  className,
}: FacultyCardProps) {
  const { bg, nameGradient } = VARIANT_STYLES[colorVariant]
  const [imgError, setImgError] = useState(false)

  return (
    <Link
      href={`/about/faculty/${id}`}
      className={cn(
        'group relative block w-[200px] h-[261px] sm:w-[245px] sm:h-[320px] lg:w-[290px] lg:h-[379px] rounded-[5.21px] overflow-hidden',
        'shadow-[0px_4px_5.5px_rgba(0,0,0,0.25)]',
        'transition-transform duration-300 ease-out hover:scale-[1.04] hover:shadow-[0px_8px_20px_rgba(0,0,0,0.30)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-green focus-visible:ring-offset-2',
        className,
      )}
      aria-label={`${nameKo} ${role} — 상세 보기`}
      data-node-id="427:1075"
    >
      {/* ── 배경 레이어 ─────────────────────────────── */}
      <div className={cn('absolute inset-0 rounded-[5.21px]', bg)} aria-hidden="true" />

      {/* ── 교수 사진 ─────────────────────────────── */}
      <div className="absolute inset-0 top-[9px]" aria-hidden="true">
        {photoUrl && !imgError ? (
          <Image
            src={photoUrl}
            alt={`${nameKo} ${role} 프로필 사진`}
            fill
            className="object-cover object-top rounded-[5px]"
            unoptimized
            onError={() => setImgError(true)}
          />
        ) : (
          /* 사진 없거나 로드 실패 시 이니셜 플레이스홀더 */
          <div className="absolute inset-0 flex items-end justify-center pb-8">
            <span
              className="font-body font-extrabold text-[72px] leading-none"
              style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.05))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              aria-hidden="true"
            >
              {nameKo[0]}
            </span>
          </div>
        )}
      </div>

      {/* ── 좌측 수직 이름 텍스트 ─────────────────── */}
      {/* Figma: absolute left=0, w=78px, 내부 rotate-90 */}
      <div
        className="absolute left-0 top-0 w-[78px] h-full flex items-center justify-center z-10"
        aria-hidden="true"
      >
        <div className="flex-none rotate-90">
          <span
            className={cn(
              'block font-body font-extrabold text-[36.5px] leading-[60px]',
              'bg-gradient-to-r bg-clip-text text-transparent whitespace-nowrap select-none',
              nameGradient,
            )}
          >
            {nameEn}
          </span>
        </div>
      </div>

      {/* ── 우측 상단 화살표 아이콘 ─────────────────── */}
      {/* Figma: inset-[2.64%_5.52%_82.87%_74.48%], -scale-x-100 */}
      <div
        className="absolute z-10 flex items-center justify-center"
        style={{
          top: '2.64%',
          right: '5.52%',
          bottom: '82.87%',
          left: '74.48%',
        }}
        aria-hidden="true"
      >
        <CardArrowIcon
          className={cn(
            '-scale-x-100 w-full h-full',
            colorVariant === 'green-gradient' ? 'text-white/80' : 'text-black/50',
            'transition-colors duration-300 group-hover:text-black/80',
          )}
        />
      </div>

      {/* ── 호버 오버레이 ─────────────────────────── */}
      <div
        className={cn(
          'absolute inset-0 z-20',
          'bg-gradient-to-t from-black/70 via-black/20 to-transparent',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-300 ease-out',
          'flex flex-col items-center justify-end pb-7 gap-1',
        )}
        aria-hidden="true"
      >
        <span className="font-body font-bold text-[22px] text-white leading-tight drop-shadow">
          {nameKo}
        </span>
        <span className="font-body text-[13px] text-white/70 tracking-wider">
          {role}
        </span>
        <span
          className="mt-2 px-4 py-1.5 rounded-full border border-white/60 text-white/90 text-[12px] font-body font-medium"
        >
          자세히 보기
        </span>
      </div>
    </Link>
  )
}
