/**
 * BASE 컴포넌트: Tag
 * Figma node-id: 91:79 (Tag)
 *
 * 디자인 스펙:
 * - Primary: #09F593 bg, Pretendard Bold 12px, #050505 text, px-[10px] py-1
 * - Secondary: #E3E94D bg, 동일
 * - Neutral: #e0e0e0 bg, 동일
 * - Dark: #151515 bg, white text, 동일
 * - TALKS: #09F593 bg, Pretendard Medium 16.88px, drop-shadow, px-1 py-0.5
 * - Contents: #E3E94D bg, 동일 스펙
 *
 * 사용처:
 * - NcrTrendSection의 카테고리 태그 (TALKS, Contents)
 * - Showcase 필터 태그
 * - 게시물 카테고리 분류
 */

import { cn } from '@/lib/utils'

export type TagType = 'primary' | 'secondary' | 'neutral' | 'dark' | 'talks' | 'contents'

export interface TagProps {
  children: React.ReactNode
  type?: TagType
  className?: string
}

const TAG_STYLES: Record<TagType, string> = {
  primary: 'bg-nwcn-green px-[10px] py-1',
  secondary: 'bg-nwcn-yellow px-[10px] py-1',
  neutral: 'bg-nwcn-neutral-200 px-[10px] py-1',
  dark: 'bg-nwcn-dark px-[10px] py-1',
  talks: 'bg-nwcn-green px-1 py-0.5 drop-shadow-sm',
  contents: 'bg-nwcn-yellow px-1 py-0.5 drop-shadow-sm',
}

const TAG_TEXT_STYLES: Record<TagType, string> = {
  primary: 'font-body font-bold text-caption text-nwcn-text-default',
  secondary: 'font-body font-bold text-caption text-nwcn-text-default',
  neutral: 'font-body font-bold text-caption text-nwcn-text-default',
  dark: 'font-body font-bold text-caption text-white',
  talks: 'font-body font-medium text-card text-nwcn-text-default',
  contents: 'font-body font-medium text-card text-nwcn-text-default',
}

export default function Tag({ children, type = 'primary', className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        TAG_STYLES[type],
        className
      )}
      data-node-id="91:79"
    >
      <span className={cn('whitespace-nowrap leading-normal', TAG_TEXT_STYLES[type])}>
        {children}
      </span>
    </span>
  )
}
