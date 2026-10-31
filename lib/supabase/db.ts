/**
 * Supabase 공개 데이터 클라이언트 (서버 전용 — 쿠키 불필요)
 *
 * - 공개 읽기 전용 쿼리에 사용 (showcase, awards, events, ncr 등)
 * - next/headers 의존성 없음 → Server Component에서 안전하게 사용
 * - 인증이 필요한 Admin 작업에는 lib/supabase/server.ts 사용
 * - 미리보기·로컬 개발에서는 저장해 둔 공개 데이터 스냅샷 + 예시 데이터로 대신 보여준다
 *   (lib/supabase/snapshot-client.ts). 운영(Production)에서는 절대 켜지지 않는다.
 *   로컬에서 실제 DB를 보려면 USE_REAL_DB=1 npm run dev
 */

import { createClient } from '@supabase/supabase-js'
import { createTimeoutFetch } from './timeout-fetch'
import { createSnapshotClient } from './snapshot-client'

/**
 * 스냅샷(저장 데이터 + 예시)으로 보여주는 중인가
 * - 운영(VERCEL_ENV=production) → 항상 실제 DB
 * - USE_REAL_DB=1 → 실제 DB / USE_SNAPSHOT_DB=1 → 스냅샷
 * - 그 밖에는 Supabase 환경변수가 없거나, 로컬 개발(next dev)·Vercel 미리보기면 스냅샷
 */
export function isSnapshotDb(): boolean {
  if (process.env.VERCEL_ENV === 'production') return false
  if (process.env.USE_REAL_DB === '1') return false
  if (process.env.USE_SNAPSHOT_DB === '1') return true
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return true
  return process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview'
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
