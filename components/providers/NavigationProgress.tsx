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
      // Next 내부 HistoryUpdater는 useInsertionEffect 안에서 pushState를 호출한다.
      // 여기서 showLoading()(setState)를 동기 호출하면
      // "useInsertionEffect must not schedule updates" 경고가 발생하므로
      // 마이크로태스크로 지연시켜 insertion effect 단계 밖에서 상태를 갱신한다.
      queueMicrotask(() => showLoading('navigation'))
      return original(...args)
    }
    return () => { history.pushState = original }
  }, [showLoading])

  // pathname / searchParams 변경 = 내비게이션 완료
  // 고정 키 'navigation' 이므로 pushState가 여러 번 불려도 1개로 취급되고,
  // 경로 변경 시 한 번의 hide로 확실히 해제된다.
  useEffect(() => {
    hideLoading('navigation')
  }, [pathname, searchParams, hideLoading])

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
