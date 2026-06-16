'use client'

import { useEffect } from 'react'

/**
 * 페이지 마운트 시 조회수를 1 증가시키는 fire-and-forget 컴포넌트.
 *
 * 같은 세션에서 새로고침/재방문 시 조회수가 부풀려지지 않도록
 * sessionStorage로 작품별 1회만 집계한다. (서버의 IP 레이트리밋과 별개로 UX 단의 중복 제거)
 */
export default function ViewCountTracker({ workId }: { workId: string }) {
  useEffect(() => {
    const key = `viewed:${workId}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      // sessionStorage 미지원/차단 환경 → 그냥 집계 진행
    }

    fetch(`/api/works/${workId}/view`, { method: 'POST' }).catch(() => {
      // 실패해도 무시 (조회수는 UX에 critical하지 않음)
    })
  }, [workId])

  return null
}
