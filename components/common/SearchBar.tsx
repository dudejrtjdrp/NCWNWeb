'use client'

/**
 * 공통 컴포넌트: SearchBar
 * Figma node-id: 280:409 (NINC 검색바 기준)
 *
 * 디자인 스펙:
 * - 최대 너비: 1011px, 높이: 47px
 * - 테두리: border-black, rounded-full (pill)
 * - 포커스: border-nwcn-green
 * - 폰트: Pretendard 16px
 *
 * 순수 UI — state는 부모에서 관리 (useFilter 훅과 함께 사용 권장)
 *
 * 사용처: NincCardGrid, 추후 work/showcase, ncr-trend 등
 */

import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** 접근성: aria-label (기본 "검색") */
  label?: string
  /** 최대 너비 (기본 max-w-wide) */
  maxWidth?: string
  className?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder,
  label,
  maxWidth = 'max-w-wide',
  className,
}: SearchBarProps) {
  const t = useTranslations('common')
  const resolvedPlaceholder = placeholder ?? t('searchPlaceholder')
  const resolvedLabel = label ?? t('search')
  return (
    <div className={cn('flex justify-center px-4', className)}>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={resolvedPlaceholder}
        className={cn(
          'h-[47px] w-full rounded-full px-6',
          'border border-nwcn-text-default bg-white',
          'font-body text-body text-nwcn-text-default placeholder:text-nwcn-text-sub',
          'transition-[border-color,box-shadow] duration-fast ease-nwcn',
          'hover:border-nwcn-green-darker',
          'outline-none focus:border-nwcn-green focus-visible:ring-2 focus-visible:ring-nwcn-green/40',
          maxWidth
        )}
        aria-label={resolvedLabel}
      />
    </div>
  )
}
