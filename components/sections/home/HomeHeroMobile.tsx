'use client'

/**
 * 섹션 컴포넌트: HomeHeroMobile (홈 전용 · 모바일)
 *
 * 데스크탑 HomeHeroSection 의 모바일(≤767px) 대응 버전.
 * Figma 시안:
 *   - 스크롤 전: node-id 1152:1792 / hero-banner 1152:1793
 *   - 스크롤 후: node-id 452:529  / hero-banner 1152:3652
 *
 * 스크롤 UX (데스크탑과 동일한 내러티브):
 *   1) 진입(스크롤 전): 흰 배경 + 모서리에 떠 있는 NWCN 3D 낱자 + 가운데 카피 + nwcn 알약 버튼
 *   2) 스크롤 시
 *      - 가운데 카피: 위로 흐릿(블러)해지며 상승 후 사라짐
 *      - 3D 낱자: 살짝 떠오른 뒤 네 모서리 방향으로 흩어지며 사라짐
 *      - WORK 3D: 오른쪽 → 왼쪽으로 등장
 *      - 게시물(최대 4): 오른쪽 → 왼쪽으로 등장하는 가로 스냅 스트립
 *      - NWCN/슬로건: 작게 흐릿하다가 커지며 또렷해짐(scale + 블러 인)
 *   3) 알약 버튼은 전 구간 고정 — 누르면 하단 섹션으로 스크롤
 *
 * 반응형:
 *   - sticky 영역 100dvh 풀블리드 → 모든 폰에서 화면을 꽉 채움
 *   - 좌표는 뷰포트 중심(px offset) / 모서리 앵커 / clamp() 기반이라
 *     iPhone SE(375)~Pro Max(430+) 까지 자연스럽게 대응
 *
 * 에셋: 웹(데스크탑)과 동일한 파일 그대로 재사용
 *   - /images/home/letter-1~4.png (3D 낱자)
 *   - /images/home/work.png (WORK 3D)
 *   - nwcn 워드마크(알약 버튼) — 데스크탑과 동일한 Figma export URL
 */

import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  type CSSProperties,
} from 'react'
import { Link } from '@/i18n/navigation'
import type { HeroPost } from './HomeHeroSection'

/** SSR 경고 없이 클라이언트에선 layout effect 사용 */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/* ──────────────────────────────────────────────────────────
 * 에셋 (웹과 동일)
 * ────────────────────────────────────────────────────────── */
const ASSET = {
  /** 알약 버튼 안 nwcn 워드마크 (데스크탑 HomeHeroSection 과 동일 URL) */
  wordmark: 'https://www.figma.com/api/mcp/asset/80ba2d54-e549-4cbc-9849-f41a331ec2ae',
  /** WORK 3D 텍스트 */
  work: '/images/home/work.png',
} as const

/* ──────────────────────────────────────────────────────────
 * 배경 NWCN 3D 낱자 — 시안 좌표를 모바일 풀블리드용 모서리 앵커로 변환
 *   anchor : 화면 모서리 기준 위치(top/left/right/bottom)
 *   w      : clamp 너비 (모든 폰 대응)
 *   rot/op : 기울기 / 기본 투명도 (시안값)
 *   scatter: 스크롤 시 흩어지는 방향·거리(px)
 *   bob    : 대기 중 둥둥 떠다니는 플로팅 키프레임
 * ────────────────────────────────────────────────────────── */
type Letter = {
  src: string
  anchor: CSSProperties
  w: string
  rot: number
  op: number
  scatter: { x: number; y: number }
  bob: 'heroFloatA' | 'heroFloatB'
  bobDur: number
  bobDelay: number
}

