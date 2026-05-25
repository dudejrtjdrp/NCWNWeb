'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
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
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* 오버레이 */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* 드로어 */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-80 bg-nwcn-dark-2 border-l border-white/10 transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <Link href="/" onClick={onClose} aria-label="NWCN 홈으로">
            <Image
              src="/images/common/newcon-logo.png"
              alt="NWCN"
              width={36}
              height={32}
              unoptimized
            />
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white transition-colors"
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
              <p className="font-body text-xs font-semibold tracking-widest text-nwcn-green mb-3">
                {item.label}
              </p>
              <div className="space-y-1">
                {item.children?.map((child) => (
                  <Link
                    key={child.label}
                    href={child.href}
                    onClick={onClose}
                    className={cn(
                      'block px-3 py-2 font-body text-sm rounded-lg transition-colors duration-150',
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
