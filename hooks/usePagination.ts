'use client'

import { useState, useMemo, useCallback } from 'react'

/**
 * 커스텀 훅: usePagination
 *
 * 페이지네이션 로직을 캡슐화.
 * 컴포넌트에서 직접 page state, totalPages 계산, 슬라이싱을 반복하지 않도록 추출.
 *
 * @param items     - 페이지네이션할 전체 배열 (useFilter의 filtered 결과를 넘기면 됨)
 * @param pageSize  - 페이지당 항목 수
 *
 * 사용 예시:
 * ```tsx
 * const { query, setQuery, filtered } = useFilter(DATA, searchFn)
 * const { page, setPage, totalPages, paged, reset } = usePagination(filtered, 9)
 *
 * // 검색 변경 시 첫 페이지로 리셋
 * const handleSearch = (v: string) => { setQuery(v); reset() }
 * ```
 */
export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1)

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / pageSize)),
    [items.length, pageSize]
  )

  const paged = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  )

  /** 첫 페이지로 초기화 (검색어 변경 시 호출) */
  const reset = useCallback(() => setPage(1), [])

  return { page, setPage, totalPages, paged, reset }
}
