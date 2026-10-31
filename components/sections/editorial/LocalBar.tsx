'use client'

/**
 * LocalBar — 에디토리얼(E4) 서브페이지 상단 줄
 * 왼쪽: 현재 위치(SECTION › 현재 페이지) / 오른쪽: 같은 메뉴의 하위 페이지, 현재 페이지는 검정 블록.
 * 상세 페이지(/work/abc…)에서도 상위 탭이 현재로 잡히도록 경로 앞부분으로 비교한다.
 */

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export interface LocalBarItem {
  href: string
  label: string
}

export interface LocalBarProps {
  section: LocalBarItem
  items: LocalBarItem[]
  labels: { breadcrumb: string; menu: string }
  /** 경로로 알 수 없는 경우(예: 작품 상세) 현재로 표시할 항목의 href */
  currentHref?: string
}

export default function LocalBar({ section, items, labels, currentHref }: LocalBarProps) {
  const pathname = usePathname()
  const isCurrent = (href: string) =>
    currentHref ? href === currentHref : pathname === href || pathname.startsWith(`${href}/`)
  const current = items.find((item) => isCurrent(item.href))

  return (
    <div
      data-no-reveal
      className="editorial-container flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3 font-semibold text-body-sm tracking-wide"
    >
      <nav aria-label={labels.breadcrumb}>
        <ol className="flex items-center gap-2">
          <li>
            <Link href={section.href} className="editorial-link">
              {section.label}
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          {current && <li aria-current="page">{current.label}</li>}
        </ol>
      </nav>

      <nav aria-label={labels.menu} className="-mx-2 max-w-full overflow-x-auto scrollbar-hide">
        <ul className="flex gap-1 px-2">
          {items.map((item) => {
            const active = isCurrent(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'block whitespace-nowrap px-2 py-1 transition-colors duration-fast ease-nwcn',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark focus-visible:ring-offset-2 focus-visible:ring-offset-nwcn-paper',
                    active ? 'bg-nwcn-dark text-nwcn-paper' : 'editorial-link'
                  )}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
