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

    return supabaseResponse
  } catch {
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/callback',
  ],
}
