'use client'

import { useEffect } from 'react'

/** 페이지 마운트 시 조회수를 1 증가시키는 fire-and-forget 컴포넌트 */
export default function ViewCountTracker({ workId }: { workId: string }) {
  useEffect(() => {
    fetch(`/api/works/${workId}/view`, { method: 'POST' }).catch(() => {
      // 실패해도 무시 (조회수는 UX에 critical하지 않음)
    })
  }, [workId])

  return null
}
