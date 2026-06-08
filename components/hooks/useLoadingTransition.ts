'use client'

/**
 * useLoadingTransition
 * useTransition + LoadingProvider를 합친 훅.
 * isPending이 true일 때 자동으로 전역 로딩 오버레이를 띄웁니다.
 */

import { useEffect, useTransition } from 'react'
import { useLoading } from '@/components/providers/LoadingProvider'

export function useLoadingTransition() {
  const [isPending, startTransition] = useTransition()
  const { showLoading, hideLoading } = useLoading()

  useEffect(() => {
    if (isPending) showLoading()
    else hideLoading()
  }, [isPending, showLoading, hideLoading])

  return [isPending, startTransition] as const
}
