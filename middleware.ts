/**
 * Next.js Middleware — Supabase 세션 갱신
 *
 * 인증 가드는 각 페이지(Server Component)에서 직접 처리:
 *   - /admin        → 비인증 시 /admin/login 으로 redirect
 *   - /admin/login  → 인증 시 /admin 으로 redirect
 *
 * 미들웨어는 세션 토큰 만료 시 자동 갱신(refresh)만 담당.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({ request })

    // 세션 쿠키 갱신 — 만료된 토큰을 자동으로 재발급
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // 세션 갱신 트리거 (반환값 불필요)
    await supabase.auth.getUser()

    // 보안 관련 기본 응답 헤더 추가
    supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
    supabaseResponse.headers.set('X-Frame-Options', 'DENY')
    supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    supabaseResponse.headers.set('Permissions-Policy', 'geolocation=()')

    return supabaseResponse
  } catch {
    // 미들웨어에서 발생한 예외는 로깅해두고 요청을 통과시킵니다.
    // 향후 Sentry/Datadog 같은 외부 에러 집계로 전송하도록 확장 권장.
    // eslint-disable-next-line no-console
    console.error('Middleware error during session refresh')
    const resp = NextResponse.next({ request })
    resp.headers.set('X-Content-Type-Options', 'nosniff')
    resp.headers.set('X-Frame-Options', 'DENY')
    return resp
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/callback',
  ],
}
