'use client'

import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  navItems: NavItem[]
  pathname: string
}

export default function MobileMenu({ isOpen, onClose, navItems, pathname }: MobileMenuProps) {
  /* 닫혀 있을 땐 inert — 화면 밖 드로어의 링크로 Tab 포커스가 새지 않게.
     React 18 은 inert 를 모르는 속성으로 다뤄 boolean 을 버리므로 DOM 에 직접 건다. */
  const drawerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = drawerRef.current
    if (!el) return
    if (isOpen) el.removeAttribute('inert')
    else el.setAttribute('inert', '')
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      document.addEventListener('keydown', onKeyDown)
      return () => {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', onKeyDown)
      }
    }
    document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen, onClose])

  return (
    <>
      {/* 오버레이 */}
      <div
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-base ease-nwcn',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* 드로어 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="모바일 메뉴"
        aria-hidden={!isOpen}
        ref={drawerRef}
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-80 bg-nwcn-dark-2 border-l border-white/10 transition-transform duration-base ease-nwcn',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <Link href="/" onClick={onClose} aria-label="NWCN 홈으로">
            <Image
              src="/images/common/newcon-logo.svg"
              alt="NWCN"
              width={36}
              height={32}
              unoptimized
            />
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white transition-colors duration-fast ease-nwcn"
            aria-label="메뉴 닫기"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="p-6 space-y-6 overflow-y-auto h-[calc(100%-80px)]">
          {navItems.map((item) => (
            <div key={item.label}>
              <p className="font-body text-caption font-semibold tracking-widest text-nwcn-green mb-3">
                {item.label}
              </p>
              <div className="space-y-1">
                {item.children?.map((child) => (
                  <Link
                    key={child.label}
                    href={child.href}
                    onClick={onClose}
                    className={cn(
                      'block px-3 py-2 font-body text-body-sm rounded-lg transition-colors duration-fast ease-nwcn',
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
          ))}
        </nav>
      </div>
    </>
  )
}
