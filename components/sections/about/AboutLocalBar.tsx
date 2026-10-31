'use client'

/**
 * AboutLocalBar — 학과 소개(ABOUT) 서브페이지 상단 줄 (E4)
 * 왼쪽: 현재 위치(ABOUT › 학과 소개) / 오른쪽: ABOUT 하위 메뉴, 현재 페이지는 검정 블록.
 * 기존 SubNav(가운데 정렬 탭 + 둥근 밑줄)를 에디토리얼 톤으로 대체한다.
 */

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { ABOUT_NAV_ITEMS } from '@/constants/nav-items'
import { cn } from '@/lib/utils'

type AboutKey = 'department' | 'faculty' | 'curriculum' | 'lab'

const KEY_BY_HREF: Record<string, AboutKey> = {
  '/about/department': 'department',
  '/about/faculty': 'faculty',
  '/about/curriculum': 'curriculum',
  '/about/lab': 'lab',
}

export default function AboutLocalBar() {
  const t = useTranslations('about.nav')
  const pathname = usePathname()
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const current = ABOUT_NAV_ITEMS.find((item) => isCurrent(item.href))
  const label = (href: string) => {
    const key = KEY_BY_HREF[href]
    return key ? t(key) : href
  }

  return (
    <div
      data-no-reveal
      className="editorial-container flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3 font-semibold text-body-sm tracking-wide"
    >
      <nav aria-label={t('breadcrumb')}>
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/about/department" className="editorial-link">
              {t('section')}
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          {current && <li aria-current="page">{label(current.href)}</li>}
        </ol>
      </nav>

      <nav aria-label={t('menu')} className="-mx-2 max-w-full overflow-x-auto scrollbar-hide">
        <ul className="flex gap-1 px-2">
          {ABOUT_NAV_ITEMS.map((item) => {
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
                  {label(item.href)}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
