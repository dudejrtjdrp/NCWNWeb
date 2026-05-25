'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import MobileMenu from './MobileMenu'

const NAV_ITEMS = [
  {
    label: 'WORK',
    href: '/work/showcase',
    children: [
      { label: 'SHOWCASE', href: '/work/showcase' },
      { label: 'ARCHIVE', href: '/work/archive' },
    ],
  },
  {
    label: 'ABOUT',
    href: '/about/department',
    children: [
      { label: 'DEPARTMENT', href: '/about/department' },
      { label: 'FACULTY', href: '/about/faculty' },
      { label: 'CURRICULUM', href: '/about/curriculum' },
      { label: 'LAB', href: '/about/lab' },
    ],
  },
  {
    label: 'NINC',
    href: '/ninc/awards',
    children: [
      { label: 'AWARDS', href: '/ninc/awards' },
      { label: 'PROJECT', href: '/ninc/project' },
      { label: 'EVENT', href: '/ninc/event' },
    ],
  },
  {
    label: 'NCR TREND',
    href: '/ncr-trend/latest',
    children: [
      { label: 'LATEST REPORT', href: '/ncr-trend/latest' },
      { label: 'ARCHIVE', href: '/ncr-trend/archive' },
    ],
  },
  {
    label: 'INFO',
    href: '/info/admission',
    children: [
      { label: 'ADMISSION', href: '/info/admission' },
      { label: 'CONTACT', href: '/info/contact' },
      { label: 'PRIVACY', href: '/info/privacy' },
    ],
  },
]

export default function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-nwcn-dark/95 backdrop-blur-md border-b border-white/10'
            : 'bg-transparent'
        )}
      >
        <div className="page-container">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* 로고 */}
            <Link
              href="/"
              className="flex items-center hover:opacity-80 transition-opacity duration-200"
              aria-label="NWCN 홈으로"
            >
              <Image
                src="/images/common/newcon-logo.png"
                alt="NWCN"
                width={36}
                height={32}
                priority
                unoptimized
              />
            </Link>

            {/* 데스크탑 네비게이션 */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href.split('/').slice(0, 2).join('/'))
                return (
                  <div
                    key={item.label}
                    className="relative group"
                    onMouseEnter={() => setActiveMenu(item.label)}
                    onMouseLeave={() => setActiveMenu(null)}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'px-4 py-2 font-body text-sm font-medium tracking-wide transition-colors duration-200 rounded-md',
                        isActive
                          ? 'text-nwcn-green'
                          : 'text-white/70 hover:text-white'
                      )}
                    >
                      {item.label}
                    </Link>

                    {/* 드롭다운 */}
                    {item.children && (
                      <div
                        className={cn(
                          'absolute top-full left-0 pt-2 transition-all duration-200',
                          activeMenu === item.label
                            ? 'opacity-100 translate-y-0 pointer-events-auto'
                            : 'opacity-0 -translate-y-2 pointer-events-none'
                        )}
                      >
                        <div className="bg-nwcn-dark-2 border border-white/10 rounded-xl overflow-hidden min-w-[160px] shadow-xl shadow-black/50">
                          {item.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              className={cn(
                                'block px-4 py-3 font-body text-xs font-medium tracking-wider transition-colors duration-150',
                                pathname === child.href
                                  ? 'text-nwcn-green bg-nwcn-green/10'
                                  : 'text-white/60 hover:text-white hover:bg-white/5'
                              )}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* 모바일 햄버거 */}
            <button
              className="lg:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setMobileOpen(true)}
              aria-label="메뉴 열기"
            >
              <span className="w-6 h-0.5 bg-white block" />
              <span className="w-6 h-0.5 bg-white block" />
              <span className="w-4 h-0.5 bg-white block ml-auto" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navItems={NAV_ITEMS}
        pathname={pathname}
      />
    </>
  )
}
