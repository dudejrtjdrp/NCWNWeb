'use client'

/**
 * 섹션 컴포넌트: HomeHeroSection (홈 전용)
 *
 * Figma:
 *   - 스크롤 전 (히어로 첫 화면): node-id 941:1000 / hero-banner 1158:1721
 *   - 스크롤 후 (WORK + 게시물):  node-id 376:634  / hero-banner 1152:3622
 *
 * 스크롤 UX (디자이너 시안 반영):
 *   1) 진입: 흰 배경 + NWCN 3D 낱자(배경 요소) + 가운데 카피 + nwcn 알약 버튼
 *   2) 스크롤 시
 *      - 가운데 글자: 위로 흐릿(블러)해지며 상승 후 사라짐
 *      - 배경 3D 요소: 살짝 떠오른 뒤 자리에서 흐릿해지며 양옆으로 흩어져 사라짐
 *      - WORK 3D: 오른쪽 → 왼쪽으로 등장
 *      - NWCN/슬로건: 작게 흐릿하다가 커지며 또렷해짐(scale + 블러 인)
 *      - 게시물(최대 4): 오른쪽 → 왼쪽으로 등장하며 가로로 흘러감
 *   3) 게시물이 모두 지나가거나 버튼을 누르면 하단 섹션으로 스크롤
 *   4) 역스크롤 시 전 구간 역재생 (progress 기반)
 *
 * 구현 (자연스러운 스크롤 UX):
 *   - {scrollHeight} 높이 컨테이너로 스크롤을 "캡처"
 *   - 내부 시각 영역은 position: sticky, height: 100vh (흰 배경)
 *   - 1440×725 디자인 좌표를 그대로 쓰는 stage 를 뷰포트 너비에 맞춰 scale
 *   - 스크롤 진행률(0→1)을 매 프레임 setState 하지 않고, ref + 단일 rAF 루프에서
 *     "댐핑(lerp)"으로 부드럽게 보간한 뒤 각 요소 style 에 직접 적용한다.
 *       · React 리렌더(재조정) 없이 합성만 갱신 → 잼(끊김) 제거
 *       · 진행값에 관성을 줘서 스크롤이 시각요소를 살짝 "쫓아오게" → 자연스러움
 *       · 프레임레이트 독립 보간(dt 기반)이라 60/120Hz에서 동일한 감각
 *   - 타임라인 구간을 겹치도록 배치해 "스크롤해도 아무 일 없는 빈 구간"을 제거
 *   - prefers-reduced-motion: 스크롤 캡처를 끄고 최종(해석된) 화면을 정적으로 표시
 *
 * ⚠️ 3D 이미지(에셋)는 현재 Figma 임시 export URL(약 7일 유효)을 사용합니다.
 *    추후 /public/images/home 으로 내려받아 ASSET 경로만 교체하면 됩니다.
 */

import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { Link } from '@/i18n/navigation'
import HomeHeroMobile from './HomeHeroMobile'

/** SSR 경고 없이 클라이언트에선 layout effect 사용 */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/* ──────────────────────────────────────────────────────────
 * 에셋 (TODO: 로컬 /public/images/home/* 로 교체)
 * ────────────────────────────────────────────────────────── */
const ASSET = {
  /** MEETS 를 감싸는 손그림 원형 마커 */
  ellipse: 'https://www.figma.com/api/mcp/asset/6ef5aa0c-a953-4a25-83d0-c6811819fc07',
  /** 알약 버튼 안 nwcn 워드마크 */
  wordmark: 'https://www.figma.com/api/mcp/asset/80ba2d54-e549-4cbc-9849-f41a331ec2ae',
  /** WORK 3D 텍스트 (로컬 에셋) */
  work: '/images/home/work.png',
} as const

/* 디자인 기준 좌표 (Figma hero-banner 프레임) */
const DESIGN_W = 1440
const DESIGN_H = 725

/* ──────────────────────────────────────────────────────────
 * 배경 NWCN 3D 낱자 (개별 PNG — nwcn-letters 에서 분리)
 *   cx/cy   : 중심 좌표 (stage 1440×725 기준)
 *   w       : 표시 너비(px) — 높이는 원본 비율 유지
 *   rot/op  : 기울기 / 기본 투명도
 *   scatter : 스크롤 시 흩어지는 방향·거리(px)
 * ────────────────────────────────────────────────────────── */
