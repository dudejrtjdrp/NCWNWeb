'use client'

/**
 * BASE 컴포넌트: CareerColumn
 * 교수 상세(ProfessorDetailSection)의 우측 컬럼.
 * CAREER + 추가 이력(PUBLICATION/PERFORMANCE/EXHIBITION/JOURNAL)을
 * "하나의 연속된 목록"으로 취급한다.
 *
 * ─ 더보기 동작 ───────────────────────────────────────────────
 *  · 섹션별 토글이 아니라 컬럼 전체에 단 하나의 더보기/접기.
 *  · 접힘 상태: CAREER 부터 순서대로 collapsedCount 개의 "항목"만 노출
 *    (헤더는 항목 수에 포함하지 않음). 예산이 소진되면 그 아래 섹션은 숨김.
 *  · 전체 항목 수가 collapsedCount 이하이면 토글을 노출하지 않는다(기존 동작 유지).
 * ──────────────────────────────────────────────────────────── */

import { useState } from 'react'

export interface CareerSection {
  label: string
  items: string[]
}

export interface CareerColumnProps {
  /** 순서대로 렌더 — 보통 [CAREER, ...extraSections] */
  sections: CareerSection[]
  /** 접힘 상태에서 노출할 "항목" 총 개수 (헤더 제외) */
  collapsedCount?: number
  variant?: 'desktop' | 'mobile'
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

/* ── variant 별 스타일 (기존 ProfessorDetailSection 값 그대로) ── */
const STYLES = {
  desktop: {
    column: 'flex flex-col',
    columnStyle: { rowGap: 'clamp(28px, 3.13vw, 45px)' } as React.CSSProperties,
    section: 'w-full flex flex-col gap-[21px] items-end',
    label: 'font-body font-extrabold text-[26.261px] text-nwcn-green leading-normal w-full',
    list: 'w-full font-body font-normal text-[20px] text-[#050505]',
    listStyle: { lineHeight: '34.467px' } as React.CSSProperties,
    button: 'text-[17px]',
  },
  mobile: {
    column: 'flex flex-col gap-8',
    columnStyle: undefined as React.CSSProperties | undefined,
    section: 'flex flex-col gap-3',
    label: 'font-body font-extrabold text-[20px] text-nwcn-green leading-normal',
    list: 'font-body font-normal text-[14px] text-[#050505]',
    listStyle: { lineHeight: 1.75 } as React.CSSProperties,
    button: 'text-[14px]',
  },
} as const

export default function CareerColumn({
  sections,
  collapsedCount = 5,
  variant = 'desktop',
  className,
}: CareerColumnProps) {
  const [expanded, setExpanded] = useState(false)
  const s = STYLES[variant]

  const total = sections.reduce((acc, sec) => acc + sec.items.length, 0)
  const canToggle = total > collapsedCount
  const showAll = expanded || !canToggle
  const hiddenCount = total - collapsedCount

  /* 전역 예산(collapsedCount)으로 섹션별 노출 항목 수를 계산 */
  let budget = collapsedCount
  const rendered = sections
    .map((sec) => {
      const visible = showAll ? sec.items : sec.items.slice(0, Math.max(0, budget))
      if (!showAll) budget -= visible.length
      return { label: sec.label, visible }
    })
    .filter((sec) => sec.visible.length > 0)

  return (
    <div className={`${s.column} ${className ?? ''}`} style={s.columnStyle}>
      {rendered.map((sec, idx) => (
        <div key={sec.label} className={s.section}>
          <p className={s.label}>{sec.label}</p>
          <div className={s.list} style={s.listStyle}>
            {sec.visible.map((item, i) => (
              <p key={i}>{item}</p>
            ))}
          </div>

          {/* 컬럼 전체에 단 하나의 더보기/접기 — 마지막으로 노출된 섹션 하단에 배치 */}
          {canToggle && idx === rendered.length - 1 && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className={`self-start inline-flex items-center gap-1.5 font-body font-semibold text-nwcn-green hover:opacity-70 transition-opacity ${s.button}`}
            >
              {expanded ? '접기' : `더보기 +${hiddenCount}`}
              <Chevron open={expanded} />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
