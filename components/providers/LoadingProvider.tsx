/**
 * 전역 로딩 오버레이 Provider
 * - showLoading(key) / hideLoading(key) 로 어디서든 오버레이 제어
 * - 키(Set) 기반: 각 호출자가 고유 키를 소유하므로 호출자끼리 서로 간섭하지 않음.
 *   같은 키로 show를 여러 번 불러도 1개로 취급되고, 없는 키를 hide해도 무해(no-op).
 *   활성 키가 하나라도 있으면 오버레이 표시 → show/hide 불균형으로 인한 누수 방지.
 */

'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'

interface LoadingContextType {
  showLoading: (key: string) => void
  hideLoading: (key: string) => void
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
  // 활성 로딩 키 집합: 하나라도 있으면 오버레이 표시
  const keysRef = useRef<Set<string>>(new Set())

  const showLoading = useCallback((key: string) => {
    keysRef.current.add(key)
    setVisible(keysRef.current.size > 0)
  }, [])

  const hideLoading = useCallback((key: string) => {
    keysRef.current.delete(key)
    setVisible(keysRef.current.size > 0)
  }, [])

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      {visible && <LoadingOverlay />}
    </LoadingContext.Provider>
  )
}
