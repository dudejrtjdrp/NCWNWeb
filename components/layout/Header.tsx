'use client'

/**
 * 글로벌 Header 컴포넌트 (통합)
 *
 * variant 옵션:
 *   - "light"       → 흰 배경, 다크 텍스트 (서브 페이지 기본)  ← Figma node-id: 376:517
 *   - "dark"        → 다크 배경, 흰 텍스트 (다크 테마 페이지)
 *   - "transparent" → 초기 투명, 스크롤 시 흰 배경으로 전환 (홈 히어로 위)
 *
 * 높이: 64px (Figma 스펙)
 * 로고: 중앙 정렬 (Figma 스펙)
 * 메뉴: 우측 정렬 (right: 79px, Figma 스펙)
 */

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import MobileMenu from './MobileMenu'
import LocaleSwitcher from '@/components/common/LocaleSwitcher'
import { NAV_ITEMS } from '@/constants/nav-items'

export type HeaderVariant = 'light' | 'dark' | 'transparent'

export interface HeaderProps {
  variant?: HeaderVariant
  className?: string
}

/** 인라인 SVG 로고 — 이미지 파일 의존 없이 렌더링 (Figma NavBar NWCN 텍스트 로고) */
function NwcnLogo() {
  return (
    <svg
      width="90"
      height="24"
      viewBox="0 0 90 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="NWCN"
    >
      <text
        x="0"
        y="20"
        fontFamily="'A2z', 'Arial Black', sans-serif"
        fontWeight="900"
        fontSize="22"
        fill="#09F593"
        letterSpacing="-0.5"
      >
        NWCN
      </text>
    </svg>
  )
}

export default function Header({ variant = 'light', className }: HeaderProps) {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // transparent 모드에서만 스크롤 감지
  useEffect(() => {
    if (variant !== 'transparent') return
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [variant])

  // 현재 경로가 해당 최상위 섹션에 속하는지 확인
  const isTopSection = (href: string) =>
    pathname.startsWith('/' + href.split('/')[1])

  /* ── 테마 상태 계산 ── */
  const isLight = variant === 'light' || (variant === 'transparent' && scrolled)
  const isDark = variant === 'dark' || (variant === 'transparent' && !scrolled)

  return (
    <>
      {/* ── 데스크탑 Header ── */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-colors duration-200',
          isLight && 'bg-white',
          variant === 'dark' && 'bg-nwcn-dark/95 backdrop-blur-md border-b border-white/10',
          variant === 'transparent' && !scrolled && 'bg-transparent',
          className
        )}
        style={{ height: '64px' }}
        data-node-id="376:517"
      >
        <div className="relative h-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px]">
          {/* 로고 — Figma: 중앙 정렬 */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href="/" aria-label={t('home')}>
              <NwcnLogo />
            </Link>
          </div>

          {/* 메뉴 — 우측 정렬 (page-container 패딩 기반) */}
          <nav
            className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-[79px] items-center"
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
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2',
                      'font-body font-normal text-[16px] leading-normal whitespace-nowrap',
                      'transition-colors duration-150',
                      active
                        ? 'text-nwcn-green'
                        : isLight
                          ? 'text-[#323131] hover:text-nwcn-green'
                          : 'text-white/70 hover:text-white'
                    )}
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
                      <div className={cn(
                        'border rounded-lg overflow-hidden min-w-max',
                        isLight
                          ? 'bg-white border-gray-100 shadow-md'
                          : 'bg-nwcn-dark-2 border-white/10 shadow-xl shadow-black/50'
                      )}>
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className={cn(
                              'block px-4 py-2.5 font-body text-[13px] whitespace-nowrap',
                              'transition-colors duration-100',
                              pathname === child.href
                                ? 'text-nwcn-green bg-nwcn-green/5'
                                : isLight
                                  ? 'text-[#323131] hover:text-nwcn-green hover:bg-gray-50'
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

          {/* 언어 전환 버튼 (데스크탑) */}
          <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 left-[79px]">
            <LocaleSwitcher isLight={isLight} />
          </div>

          {/* 모바일 햄버거 */}
          <button
            className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 flex flex-col gap-[5px]"
            onClick={() => setMobileOpen(true)}
            aria-label={t('openMenu')}
          >
            <span className={cn('w-6 h-[1.5px] block', isLight ? 'bg-[#323131]' : 'bg-white')} />
            <span className={cn('w-6 h-[1.5px] block', isLight ? 'bg-[#323131]' : 'bg-white')} />
            <span className={cn('w-4 h-[1.5px] block ml-auto', isLight ? 'bg-[#323131]' : 'bg-white')} />
          </button>
        </div>
      </header>

      {/* 모바일 드로어 */}
      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navItems={NAV_ITEMS}
        pathname={pathname}
      />
    </>
  )
}
