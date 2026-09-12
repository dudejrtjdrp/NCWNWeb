'use client'

/**
 * SmoothScrollSlider — 가로형 관성 캐러셀
 * ────────────────────────────────────────────────────────────
 * originkit.dev 의 "Smooth Scroll Slider (Momentum Image Carousel)" 동작을
 * 이 프로젝트 스택(Next 14 · Tailwind · 무의존성)에 맞춰 구현한 것.
 *
 * 원본 동작 규칙
 *  - 목표 오프셋(target)과 렌더 오프셋(rendered)을 분리하고 lerp 로 이어
 *    입력이 멈춘 뒤에도 레일이 계속 미끄러진다.
 *  - 각 슬라이드의 배율은 "자기 중심 ↔ 뷰포트 중심" 거리로 결정된다.
 *  - 커진 슬라이드는 늘어난 만큼의 75% 를 진행 방향으로 더 밀어내
 *    옆 카드를 잡아먹지 않는다.
 *  - 원본 배열을 뷰포트보다 길어질 때까지 반복한 뒤 양수 모듈로로 감아
 *    이음매를 숨긴다.
 *  - 프레임레이트 독립 이징 — 60fps 기준 상수를 델타로 거듭제곱한다.
 *  - 레일 위에서는 휠 이벤트를 소비해 페이지 스크롤을 붙잡는다.
 *
 * 접근성
 *  - prefers-reduced-motion 이면 관성 레일 대신 scroll-snap 가로 목록으로 대체
 *  - 좌우 화살표 버튼 · 키보드 ←/→ 지원, 각 슬라이드는 링크/버튼으로 포커스 가능
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface SlideItem {
  id: string
  /** 없으면 타이포그래피 플레이스홀더가 대신 표시된다 (가짜 이미지 금지) */
  src?: string | null
  alt: string
  /** 카드 아래(또는 중앙 활성 시) 노출할 캡션 */
  caption?: string
  /** 부가 설명 — 활성 슬라이드에만 표시 */
  subCaption?: string
  /** 있으면 카드가 링크가 된다 */
  href?: string
}

export interface SmoothScrollSliderProps {
  items: SlideItem[]
  /** 카드 기본 너비(px) */
  slideWidth?: number
  /** 카드 기본 높이(px) */
  slideHeight?: number
  /** 카드 사이 여백(px) */
  spacing?: number
  /** 레일이 입력을 따라잡는 더딤 정도 — 클수록 오래 미끄러진다 */
  smoothness?: number
  /** 모서리 반경(px) */
  radius?: number
  /** 중심에서 멀어질수록 어두워지는 정도 0~1 */
  dim?: number
  /** 중심 카드 최대 배율 */
  maxScale?: number
  /** 가장자리 카드 최소 배율 */
  minScale?: number
  /** 휠 한 칸 · 드래그 1px 가 레일을 미는 양 */
  sensitivity?: number
  /** 자동 흐름 속도(px/s). 0이면 끔 */
  autoplay?: number
  /**
   * 세로 휠까지 레일이 가져갈지 여부.
   * 원본(originkit)은 레일 위에서 페이지를 붙잡지만, 학과 사이트에서는
   * 세로 스크롤이 막히는 편이 더 당황스러워 기본값을 false 로 둔다.
   * (가로 트랙패드 스와이프·드래그·화살표·키보드는 항상 동작)
   */
  captureVerticalWheel?: boolean
  /** 레일 배경색 */
  background?: string
  /** 카드 종횡비를 유지한 채 채울지 */
  fit?: 'cover' | 'contain'
  className?: string
  'aria-label'?: string
}

/** 양수 모듈로 — 음수 오프셋에서도 이음매가 생기지 않는다 */
function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

