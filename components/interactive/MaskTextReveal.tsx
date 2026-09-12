'use client'

/**
 * MaskTextReveal — clip-path 마스크 텍스트 등장
 * ────────────────────────────────────────────────────────────
 * originkit.dev 의 "Mask Text Reveal" 을 의존성 없이 구현.
 * 뷰포트에 들어오는 순간 지정한 방향에서 마스크가 걷히며 글자가 드러난다.
 * prefers-reduced-motion 이면 즉시 표시한다.
 */

import { useEffect, useRef, useState, type ElementType } from 'react'
import { cn } from '@/lib/utils'

type Direction = 'up' | 'down' | 'left' | 'right' | 'center-horizontal' | 'center-vertical'

const HIDDEN: Record<Direction, string> = {
  up: 'inset(100% 0 0 0)',
  down: 'inset(0 0 100% 0)',
  left: 'inset(0 0 0 100%)',
  right: 'inset(0 100% 0 0)',
  'center-horizontal': 'inset(0 50% 0 50%)',
  'center-vertical': 'inset(50% 0 50% 0)',
}
const SHOWN = 'inset(0 0 0 0)'

export interface MaskTextRevealProps {
  children: React.ReactNode
  as?: ElementType
  direction?: Direction
  /** ms */
  delay?: number
  duration?: number
  className?: string
}

export default function MaskTextReveal({
  children,
  as: Tag = 'span',
  direction = 'up',
  delay = 0,
  duration = 700,
  className,
}: MaskTextRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.25, rootMargin: '0px 0px -8% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={cn('inline-block', className)}
      style={{
        clipPath: shown ? SHOWN : HIDDEN[direction],
        WebkitClipPath: shown ? SHOWN : HIDDEN[direction],
        transition: `clip-path ${duration}ms var(--ease-nwcn) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  )
}
