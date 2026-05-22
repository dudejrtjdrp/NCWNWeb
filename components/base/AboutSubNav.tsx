'use client'

/**
 * BASE 컴포넌트: AboutSubNav
 * Figma node-id: 427:831
 *
 * ABOUT 섹션 내 서브 탭 내비게이션
 * - DEPARTMENT | FACULTY | CURRICULLIM | LAB
 * - 활성 탭: Bold, 하단 라인 표시
 * - 비활성 탭: Regular/Light, #888
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const ABOUT_NAV_ITEMS = [
  { label: 'DEPARTMENT', href: '/about/department' },
  { label: 'FACULTY', href: '/about/faculty' },
  { label: 'CURRICULLIM', href: '/about/curriculum' },
  { label: 'LAB', href: '/about/lab' },
]

export interface AboutSubNavProps {
  className?: string
}

export default function AboutSubNav({ className }: AboutSubNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn('flex items-center justify-center gap-[75px]', className)}
      data-node-id="427:831"
      aria-label="ABOUT 서브 메뉴"
    >
      {ABOUT_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex flex-col gap-[6px] items-center p-[10px] group transition-all duration-150',
            )}
          >
            <span
              className={cn(
                'font-body text-[24px] leading-normal',
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
  )
}
