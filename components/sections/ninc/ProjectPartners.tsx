'use client'

/**
 * NINC / PROJECT — 산학협력 / 가족회사 로고 섹션
 * Figma node-id: 941:287
 * - 흰 카드 위 로고, 클릭 시 링크 이동(추후 교체)
 * - 로고 이미지 없으면 회사명 텍스트로 폴백
 */

import { useState } from 'react'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'
import { PARTNER_LOGOS } from '@/constants/ninc-project'

function PartnerCard({ name, logoSrc, href }: { name: string; logoSrc: string; href: string }) {
  const [imgError, setImgError] = useState(false)

  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="group flex h-[180px] sm:h-[220px] lg:h-[263px] items-center justify-center bg-white px-6 transition-transform duration-200 hover:-translate-y-1"
      aria-label={name}
    >
      {imgError ? (
        <span className="font-body font-semibold text-[18px] text-[#888] group-hover:text-[#555]">
          {name}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoSrc}
          alt={name}
          className="max-h-[150px] max-w-[220px] object-contain"
          onError={() => setImgError(true)}
        />
      )}
    </a>
  )
}

export default function ProjectPartners() {
  return (
    <section className="bg-white pt-16 sm:pt-20 lg:pt-[90px]" data-node-id="941:287">
      {/* 헤딩 */}
      <AnimateOnScroll variant="fade-up" className="text-center">
        <h2 className="font-body font-bold text-[22px] sm:text-[24px] lg:text-[25px] text-[#050505]">
          산학협력/가족회사
        </h2>
        <p className="mt-3 lg:mt-[14px] font-body text-[15px] sm:text-[17px] lg:text-[18px] leading-[27px] text-[#888]">
          뉴미디어콘텐츠과와 인연을 맺고 있는 회사들입니다
        </p>
      </AnimateOnScroll>

      {/* 로고 그리드 */}
      <AnimateOnScroll variant="fade-up" delay={80} className="mt-10 sm:mt-12 lg:mt-[45px]">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {PARTNER_LOGOS.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className="border-b border-r border-[#ececec] [&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(4n)]:border-r-0"
            >
              <PartnerCard {...p} />
            </div>
          ))}
        </div>
      </AnimateOnScroll>
    </section>
  )
}
