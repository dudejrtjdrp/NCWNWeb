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

import { useRef, useEffect, useState, useCallback, type CSSProperties, type PointerEvent as ReactPointerEvent, type MouseEvent as ReactMouseEvent } from 'react'
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

export default function HomeHeroSection({
  scrollHeight = '320vh',
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
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    updateProgress()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [onScroll, updateProgress])

  /* 게시물 가로 스냅 스트립 — 세로 스크롤과 분리.
     트랙패드 가로 스와이프/터치는 네이티브 scroll-snap 으로 한 칸씩, 마우스는 드래그로 스크롤. */
  const stripRef = useRef<HTMLDivElement>(null)
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

  /* ── 타임라인 (progress 0→1) ── */
  const p = progress
  const introExit = easeInOut(norm(p, 0.0, 0.18))     // 가운데 카피: 상승 + 블러 + 페이드아웃
  const floatUp = easeOut(norm(p, 0.0, 0.12))          // 3D 낱자: 살짝 떠오름
  const scatter = easeInOut(norm(p, 0.06, 0.28))       // 3D 낱자: 양옆 분산 + 페이드아웃
  const workIn = easeOut(norm(p, 0.34, 0.62))          // WORK: 우 → 좌 등장
  const headingIn = easeOut(norm(p, 0.50, 0.74))       // NWCN/슬로건: scale + 블러 인
  const stripIn = easeOut(norm(p, 0.62, 0.86))         // 게시물 스트립: 우측에서 슬라이드 + 페이드 인

  const scale = vw / DESIGN_W

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
              '@keyframes heroWorkFloat{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-16px) rotate(-1.2deg)}}' +
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
              position: 'absolute', top: 150, left: 470, width: 970, height: 410,
              display: 'flex', gap: CARD_GAP, alignItems: 'center',
              overflowX: 'auto', overflowY: 'hidden',
              scrollSnapType: 'x mandatory', overscrollBehaviorX: 'contain',
              transform: `translateX(${(1 - stripIn) * 240}px)`,
              opacity: stripIn, zIndex: 20, cursor: 'grab', touchAction: 'pan-x',
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
