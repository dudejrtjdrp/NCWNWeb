'use client';

/**
 * SmoothScrollProvider
 *
 * Lenis 기반 부드러운 스크롤 구현.
 * lerp(선형 보간) 값으로 스크롤이 목표 위치를 살짝 "쫓아오는" 관성 효과 부여.
 *
 * lerp: 0.08 → 묵직하게 밀리는 느낌
 * lerp: 0.10 → 살짝 부드러운 느낌 (현재 설정 — 관성과 반응성의 균형)
 * lerp: 0.20 → 거의 즉각 반응
 *
 * 자연스러운 감각을 위한 추가 설정:
 *   - easing: easeOutExpo — 휠 한 번에 부드럽게 가속→감속하며 정착(스텝감 제거)
 *   - wheelMultiplier 1.0 / touchMultiplier 1.5 — 과하지 않은 감도
 *
 * prefers-reduced-motion: 스무딩을 끄고 네이티브 스크롤 사용(멀미·접근성 고려).
 *   → 이때 window.__lenis 는 없으며, 이를 쓰는 쪽은 window.scrollTo 로 폴백한다.
 *
 * ⚠️ HomeHeroSection의 sticky + scroll 이벤트는 Lenis가
 *    window scroll 이벤트를 그대로 emit하므로 호환됩니다.
 */

import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

/** easeOutExpo — 빠르게 시작해 끝에서 길게 감속(부드러운 정착) */
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [reduced, setReduced] = useState(false);

  /* 모션 최소화 선호 감지(변경에도 반응) */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    // 모션 최소화: Lenis 미초기화 → 네이티브 스크롤
    if (reduced) return;

    const lenis = new Lenis({
      lerp: 0.1,            // 관성 강도 (낮을수록 더 많이 밀림)
      easing: easeOutExpo,  // 휠 단위 이동의 가속/감속 곡선
      smoothWheel: true,    // 마우스 휠 스무딩
      wheelMultiplier: 1.0, // 휠 감도
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
      if (typeof window !== 'undefined') {
        delete (window as Window & { __lenis?: Lenis }).__lenis;
      }
    };
  }, [reduced]);

  return <>{children}</>;
}
