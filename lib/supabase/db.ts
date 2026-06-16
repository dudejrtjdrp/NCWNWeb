/**
 * Supabase 공개 데이터 클라이언트 (서버 전용 — 쿠키 불필요)
 *
 * - 공개 읽기 전용 쿼리에 사용 (showcase, awards, events, ncr 등)
 * - next/headers 의존성 없음 → Server Component에서 안전하게 사용
 * - 인증이 필요한 Admin 작업에는 lib/supabase/server.ts 사용
 */

import { createClient } from '@supabase/supabase-js'
import { createTimeoutFetch } from './timeout-fetch'

export function createDbClient() {
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
