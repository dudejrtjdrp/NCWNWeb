'use client'

/**
 * BASE 컴포넌트: CareerList
 * 교수 상세(ProfessorDetailSection)의 CAREER 목록.
 * 항목이 collapsedCount 를 초과하면 일부만 보여주고 "더보기/접기" 토글을 노출한다.
 * (Figma ABOUT/Faculty/Detail — CareerSection 스타일 준수)
 */

import { useState } from 'react'

export interface CareerListProps {
  items: string[]
  /** 이 개수를 초과하면 토글을 노출하고, 접힘 상태에서 이만큼만 보여준다 */
  collapsedCount?: number
  /** 목록 텍스트 스타일 (반응형 폰트/색상) */
  itemClassName?: string
  /** 줄 간격 (px 문자열 또는 숫자 배수) */
  lineHeight?: string | number
  /** 토글 버튼 폰트 크기 클래스 */
  buttonClassName?: string
  className?: string
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export default function CareerList({
  items,
  collapsedCount = 5,
  itemClassName,
  lineHeight,
  buttonClassName = 'text-[15px]',
  className,
}: CareerListProps) {
  const [expanded, setExpanded] = useState(false)
  const canToggle = items.length > collapsedCount
  const visible = !canToggle || expanded ? items : items.slice(0, collapsedCount)
  const hiddenCount = items.length - collapsedCount

  return (
    <div className={className}>
      <div className={itemClassName} style={lineHeight ? { lineHeight } : undefined}>
        {visible.map((item, i) => (
          <p key={i}>{item}</p>
        ))}
      </div>

      {canToggle && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className={`mt-4 inline-flex items-center gap-1.5 font-body font-semibold text-nwcn-green hover:opacity-70 transition-opacity ${buttonClassName}`}
        >
          {expanded ? '접기' : `더보기 +${hiddenCount}`}
          <Chevron open={expanded} />
        </button>
      )}
    </div>
  )
}
