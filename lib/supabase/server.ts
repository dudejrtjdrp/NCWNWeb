import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (e) {
            // cookie setting 실패는 무시하되 로깅
            // (서버 비용과 장애 대응을 위해 최소한 로깅을 남깁니다)
            // 구체적인 모니터링/에러 수집 도구에 전송하도록 확장 권장
            // eslint-disable-next-line no-console
            console.error('Failed to set cookies in server.createClient()', e)
          }
        },
      },
    }
  )
}
