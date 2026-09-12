/**
 * UI 프리미티브: Container
 * 사이트 전역 가로 폭·좌우 거터를 한 곳에서 관리한다.
 * (기존 max-w-[1440px] + lg:px-[79px/80px/87px/98px/106px] 인라인 19곳 대체)
 */

import { cn } from '@/lib/utils'

type Width = 'page' | 'wide' | 'prose' | 'full'

const widths: Record<Width, string> = {
  page: 'max-w-page',
  wide: 'max-w-wide',
  prose: 'max-w-prose',
  full: 'max-w-none',
}

export default function Container({
  width = 'page',
  className,
  children,
  as: Tag = 'div',
}: {
  width?: Width
  className?: string
  children: React.ReactNode
  as?: React.ElementType
}) {
  return (
    <Tag className={cn('mx-auto w-full px-4 sm:px-8 lg:px-20', widths[width], className)}>
      {children}
    </Tag>
  )
}
