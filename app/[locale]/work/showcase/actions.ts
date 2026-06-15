'use server'

import { getShowcaseWorksPage, type ShowcaseWorksPage } from '@/lib/supabase/queries/works'

/** 쇼케이스 무한 스크롤 — 다음 페이지 로드 (Server Action) */
export async function loadShowcaseWorksAction(params: {
  locale?: string
  tag?: string
  q?: string
  offset?: number
  limit?: number
  seed?: string
}): Promise<ShowcaseWorksPage> {
  return getShowcaseWorksPage(params)
}