type Letter = {
  src: string
  cx: number; cy: number; w: number
  rot: number; op: number
  scatter: { x: number; y: number }
  /** 대기 중 둥둥 떠다니는 플로팅 */
  bob: 'heroFloatA' | 'heroFloatB'; bobDur: number; bobDelay: number
}

const LETTERS: Letter[] = [
  { src: '/images/home/letter-1.png', cx: 295, cy: 140, w: 255, rot: -8, op: 0.95, scatter: { x: -380, y: -60 }, bob: 'heroFloatA', bobDur: 5.0, bobDelay: 0 },    // N
  { src: '/images/home/letter-2.png', cx: 470, cy: 470, w: 320, rot: -20, op: 0.6, scatter: { x: -460, y: 130 }, bob: 'heroFloatB', bobDur: 6.4, bobDelay: -1.6 }, // C
  { src: '/images/home/letter-3.png', cx: 1180, cy: 150, w: 280, rot: 6, op: 0.85, scatter: { x: 430, y: -70 }, bob: 'heroFloatA', bobDur: 5.6, bobDelay: -0.9 },  // W
  { src: '/images/home/letter-4.png', cx: 900, cy: 660, w: 200, rot: 16, op: 0.45, scatter: { x: 300, y: 200 }, bob: 'heroFloatB', bobDur: 6.9, bobDelay: -2.4 },  // N
]

/* 게시물(최대 4) — page.tsx 에서 실제 쇼케이스 작품을 주입 */
export type HeroPost = {
  id: string
  title: string
  subtitle?: string        // 작가/연도 등
  tag?: string             // 작품 종류 라벨
  image?: string | null    // 썸네일 URL
  href?: string            // 상세 페이지 경로 (예: /work/[id])
}
const DEFAULT_POSTS: HeroPost[] = [
  { id: 'p1', title: 'WORK 01', tag: 'NINC' },
  { id: 'p2', title: 'WORK 02', tag: 'NINC' },
  { id: 'p3', title: 'WORK 03', tag: 'NINC' },
  { id: 'p4', title: 'WORK 04', tag: 'NINC' },
]

const CARD_W = 600
const CARD_H = 376
const CARD_GAP = 40

export interface HomeHeroSectionProps {
  /** 스크롤 캡처 길이 (기본 320vh — 인트로/WORK/슬로건 + 게시물 스트립 등장) */
  scrollHeight?: string
  /** 히어로 게시물 (최대 4개 권장) */
  posts?: HeroPost[]
  className?: string
}

/* 이징/보간 유틸 */
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const norm = (x: number, a: number, b: number) => clamp01((x - a) / (b - a))
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/* ── 타임라인 (progress 0→1) ──
 * 구간을 서로 겹치도록 배치해 모션이 끊기지 않고 이어지게 한다.
 *   인트로 퇴장 → 낱자 분산 → WORK 등장 → 슬로건 인 → 게시물 스트립
 * (이전: 0.28~0.34 / 0.86~1.0 빈 구간 → 제거) */
type Frame = {
  introExit: number
  floatUp: number
  scatter: number
  workIn: number
  headingIn: number
  stripIn: number
}
function computeFrame(p: number): Frame {
  return {
    introExit: easeInOut(norm(p, 0.0, 0.20)),   // 가운데 카피: 상승 + 블러 + 페이드아웃
    floatUp: easeOut(norm(p, 0.0, 0.16)),        // 3D 낱자: 살짝 떠오름
    scatter: easeInOut(norm(p, 0.05, 0.30)),     // 3D 낱자: 양옆 분산 + 페이드아웃
    workIn: easeOut(norm(p, 0.26, 0.58)),        // WORK: 우 → 좌 등장 (낱자 분산과 살짝 겹침)
    headingIn: easeOut(norm(p, 0.48, 0.74)),     // NWCN/슬로건: scale + 블러 인
    stripIn: easeOut(norm(p, 0.60, 0.94)),       // 게시물 스트립: 우측 슬라이드 + 페이드 인 (끝까지 채움)
  }
}

