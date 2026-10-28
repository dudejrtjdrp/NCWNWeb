'use client';

import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useScrollAnimation({
  threshold = 0.15,
  // 뷰포트 하단보다 살짝 일찍 트리거 → 스크롤과 등장 사이 "빈 박자" 감소
  rootMargin = '0px 0px -12% 0px',
  once = true,
}: UseScrollAnimationOptions = {}) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 모션 최소화 선호 시: 애니메이션 없이 즉시 표시(가려짐 방지)
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsVisible(true);
      return;
    }

    /* 요소가 뷰포트보다 길면 교차 비율이 threshold 에 영원히 못 미친다
       (예: 9000px 본문 / 720px 화면 → 최대 0.08). 요소 높이에 맞춰 낮춘다. */
    const maxRatio = el.offsetHeight > 0
      ? Math.min(1, window.innerHeight / el.offsetHeight)
      : 1
    const effectiveThreshold = Math.min(threshold, maxRatio * 0.8)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: effectiveThreshold, rootMargin }
    );

    observer.observe(el);

    /* 안전장치 — 관찰자가 어떤 이유로든 안 잡히면 내용이 opacity 0 으로 영구히 가려진다.
       2초 뒤에도 안 보이는데 이미 화면 안(또는 위)에 있는 요소라면 강제로 드러낸다.
       아직 아래쪽에 있는 요소는 그대로 두어 스크롤 등장 연출을 유지한다. */
    const failsafe = window.setTimeout(() => {
      const top = el.getBoundingClientRect().top;
      if (top < window.innerHeight) setIsVisible(true);
    }, 2000);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}
