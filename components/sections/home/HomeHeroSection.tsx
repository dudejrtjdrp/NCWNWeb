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
 * 구현:
 *   - {scrollHeight} 높이 컨테이너로 스크롤을 "캡처"
 *   - 내부 시각 영역은 position: sticky, height: 100vh (흰 배경)
 *   - 1440×725 디자인 좌표를 그대로 쓰는 stage 를 뷰포트 너비에 맞춰 scale
 *   - scrollProgress(0→1) 로 각 요소 transform/opacity/blur 제어
 *
 * ⚠️ 3D 이미지(에셋)는 현재 Figma 임시 export URL(약 7일 유효)을 사용합니다.
 *    추후 /public/images/home 으로 내려받아 ASSET 경로만 교체하면 됩니다.
 */

import { useRef, useEffect, useState, useCallback, type CSSProperties } from 'react'
import { Link } from '@/i18n/navigation'

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

const CARD_W = 668
const CARD_H = 376
const CARD_GAP = 48

export interface HomeHeroSectionProps {
  /** 스크롤 캡처 길이 (기본 520vh — 인트로/WORK + 휠 스텝 캐러셀) */
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

export default function HomeHeroSection({
  scrollHeight = '520vh',
  posts = DEFAULT_POSTS,
  className = '',
}: HomeHeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0) // 0 ~ 1
  const [vw, setVw] = useState(DESIGN_W)
  const rafRef = useRef<number | null>(null)

