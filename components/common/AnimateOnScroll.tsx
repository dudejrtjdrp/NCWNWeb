'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import React, { ElementType, ReactNode } from 'react';

type AnimationVariant =
  | 'fade-up'       // 아래에서 위로 페이드인 (기본)
  | 'fade-down'     // 위에서 아래로 페이드인
  | 'fade-left'     // 오른쪽에서 왼쪽으로 페이드인
  | 'fade-right'    // 왼쪽에서 오른쪽으로 페이드인
  | 'fade'          // 단순 페이드인
  | 'zoom-in'       // 살짝 확대되며 등장
  | 'none';         // 애니메이션 없음

interface AnimateOnScrollProps {
  children: ReactNode;
  variant?: AnimationVariant;
  delay?: number;       // ms 단위 딜레이
  duration?: number;    // ms 단위 지속시간 (기본 700ms)
  className?: string;
  style?: React.CSSProperties;
  as?: ElementType;
  threshold?: number;
  once?: boolean;
}

/* 숨김 상태(이동 거리 24px 등)는 globals.css 의 [data-aos] 규칙이 맡는다.
   클래스 대신 data 속성으로 두는 이유: 하이드레이션 전에 도는 인라인 스크립트
   (app/layout.tsx 의 AOS_EARLY_SCRIPT)가 첫 화면 요소에 data-aos-early 를 붙여
   JS 번들을 기다리지 않고 바로 보이게 하기 위해서다 (모바일 LCP 렌더 지연 수 초 감소). */

/* 부드럽게 안착하는 easeOutQuint 계열 커브 — 일반 ease-out보다 끝에서 더 우아하게 정착 */
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export default function AnimateOnScroll({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 700,
  className,
  style,
  as: Tag = 'div',
  threshold = 0.15,
  once = true,
}: AnimateOnScrollProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold, once });

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={cn(className)}
      data-aos={variant}
      data-aos-state={isVisible ? 'in' : 'out'}
      data-aos-once={once ? undefined : 'false'}
      style={{
        transitionProperty: 'opacity, transform',
        transitionTimingFunction: EASE,
        transitionDuration: `${duration}ms`,
        transitionDelay: isVisible ? `${delay}ms` : '0ms',
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