/** 진행값 댐핑 시간상수(초). 작을수록 스크롤에 즉각, 클수록 더 미끄러지듯 따라옴. */
const SMOOTH_TAU = 0.075

export default function HomeHeroSection({
  scrollHeight = '320vh',
  posts = DEFAULT_POSTS,
  className = '',
}: HomeHeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [vw, setVw] = useState(DESIGN_W)

  /* 모바일(≤767px) / 모션 최소화 선호 — 마운트 후 결정(SSR 하이드레이션 미스매치 방지) */
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    const mqMobile = window.matchMedia('(max-width: 767px)')
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      setIsMobile(mqMobile.matches)
      setReducedMotion(mqReduce.matches)
    }
    update()
    mqMobile.addEventListener('change', update)
    mqReduce.addEventListener('change', update)
    return () => {
      mqMobile.removeEventListener('change', update)
      mqReduce.removeEventListener('change', update)
    }
  }, [])

  /* 뷰포트 너비(stage scale 용) */
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  /* ── 애니메이션 대상 ref (imperative 적용 — React 리렌더 없이 합성만 갱신) ── */
  const lettersRef = useRef<(HTMLDivElement | null)[]>([])
  const stripRef = useRef<HTMLDivElement>(null)
  const workRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const debugRef = useRef<HTMLDivElement>(null)

  /* 진행값: target(원시 스크롤) → rendered(댐핑된 값) */
  const targetRef = useRef(0)
  const renderedRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef(0)

  /** rendered progress(p)를 각 요소 style 에 직접 적용 */
  const applyStyles = useCallback((p: number) => {
    const f = computeFrame(p)

    // 배경 낱자
    for (let i = 0; i < LETTERS.length; i++) {
      const el = lettersRef.current[i]
      if (!el) continue
      const L = LETTERS[i]
      const tx = L.scatter.x * f.scatter
      const ty = -f.floatUp * 26 + L.scatter.y * f.scatter
      el.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) translateZ(0)`
      el.style.opacity = `${L.op * (1 - f.scatter)}`
      // idle(scatter=0)엔 filter 속성 자체를 제거해 합성 레이어를 깨끗이 유지
      el.style.filter = f.scatter > 0 ? `blur(${f.scatter * 8}px)` : ''
    }

    // 게시물 스트립
    if (stripRef.current) {
      stripRef.current.style.transform = `translateX(${(1 - f.stripIn) * 240}px)`
      stripRef.current.style.opacity = `${f.stripIn}`
    }

    // WORK
    if (workRef.current) {
      workRef.current.style.transform = `translateX(${(1 - f.workIn) * 1500}px)`
      workRef.current.style.opacity = `${f.workIn}`
      workRef.current.style.pointerEvents = f.workIn > 0.9 ? 'auto' : 'none'
    }

    // NWCN/슬로건
    if (headingRef.current) {
      headingRef.current.style.transform = `scale(${0.62 + f.headingIn * 0.38})`
      headingRef.current.style.opacity = `${f.headingIn}`
      headingRef.current.style.filter = f.headingIn < 1 ? `blur(${(1 - f.headingIn) * 12}px)` : ''
    }

    // 가운데 카피
    if (introRef.current) {
      introRef.current.style.transform = `translate(-50%, calc(-50% - ${f.introExit * 150}px))`
      introRef.current.style.opacity = `${1 - f.introExit}`
      introRef.current.style.filter = f.introExit > 0 ? `blur(${f.introExit * 14}px)` : ''
    }

    // 스크롤 힌트
    if (hintRef.current) hintRef.current.style.opacity = `${Math.max(0, 1 - p * 6)}`

    // dev 진행률
    if (debugRef.current) debugRef.current.textContent = `${Math.round(p * 100)}%`
  }, [])

  /* 단일 rAF 루프 — target 측정 + 댐핑 보간 + 적용. 안정되면 멈추고 스크롤 시 재가동. */
  const tick = useCallback((now: number) => {
    const dt = Math.min(0.05, (now - lastTsRef.current) / 1000 || 0)
    lastTsRef.current = now

    const el = containerRef.current
    if (el) {
      const scrollable = el.offsetHeight - window.innerHeight
      const rect = el.getBoundingClientRect()
      targetRef.current = scrollable > 0 ? clamp01(-rect.top / scrollable) : 0
    }

    // 프레임레이트 독립 보간계수
    const a = 1 - Math.exp(-dt / SMOOTH_TAU)
    renderedRef.current += (targetRef.current - renderedRef.current) * a
    if (Math.abs(targetRef.current - renderedRef.current) < 0.0004) {
      renderedRef.current = targetRef.current
    }

    applyStyles(renderedRef.current)

    if (renderedRef.current !== targetRef.current) {
      rafRef.current = requestAnimationFrame(tick)
    } else {
      rafRef.current = null // 안정 → 정지(배터리 절약)
    }
  }, [applyStyles])

  const kick = useCallback(() => {
    if (rafRef.current != null) return
    lastTsRef.current = performance.now()
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  /* 스크롤/리사이즈 → 루프 가동 (데스크탑 · 모션 허용 시) */
  useEffect(() => {
    if (isMobile !== false) return
    if (reducedMotion) {
      // 모션 최소화: 캡처 없이 최종 해석 상태 고정
      targetRef.current = 1
      renderedRef.current = 1
      applyStyles(1)
      return
    }
    renderedRef.current = 0
    targetRef.current = 0
    window.addEventListener('scroll', kick, { passive: true })
    window.addEventListener('resize', kick)
    kick()
    return () => {
      window.removeEventListener('scroll', kick)
      window.removeEventListener('resize', kick)
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [isMobile, reducedMotion, kick, applyStyles])

  /* 리렌더(vw 변경 등) 직후, paint 전에 현재 진행값을 다시 적용 → 깜빡임 방지 */
  useIsoLayoutEffect(() => {
    if (isMobile !== false) return
    applyStyles(reducedMotion ? 1 : renderedRef.current)
  }, [vw, isMobile, reducedMotion, applyStyles])

  /* 게시물 가로 스냅 스트립 — 세로 스크롤과 분리.
     트랙패드 가로 스와이프/터치는 네이티브 scroll-snap 으로 한 칸씩, 마우스는 드래그로 스크롤. */
  const dragRef = useRef({ down: false, startX: 0, startLeft: 0, moved: false })

  const onStripPointerDown = useCallback((e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse') return // 터치/펜은 네이티브 스크롤에 맡김
    const strip = stripRef.current
    if (!strip) return
    dragRef.current = { down: true, startX: e.clientX, startLeft: strip.scrollLeft, moved: false }
    strip.style.scrollSnapType = 'none'   // 드래그 중에는 스냅 해제
    strip.setPointerCapture?.(e.pointerId)
  }, [])
  const onStripPointerMove = useCallback((e: ReactPointerEvent) => {
    const d = dragRef.current
    const strip = stripRef.current
    if (!d.down || !strip) return
    const dx = e.clientX - d.startX
    if (Math.abs(dx) > 4) d.moved = true
    strip.scrollLeft = d.startLeft - dx
  }, [])
  const endStripDrag = useCallback((e: ReactPointerEvent) => {
    const strip = stripRef.current
    if (!dragRef.current.down) return
    dragRef.current.down = false
    if (strip) strip.style.scrollSnapType = '' // 스냅 복원 → 놓으면 가까운 카드로 정렬
    strip?.releasePointerCapture?.(e.pointerId)
  }, [])
  const onStripClickCapture = useCallback((e: ReactMouseEvent) => {
    if (dragRef.current.moved) { e.preventDefault(); e.stopPropagation() } // 드래그였으면 링크 클릭 무시
  }, [])

  /* 버튼/종료 → 하단 섹션으로 스크롤 */
  const scrollToNext = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const target = el.offsetTop + el.offsetHeight
    const lenis = (window as Window & { __lenis?: { start?: () => void; scrollTo: (t: number, o?: object) => void } }).__lenis
    lenis?.start?.() // 캐러셀 스텝 모드로 멈춰있을 수 있으니 재개
    if (lenis?.scrollTo) lenis.scrollTo(target, { duration: 1.1, force: true })
    else window.scrollTo({ top: target, behavior: 'smooth' })
  }, [])

  const scale = vw / DESIGN_W

  /* 결정 전: 스크롤 높이만 유지하는 플레이스홀더(히어로 깜빡임/하이드레이션 미스매치 방지) */
  if (isMobile === null) {
    return <div className={`relative ${className}`} style={{ height: scrollHeight }} aria-hidden />
  }
  /* 모바일: 전용 풀블리드 히어로 */
  if (isMobile) {
    return <HomeHeroMobile posts={posts} scrollHeight={scrollHeight} className={className} />
  }

  /* 초기 프레임(첫 paint 값) — 모션 최소화면 최종 상태(1), 아니면 진입 상태(0) */
  const f0 = computeFrame(reducedMotion ? 1 : 0)

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height: reducedMotion ? '100vh' : scrollHeight, overscrollBehaviorX: 'none' }}
      aria-label="히어로 섹션"
    >
      {/* ── Sticky 시각 영역 ── */}
      <div className="sticky top-0 w-full overflow-hidden bg-white" style={{ height: '100vh' }}>
        {/* 낱자 대기 플로팅 키프레임 */}
        <style
          dangerouslySetInnerHTML={{
            __html:
              /* translate3d 사용: GPU 컴포지터에서 합성 → Windows 서브픽셀 진동(덜덜거림) 방지 */
              '@keyframes heroFloatA{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-15px,0)}}' +
              '@keyframes heroFloatB{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-23px,0)}}' +
              '@keyframes heroWorkFloat{0%,100%{transform:translate3d(0,0,0) rotate(0deg)}50%{transform:translate3d(0,-16px,0) rotate(-1.2deg)}}' +
              '.hero-strip{-ms-overflow-style:none;scrollbar-width:none}.hero-strip::-webkit-scrollbar{display:none}.hero-strip:active{cursor:grabbing}',
          }}
        />
        {/* 1440×725 디자인 좌표 stage — 뷰포트 너비에 맞춰 스케일 */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: DESIGN_W,
            height: DESIGN_H,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* 배경 그라데이션 오버레이 */}
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(240,240,240,0.2) 0%, rgba(255,255,255,0.2) 100%)',
            }}
          />

          {/* ── 배경 NWCN 3D 낱자 (개별 PNG, 대기 중 둥둥 플로팅) ── */}
          {LETTERS.map((L, i) => {
            const tx = L.scatter.x * f0.scatter
            const ty = -f0.floatUp * 26 + L.scatter.y * f0.scatter
            return (
              <div
                key={L.src}
                ref={(el) => { lettersRef.current[i] = el }}
                style={{
                  position: 'absolute', left: L.cx, top: L.cy, width: L.w,
                  /* translateZ(0): 2D transform 조상(scale·rotate) 안에서도 이 레이어를
                     3D 합성 컨텍스트로 승격 → Windows(Chrome)에서 애니메이션 위치를
                     정수 픽셀로 스냅(덜덜 떨림)하지 않고 서브픽셀로 부드럽게 이동. */
                  transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) translateZ(0)`,
                  opacity: L.op * (1 - f0.scatter),
                  ...(f0.scatter > 0 ? { filter: `blur(${f0.scatter * 8}px)` } : null),
                  zIndex: 10, pointerEvents: 'none', willChange: 'transform, opacity',
                }}
              >
                <div style={{ transform: `rotate(${L.rot}deg) translateZ(0)` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={L.src} alt="" aria-hidden
                    style={{
                      display: 'block', width: '100%', height: 'auto',
                      animation: `${L.bob} ${L.bobDur}s ease-in-out ${L.bobDelay}s infinite`,
                      /* 애니메이션 요소를 독립 GPU 레이어로 승격 → 픽셀 그리드 스냅(진동) 제거 */
                      willChange: 'transform', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                    }}
                  />
                </div>
              </div>
            )
          })}

          {/* ── 게시물 가로 스냅 스트립 (세로 스크롤과 분리) ── */}
          <div
            ref={stripRef}
            onPointerDown={onStripPointerDown}
            onPointerMove={onStripPointerMove}
            onPointerUp={endStripDrag}
            onPointerCancel={endStripDrag}
            onPointerLeave={endStripDrag}
            onClickCapture={onStripClickCapture}
            className="hero-strip"
            style={{
              /* 좌하단 NWCN 슬로건과 겹치지 않도록 스트립을 슬로건 오른쪽에서 시작·클립 */
              position: 'absolute', top: 150, left: 640, width: 800, height: 410,
              display: 'flex', gap: CARD_GAP, alignItems: 'center',
              overflowX: 'auto', overflowY: 'hidden',
              scrollSnapType: 'x mandatory', overscrollBehaviorX: 'contain',
              transform: `translateX(${(1 - f0.stripIn) * 240}px)`,
              opacity: f0.stripIn, zIndex: 20, cursor: 'grab', touchAction: 'pan-x',
              willChange: 'transform, opacity',
            }}
          >
            {/* 첫/마지막 카드 가운데 정렬용 여백 */}
            <div aria-hidden style={{ flex: 'none', width: 'calc(50% - 300px)' }} />
            {posts.slice(0, 4).map((post) => {
              const cardStyle: CSSProperties = {
                position: 'relative', display: 'block', width: CARD_W, height: CARD_H, flex: 'none',
                borderRadius: 20, background: '#d9d9d9', overflow: 'hidden', textDecoration: 'none',
                scrollSnapAlign: 'center',
              }
              const inner = (
                <>
                  {post.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={post.title} src={post.image}
                      className="transition-transform duration-500 group-hover:scale-105"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                  {/* 하단 가독성 그라데이션 (썸네일 있을 때) */}
                  {post.image && (
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)' }} />
                  )}
                  <div style={{ position: 'absolute', inset: 0, padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {post.tag && (
                      <span style={{ alignSelf: 'flex-start', fontSize: 14, fontWeight: 600, color: '#2d2d2d', background: 'rgba(255,255,255,0.82)', borderRadius: 999, padding: '5px 14px', letterSpacing: '0.02em' }}>
                        {post.tag}
                      </span>
                    )}
                    <div>
                      <p style={{ margin: 0, fontSize: 28, fontWeight: 700, lineHeight: 1.2, color: post.image ? '#fff' : '#6f6f6f', textShadow: post.image ? '0 1px 10px rgba(0,0,0,0.4)' : 'none', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.title}
                      </p>
                      {post.subtitle && (
                        <p style={{ margin: '8px 0 0', fontSize: 16, fontWeight: 500, color: post.image ? 'rgba(255,255,255,0.85)' : '#9a9a9a' }}>
                          {post.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )
              return post.href ? (
                <Link key={post.id} href={post.href} className="group" style={cardStyle} aria-label={post.title} draggable={false}>
                  {inner}
                </Link>
              ) : (
                <div key={post.id} className="group" style={cardStyle}>
                  {inner}
                </div>
              )
            })}
            {/* 첫/마지막 카드 가운데 정렬용 여백 */}
            <div aria-hidden style={{ flex: 'none', width: 'calc(50% - 300px)' }} />
          </div>

          {/* ── WORK 3D (우 → 좌 등장 + 둥실둥실 플로팅 + hover 인터랙션) ── */}
          <div
            ref={workRef}
            style={{
              position: 'absolute', left: 76, top: 110, width: 732,
              transform: `translateX(${(1 - f0.workIn) * 1500}px)`,
              opacity: f0.workIn, zIndex: 30, willChange: 'transform, opacity',
              pointerEvents: f0.workIn > 0.9 ? 'auto' : 'none',
            }}
          >
            <Link href="/work/showcase" aria-label="WORK 쇼케이스 보기" className="group" style={{ display: 'block' }}>
              {/* drop-shadow는 정적 부모로 분리: 애니메이션 요소에 filter가 걸리면
                  Windows에서 매 프레임 그림자 재래스터로 떨림이 발생하므로 분리한다 */}
              <div
                className="transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                style={{ filter: 'drop-shadow(-18px 46px 22px rgba(0,0,0,0.10))' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="WORK" src={ASSET.work}
                  style={{
                    display: 'block', width: '100%', height: 'auto',
                    animation: 'heroWorkFloat 6s ease-in-out infinite',
                    willChange: 'transform', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                  }}
                />
              </div>
            </Link>
          </div>

          {/* ── NWCN, + 슬로건 (scale + 블러 인) ── */}
          <div
            ref={headingRef}
            style={{
              position: 'absolute', left: 126, top: 430, width: 760,
              transformOrigin: 'left center',
              transform: `scale(${0.62 + f0.headingIn * 0.38})`,
              opacity: f0.headingIn,
              ...(f0.headingIn < 1 ? { filter: `blur(${(1 - f0.headingIn) * 12}px)` } : null),
              zIndex: 30, pointerEvents: 'none', willChange: 'transform, opacity, filter',
            }}
          >
            <p style={{ margin: 0, fontWeight: 700, fontSize: 32, lineHeight: 1.2, color: '#3a3a3b' }}>NWCN,</p>
            <p style={{ margin: '18px 0 0', fontWeight: 200, fontSize: 22, lineHeight: 1.45, color: '#3a3a3b' }}>
              We cultivate convergence content specialists
              <br />who can lead the new media industry.
            </p>
          </div>

          {/* ── 가운데 카피 (상승 + 블러 + 페이드아웃) ── */}
          <div
            ref={introRef}
            style={{
              position: 'absolute', left: '50%', top: 283, width: DESIGN_W - 94, height: 360,
              transform: `translate(-50%, calc(-50% - ${f0.introExit * 150}px))`,
              opacity: 1 - f0.introExit,
              /* idle엔 blur(0) 정적 필터 제거 — 떠다니는 낱자 repaint에 휩쓸려
                 매 프레임 필터 재패스가 일어나면 Windows에서 텍스트가 떨린다. */
              ...(f0.introExit > 0 ? { filter: `blur(${f0.introExit * 14}px)` } : null),
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              textAlign: 'center', color: '#3a3a3b', zIndex: 40, pointerEvents: 'none',
              willChange: 'transform, opacity, filter',
            }}
          >
            <p style={{ margin: 0, fontWeight: 200, fontSize: 77, lineHeight: '90px' }}>WHEN THE SENSIBILITY OF ART</p>
            <p style={{ margin: 0, fontWeight: 500, fontSize: 77, lineHeight: '90px' }}>MEETS THE</p>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 77, lineHeight: '90px' }}>POWER OF TECHNOLOGY,</p>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 77, lineHeight: '90px' }}>NEW POSSIBILITIES ARE BORN.</p>

            {/* MEETS 원형 마커 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="" aria-hidden src={ASSET.ellipse}
              style={{ position: 'absolute', left: 441, top: 91, width: 291, height: 88, pointerEvents: 'none' }}
            />
          </div>

          {/* ── nwcn 알약 버튼 (전 구간 고정, 클릭 시 하단 스크롤) ── */}
          <button
            type="button"
            onClick={scrollToNext}
            aria-label="다음 섹션으로 이동"
            style={{
              position: 'absolute', left: 565, top: 620, width: 306, height: 92,
              borderRadius: 48, background: 'rgba(255,255,255,0.1)',
              boxShadow: 'inset 3px 3px 4px 0 rgba(0,0,0,0.2)',
              border: 'none', cursor: 'pointer', zIndex: 50,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="nwcn" src={ASSET.wordmark} style={{ width: 175, height: 44, objectFit: 'contain' }} />
          </button>
        </div>

        {/* ── 초기 스크롤 힌트 ── */}
        <div
          ref={hintRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[60] pointer-events-none"
          style={{ opacity: reducedMotion ? 0 : 1 }}
        >
          <span className="font-body text-[11px] tracking-[0.2em] text-[#3a3a3b]/70 uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#3a3a3b]/50 to-transparent" />
        </div>

        {/* ── 진행률 디버그 (dev only) ── */}
        {process.env.NODE_ENV === 'development' && (
          <div ref={debugRef} className="absolute top-20 right-4 z-[60] bg-black/50 text-white text-xs px-2 py-1 rounded font-mono">
            0%
          </div>
        )}
      </div>
    </div>
  )
}
