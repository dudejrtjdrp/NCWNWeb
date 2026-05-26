'use client'

import { useState, useMemo } from 'react'

/**
 * 커스텀 훅: useFilter
 *
 * 검색어 기반 필터링 로직을 캡슐화.
 * 컴포넌트에서 직접 useMemo + 검색 state 관리를 반복하지 않도록 추출.
 *
 * @param items     - 필터링할 원본 배열
 * @param searchFn  - (item, query) => boolean 형태의 검색 함수
 *
 * 사용 예시:
 * ```tsx
 * const { query, setQuery, filtered } = useFilter(AWARDS_DATA, (item, q) =>
 *   item.competition.toLowerCase().includes(q) ||
 *   item.award_name.toLowerCase().includes(q)
 * )
 * ```
 */
export function useFilter<T>(
  items: T[],
  searchFn: (item: T, query: string) => boolean
) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => searchFn(item, q))
  }, [items, query, searchFn])

  return { query, setQuery, filtered }
}
