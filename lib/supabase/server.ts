import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase 서버 클라이언트
 *
 * @supabase/ssr v0.3.0 에서 createServerClient 내부 스토리지는
 * cookies.get / cookies.set / cookies.remove 만 호출합니다.
 * (getAll / setAll 은 이 버전에서 사용되지 않음)
 *
 * Server Component(렌더 중) → set/remove 에서 예외 발생 → try-catch 처리
 * Server Action 컨텍스트  → set/remove 정상 동작
 */
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Server Component 렌더 중에는 쿠키 설정 불가 → 무시
            // (미들웨어가 별도로 갱신된 쿠키를 응답에 주입합니다)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Server Component 렌더 중에는 쿠키 삭제 불가 → 무시
          }
        },
      },
    }
  )
}
