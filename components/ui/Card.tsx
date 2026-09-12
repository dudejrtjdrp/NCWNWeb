/**
 * UI 프리미티브: Card
 * 카드 모서리/그림자/호버를 3단계로 고정한다.
 * (기존 shadow-2xl / shadow-[0_28px_52px] / hover:shadow-sm 혼용 대체)
 */

import Link from 'next/link'
import { cn } from '@/lib/utils'

type Radius = 'sm' | 'md' | 'lg'
type Elevation = 0 | 1 | 2
type Hover = 'lift' | 'zoom' | 'none'

const radii: Record<Radius, string> = {
  sm: 'rounded-lg',
  md: 'rounded-card',
  lg: 'rounded-panel',
}

const elevations: Record<Elevation, string> = {
  0: '',
  1: 'shadow-lift-1',
  2: 'shadow-lift-2',
}

const hovers: Record<Hover, string> = {
  none: '',
  lift: 'hover:-translate-y-1 hover:shadow-lift-3',
  zoom: 'hover:scale-[1.02] hover:shadow-lift-2',
}

export default function Card({
  href,
  radius = 'md',
  elevation = 0,
  hover = 'lift',
  className,
  children,
}: {
  href?: string
  radius?: Radius
  elevation?: Elevation
  hover?: Hover
  className?: string
  children: React.ReactNode
}) {
  const classes = cn(
    'group relative block overflow-hidden bg-white',
    'transition-[transform,box-shadow] duration-base ease-nwcn will-change-transform',
    radii[radius],
    elevations[elevation],
    href && hovers[hover],
    href && 'focus-ring',
    className
  )

  if (href) {
    return href.startsWith('http') ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>{children}</a>
    ) : (
      <Link href={href} className={classes}>{children}</Link>
    )
  }
  return <div className={classes}>{children}</div>
}
