'use client'

/**
 * 공통 컴포넌트: SubNav
 * Figma node-id: 427:831 (AboutSubNav 기준)
 *
 * 디자인 스펙:
 * - 탭 간격: gap-[75px]
 * - 활성 탭: font-bold, text-[#151515], 하단 라인 bar
 * - 비활성 탭: font-light, text-[#888], hover: text-[#444]
 * - 하단 보더: border-b border-[#e8e8e8]
 *
 * 순수 UI — pathname 기반 자동 활성 처리
 *
 * 사용처:
 *   - About: ABOUT_NAV_ITEMS (DEPARTMENT | FACULTY | CURRICULUM | LAB)
 *   - NINC: NINC_NAV_ITEMS (AWARDS | PROJECT | EVENT)
 *   - NCR Trend: NCR_NAV_ITEMS (LATEST REPORT | ARCHIVE)
 */

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export interface SubNavItem {
  label: string
  href: string
}

export interface SubNavProps {
  items: SubNavItem[]
  className?: string
}

export default function SubNav({ items, className }: SubNavProps) {
  const pathname = usePathname()

  return (
    <div
      className={cn('w-full bg-white border-b border-[#e8e8e8]', className)}
    >
      <nav
        className="max-w-[1440px] mx-auto flex justify-center items-start gap-4 sm:gap-8 lg:gap-[75px] px-2 sm:px-4 overflow-x-auto scrollbar-hide"
        aria-label="서브 메뉴"
        data-node-id="427:831"
      >
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-[6px] p-2 sm:p-[10px] flex-shrink-0 transition-all duration-150"
            >
              <span
                className={cn(
                  'font-body text-[14px] sm:text-[18px] lg:text-[24px] leading-normal whitespace-nowrap transition-colors',
                  isActive
                    ? 'font-bold text-[#151515]'
                    : 'font-light text-[#888] hover:text-[#444]'
                )}
              >
                {item.label}
              </span>

              {/* 활성 탭 하단 라인 */}
              {isActive && (
                <div
                  className="w-full h-[3px] bg-[#151515] rounded-full"
                  aria-hidden="true"
                />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
