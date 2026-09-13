'use client'

/**
 * UI 프리미티브: Toast
 * ────────────────────────────────────────────────────────────
 * 앱 전역 토스트. 루트 레이아웃에서 <ToastProvider> 로 감싸고
 * 어디서든 const toast = useToast() → toast.success('저장했습니다') 로 호출한다.
 *
 * - 화면 우측 하단 스택, 기본 3.2초 후 자동 소멸
 * - role="status" + aria-live="polite" 로 스크린리더 안내
 * - 모션 최소화 환경에서는 등장 애니메이션 없이 즉시 표시
 */

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

type ToastTone = 'default' | 'success' | 'error'

interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

interface ToastApi {
  show: (message: string, tone?: ToastTone) => void
  success: (message: string) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast 는 <ToastProvider> 안에서만 사용할 수 있습니다.')
  return ctx
}

const tones: Record<ToastTone, string> = {
  default: 'bg-nwcn-dark text-white',
  success: 'bg-nwcn-green text-nwcn-dark',
  error: 'bg-nwcn-danger text-white',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const seq = useRef(0)
  const [mounted, setMounted] = useState(false)

  // 포털 대상이 준비된 뒤에만 렌더 (SSR 안전)
  if (typeof window !== 'undefined' && !mounted) {
    queueMicrotask(() => setMounted(true))
  }

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (message: string, tone: ToastTone = 'default') => {
      const id = ++seq.current
      setItems((prev) => [...prev.slice(-2), { id, message, tone }])
      window.setTimeout(() => remove(id), 3200)
    },
    [remove]
  )

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (m: string) => show(m, 'success'),
      error: (m: string) => show(m, 'error'),
    }),
    [show]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted &&
        createPortal(
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-none fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-2"
          >
            {items.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => remove(t.id)}
                className={cn(
                  'pointer-events-auto max-w-[min(88vw,380px)] rounded-full px-5 py-3 text-left',
                  'font-body text-body-sm font-medium shadow-lift-2 animate-toast-in',
                  tones[t.tone]
                )}
              >
                {t.message}
              </button>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  )
}

export default ToastProvider
