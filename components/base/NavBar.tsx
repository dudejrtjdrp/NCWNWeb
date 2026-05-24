'use client'

/**
 * BASE 컴포넌트: NavBar
 * Figma node-id: 376:517
 *
 * 디자인 스펙:
 * - 높이: 64px / 배경: white
 * - 로고: 중앙 정렬 (NWCN 이미지)
 * - 메뉴: 우측 정렬, Pretendard Regular 16px, color #323131
 * - 상단 고정 (fixed)
 */

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const NWCN_LOGO_URL = '/images/common/newcon-logo.png'

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

export interface NavBarProps {
  className?: string
  /** 스크롤에 따라 배경 전환 (기본: true) */
  transparent?: boolean
}

export default function NavBar({ className, transparent = false }: NavBarProps) {
  const pathname = usePathname()
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!transparent) return
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [transparent])

  const isTopSection = (href: string) =>
    pathname.startsWith('/' + href.split('/')[1])

  return (
    <>
      {/* ── 데스크탑 NavBar ── */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-colors duration-200',
          transparent && !scrolled ? 'bg-transparent' : 'bg-white',
          className
        )}
        style={{ height: '64px' }}
        data-node-id="376:517"
      >
        <div className="relative h-full max-w-[1440px] mx-auto">
          {/* 로고 — Figma: 중앙 정렬 */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href="/" aria-label="NWCN 홈">
              <div className="relative w-[90px] h-[24px]">
                <Image
                  src={NWCN_LOGO_URL}
                  alt="NWCN"
                  fill
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
            </Link>
          </div>

          {/* 메뉴 — Figma: 우측 정렬, left:882px (1440 기준) */}
          <nav
            className="hidden lg:flex absolute top-1/2 -translate-y-1/2 items-center"
            style={{ right: '79px' }}
          >
            {NAV_ITEMS.map((item) => {
              const active = isTopSection(item.href)
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {/* MenuItem — Figma: px-12 py-8 */}
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2',
                      'font-body font-normal text-[16px] leading-normal whitespace-nowrap',
                      'transition-colors duration-150',
                      active
                        ? 'text-nwcn-green'
                        : 'text-[#323131] hover:text-nwcn-green'
                    )}
                    data-node-id="I376:355;347:196"
                  >
                    {item.label}
                  </Link>

                  {/* 드롭다운 */}
                  {item.children && (
                    <div
                      className={cn(
                        'absolute top-full left-0 pt-1 transition-all duration-150',
                        activeDropdown === item.label
                          ? 'opacity-100 translate-y-0 pointer-events-auto'
                          : 'opacity-0 -translate-y-1 pointer-events-none'
                      )}
                    >
                      <div className="bg-white border border-gray-100 rounded-lg shadow-md overflow-hidden min-w-max">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className={cn(
                              'block px-4 py-2.5 font-body text-[13px] whitespace-nowrap',
                              'transition-colors duration-100',
                              pathname === child.href
                                ? 'text-nwcn-green bg-nwcn-green/5'
                                : 'text-[#323131] hover:text-nwcn-green hover:bg-gray-50'
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
            className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 flex flex-col gap-[5px]"
            onClick={() => setMobileOpen(true)}
            aria-label="메뉴 열기"
          >
            <span className="w-6 h-[1.5px] bg-[#323131] block" />
            <span className="w-6 h-[1.5px] bg-[#323131] block" />
            <span className="w-4 h-[1.5px] bg-[#323131] block ml-auto" />
          </button>
        </div>
      </header>

      {/* ── 모바일 드로어 ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full w-72 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100">
              <Link href="/" onClick={() => setMobileOpen(false)}>
                <span className="font-brand text-xl text-[#050505]">NWCN</span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="메뉴 닫기"
                className="p-2 text-[#323131]"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M14 4L4 14M4 4l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-4">
              {NAV_ITEMS.map((item) => (
                <div key={item.label} className="mb-4">
                  <p className="font-body text-[11px] font-semibold tracking-widest text-nwcn-green px-2 mb-2">
                    {item.label}
                  </p>
                  {item.children?.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'block px-2 py-2 font-body text-[14px] rounded-md transition-colors',
                        pathname === child.href
                          ? 'text-nwcn-green bg-nwcn-green/5'
                          : 'text-[#323131] hover:bg-gray-50'
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