const LETTERS: Letter[] = [
  // N — 좌상단(가장 큼, 불투명)
  {
    src: '/images/home/letter-1.png',
    anchor: { top: '-2%', left: '-5%' },
    w: 'clamp(132px, 40vw, 200px)',
    rot: -7.5, op: 1, scatter: { x: -170, y: -140 },
    bob: 'heroFloatA', bobDur: 5.0, bobDelay: 0,
  },
  // W — 우상단
  {
    src: '/images/home/letter-3.png',
    anchor: { top: '5%', right: '-7%' },
    w: 'clamp(112px, 34vw, 174px)',
    rot: -12, op: 0.8, scatter: { x: 170, y: -120 },
    bob: 'heroFloatA', bobDur: 5.6, bobDelay: -0.9,
  },
  // C — 좌측 중하단
  {
    src: '/images/home/letter-2.png',
    anchor: { top: '49%', left: '1%' },
    w: 'clamp(116px, 35vw, 178px)',
    rot: -21.8, op: 0.4, scatter: { x: -185, y: 70 },
    bob: 'heroFloatB', bobDur: 6.4, bobDelay: -1.6,
  },
  // N — 우측 하단
  {
    src: '/images/home/letter-4.png',
    anchor: { bottom: '3%', right: '3%' },
    w: 'clamp(100px, 30vw, 150px)',
    rot: 18.8, op: 0.2, scatter: { x: 150, y: 150 },
    bob: 'heroFloatB', bobDur: 6.9, bobDelay: -2.4,
  },
]

/* 가운데 카피 (시안: 7줄, 줄마다 굵기 상이) */
const COPY_LINES: { text: string; weight: number }[] = [
  { text: 'WHEN THE', weight: 200 },
  { text: 'SENSIBILITY OF ART', weight: 800 },
  { text: 'MEETS THE', weight: 200 },
  { text: 'POWER OF', weight: 700 },
  { text: 'TECHNOLOGY,', weight: 700 },
  { text: 'NEW POSSIBILITIES', weight: 900 },
  { text: 'ARE BORN.', weight: 900 },
]

const DEFAULT_POSTS: HeroPost[] = [
  { id: 'p1', title: 'WORK 01', tag: 'NINC' },
  { id: 'p2', title: 'WORK 02', tag: 'NINC' },
  { id: 'p3', title: 'WORK 03', tag: 'NINC' },
  { id: 'p4', title: 'WORK 04', tag: 'NINC' },
]

export interface HomeHeroMobileProps {
  scrollHeight?: string
  posts?: HeroPost[]
  className?: string
}

/* 이징/보간 유틸 */
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const norm = (x: number, a: number, b: number) => clamp01((x - a) / (b - a))
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

const TEXT_COLOR = '#3a3a3b'

/* ── 타임라인 (progress 0→1) — 데스크탑과 동일한 내러티브, 구간을 겹쳐 빈 박자 제거 ── */
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
    introExit: easeInOut(norm(p, 0.0, 0.20)), // 가운데 카피 퇴장
    floatUp: easeOut(norm(p, 0.0, 0.16)),      // 낱자 살짝 떠오름
    scatter: easeInOut(norm(p, 0.05, 0.30)),   // 낱자 분산 + 페이드아웃
    workIn: easeOut(norm(p, 0.26, 0.58)),      // WORK 등장
    headingIn: easeOut(norm(p, 0.48, 0.74)),   // NWCN/슬로건 등장
    stripIn: easeOut(norm(p, 0.60, 0.94)),     // 게시물 스트립 등장 (끝까지 채움)
  }
}

/** 진행값 댐핑 시간상수(초) */
const SMOOTH_TAU = 0.075

