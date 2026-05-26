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
  duration?: number;    // ms 단위 지속시간 (기본 600ms)
  className?: string;
  style?: React.CSSProperties;
  as?: ElementType;
  threshold?: number;
  once?: boolean;
}

const variantStyles: Record<AnimationVariant, { hidden: string; visible: string }> = {
  'fade-up': {
    hidden: 'opacity-0 translate-y-8',
    visible: 'opacity-100 translate-y-0',
  },
  'fade-down': {
    hidden: 'opacity-0 -translate-y-8',
    visible: 'opacity-100 translate-y-0',
  },
  'fade-left': {
    hidden: 'opacity-0 translate-x-8',
    visible: 'opacity-100 translate-x-0',
  },
  'fade-right': {
    hidden: 'opacity-0 -translate-x-8',
    visible: 'opacity-100 translate-x-0',
  },
  'fade': {
    hidden: 'opacity-0',
    visible: 'opacity-100',
  },
  'zoom-in': {
    hidden: 'opacity-0 scale-95',
    visible: 'opacity-100 scale-100',
  },
  'none': {
    hidden: '',
    visible: '',
  },
};

export default function AnimateOnScroll({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 600,
  className,
  style,
  as: Tag = 'div',
  threshold = 0.15,
  once = true,
}: AnimateOnScrollProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold, once });
  const animStyles = variantStyles[variant];

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={cn(
        'transition-all ease-out will-change-transform',
        isVisible ? animStyles.visible : animStyles.hidden,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: isVisible ? `${delay}ms` : '0ms',
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
