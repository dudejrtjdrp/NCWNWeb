'use client'

/**
 * UI 컴포넌트: Pagination
 * NWCN 디자인 토큰 기반 범용 페이지네이션
 *
 * 디자인 스펙:
 * - 페이지 번호 버튼: 36×36px, rounded-full, border #050505
 * - 활성 페이지: bg-nwcn-text-default, text-white
 * - 비활성: bg-transparent, text-nwcn-text-default, hover: bg → text-white
 * - 이전/다음: 화살표, disabled 시 opacity-30
 *
 * 순수 UI — state는 부모에서 관리 (usePagination 훅과 함께 사용)
 *
 * 사용처: ninc/awards, ninc/project, ninc/event, work/showcase, work/archive 등
 */

import { cn } from '@/lib/utils'

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav
      className={cn('flex items-center justify-center gap-2 py-12', className)}
      aria-label="페이지네이션"
    >
      {/* 이전 */}
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center border border-nwcn-text-default rounded-full font-body text-[14px] text-nwcn-text-default transition-colors hover:bg-nwcn-text-default hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="이전 페이지"
      >
        ←
      </button>

      {/* 페이지 번호 */}
      {pages.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onPageChange(n)}
          className={cn(
            'w-9 h-9 flex items-center justify-center border rounded-full font-body text-[14px] transition-colors',
            n === page
              ? 'bg-nwcn-text-default text-white border-nwcn-text-default'
              : 'border-nwcn-text-default text-nwcn-text-default hover:bg-nwcn-text-default hover:text-white'
          )}
          aria-current={n === page ? 'page' : undefined}
          aria-label={`${n} 페이지`}
        >
          {n}
        </button>
      ))}

      {/* 다음 */}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="w-9 h-9 flex items-center justify-center border border-nwcn-text-default rounded-full font-body text-[14px] text-nwcn-text-default transition-colors hover:bg-nwcn-text-default hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="다음 페이지"
      >
        →
      </button>
    </nav>
  )
}
