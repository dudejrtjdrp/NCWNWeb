/**
 * BASE 컴포넌트: NincPagination
 * Figma 명시적 디자인 없음 — NWCN 디자인 토큰 기반 구현
 *
 * 디자인 스펙:
 * - 페이지 번호 버튼: 36×36px, rounded-full, border #050505
 * - 활성 페이지: bg-nwcn-text-default, text-white
 * - 비활성: bg-transparent, text-nwcn-text-default, hover: bg-nwcn-text-default text-white
 * - 이전/다음 버튼: 화살표 아이콘 포함, disabled 상태 opacity-30
 *
 * 'use client' — onPageChange 이벤트 핸들러 전달
 * 기능 로직 없음 (순수 UI, state는 부모에서 관리)
 */

'use client'

export interface NincPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export default function NincPagination({
  page,
  totalPages,
  onPageChange,
  className = '',
}: NincPaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav
      className={`flex items-center justify-center gap-2 py-12 ${className}`}
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
          className={`w-9 h-9 flex items-center justify-center border rounded-full font-body text-[14px] transition-colors ${
            n === page
              ? 'bg-nwcn-text-default text-white border-nwcn-text-default'
              : 'border-nwcn-text-default text-nwcn-text-default hover:bg-nwcn-text-default hover:text-white'
          }`}
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