  /* 스크롤 진행률 계산 */
  const updateProgress = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const scrollable = containerRef.current.offsetHeight - window.innerHeight
    if (scrollable > 0) {
      setProgress(clamp01(-rect.top / scrollable))
    }
    rafRef.current = null
  }, [])

  const onScroll = useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(updateProgress)
  }, [updateProgress])

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth)
    onResize()
    // 히어로 영역에서 가로 스와이프(트랙패드) → 브라우저 앞/뒤로가기 차단.
    // 가로 우세 휠만 preventDefault, 세로 휠은 통과시켜 스크롤 애니메이션 유지.
    const el = containerRef.current
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.preventDefault()
    }
    el?.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    updateProgress()
    return () => {
      el?.removeEventListener('wheel', onWheel)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [onScroll, updateProgress])

  /* 가로 캐러셀: 한 번의 휠 제스처 = 카드 한 칸.
     구간(0.50~0.95) 안에서는 Lenis 관성을 멈추고 휠 방향으로 한 칸씩 스냅,
     양 끝에서는 다시 자유 스크롤로 빠져나간다(위→인트로/아래→다음 섹션). */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    // 터치 기기는 휠 이벤트가 없어 Lenis 정지 시 멈출 수 있으므로 스텝 비활성(자유 스크롤)
    if (window.matchMedia?.('(pointer: coarse)').matches) return
    type LenisLike = {
      stop: () => void
      start: () => void
      scrollTo: (t: number, o?: { duration?: number; force?: boolean }) => void
    }
    const getLenis = () => (window as Window & { __lenis?: LenisLike }).__lenis
    const nSegL = Math.max(1, Math.min(posts.length, 4))
    const Z0 = 0.5
    const Z1 = 0.95
    let inZone = false
    let step = 1
    let gestureActive = false   // 이번 제스처(플릭)에서 이미 한 칸 이동했는가
    let stepLockUntil = 0       // 스텝 간 최소 간격(애니메이션 시간) 보장
    let suppressUntil = 0       // 이탈 직후 재진입 방지
    let gestureTimer: ReturnType<typeof setTimeout> | null = null

    const metrics = () => {
      const scrollable = el.offsetHeight - window.innerHeight
      const rect = el.getBoundingClientRect()
      const docTop = rect.top + window.scrollY
      const p = scrollable > 0 ? clamp01((window.scrollY - docTop) / scrollable) : 0
      return { scrollable, docTop, p }
    }
    const yForStep = (k: number) => {
      const { scrollable, docTop } = metrics()
      return docTop + (Z0 + (k / nSegL) * (Z1 - Z0)) * scrollable
    }
    const animTo = (y: number, dur: number) => {
      const lenis = getLenis()
      if (lenis?.scrollTo) lenis.scrollTo(y, { duration: dur, force: true })
      else window.scrollTo({ top: y })
    }
    // 휠이 멎고 일정 시간 뒤에 제스처 종료로 간주 → 다음 한 칸 허용
    const armGestureEnd = (ms: number) => {
      if (gestureTimer) clearTimeout(gestureTimer)
      gestureTimer = setTimeout(() => { gestureActive = false }, ms)
    }

    // 진입/이탈 감지 (관성 진입 시 Lenis 정지)
    const onZoneScroll = () => {
      if (Date.now() < suppressUntil) return
      const { p } = metrics()
      const within = p > Z0 - 0.004 && p < Z1 + 0.004
      if (within && !inZone) {
        inZone = true
        getLenis()?.stop()
        const approx = Math.round(((p - Z0) / (Z1 - Z0)) * nSegL)
        step = Math.min(nSegL, Math.max(1, approx || 1))
        gestureActive = true            // 진입 제스처로는 카드 스텝하지 않음
        stepLockUntil = Date.now() + 650
        armGestureEnd(300)
        animTo(yForStep(step), 0.4)
      } else if (!within && inZone) {
        inZone = false
        getLenis()?.start()
      }
    }
    // 휠 = 한 제스처당 한 칸
    const onZoneWheel = (e: WheelEvent) => {
      if (!inZone) return
      e.preventDefault()
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return // 가로 제스처 무시
      getLenis()?.stop()                                   // 방어적으로 관성 정지 유지
      armGestureEnd(260)                                   // 휠이 계속되는 동안(관성 꼬리 포함) 제스처 유지
      if (gestureActive || Date.now() < stepLockUntil) return
      gestureActive = true
      stepLockUntil = Date.now() + 650
      const dir = e.deltaY > 0 ? 1 : -1
      const next = step + dir
      const { docTop, scrollable } = metrics()
      if (next < 1) {                      // 위로 이탈 → 자유 스크롤 복귀
        inZone = false; suppressUntil = Date.now() + 800
        getLenis()?.start()
        animTo(docTop + (Z0 - 0.03) * scrollable, 0.4)
        return
      }
      if (next > nSegL) {                  // 아래로 이탈 → 다음 섹션
        inZone = false; suppressUntil = Date.now() + 800
        getLenis()?.start()
        animTo(docTop + scrollable + 2, 0.55)
        return
      }
      step = next
      animTo(yForStep(step), 0.5)
    }

    window.addEventListener('scroll', onZoneScroll, { passive: true })
    window.addEventListener('wheel', onZoneWheel, { passive: false })
    return () => {
      window.removeEventListener('scroll', onZoneScroll)
      window.removeEventListener('wheel', onZoneWheel)
      if (gestureTimer) clearTimeout(gestureTimer)
      getLenis()?.start()
    }
  }, [posts.length])

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

  /* ── 타임라인 (progress 0→1) — 전체적으로 더 느리게, 단계 사이 텀 부여 ── */
  const p = progress
  const introExit = easeInOut(norm(p, 0.0, 0.15))    // 가운데 카피: 상승 + 블러 + 페이드아웃
  const floatUp = easeOut(norm(p, 0.0, 0.10))         // 3D 낱자: 살짝 떠오름
  const scatter = easeInOut(norm(p, 0.05, 0.22))      // 3D 낱자: 양옆 분산 + 페이드아웃
  // (0.22 → 0.27 짧은 텀: NWCN 이 사라진 뒤 WORK 등장 전)
  const workIn = easeOut(norm(p, 0.27, 0.47))         // WORK: 우 → 좌 등장
  const headingIn = easeOut(norm(p, 0.37, 0.55))      // NWCN/슬로건: scale + 블러 인
  const cardsAppear = easeOut(norm(p, 0.46, 0.56))    // 게시물 페이드 인

  const scale = vw / DESIGN_W

  /* 게시물 트랙 — 카드별 "포커스(정착)" 지점으로 스냅
     (오른쪽 등장 → 부드럽게 정착 → 살짝 달라붙음 → 좌측 페이드아웃하며 다음 카드) */
  const pitch = CARD_W + CARD_GAP
  const nCards = Math.min(posts.length, 4)
  const lastIndex = nCards - 1
  const focusCenterX = DESIGN_W - 40 - CARD_W / 2              // 카드 정착 중심 X(≈1066, 마지막 카드 안착점)
  const focusTrackX = (i: number) => focusCenterX - CARD_W / 2 - i * pitch
  // 정착 지점들: [입장 시작(오른쪽 밖), 카드0 포커스, 카드1 포커스, ...]
  const STOPS = [focusTrackX(0) + 760, ...Array.from({ length: nCards }, (_, i) => focusTrackX(i))]
  const nSeg = Math.max(1, STOPS.length - 1)
  const HOLD = 0                                               // 스텝 스냅이 정착을 담당 → 0(구간마다 매끄럽게 이동)
  const cc = clamp01(norm(p, 0.50, 0.95)) * nSeg
  const segI = Math.min(nSeg - 1, Math.floor(cc))
  const segF = cc - segI
  // 구간의 앞 (1-HOLD) 동안만 부드럽게 이동해 포커스에 도달, 나머지는 그 자리에 달라붙어 정지
  const segMoved = segF <= 1 - HOLD ? easeInOut(segF / (1 - HOLD)) : 1
  const trackX = STOPS[segI] + ((STOPS[segI + 1] ?? STOPS[segI]) - STOPS[segI]) * segMoved

  // 게시물 사라지는 기준선: 화면 중앙 + 50px(스크린) → stage 좌표로 환산 (반응형)
  // DESIGN_W/2(=720) 는 어느 너비에서나 화면 정중앙. 50px 는 scale 로 나눠 보정.
  const fadeCenterX = DESIGN_W / 2 + 50 / scale
  const FADE_SPAN = 300

  /* 초기 스크롤 힌트 페이드 */
  const hintOpacity = Math.max(0, 1 - p * 6)

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height: scrollHeight, overscrollBehaviorX: 'none' }}
      aria-label="히어로 섹션"
    >
      {/* ── Sticky 시각 영역 ── */}
      <div className="sticky top-0 w-full overflow-hidden bg-white" style={{ height: '100vh' }}>
        {/* 낱자 대기 플로팅 키프레임 */}
        <style
          dangerouslySetInnerHTML={{
            __html:
              '@keyframes heroFloatA{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}' +
              '@keyframes heroFloatB{0%,100%{transform:translateY(0)}50%{transform:translateY(-23px)}}' +
              '@keyframes heroWorkFloat{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-16px) rotate(-1.2deg)}}',
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
          {LETTERS.map((L) => {
            const opacity = L.op * (1 - scatter)
            const tx = L.scatter.x * scatter
            const ty = -floatUp * 26 + L.scatter.y * scatter
            return (
              <div
                key={L.src}
                style={{
                  position: 'absolute', left: L.cx, top: L.cy, width: L.w,
                  transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`,
                  opacity, filter: scatter > 0 ? `blur(${scatter * 8}px)` : 'none',
                  zIndex: 10, pointerEvents: 'none', willChange: 'transform, opacity',
                }}
              >
                <div style={{ transform: `rotate(${L.rot}deg)` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={L.src} alt="" aria-hidden
                    style={{
                      display: 'block', width: '100%', height: 'auto',
                      animation: `${L.bob} ${L.bobDur}s ease-in-out ${L.bobDelay}s infinite`,
                    }}
                  />
                </div>
              </div>
            )
          })}

          {/* ── 게시물 캐러셀 (우 → 좌) ── */}
          <div
            style={{
              position: 'absolute', top: 165, left: 0, height: CARD_H,
              display: 'flex', gap: CARD_GAP,
              transform: `translateX(${trackX}px)`,
              opacity: cardsAppear, zIndex: 20, willChange: 'transform',
            }}
          >
            {posts.slice(0, 4).map((post, i) => {
              // 카드 중심의 화면상 X (stage 좌표). 중앙(720)보다 왼쪽으로 오면
              // opacity↓ · scale↓ · blur↑ 로 사라짐 (왼쪽 끝까지 가지 않음)
              const centerX = i * pitch + trackX + CARD_W / 2
              // 마지막 카드는 오른쪽 유지. 나머지는 화면 중앙+50px(fadeCenterX)에서
              // 완전히 사라지도록 그 우측 구간(FADE_SPAN)에서 opacity↓·scale↓·blur↑
              const fadeT = i === lastIndex ? 0 : clamp01((fadeCenterX + FADE_SPAN - centerX) / FADE_SPAN)
              const cardStyle: CSSProperties = {
                position: 'relative', display: 'block', width: CARD_W, height: CARD_H, flex: 'none',
                borderRadius: 20, background: '#d9d9d9', overflow: 'hidden', textDecoration: 'none',
                transformOrigin: 'center center',
                transform: `scale(${1 - 0.35 * fadeT})`,
                opacity: 1 - fadeT,
                filter: fadeT > 0 ? `blur(${fadeT * 16}px)` : 'none',
                pointerEvents: fadeT > 0.5 ? 'none' : undefined,
                willChange: 'transform, opacity, filter',
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
                <Link key={post.id} href={post.href} className="group" style={cardStyle} aria-label={post.title}>
                  {inner}
                </Link>
              ) : (
                <div key={post.id} className="group" style={cardStyle}>
                  {inner}
                </div>
              )
            })}
          </div>

          {/* ── WORK 3D (우 → 좌 등장 + 둥실둥실 플로팅 + hover 인터랙션) ── */}
          <div
            style={{
              position: 'absolute', left: 76, top: 110, width: 732,
              transform: `translateX(${(1 - workIn) * 1500}px)`,
              opacity: workIn, zIndex: 30, willChange: 'transform, opacity',
              pointerEvents: workIn > 0.9 ? 'auto' : 'none',
            }}
          >
            <Link href="/work/showcase" aria-label="WORK 쇼케이스 보기" className="group" style={{ display: 'block' }}>
              <div className="transition-transform duration-300 ease-out group-hover:scale-[1.04]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="WORK" src={ASSET.work}
                  style={{
                    display: 'block', width: '100%', height: 'auto',
                    animation: 'heroWorkFloat 6s ease-in-out infinite',
                    filter: 'drop-shadow(-18px 46px 22px rgba(0,0,0,0.10))',
                  }}
                />
              </div>
            </Link>
          </div>

          {/* ── NWCN, + 슬로건 (scale + 블러 인) ── */}
          <div
            style={{
              position: 'absolute', left: 126, top: 430, width: 760,
              transformOrigin: 'left center',
              transform: `scale(${0.62 + headingIn * 0.38})`,
              opacity: headingIn, filter: `blur(${(1 - headingIn) * 12}px)`,
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
            style={{
              position: 'absolute', left: '50%', top: 283, width: DESIGN_W - 94, height: 360,
              transform: `translate(-50%, calc(-50% - ${introExit * 150}px))`,
              opacity: 1 - introExit, filter: `blur(${introExit * 14}px)`,
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
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[60] pointer-events-none"
          style={{ opacity: hintOpacity }}
        >
          <span className="font-body text-[11px] tracking-[0.2em] text-[#3a3a3b]/70 uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#3a3a3b]/50 to-transparent" />
        </div>

        {/* ── 진행률 디버그 (dev only) ── */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-20 right-4 z-[60] bg-black/50 text-white text-xs px-2 py-1 rounded font-mono">
            {Math.round(progress * 100)}%
          </div>
        )}
      </div>
    </div>
  )
}