export default function HomeHeroMobile({
  scrollHeight = '320vh',
  posts = DEFAULT_POSTS,
  className = '',
}: HomeHeroMobileProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  /* 모션 최소화 선호 — 마운트 후 결정 */
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  /* ── 애니메이션 대상 ref (imperative 적용 — React 리렌더 없이 합성만 갱신) ── */
  const lettersRef = useRef<(HTMLDivElement | null)[]>([])
  const workRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)

  /* 진행값: target(원시 스크롤) → rendered(댐핑된 값) */
  const targetRef = useRef(0)
  const renderedRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef(0)

  /** rendered progress(p)를 각 요소 style 에 직접 적용 */
  const applyStyles = useCallback((p: number) => {
    const f = computeFrame(p)

    for (let i = 0; i < LETTERS.length; i++) {
      const el = lettersRef.current[i]
      if (!el) continue
      const L = LETTERS[i]
      const tx = L.scatter.x * f.scatter
      const ty = -f.floatUp * 18 + L.scatter.y * f.scatter
      el.style.transform = `translate(${tx}px, ${ty}px)`
      el.style.opacity = `${L.op * (1 - f.scatter)}`
      el.style.filter = f.scatter > 0 ? `blur(${f.scatter * 7}px)` : ''
    }

    if (workRef.current) {
      workRef.current.style.transform = `translateX(calc(-50% + ${(1 - f.workIn) * 460}px))`
      workRef.current.style.opacity = `${f.workIn}`
      workRef.current.style.pointerEvents = f.workIn > 0.9 ? 'auto' : 'none'
    }

    if (stripRef.current) {
      stripRef.current.style.transform = `translateY(-50%) translateX(${(1 - f.stripIn) * 60}px)`
      stripRef.current.style.opacity = `${f.stripIn}`
      stripRef.current.style.pointerEvents = f.stripIn > 0.9 ? 'auto' : 'none'
    }

    if (headingRef.current) {
      headingRef.current.style.transform = `scale(${0.72 + f.headingIn * 0.28})`
      headingRef.current.style.opacity = `${f.headingIn}`
      headingRef.current.style.filter = f.headingIn < 1 ? `blur(${(1 - f.headingIn) * 10}px)` : ''
    }

    if (introRef.current) {
      introRef.current.style.transform = `translate(-50%, calc(-50% - ${f.introExit * 120}px))`
      introRef.current.style.opacity = `${1 - f.introExit}`
      introRef.current.style.filter = f.introExit > 0 ? `blur(${f.introExit * 12}px)` : ''
    }

    if (hintRef.current) hintRef.current.style.opacity = `${Math.max(0, 1 - p * 6)}`
  }, [])

  /* 단일 rAF 루프 — target 측정 + 댐핑 보간 + 적용 */
  const tick = useCallback((now: number) => {
    const dt = Math.min(0.05, (now - lastTsRef.current) / 1000 || 0)
    lastTsRef.current = now

    const el = containerRef.current
    if (el) {
      const scrollable = el.offsetHeight - window.innerHeight
      const rect = el.getBoundingClientRect()
      targetRef.current = scrollable > 0 ? clamp01(-rect.top / scrollable) : 0
    }

    const a = 1 - Math.exp(-dt / SMOOTH_TAU)
    renderedRef.current += (targetRef.current - renderedRef.current) * a
    if (Math.abs(targetRef.current - renderedRef.current) < 0.0004) {
      renderedRef.current = targetRef.current
    }

    applyStyles(renderedRef.current)

    if (renderedRef.current !== targetRef.current) {
      rafRef.current = requestAnimationFrame(tick)
    } else {
      rafRef.current = null
    }
  }, [applyStyles])

  const kick = useCallback(() => {
    if (rafRef.current != null) return
    lastTsRef.current = performance.now()
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  useEffect(() => {
    if (reducedMotion) {
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
  }, [reducedMotion, kick, applyStyles])

  /* 리렌더 직후, paint 전에 현재 진행값을 다시 적용 → 깜빡임 방지 */
  useIsoLayoutEffect(() => {
    applyStyles(reducedMotion ? 1 : renderedRef.current)
  }, [reducedMotion, applyStyles])

  /* 버튼/종료 → 하단 섹션으로 스크롤 */
  const scrollToNext = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const target = el.offsetTop + el.offsetHeight
    const lenis = (window as Window & { __lenis?: { start?: () => void; scrollTo: (t: number, o?: object) => void } }).__lenis
    lenis?.start?.()
    if (lenis?.scrollTo) lenis.scrollTo(target, { duration: 1.1, force: true })
    else window.scrollTo({ top: target, behavior: 'smooth' })
  }, [])

  /* 초기 프레임(첫 paint 값) — 모션 최소화면 최종 상태(1), 아니면 진입 상태(0) */
  const f0 = computeFrame(reducedMotion ? 1 : 0)

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height: reducedMotion ? '100dvh' : scrollHeight, overscrollBehaviorX: 'none' }}
      aria-label="히어로 섹션"
    >
      {/* ── Sticky 시각 영역 (100dvh 풀블리드) ── */}
      <div
        className="sticky top-0 w-full overflow-hidden bg-white font-body"
        style={{ height: '100dvh' }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html:
              /* translate3d 사용: GPU 컴포지터에서 합성 → Windows 서브픽셀 진동(덜덜거림) 방지 */
              '@keyframes heroFloatA{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-12px,0)}}' +
              '@keyframes heroFloatB{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-18px,0)}}' +
              '@keyframes heroWorkFloat{0%,100%{transform:translate3d(0,0,0) rotate(0deg)}50%{transform:translate3d(0,-10px,0) rotate(-1deg)}}' +
              '.hero-strip-m{-ms-overflow-style:none;scrollbar-width:none}.hero-strip-m::-webkit-scrollbar{display:none}',
          }}
        />

        {/* ── 배경 NWCN 3D 낱자 (대기 중 둥둥, 스크롤 시 분산) ── */}
        {LETTERS.map((L, i) => {
          const opacity = L.op * (1 - f0.scatter)
          const tx = L.scatter.x * f0.scatter
          const ty = -f0.floatUp * 18 + L.scatter.y * f0.scatter
          return (
            <div
              key={L.src}
              ref={(el) => { lettersRef.current[i] = el }}
              aria-hidden
              style={{
                position: 'absolute',
                ...L.anchor,
                width: L.w,
                transform: `translate(${tx}px, ${ty}px)`,
                opacity,
                ...(f0.scatter > 0 ? { filter: `blur(${f0.scatter * 7}px)` } : null),
                zIndex: 10,
                pointerEvents: 'none',
                willChange: 'transform, opacity',
              }}
            >
              <div style={{ transform: `rotate(${L.rot}deg)` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={L.src}
                  alt=""
                  aria-hidden
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    animation: `${L.bob} ${L.bobDur}s ease-in-out ${L.bobDelay}s infinite`,
                    /* 애니메이션 요소를 독립 GPU 레이어로 승격 → 픽셀 그리드 스냅(진동) 제거 */
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                />
              </div>
            </div>
          )
        })}

        {/* ── WORK 3D (우 → 좌 등장 + 둥실 플로팅) ── */}
        <div
          ref={workRef}
          style={{
            position: 'absolute',
            top: 'clamp(72px, 12%, 132px)',
            left: '50%',
            width: 'clamp(220px, 74vw, 320px)',
            transform: `translateX(calc(-50% + ${(1 - f0.workIn) * 460}px))`,
            opacity: f0.workIn,
            zIndex: 20,
            pointerEvents: f0.workIn > 0.9 ? 'auto' : 'none',
            willChange: 'transform, opacity',
          }}
        >
          <Link href="/work/showcase" aria-label="WORK 쇼케이스 보기" className="group block">
            {/* drop-shadow는 정적 부모로 분리: 애니메이션 요소에 filter가 걸리면
                Windows에서 매 프레임 그림자 재래스터로 떨림이 발생하므로 분리한다 */}
            <div
              className="transition-transform duration-300 ease-out group-hover:scale-[1.04]"
              style={{ filter: 'drop-shadow(-12px 30px 18px rgba(0,0,0,0.10))' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="WORK"
                src={ASSET.work}
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  animation: 'heroWorkFloat 6s ease-in-out infinite',
                  willChange: 'transform',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              />
            </div>
          </Link>
        </div>

        {/* ── 게시물 가로 스냅 스트립 (우측에서 슬라이드 인) ── */}
        <div
          ref={stripRef}
          className="hero-strip-m"
          style={{
            position: 'absolute',
            top: '38%',
            left: 0,
            width: '100%',
            transform: `translateY(-50%) translateX(${(1 - f0.stripIn) * 60}px)`,
            opacity: f0.stripIn,
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollSnapType: 'x mandatory',
            overscrollBehaviorX: 'contain',
            WebkitOverflowScrolling: 'touch',
            zIndex: 15,
            touchAction: 'pan-x',
            pointerEvents: f0.stripIn > 0.9 ? 'auto' : 'none',
            willChange: 'transform, opacity',
          }}
        >
          <div aria-hidden style={{ flex: 'none', width: 'calc(50% - 41.5%)' }} />
          {posts.slice(0, 4).map((post) => {
            const cardStyle: CSSProperties = {
              position: 'relative',
              display: 'block',
              width: '83vw',
              maxWidth: 340,
              aspectRatio: '325 / 183',
              flex: 'none',
              borderRadius: 14,
              background: '#d9d9d9',
              overflow: 'hidden',
              textDecoration: 'none',
              scrollSnapAlign: 'center',
            }
            const inner = (
              <>
                {post.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={post.title}
                    src={post.image}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                {post.image && (
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)' }} />
                )}
                <div style={{ position: 'absolute', inset: 0, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  {post.tag && (
                    <span style={{ alignSelf: 'flex-start', fontSize: 11, fontWeight: 600, color: '#2d2d2d', background: 'rgba(255,255,255,0.82)', borderRadius: 999, padding: '3px 10px', letterSpacing: '0.02em' }}>
                      {post.tag}
                    </span>
                  )}
                  <div>
                    <p style={{ margin: 0, fontSize: 17, fontWeight: 700, lineHeight: 1.2, color: post.image ? '#fff' : '#6f6f6f', textShadow: post.image ? '0 1px 8px rgba(0,0,0,0.4)' : 'none', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.title}
                    </p>
                    {post.subtitle && (
                      <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 500, color: post.image ? 'rgba(255,255,255,0.85)' : '#9a9a9a' }}>
                        {post.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )
            return post.href ? (
              <Link key={post.id} href={post.href} style={cardStyle} aria-label={post.title} draggable={false}>
                {inner}
              </Link>
            ) : (
              <div key={post.id} style={cardStyle}>
                {inner}
              </div>
            )
          })}
          <div aria-hidden style={{ flex: 'none', width: 'calc(50% - 41.5%)' }} />
        </div>

        {/* ── NWCN, + 슬로건 (좌하단, scale + 블러 인) ── */}
        <div
          ref={headingRef}
          style={{
            position: 'absolute',
            left: '8%',
            top: 'calc(50% + 52px)',
            transformOrigin: 'left center',
            transform: `scale(${0.72 + f0.headingIn * 0.28})`,
            opacity: f0.headingIn,
            ...(f0.headingIn < 1 ? { filter: `blur(${(1 - f0.headingIn) * 10}px)` } : null),
            zIndex: 25,
            pointerEvents: 'none',
            willChange: 'transform, opacity, filter',
          }}
        >
          <p style={{ margin: 0, fontWeight: 700, fontSize: 'clamp(20px, 6.2vw, 26px)', lineHeight: 1.2, color: TEXT_COLOR }}>NWCN,</p>
          <p style={{ margin: '8px 0 0', fontWeight: 200, fontSize: 'clamp(11px, 3.1vw, 13px)', lineHeight: 1.5, color: TEXT_COLOR }}>
            We cultivate convergence content specialists
            <br />
            who can lead the new media industry.
          </p>
        </div>

        {/* ── 가운데 카피 (상승 + 블러 + 페이드아웃) ── */}
        <div
          ref={introRef}
          style={{
            position: 'absolute',
            left: '50%',
            top: 'calc(50% - 26px)',
            width: '88%',
            transform: `translate(-50%, calc(-50% - ${f0.introExit * 120}px))`,
            opacity: 1 - f0.introExit,
            ...(f0.introExit > 0 ? { filter: `blur(${f0.introExit * 12}px)` } : null),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            color: TEXT_COLOR,
            zIndex: 30,
            pointerEvents: 'none',
            willChange: 'transform, opacity, filter',
          }}
        >
          {COPY_LINES.map((line, i) => (
            <p
              key={i}
              style={{ margin: 0, fontWeight: line.weight, fontSize: 'clamp(19px, 7.4vw, 31px)', lineHeight: 1.18, letterSpacing: '-0.01em' }}
            >
              {line.text}
            </p>
          ))}
        </div>

        {/* ── nwcn 알약 버튼 (전 구간 고정, 클릭 시 하단 스크롤) ── */}
        <button
          type="button"
          onClick={scrollToNext}
          aria-label="다음 섹션으로 이동"
          style={{
            position: 'absolute',
            left: '50%',
            top: 'calc(50% + 150px)',
            transform: 'translateX(-50%)',
            width: 181,
            height: 54,
            borderRadius: 48,
            background: 'rgba(255,255,255,0.1)',
            boxShadow: 'inset 3px 3px 4px 0 rgba(0,0,0,0.2)',
            border: 'none',
            cursor: 'pointer',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="nwcn" src={ASSET.wordmark} style={{ width: 103, height: 26, objectFit: 'contain' }} />
        </button>

        {/* ── 초기 스크롤 힌트 ── */}
        <div
          ref={hintRef}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-[50] pointer-events-none"
          style={{ opacity: reducedMotion ? 0 : 1 }}
        >
          <span className="font-body text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(58,58,59,0.7)' }}>
            Scroll
          </span>
          <div className="w-px h-7 bg-gradient-to-b from-[#3a3a3b]/50 to-transparent" />
        </div>
      </div>
    </div>
  )
}
