'use client'

/**
 * NavigationProgress
 * Next.js App Router 페이지 이동 시 전역 로딩 오버레이를 자동으로 제어합니다.
 * - history.pushState 패치 → 이동 시작 시 showLoading
 * - usePathname 변경 감지 → 이동 완료 시 hideLoading
 */

import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useLoading } from './LoadingProvider'

function NavigationListener() {
  const { showLoading, hideLoading } = useLoading()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // history.pushState 패치 — 클라이언트 내비게이션 시작 감지
  useEffect(() => {
    const original = history.pushState.bind(history)
    history.pushState = (...args: Parameters<typeof history.pushState>) => {
      showLoading()
      return original(...args)
    }
    return () => { history.pushState = original }
  }, [showLoading])

  // pathname / searchParams 변경 = 내비게이션 완료
  useEffect(() => {
    hideLoading()
  // pathname/searchParams가 바뀔 때마다 실행
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  return null
}

/** 루트 layout에 한 번만 추가합니다. useSearchParams 때문에 Suspense로 감쌉니다. */
export function NavigationProgress() {
  return (
    <Suspense>
      <NavigationListener />
    </Suspense>
  )
}
