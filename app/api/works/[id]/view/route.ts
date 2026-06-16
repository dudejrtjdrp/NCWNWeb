/**
 * POST /api/works/[id]/view
 * 작품 조회수 1 증가. 클라이언트에서 페이지 진입 시 호출.
 *
 * Postgres RPC `increment_view_count` (atomic, SECURITY DEFINER) 사용.
 * - showcase_works 는 RLS 상 anon UPDATE 가 막혀 있으므로 SECURITY DEFINER RPC 로 증가
 * - 표시 숫자는 목록/상세 캐시 TTL(5분)로 최종적 일관성 반영 (조회마다 캐시 무효화하지 않음)
 */

import { createClient } from '@/lib/supabase/server'
import { type NextRequest } from 'next/server'
import { withHandler } from '@/lib/server/withHandler'
import { checkRateLimit } from '@/lib/server/rateLimiter'
import { ApiError } from '@/lib/server/apiError'
import { isValidUUID } from '@/lib/server/validation'

const JSON_HEADERS = { 'content-type': 'application/json' } as const

export const POST = withHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params

  // UUID 형식 검증 — 잘못된 ID로 DB 쿼리 방어
  if (!isValidUUID(id)) throw new ApiError('유효하지 않은 작품 ID입니다.', 400)

  // IP당 30req/min — 단순 새로고침으로 인한 조회수 어뷰징 방지
  checkRateLimit(request, 'works-view', 30, 60_000)

  const supabase = createClient()

  // Postgres RPC (atomic increment, SECURITY DEFINER) 로 조회수 증가
  const { error: rpcError } = await supabase.rpc('increment_view_count', { work_id: id })

  if (rpcError) {
    // RPC 미배포 또는 실행 실패 → 마이그레이션 add_increment_view_count_rpc.sql 적용 필요
    throw new ApiError('조회수 업데이트에 실패했습니다.', 500)
  }

  return new Response(JSON.stringify({ success: true }), { status: 200, headers: JSON_HEADERS })
})
