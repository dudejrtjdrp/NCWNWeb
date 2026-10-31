/** NCR 리포트 공용 도우미 — 날짜 표기, 유형 이름표 */

import type { ArticleType } from '@/lib/supabase/queries/ncr'

/** '2026.05.19' — 시간대 차이로 하루 밀리지 않게 앞 10자리만 쓴다 */
export const reportDate = (iso: string) => iso.slice(0, 10).replace(/-/g, '.')

/** 유형 값 → 이름 (설정의 유형 목록 + 기본 세 가지는 번역) */
export function typeLabelMap(types: ArticleType[], base: { editorial: string; trend: string; card_news: string }) {
  return { ...Object.fromEntries(types.map((at) => [at.value, at.label])), ...base } as Record<string, string>
}

/** 'Season 3' → 3 (숫자 없으면 0) */
export const seasonNo = (s: string) => parseInt(s.replace(/\D/g, ''), 10) || 0
export const seasonAnchor = (s: string) => `season-${seasonNo(s) || 'etc'}`
