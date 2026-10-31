/**
 * 작품 제작자 도우미 — 서버·클라이언트 공용 (DB 접근 없음)
 * 제작자는 showcase_works.creators(JSON) 에 있고, 예전 작품은 author("A, B") 문자열만 있다.
 */

import type { WorkCreatorRef, WorkListItem } from '@/lib/supabase/queries/works'

/** 'A, B · C' → ['A', 'B', 'C'] */
export function splitCreators(author: string | null | undefined): string[] {
  return (author ?? '')
    .split(/\s*[,，·&]\s*|\s+및\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** 작품의 제작자 목록 — creators 가 있으면 그것, 없으면 author 를 나눈 이름 */
export function creatorRefs(work: Pick<WorkListItem, 'author' | 'creators'>): WorkCreatorRef[] {
  const list = (work.creators ?? []).filter((c) => c && c.name)
  if (list.length) return list
  return splitCreators(work.author).map((name) => ({ name, student_id: null, student_no: null }))
}