export default function SmoothScrollSlider({
  items,
  slideWidth = 300,
  slideHeight = 400,
  spacing = 24,
  smoothness = 10,
  radius = 12,
  dim = 0.45,
  maxScale = 1.85,
  minScale = 0.66,
  sensitivity = 1.1,
  autoplay = 0,
  captureVerticalWheel = false,
  background = 'transparent',
  fit = 'cover',
  className,
  'aria-label': ariaLabel,
}: SmoothScrollSliderProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])

  const target = useRef(0)
  const rendered = useRef(0)
  const raf = useRef<number>()
  const lastTs = useRef(0)
  const dragging = useRef(false)
  const hovering = useRef(false)
  const dragLast = useRef(0)
  const velocity = useRef(0)

  const [width, setWidth] = useState(0)
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')
  const activeIdRef = useRef(activeId)
  activeIdRef.current = activeId
  const [reduced, setReduced] = useState(false)

  const step = slideWidth + spacing
  const n = items.length

  /* ── 원본 배열을 뷰포트보다 길어질 때까지 반복 ── */
  const copies = useMemo(() => {
    if (!n || !width) return 1
    const need = width + slideWidth * maxScale * 4
    return Math.max(2, Math.ceil(need / (n * step)) + 1)
  }, [n, width, step, slideWidth, maxScale])

  const rail = useMemo(
    () => Array.from({ length: copies * n }, (_, i) => ({ ...items[i % n], key: `${i}` })),
    [copies, n, items]
  )
  const loopLength = copies * n * step

  /* ── 뷰포트 폭 추적 ── */
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  /* ── 모션 최소화 설정 ── */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  /* ── 렌더 루프 ── */
  useEffect(() => {
    if (reduced || !width || !n) return

    const decayPerFrame = Math.max(0.02, 1 - 1 / Math.max(1, smoothness))
    const cx = width / 2

    const frame = (ts: number) => {
      const dt = lastTs.current ? Math.min((ts - lastTs.current) / 1000, 0.1) : 1 / 60
      lastTs.current = ts

      // 자동 흐름
      if (autoplay && !dragging.current && !hovering.current) target.current -= autoplay * dt

      // 드래그를 놓은 뒤 남은 관성
      if (!dragging.current && Math.abs(velocity.current) > 0.01) {
        target.current += velocity.current * dt
        velocity.current *= Math.pow(0.06, dt)
      }

      // 프레임레이트 독립 이징 — 60fps 기준 상수를 델타 프레임으로 거듭제곱
      const k = Math.pow(decayPerFrame, dt * 60)
      rendered.current = target.current + (rendered.current - target.current) * k

      let bestDist = Infinity
      let bestId = activeIdRef.current

      for (let i = 0; i < rail.length; i++) {
        const el = slideRefs.current[i]
        if (!el) continue

        // 양수 모듈로로 감아 이음매를 숨긴다
        const x = mod(i * step + rendered.current, loopLength) - slideWidth * maxScale
        const center = x + slideWidth / 2

        // 중심까지의 정규화 거리 → 배율·감광
        const u = (center - cx) / cx
        const nearness = Math.max(0, 1 - Math.min(Math.abs(u), 1))
        const scale = minScale + (maxScale - minScale) * Math.pow(nearness, 2.1)

        // 커진 만큼의 75% 를 진행 방향으로 더 밀어 이웃을 덮지 않게 한다
        const push = Math.sign(u) * (scale - 1) * slideWidth * 0.75

        const brightness = 1 - dim * (1 - nearness)
        const visible = x > -slideWidth * maxScale * 1.2 && x < width + slideWidth * maxScale * 1.2

        el.style.transform = `translate3d(${x + push}px, -50%, 0) scale(${scale})`
        el.style.opacity = visible ? String(0.25 + 0.75 * Math.pow(nearness, 0.6)) : '0'
        el.style.filter = `brightness(${brightness})`
        el.style.zIndex = String(Math.round(nearness * 100))
        el.style.pointerEvents = visible ? 'auto' : 'none'

        const d = Math.abs(center - cx)
        if (d < bestDist) {
          bestDist = d
          bestId = rail[i].id
        }
      }

      if (bestId !== activeIdRef.current) setActiveId(bestId)
      raf.current = requestAnimationFrame(frame)
    }

    raf.current = requestAnimationFrame(frame)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      lastTs.current = 0
    }
  }, [
    reduced, width, n, rail, loopLength, step, slideWidth, maxScale, minScale,
    dim, smoothness, autoplay,
  ])

  /* ── 휠: 레일 영역 안에서는 페이지 대신 레일이 움직인다 ── */
  useEffect(() => {
    const el = wrapRef.current
    if (!el || reduced) return
    const onWheel = (e: WheelEvent) => {
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY)
      if (!horizontal && !captureVerticalWheel) return // 세로 스크롤은 페이지에 양보
      const delta = horizontal ? e.deltaX : e.deltaY
      if (!delta) return
      e.preventDefault()
      target.current -= delta * sensitivity
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [reduced, sensitivity, captureVerticalWheel])

  /* ── 포인터 드래그 ── */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (reduced) return
    dragging.current = true
    dragLast.current = e.clientX
    velocity.current = 0
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [reduced])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - dragLast.current
    dragLast.current = e.clientX
    target.current += dx * sensitivity
    velocity.current = dx * 45
  }, [sensitivity])

  const endDrag = useCallback(() => {
    dragging.current = false
  }, [])

  const nudge = useCallback((dir: number) => {
    target.current -= dir * step
  }, [step])

  /* ── 모션 최소화: 단순 scroll-snap 목록 ── */
  if (reduced) {
    return (
      <div
        className={cn('scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto', className)}
        aria-label={ariaLabel}
        style={{ background }}
      >
        {items.map((it) => (
          <SlideCard
            key={it.id}
            item={it}
            width={slideWidth}
            height={slideHeight}
            radius={radius}
            fit={fit}
            className="snap-center shrink-0"
          />
        ))}
      </div>
    )
  }

  const active = items.find((i) => i.id === activeId) ?? items[0]
  // 레일 배경이 투명하면 페이지 배경(흰색)과 이어지도록 흰색으로 페이드
  const edgeColor = background === 'transparent' ? '#ffffff' : background

  return (
    <div className={cn('select-none', className)}>
      <div
        ref={wrapRef}
        role="group"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); nudge(1) }
          if (e.key === 'ArrowLeft') { e.preventDefault(); nudge(-1) }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={() => { hovering.current = true }}
        onPointerLeave={() => { hovering.current = false; endDrag() }}
        onFocus={() => { hovering.current = true }}
        onBlur={() => { hovering.current = false }}
        className="focus-ring relative w-full cursor-grab overflow-hidden rounded-panel active:cursor-grabbing"
        style={{ height: slideHeight * maxScale, background }}
      >
        <div ref={railRef} className="absolute inset-0">
          {rail.map((it, i) => (
            <div
              key={it.key}
              ref={(el) => { slideRefs.current[i] = el }}
              className="absolute left-0 top-1/2 will-change-transform"
              style={{ width: slideWidth, height: slideHeight }}
            >
              <SlideCard
                item={it}
                width={slideWidth}
                height={slideHeight}
                radius={radius}
                fit={fit}
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* 좌우 페이드 — 레일이 섹션 경계에서 잘리지 않게 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-[12%]"
          style={{ background: `linear-gradient(to right, ${edgeColor}, transparent)` }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-[12%]"
          style={{ background: `linear-gradient(to left, ${edgeColor}, transparent)` }}
        />
      </div>

      {/* 캡션 + 컨트롤 */}
      <div className="mt-7 flex items-center justify-between gap-6">
        <button
          type="button"
          onClick={() => nudge(-1)}
          aria-label="이전 슬라이드"
          className="focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-full border border-nwcn-border-light text-nwcn-text-default transition-colors duration-fast ease-nwcn hover:border-nwcn-text-default hover:bg-nwcn-text-default hover:text-white"
        >
          <ArrowIcon className="rotate-180" />
        </button>

        <div className="min-h-[48px] flex-1 text-center" aria-live="polite">
          {active?.caption && (
            <p className="font-body text-card font-semibold text-nwcn-text-default">{active.caption}</p>
          )}
          {active?.subCaption && (
            <p className="mt-1 font-body text-caption text-nwcn-gray-muted">{active.subCaption}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => nudge(1)}
          aria-label="다음 슬라이드"
          className="focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-full border border-nwcn-border-light text-nwcn-text-default transition-colors duration-fast ease-nwcn hover:border-nwcn-text-default hover:bg-nwcn-text-default hover:text-white"
        >
          <ArrowIcon />
        </button>
      </div>
    </div>
  )
}

/* ── 개별 카드 ─────────────────────────────────────────────── */
function SlideCard({
  item, width, height, radius, fit, className, draggable = true,
}: {
  item: SlideItem
  width: number
  height: number
  radius: number
  fit: 'cover' | 'contain'
  className?: string
  draggable?: boolean
}) {
  const inner = item.src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.src}
      alt={item.alt}
      draggable={draggable}
      className={cn('h-full w-full', fit === 'cover' ? 'object-cover' : 'object-contain')}
    />
  ) : (
    // 이미지 미등록 상태 — 가짜 썸네일 대신 브랜드 타이포로 채운다
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-nwcn-neutral-100 px-4 text-center">
      <span className="font-brand text-[clamp(28px,4vw,44px)] leading-none text-nwcn-neutral-300">NWCN</span>
      <span className="font-body text-caption text-nwcn-neutral-400">{item.caption ?? item.alt}</span>
    </div>
  )

  const box = (
    <div
      className={cn('overflow-hidden bg-nwcn-neutral-100', className)}
      style={{ width, height, borderRadius: radius }}
    >
      {inner}
    </div>
  )

  if (!item.href) return box

  return (
    <Link
      href={item.href}
      className="focus-ring block"
      style={{ borderRadius: radius }}
      aria-label={item.caption ?? item.alt}
      draggable={false}
    >
      {box}
    </Link>
  )
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
