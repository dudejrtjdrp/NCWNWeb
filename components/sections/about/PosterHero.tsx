'use client'

/**
 * PosterHero — 포스터형 서브페이지 히어로 (학과 소개 E4)
 * ────────────────────────────────────────────────────────────
 * 화면 왼쪽에 거대한 영문·한글 제목, 오른쪽(--poster-split 지점부터)에 학과 사진
 * 슬라이드. 같은 제목을 검정·흰색 두 겹으로 그려 사진 경계에서 잘라 붙이므로,
 * 사진 위로 넘어간 글자만 흰색으로 보인다(app/globals.css 의 .poster-* 참고).
 *
 * - 6.5초마다 다음 사진으로 넘어가고, 마우스를 올리거나 키보드 포커스가 들어오면 멈춘다.
 * - 멈춤/재생 버튼 제공(WCAG 2.2.2), prefers-reduced-motion 이면 자동 넘김 없음.
 * - 모바일(<lg)은 제목 → 사진 순으로 쌓이고 글자는 모두 검정.
 * - fit 'portrait': 포스터처럼 잘리면 안 되는 이미지를 판 세로 가운데에 꽉 차게(contain) 올리고
 *   그림자를 준다. 뒤에는 같은 이미지를 크게 확대·블러·반투명으로 깔아 판을 채운다.
 *   사진이 없으면(slides=[]) 어두운 판에 emptyCaption 만 보여준다.
 */

import Image from 'next/image'
import { useEffect, useState, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export interface PosterSlide {
  src: string
  alt: string
  caption: string
  /** object-position (예: '50% 40%') */
  position?: string
  /** cover(기본): 칸을 꽉 채움 / portrait: 잘리지 않게 어두운 판 위에 통째로 */
  fit?: 'cover' | 'portrait'
}

export interface PosterHeroProps {
  /** 영문 제목 줄 (줄마다 하나) */
  titleEn: string[]
  /** 한글 제목 */
  titleKo: string
  /** 제목 아래 한두 줄 소개 (\n 줄바꿈 유지) */
  lead?: string
  slides: PosterSlide[]
  /** 사진이 시작되는 가로 위치(%) — 기본 44 */
  split?: number
  labels: { region: string; prev: string; next: string; pause: string; play: string }
  /** 사진이 없을 때 판 아래에 보여줄 문구 */
  emptyCaption?: string
  /** 사진이 없을 때 판 위에 흐리게 올릴 이미지 (예: 학과 엠블럼) */
  emptyImage?: { src: string; alt: string }
  id?: string
}

const INTERVAL_MS = 6500

function Title({ titleEn, titleKo }: Pick<PosterHeroProps, 'titleEn' | 'titleKo'>) {
  return (
    <span className="flex flex-col">
      <span lang="en" className="block font-black text-poster-en">
        {titleEn.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </span>
      <span className="mt-3 block font-extrabold text-poster-ko">{titleKo}</span>
    </span>
  )
}

export default function PosterHero({
  titleEn,
  titleKo,
  lead,
  slides,
  split = 44,
  labels,
  emptyCaption,
  emptyImage,
  id = 'top',
}: PosterHeroProps) {
  const count = slides.length
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [stopped, setStopped] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // index 가 바뀔 때마다 타이머를 새로 건다 → 수동으로 넘겨도 6.5초를 온전히 보여준다
  useEffect(() => {
    if (count < 2 || reduced || hovered || stopped) return
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), INTERVAL_MS)
    return () => window.clearTimeout(timer)
  }, [index, count, reduced, hovered, stopped])

  const go = (step: number) => setIndex((i) => (i + step + count) % count)
  const current = slides[index]
  const autoplay = count > 1 && !reduced

  return (
    <section
      id={id}
      data-no-reveal
      className="relative mx-auto flex max-w-page flex-col overflow-hidden break-keep border-t border-nwcn-dark lg:block lg:h-poster"
      style={{ '--poster-split': `${split}%` } as CSSProperties}
    >
      {/* ── 사진 슬라이드 ── */}
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={labels.region}
        className="poster-photo relative order-2 aspect-[4/3] overflow-hidden bg-nwcn-dark text-white sm:aspect-video lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovered(false)
        }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            aria-hidden={i !== index}
            className={cn('poster-slide absolute inset-0', i === index ? 'opacity-100' : 'opacity-0')}
          >
            {slide.fit === 'portrait' ? (
              <>
                {/* 뒤: 같은 포스터를 크게 확대 + 블러 + 반투명 */}
                <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
                  <Image src={slide.src} alt="" fill sizes="30vw" className="poster-backdrop object-cover" />
                </div>
                {/* 앞: 세로 가운데, 칸을 꽉 채우고 그림자 */}
                <div className="poster-portrait">
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    priority={i === 0}
                    sizes="(min-width: 1024px) 40vw, 80vw"
                    className="poster-shadow object-contain"
                    style={{ objectPosition: slide.position ?? '50% 50%' }}
                  />
                </div>
              </>
            ) : (
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 56vw, 100vw"
                className="object-cover"
                style={{ objectPosition: slide.position ?? '50% 50%' }}
              />
            )}
          </div>
        ))}
        {count === 0 && emptyImage && (
          <div className="poster-portrait opacity-40">
            <Image src={emptyImage.src} alt={emptyImage.alt} fill sizes="(min-width: 1024px) 36vw, 70vw" className="object-contain" />
          </div>
        )}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0',
            slides.some((sl) => sl.fit === 'portrait') ? 'poster-shade-soft' : 'poster-shade'
          )}
        />

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 py-1.5 pl-4 pr-2 text-body-sm sm:pl-5">
          <span className="min-w-0 truncate">{current?.caption ?? emptyCaption}</span>
          {count > 1 && (
            <span className="flex shrink-0 items-center">
              <span className="min-w-12 text-center tabular-nums">
                {index + 1} / {count}
              </span>
              <button type="button" className="poster-btn" aria-label={labels.prev} onClick={() => go(-1)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <button type="button" className="poster-btn" aria-label={labels.next} onClick={() => go(1)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {autoplay && (
                <button
                  type="button"
                  className="poster-btn"
                  aria-label={stopped ? labels.play : labels.pause}
                  aria-pressed={stopped}
                  onClick={() => setStopped((v) => !v)}
                >
                  {stopped ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M7 4.5v15l12-7.5z" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M6.5 4.5h3.5v15H6.5zM14 4.5h3.5v15H14z" />
                    </svg>
                  )}
                </button>
              )}
            </span>
          )}
        </div>
      </div>

      {/* ── 제목: 검정 (사진 왼쪽만 보이게 잘림) ── */}
      <div className="poster-ink relative z-10 order-1 flex flex-col px-4 pb-8 pt-5 text-nwcn-dark sm:px-8 lg:absolute lg:inset-0 lg:pb-0 lg:pt-6">
        <h1 className="m-0">
          <Title titleEn={titleEn} titleKo={titleKo} />
        </h1>
        {lead && <p className="mt-5 max-w-lg whitespace-pre-line font-medium text-lead lg:mt-6">{lead}</p>}
      </div>

      {/* ── 제목: 흰색 (사진 위로 넘어간 부분만 보이게 잘림) — 장식용 복제본 ── */}
      <div
        aria-hidden="true"
        className="poster-light pointer-events-none absolute inset-0 z-10 hidden flex-col px-8 pt-6 text-white lg:flex"
      >
        <Title titleEn={titleEn} titleKo={titleKo} />
        {lead && <p className="mt-6 max-w-lg whitespace-pre-line font-medium text-lead">{lead}</p>}
      </div>
    </section>
  )
}
