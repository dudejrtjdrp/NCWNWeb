/**
 * UI 컴포넌트: Badge
 * Figma node-id: 91:71 (Badge)
 *
 * 디자인 스펙:
 * - New: #09F593 bg, rounded-full, Pretendard Bold 12px, #050505 text
 * - Hot: #E3E94D bg, 동일
 * - Number: #151515 bg, white text, 동일
 * - 공통: px-[8px] py-[2px], rounded-[99px]
 *
 * 하위 호환 variant:
 * - 'green' → New 스타일
 * - 'yellow' → Hot 스타일
 * - 'outline' → Number 스타일 (dark)
 * - 'gray' → Number 스타일 (dark)
 */

import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  /** Figma: 'new' | 'hot' | 'number' / 하위호환: 'green' | 'yellow' | 'outline' | 'gray' */
  variant?: 'new' | 'hot' | 'number' | 'green' | 'yellow' | 'outline' | 'gray'
  className?: string
}

export default function Badge({ children, variant = 'new', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-[8px] py-[2px] rounded-[99px]',
        'font-body font-bold text-[12px] leading-normal whitespace-nowrap',
        {
          // Figma 스펙
          'bg-nwcn-green text-nwcn-text-default': variant === 'new' || variant === 'green',
          'bg-nwcn-yellow text-nwcn-text-default': variant === 'hot' || variant === 'yellow',
          'bg-nwcn-dark text-white': variant === 'number' || variant === 'outline' || variant === 'gray',
        },
        className
      )}
      data-node-id="91:71"
    >
      {children}
    </span>
  )
}
