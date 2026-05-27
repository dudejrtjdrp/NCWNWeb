/**
 * POST /api/works/[id]/view
 * 작품 조회수 1 증가. 클라이언트에서 페이지 진입 시 호출.
 *
 * Supabase에 `increment_view_count` RPC가 없는 경우를 대비해
 * select → update 방식으로 fallback 처리.
 */

import { createClient } from '@/lib/supabase/server'
import { type NextRequest } from 'next/server'
import { withHandler } from '@/lib/server/withHandler'
import { checkRateLimit } from '@/lib/server/rateLimiter'
import { ApiError } from '@/lib/server/apiError'

export const POST = withHandler(async (_request: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params
  if (!id) throw new ApiError('id required', 400)

  // 간단한 레이트 제한: IP당 30req/min
  checkRateLimit(_request, 'works-view', 30, 60_000)

  const supabase = createClient()
  const supabase = createClient()

  // 우선적으로 Postgres RPC (atomic increment) 사용 시도
  try {
    const rpcRes = await supabase.rpc('increment_view_count', { work_id: id })
    // rpc가 성공하면 바로 응답
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (rpcErr) {
    // RPC가 존재하지 않거나 실패할 경우 안전한 fallback 수행
    // (예: DB에 increment RPC를 배포하기 전까지 호환성 유지)
  }

  // fallback: 현재 view_count 조회
  const { data: work, error: fetchError } = await supabase
    .from('showcase_works')
    .select('view_count')
    .eq('id', id)
    .single()

  if (fetchError || !work) {
    throw new ApiError('not found', 404)
  }

  // view_count + 1 업데이트 (낙관적 업데이트 대신 안전한 방식)
  const { error: updateError } = await supabase
    .from('showcase_works')
    .update({ view_count: (work.view_count ?? 0) + 1 })
    .eq('id', id)

  if (updateError) {
    // 로깅은 래퍼에서 처리되므로 예외로 전파
    throw new ApiError('update failed', 500)
  }

  return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'content-type': 'application/json' } })
})
