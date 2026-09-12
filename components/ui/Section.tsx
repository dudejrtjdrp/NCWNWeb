/**
 * UI 프리미티브: Section
 * 섹션 상하 리듬을 3단계로 고정하고(기존 80/81/86/90/100/120/130px 혼용 대체),
 * 선택적으로 배경 패턴과 등장 애니메이션을 함께 건다.
 */

import AnimateOnScroll from '@/components/common/AnimateOnScroll'
import Container from '@/components/ui/Container'
import { cn } from '@/lib/utils'

type Spacing = 'sm' | 'md' | 'lg' | 'none'
type Tone = 'default' | 'surface' | 'dark'
type Pattern = 'none' | 'grid' | 'dots'

const spacings: Record<Spacing, string> = {
  none: '',
  sm: 'py-section-sm',
  md: 'py-section-md',
  lg: 'py-section-lg',
}

const tones: Record<Tone, string> = {
  default: 'bg-white text-nwcn-text-muted',
  surface: 'bg-nwcn-neutral-50 text-nwcn-text-muted',
  dark: 'bg-nwcn-dark text-white',
}

export default function Section({
  spacing = 'md',
  tone = 'default',
  pattern = 'none',
  container = 'page',
  animate = true,
  className,
  innerClassName,
  children,
  ...rest
}: {
  spacing?: Spacing
  tone?: Tone
  pattern?: Pattern
  /** false 면 Container 로 감싸지 않는다(풀블리드) */
  container?: 'page' | 'wide' | 'prose' | false
  animate?: boolean
  className?: string
  innerClassName?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLElement>) {
  const dark = tone === 'dark'
  const patternClass =
    pattern === 'grid'
      ? dark ? 'bg-grid-dark' : 'bg-grid'
      : pattern === 'dots'
        ? dark ? 'bg-dots-dark' : 'bg-dots'
        : ''

  const inner = container ? (
    <Container width={container} className={innerClassName}>{children}</Container>
  ) : (
    <div className={innerClassName}>{children}</div>
  )

  return (
    <section className={cn('relative isolate', spacings[spacing], tones[tone], className)} {...rest}>
      {patternClass && (
        <div aria-hidden className={cn('pointer-events-none absolute inset-0 -z-10 mask-fade-edges', patternClass)} />
      )}
      {animate ? <AnimateOnScroll variant="fade-up">{inner}</AnimateOnScroll> : inner}
    </section>
  )
}
