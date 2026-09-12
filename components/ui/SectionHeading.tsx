/**
 * UI 프리미티브: SectionHeading
 * 기존에 8개 페이지에 복붙돼 있던 섹션 라벨을 단일 컴포넌트로 통합.
 * 마스크 리빌(originkit "Mask Text Reveal")을 기본 모션으로 쓴다.
 */

import MaskTextReveal from '@/components/interactive/MaskTextReveal'
import { cn } from '@/lib/utils'

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'light',
  className,
  as = 'h2',
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
  className?: string
  as?: 'h1' | 'h2' | 'h3'
}) {
  const dark = tone === 'dark'
  return (
    <div className={cn('flex flex-col gap-3', align === 'center' && 'items-center text-center', className)}>
      {eyebrow && (
        <span
          className={cn(
            'font-body text-label font-medium uppercase',
            dark ? 'text-nwcn-green' : 'text-nwcn-gray-muted'
          )}
        >
          {eyebrow}
        </span>
      )}
      <MaskTextReveal
        as={as}
        direction="up"
        className={cn(
          'font-body text-section font-light',
          dark ? 'text-white' : 'text-nwcn-text-default'
        )}
      >
        {title}
      </MaskTextReveal>
      {description && (
        <p className={cn('max-w-prose font-body text-body', dark ? 'text-white/60' : 'text-nwcn-gray-text')}>
          {description}
        </p>
      )}
    </div>
  )
}
