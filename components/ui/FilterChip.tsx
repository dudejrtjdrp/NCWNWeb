'use client'

/**
 * UI 프리미티브: FilterChip / FilterGroup
 * 기존에 4벌(FilterBar · ArchiveClient · ShowcaseClient · EventClient)로
 * 흩어져 있던 필터 칩 스펙을 하나로 통합한다.
 */

import { cn } from '@/lib/utils'

export function FilterChip({
  active,
  children,
  className,
  ...props
}: { active?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'focus-ring inline-flex items-center whitespace-nowrap rounded-full border px-4 py-2',
        'font-body text-body-sm font-medium',
        'transition-[color,background-color,border-color] duration-fast ease-nwcn',
        active
          ? 'border-nwcn-text-default bg-nwcn-text-default text-white'
          : 'border-nwcn-border-light bg-white text-nwcn-gray-text hover:border-nwcn-text-default hover:text-nwcn-text-default',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function FilterGroup({
  label,
  className,
  children,
}: {
  label?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} role="group" aria-label={label}>
      {children}
    </div>
  )
}

export default FilterChip
