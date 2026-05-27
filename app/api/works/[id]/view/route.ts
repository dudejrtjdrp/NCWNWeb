/**
 * POST /api/works/[id]/view
 * 작품 조회수 1 증가. 클라이언트에서 페이지 진입 시 호출.
 *
 * 우선: Postgres RPC `increment_view_count` (atomic)
 * fallback: select → update (RPC 미배포 시 호환성 유지)
 */

import { createClient } from '@/lib/supabase/server'
import { type NextRequest } from 'next/server'
import { withHandler } from '@/lib/server/withHandler'
import { checkRateLimit } from '@/lib/server/rateLimiter'
import { ApiError } from '@/lib/server/apiError'
import { isValidUUID } from '@/lib/server/validation'
import { logWarn } from '@/lib/server/logger'

const JSON_HEADERS = { 'content-type': 'application/json' } as const

export const POST = withHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params

  // UUID 형식 검증 — 잘못된 ID로 DB 쿼리 방어
  if (!isValidUUID(id)) throw new ApiError('유효하지 않은 작품 ID입니다.', 400)

  // IP당 30req/min — 단순 새로고침으로 인한 조회수 어뷰징 방지
  checkRateLimit(request, 'works-view', 30, 60_000)

  const supabase = createClient()

  // ① Postgres RPC (atomic increment) 우선 시도
  const { error: rpcError } = await supabase.rpc('increment_view_count', { work_id: id })

  if (!rpcError) {
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: JSON_HEADERS })
  }

  // RPC 오류 종류에 따라 처리
  const isRpcMissing =
    rpcError.message.includes('does not exist') ||
    rpcError.message.includes('Could not find') ||
    rpcError.code === 'PGRST202'

  if (!isRpcMissing) {
    // RPC가 존재하지만 다른 오류 → 경고 후 fallback 시도
    logWarn('[view] RPC increment_view_count 실패, fallback 수행:', rpcError.message)
  }

  // ② fallback: select → update (비원자적이지만 허용 범위)
  const { data: work, error: fetchError } = await supabase
    .from('showcase_works')
    .select('view_count')
    .eq('id', id)
    .single()

  if (fetchError || !work) {
    throw new ApiError('작품을 찾을 수 없습니다.', 404)
  }

  const { error: updateError } = await supabase
    .from('showcase_works')
    .update({ view_count: (work.view_count ?? 0) + 1 })
    .eq('id', id)

  if (updateError) {
    throw new ApiError('조회수 업데이트에 실패했습니다.', 500)
  }

  return new Response(JSON.stringify({ success: true }), { status: 200, headers: JSON_HEADERS })
})
