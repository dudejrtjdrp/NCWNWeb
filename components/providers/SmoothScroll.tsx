'use client';

/**
 * SmoothScrollProvider
 *
 * Lenis 기반 부드러운 스크롤 구현.
 * lerp(선형 보간) 값으로 스크롤이 목표 위치를 살짝 "쫓아오는" 관성 효과 부여.
 *
 * lerp: 0.08 → 묵직하게 밀리는 느낌
 * lerp: 0.12 → 살짝 부드러운 느낌 (현재 설정)
 * lerp: 0.2  → 거의 즉각 반응
 *
 * ⚠️ HomeHeroSection의 sticky + scroll 이벤트는 Lenis가
 *    window scroll 이벤트를 그대로 emit하므로 호환됩니다.
 */

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,           // 관성 강도 (낮을수록 더 많이 밀림)
      smoothWheel: true,   // 마우스 휠 스무딩
      touchMultiplier: 1.5, // 모바일 터치 감도
      infinite: false,
    });

    lenisRef.current = lenis;

    // Lenis 루프 — requestAnimationFrame으로 매 프레임 업데이트
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // 전역 접근용 (외부에서 lenis.stop() 등 제어 필요 시)
    if (typeof window !== 'undefined') {
      (window as Window & { __lenis?: Lenis }).__lenis = lenis;
    }

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
