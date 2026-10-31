'use client'

/**
 * PortfolioBrowser — 졸업생 포트폴리오 목록 (E4)
 * 위: 분야 거르개(전체 · 영상 · 모션 …, 있는 분야만) / 아래: 졸업 연도별 묶음, 카드 4열(태블릿 3열, 휴대폰 2열).
 */

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { PortfolioListItem } from '@/lib/supabase/queries/portfolios'
import PortfolioCard from './PortfolioCard'
import { PORTFOLIO_FIELDS, portfolioYearAnchor } from './portfolio-utils'


export default function PortfolioBrowser({ items }: { items: PortfolioListItem[] }) {
  const t = useTranslations('work.portfolio')
  const [field, setField] = useState<string>('ALL')

  if (items.length === 0) {
    return <p className="mt-chapter border-y border-nwcn-dark py-6 font-bold text-statement">{t('empty')}</p>
  }

  const present = new Set(items.flatMap((p) => p.fields))
  const fields = [...PORTFOLIO_FIELDS.filter((f) => present.has(f)), ...[...present].filter((f) => !PORTFOLIO_FIELDS.includes(f))]
  const shown = field === 'ALL' ? items : items.filter((p) => p.fields.includes(field))
  const years = [...new Set(items.map((p) => p.year))].sort((a, b) => b - a)

  const tab = (active: boolean) =>
    cn(
      'relative whitespace-nowrap py-3 font-semibold text-body-sm transition-colors duration-fast ease-nwcn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark',
      active
        ? 'text-nwcn-dark after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-nwcn-dark'
        : 'text-nwcn-neutral-600 hover:text-nwcn-dark'
    )

  return (
    <>
      {fields.length > 1 && (
        <div role="group" aria-label={t('filterLabel')} className="mt-10 flex gap-5 overflow-x-auto border-y border-nwcn-dark">
          {['ALL', ...fields].map((f) => {
            const n = f === 'ALL' ? items.length : items.filter((p) => p.fields.includes(f)).length
            return (
              <button key={f} type="button" aria-pressed={field === f} onClick={() => setField(f)} className={tab(field === f)}>
                {f === 'ALL' ? t('all') : f}
                <span className="ml-1.5 font-medium tabular-nums">{n}</span>
              </button>
            )
          })}
        </div>
      )}

      {years.map((year) => {
        const list = shown.filter((p) => p.year === year)
        return (
          <section
            key={year}
            id={portfolioYearAnchor(year)}
            aria-labelledby={`${portfolioYearAnchor(year)}-t`}
            className="scroll-mt-36 pt-chapter"
          >
            <div className="mb-6 flex items-baseline justify-between gap-6">
              <h2 id={`${portfolioYearAnchor(year)}-t`} className="m-0 font-extrabold tabular-nums text-headline">
                {t('yearTitle', { year })}
              </h2>
              <p className="font-semibold tabular-nums text-body-sm">{t('count', { n: list.length })}</p>
            </div>
            {list.length ? (
              <ul className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
                {list.map((p, i) => (
                  <PortfolioCard
                    key={p.id}
                    item={p}
                    priority={i < 4}
                    labels={{ profileAlt: t('profileAlt', { name: p.name }), coverHint: t('coverHint') }}
                  />
                ))}
              </ul>
            ) : (
              <p className="border-y border-nwcn-dark py-5 text-list">{t('emptyFilter')}</p>
            )}
          </section>
        )
      })}
    </>
  )
}
