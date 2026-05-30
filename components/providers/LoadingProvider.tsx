/**
 * 전역 로딩 오버레이 Provider
 * - showLoading / hideLoading 으로 어디서든 오버레이 제어
 * - 중첩 호출 안전: 내부 카운터로 마지막 hide 시에만 오버레이 제거
 */

'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

interface LoadingContextType {
  showLoading: () => void
  hideLoading: () => void
}

const LoadingContext = createContext<LoadingContextType>({
  showLoading: () => {},
  hideLoading: () => {},
})

export function useLoading() {
  return useContext(LoadingContext)
}

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          {/* 배경 링 */}
          <div className="absolute inset-0 rounded-full border-2 border-nwcn-green/15" />
          {/* 스피너 */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-nwcn-green animate-spin" />
          {/* 내부 점 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-nwcn-green/60" />
          </div>
        </div>
        <p className="font-body text-[10px] tracking-[0.25em] text-white/25 uppercase select-none">
          Loading
        </p>
      </div>
    </div>
  )
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  // 중첩 show/hide 카운팅: 마지막 hide 에서만 오버레이 제거
  const countRef = useRef(0)

  const showLoading = useCallback(() => {
    countRef.current += 1
    setVisible(true)
  }, [])

  const hideLoading = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1)
    if (countRef.current === 0) setVisible(false)
  }, [])

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      {visible && <LoadingOverlay />}
    </LoadingContext.Provider>
  )
}
