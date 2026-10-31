/**
 * Supabase 공개 데이터 클라이언트 (서버 전용 — 쿠키 불필요)
 *
 * - 공개 읽기 전용 쿼리에 사용 (showcase, awards, events, ncr 등)
 * - next/headers 의존성 없음 → Server Component에서 안전하게 사용
 * - 인증이 필요한 Admin 작업에는 lib/supabase/server.ts 사용
 * - Supabase 환경변수가 없는 미리보기·로컬(운영 제외)이거나 USE_SNAPSHOT_DB=1 이면
 *   저장해 둔 공개 데이터 스냅샷(lib/supabase/snapshot/public-data.json)으로 대신 보여준다.
 */

import { createClient } from '@supabase/supabase-js'
import { createTimeoutFetch } from './timeout-fetch'
import { createSnapshotClient } from './snapshot-client'

/** 스냅샷 데이터로 보여주는 중인가 — 운영(Production)에서는 절대 켜지지 않는다 */
export function isSnapshotDb(): boolean {
  if (process.env.VERCEL_ENV === 'production') return false
  return process.env.USE_SNAPSHOT_DB === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL
}

export function createDbClient() {
  if (isSnapshotDb()) return createSnapshotClient()
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      // 연결 멈춤 시 무한 await 방지 — 8초 내 응답 없으면 중단
      global: { fetch: createTimeoutFetch(8000) },
    }
  )
}
