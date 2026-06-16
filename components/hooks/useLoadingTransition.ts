'use client'

/**
 * useLoadingTransition
 * useTransition + LoadingProvider를 합친 훅.
 * isPending이 true일 때 자동으로 전역 로딩 오버레이를 띄웁니다.
 */

import { useEffect, useId, useTransition } from 'react'
import { useLoading } from '@/components/providers/LoadingProvider'

export function useLoadingTransition() {
  const [isPending, startTransition] = useTransition()
  const { showLoading, hideLoading } = useLoading()
  const key = useId()

  useEffect(() => {
    if (!isPending) return
    // pending 동안만 표시하고, 상태 변화·언마운트 시 cleanup으로 반드시 해제
    showLoading(key)
    return () => hideLoading(key)
  }, [isPending, key, showLoading, hideLoading])

  return [isPending, startTransition] as const
}
