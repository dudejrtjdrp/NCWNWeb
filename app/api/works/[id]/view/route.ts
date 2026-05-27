/**
 * POST /api/works/[id]/view
 * 작품 조회수 1 증가. 클라이언트에서 페이지 진입 시 호출.
 *
 * Supabase에 `increment_view_count` RPC가 없는 경우를 대비해
 * select → update 방식으로 fallback 처리.
 */

import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const supabase = createClient()

  // 현재 view_count 조회
  const { data: work, error: fetchError } = await supabase
    .from('showcase_works')
    .select('view_count')
    .eq('id', id)
    .single()

  if (fetchError || !work) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  // view_count + 1 업데이트
  const { error: updateError } = await supabase
    .from('showcase_works')
    .update({ view_count: (work.view_count ?? 0) + 1 })
    .eq('id', id)

  if (updateError) {
    console.error('[view] update failed:', updateError.message)
    return NextResponse.json({ error: 'update failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
