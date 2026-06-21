'use client'

/**
 * NavigationProgress
 * Next.js App Router 페이지 이동 시 전역 로딩 오버레이를 자동으로 제어합니다.
 * - history.pushState 패치 → 이동 시작 시 showLoading
 * - usePathname 변경 감지 → 이동 완료 시 hideLoading
 */

import { Suspense, useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useLoading } from './LoadingProvider'

// [임시 스톱갭] 페이지 이동 로딩 오버레이의 최대 노출 시간(ms).
// 로딩이 오래 도는 근본 원인은 "목적지 페이지의 서버 렌더가 끝나야 pathname 이 바뀐다"는 것:
//   - 개발 모드(next dev)에서는 각 라우트를 처음 방문할 때마다 온디맨드 컴파일이 일어나 수 초가 걸림
//   - showcase 페이지는 force-dynamic 이라 매 이동마다 Supabase 라운드트립(시드 랜덤 RPC) 발생
//   - 그 외 페이지도 캐시 미스(첫 방문) 시 Supabase 응답(최대 8초)까지 대기
// 즉 오버레이는 실제 렌더 시간을 그대로 반영해 길게 돈다. 원인 해결 전까지는
// 실제 완료 여부와 무관하게 1.5초 후 오버레이를 강제로 내려 체감 지연을 줄인다.
const NAV_CAP_MS = 1500

function NavigationListener() {
  const { showLoading, hideLoading } = useLoading()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // 1.5초 강제 해제 타이머 핸들 — 이동 완료(pathname 변경) 시 정리한다.
  const capTimerRef = useRef<ReturnType<typeof setTimeout>>()

  // history.pushState 패치 — 클라이언트 내비게이션 시작 감지
  useEffect(() => {
    const original = history.pushState.bind(history)
    history.pushState = (...args: Parameters<typeof history.pushState>) => {
      // pushState 적용 전 위치를 기록해 두고, 적용 후 실제로 경로/쿼리가
      // 바뀌었을 때만 로딩을 표시한다.
      // (해시 변경·동일 URL pushState는 내비게이션이 아니므로 무시 → 'navigation'
      //  키가 hide 없이 남아 무한 로딩되는 문제 방지)
      const prevPath = window.location.pathname
      const prevSearch = window.location.search
      const result = original(...args)
      const changed =
        window.location.pathname !== prevPath || window.location.search !== prevSearch
      if (changed) {
        // Next 내부 HistoryUpdater는 useInsertionEffect 안에서 pushState를 호출한다.
        // 여기서 showLoading()(setState)를 동기 호출하면
        // "useInsertionEffect must not schedule updates" 경고가 발생하므로
        // 마이크로태스크로 지연시켜 insertion effect 단계 밖에서 상태를 갱신한다.
        queueMicrotask(() => {
          showLoading('navigation')
          // [임시] 1.5초 캡: 페이지 렌더가 더 오래 걸려도 오버레이는 1.5초만 표시.
          clearTimeout(capTimerRef.current)
          capTimerRef.current = setTimeout(() => hideLoading('navigation'), NAV_CAP_MS)
        })
      }
      return result
    }
    return () => {
      history.pushState = original
      clearTimeout(capTimerRef.current)
    }
  }, [showLoading, hideLoading])

  // pathname / searchParams 변경 = 내비게이션 완료
  // 고정 키 'navigation' 이므로 pushState가 여러 번 불려도 1개로 취급되고,
  // 경로 변경 시 한 번의 hide로 확실히 해제된다.
  // 이동이 1.5초 안에 끝나면 캡 타이머는 불필요하므로 함께 정리한다.
  useEffect(() => {
    clearTimeout(capTimerRef.current)
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
