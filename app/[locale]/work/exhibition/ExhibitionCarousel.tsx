'use client'

/**
 * 섹션 컴포넌트: ExhibitionCarousel
 * Figma node-id: 1152:2888 (WORK/Exhibition — 가로 무한 슬라이드 커버플로우)
 *
 * 졸업전시 포스터 커버플로우 캐러셀.
 * - 중앙 포스터를 크게 강조, 양옆은 축소·페이드 (coverflow)
 * - 가로 무한 슬라이드: 자동 재생 + 순환(modulo) 이동, hover 시 일시정지
 * - 중앙 항목의 연도/제목/주제를 상·하단에 표시
 * - 포스터 클릭 시 해당 항목을 중앙으로(또는 중앙이면 link 열기)
 */

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import type { ExhibitionItem } from '@/lib/supabase/queries/exhibitions'

interface Props {
  items: ExhibitionItem[]
  /** 자동 재생 간격(ms). 0이면 자동재생 끔 */
  interval?: number
}

export default function ExhibitionCarousel({ items, interval = 4000 }: Props) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = items.length

  const go = useCallback((dir: number) => {
    setActive((prev) => (prev + dir + n) % n)
  }, [n])

  // 자동 재생 (무한 순환)
  useEffect(() => {
    if (n <= 1 || paused || interval <= 0) return
    const id = setInterval(() => setActive((p) => (p + 1) % n), interval)
    return () => clearInterval(id)
  }, [n, paused, interval])

  if (n === 0) return null

  const current = items[active]

  // 중앙 기준 순환 거리(-n/2 ~ n/2)
  const offsetOf = (i: number) => {
    let off = i - active
    if (off > n / 2) off -= n
    if (off < -n / 2) off += n
    return off
  }

  return (
    <div className="w-full">
      {/* 상단: 학과 졸업전시 + 연도 */}
      <div className="text-center mb-7">
        <p className="font-body text-[15px] text-nwcn-text-muted">뉴미디어콘텐츠과 졸업전시</p>
        <p className="font-body font-bold text-[28px] sm:text-[32px] text-nwcn-text-default mt-1.5">
          {current.year}
        </p>
      </div>

      {/* 커버플로우 */}
      <div
        className="relative h-[340px] sm:h-[440px] lg:h-[540px] overflow-hidden select-none"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        role="group"
        aria-roledescription="carousel"
        aria-label="졸업전시 포스터"
      >
        {items.map((item, i) => {
          const off = offsetOf(i)
          const abs = Math.abs(off)
          const visible = abs <= 2
          const isCenter = off === 0

          // 슬롯별 위치/크기 (px 간격은 반응형 대신 % + translate 조합)
          const translate = off * 56 // % of half-width step
          const scale = isCenter ? 1 : abs === 1 ? 0.66 : 0.5
          const opacity = isCenter ? 1 : abs === 1 ? 0.55 : 0.25
          const blur = isCenter ? '' : 'brightness-[0.7]'

          const handleClick = () => {
            if (!visible) return
            if (isCenter) {
              if (item.link) window.open(item.link, '_blank', 'noopener,noreferrer')
            } else {
              setActive(i)
            }
          }

          return (
            <div
              key={item.id ?? item.year}
              onClick={handleClick}
              className="absolute top-1/2 left-1/2 h-full aspect-[0.7] cursor-pointer transition-all duration-500 ease-out"
              style={{
                transform: `translate(-50%, -50%) translateX(${translate}%) scale(${scale})`,
                opacity: visible ? opacity : 0,
                zIndex: 10 - abs,
                pointerEvents: visible ? 'auto' : 'none',
              }}
              aria-hidden={!isCenter}
            >
              <div
                className={[
                  'relative h-full w-full overflow-hidden rounded-[8px] bg-nwcn-dark-2',
                  isCenter ? 'shadow-[0_20px_60px_rgba(0,0,0,0.25)]' : '',
                  blur,
                ].join(' ')}
              >
                {item.poster_url ? (
                  <Image
                    src={item.poster_url}
                    alt={`${item.year} ${item.title}`}
                    fill
                    sizes="(max-width: 640px) 60vw, 380px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-nwcn-dark to-nwcn-dark-2">
                    <span className="font-brand font-black text-[56px] text-white/15 leading-none">
                      {item.year}
                    </span>
                    <span className="mt-2 font-body text-[14px] text-white/30">{item.title}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* 좌우 컨트롤 */}
        {n > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="이전 전시"
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-nwcn-text-default shadow-md backdrop-blur transition-colors hover:bg-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => go(1)}
              aria-label="다음 전시"
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-nwcn-text-default shadow-md backdrop-blur transition-colors hover:bg-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* 하단: 제목 + 주제 */}
      <div className="text-center mt-8">
        {current.link ? (
          <a
            href={current.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-brand font-bold text-[26px] sm:text-[32px] text-nwcn-text-default hover:text-nwcn-green-dark transition-colors"
          >
            {current.title}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        ) : (
          <h2 className="font-brand font-bold text-[26px] sm:text-[32px] text-nwcn-text-default">
            {current.title}
          </h2>
        )}
        {current.theme && (
          <p className="mt-2 font-body text-[15px] text-nwcn-gray-muted">{current.theme}</p>
        )}

        {/* 인디케이터 */}
        {n > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {items.map((item, i) => (
              <button
                key={item.id ?? item.year}
                onClick={() => setActive(i)}
                aria-label={`${item.year} 전시 보기`}
                className={[
                  'h-1.5 rounded-full transition-all duration-300',
                  i === active ? 'w-6 bg-nwcn-text-default' : 'w-1.5 bg-nwcn-border-muted hover:bg-nwcn-gray-faint',
                ].join(' ')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
