'use client'

/**
 * UI 프리미티브: Modal
 * ────────────────────────────────────────────────────────────
 * originkit 계열 인터랙션 톤(배경 블러 + 스케일 인)을 따르는 접근성 모달.
 *  - Esc / 배경 클릭으로 닫기
 *  - 포커스 트랩 + 열기 전 포커스 복원
 *  - 열려 있는 동안 배경 스크롤 잠금(Lenis 포함)
 *  - prefers-reduced-motion 이면 애니메이션 생략
 */

import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  /** 모달 폭 */
  size?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
  children: React.ReactNode
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  full: 'max-w-[min(96vw,1200px)]',
}

export default function Modal({ open, onClose, title, size = 'md', className, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      )
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (!open) return
    restoreTo.current = document.activeElement as HTMLElement | null

    const { body, documentElement: html } = document
    const prevOverflow = body.style.overflow
    body.style.overflow = 'hidden'
    html.classList.add('lenis-stopped')

    document.addEventListener('keydown', onKeyDown, true)
    // 패널 진입 시 첫 포커스 대상으로 이동
    const t = window.setTimeout(() => {
      const panel = panelRef.current
      const target = panel?.querySelector<HTMLElement>(FOCUSABLE) ?? panel
      target?.focus()
    }, 0)

    return () => {
      window.clearTimeout(t)
      document.removeEventListener('keydown', onKeyDown, true)
      body.style.overflow = prevOverflow
      html.classList.remove('lenis-stopped')
      restoreTo.current?.focus?.()
    }
  }, [open, onKeyDown])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8">
      {/* 배경 */}
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-nwcn-dark/60 backdrop-blur-md animate-fade-in"
      />

      {/* 패널 */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'relative max-h-[88vh] w-full overflow-y-auto rounded-panel bg-white shadow-lift-3 outline-none',
          'animate-modal-in',
          sizes[size],
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="focus-ring absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/80 text-nwcn-text-default backdrop-blur transition-colors duration-fast ease-nwcn hover:bg-nwcn-text-default hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        {title && (
          <h2 className="px-6 pt-6 font-body text-section font-semibold text-nwcn-text-default sm:px-8 sm:pt-8">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>,
    document.body
  )
}
