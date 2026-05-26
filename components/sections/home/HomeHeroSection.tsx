'use client'

/**
 * 섹션 컴포넌트: HomeHeroSection (홈 전용)
 * Figma node-id: 376:635 (RivePlaceholder_hero-banner)
 *
 * 스크롤 UX:
 * 1. 진입 시 전체 화면 그린 패널이 고정 표시
 * 2. 스크롤하면 화면은 고정된 채 좌/우 패널이 벌어지는 애니메이션 진행
 * 3. 역스크롤 시 역재생 지원
 * 4. 애니메이션 완료 후 자연스럽게 하단 섹션으로 스크롤 이동
 *
 * 구현:
 * - 300vh 높이 컨테이너로 스크롤 "캡처"
 * - 내부 시각 요소는 position: sticky, height: 100vh
 * - scrollProgress (0→1)로 패널 transform 제어
 *
 * ⚠️  주의: sections/HeroSection.tsx (텍스트 히어로)와 다른 컴포넌트
 */

import { useRef, useEffect, useState, useCallback } from 'react'

export interface HomeHeroSectionProps {
  /** 스크롤 캡처 길이 (기본 300vh) */
  scrollHeight?: string
  className?: string
}

export default function HomeHeroSection({
  scrollHeight = '300vh',
  className = '',
}: HomeHeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0) // 0 ~ 1

  // 스크롤 진행률 계산 (requestAnimationFrame으로 성능 최적화)
  const rafRef = useRef<number | null>(null)

  const updateProgress = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const scrollable = containerRef.current.offsetHeight - window.innerHeight
    if (scrollable <= 0) return
    const scrolled = -rect.top
    const p = Math.max(0, Math.min(1, scrolled / scrollable))
    setProgress(p)
    rafRef.current = null
  }, [])

  const onScroll = useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(updateProgress)
  }, [updateProgress])

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    updateProgress()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [onScroll, updateProgress])

  // 이징 함수 — ease-in-out cubic
  const easeInOut = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

  // 패널 분리: progress 0→0.85 구간에서 애니메이션 완료
  const animProgress = easeInOut(Math.min(progress / 0.85, 1))

  // 패널 이동량 (100% = 완전히 화면 밖)
  const panelOffset = animProgress * 100

  // 중앙 콘텐츠 페이드 인
  const contentOpacity = Math.max(0, (animProgress - 0.3) / 0.7)

  // 패널 위 로고 페이드 아웃
  const logoOpacity = Math.max(0, 1 - animProgress * 2.5)

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height: scrollHeight }}
      aria-label="히어로 섹션"
    >
      {/* ── Sticky 시각 영역 ── */}
      <div
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: '100vh' }}
      >
        {/* ── 좌측 그린 패널 ── */}
        <div
          className="absolute inset-y-0 left-0 w-1/2 will-change-transform z-30"
          style={{
            background: 'conic-gradient(from 90deg at 100% 50%, #09F593 0%, #07C274 50%, #058F56 100%)',
            transform: `translateX(-${panelOffset}%)`,
          }}
        />

        {/* ── 우측 그린 패널 ── */}
        <div
          className="absolute inset-y-0 right-0 w-1/2 will-change-transform z-30"
          style={{
            background: 'conic-gradient(from 270deg at 0% 50%, #09F593 0%, #07C274 50%, #058F56 100%)',
            transform: `translateX(${panelOffset}%)`,
          }}
        />

        {/* ── 패널 위: NWCN 로고 (초기 상태) ── */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
          style={{ opacity: logoOpacity }}
        >
          <div className="text-center select-none">
            {/* 로고는 Figma 에셋으로 교체 필요 — 현재는 텍스트 fallback */}
            <p
              className="font-brand text-white leading-none"
              style={{ fontSize: 'clamp(48px, 8vw, 96px)' }}
            >
              NWCN
            </p>
          </div>
        </div>

        {/* ── 패널 뒤: 드러나는 콘텐츠 (배경) ── */}
        {/* ── 배경 솔리드 (패널 뒤에 위치, 전체 화면) ── */}
        <div
          className="absolute inset-0 z-0"
          style={{ background: '#003f8a' }}
        />

        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{ opacity: contentOpacity }}
        >
          {/* Rive 애니메이션 영역 — 추후 Rive 컴포넌트로 교체 */}
          <div className="w-full h-full flex items-center justify-center">
            {/* 유기적 형태 시각 힌트 */}
            <div
              className="rounded-full"
              style={{
                width: `${400 + animProgress * 200}px`,
                height: `${400 + animProgress * 200}px`,
                background: 'radial-gradient(circle, rgba(9,245,147,0.08) 0%, transparent 70%)',
                transform: `scale(${0.5 + animProgress * 0.5})`,
                opacity: contentOpacity,
              }}
            />
          </div>
        </div>

        {/* ── 하단 스크롤 인디케이터 (초기 상태) ── */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 pointer-events-none"
          style={{ opacity: Math.max(0, 1 - progress * 5) }}
        >
          <span
            className="font-body text-[11px] tracking-[0.2em] text-white/80 uppercase"
          >
            Scroll
          </span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-white/60 to-transparent" />
        </div>

        {/* ── 진행률 디버그 (dev only, 배포 시 제거) ── */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-20 right-4 z-50 bg-black/50 text-white text-xs px-2 py-1 rounded font-mono">
            {Math.round(progress * 100)}%
          </div>
        )}
      </div>

      {/* ── 슬라이드 배너 (Figma: #151515, 70px) ── */}
      <div
        className="sticky bottom-0 w-full z-20 pointer-events-none"
        style={{
          height: '70px',
          background: '#151515',
          opacity: animProgress,
          marginTop: '-70px',
        }}
      />
    </div>
  )
}
