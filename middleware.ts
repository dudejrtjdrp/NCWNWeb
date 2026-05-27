/**
 * Next.js Middleware — Supabase 세션 갱신 + /admin 인증 가드
 *
 * - 모든 요청에서 Supabase 세션 쿠키를 갱신
 * - /admin/* 접근 시 비인증 사용자 → /admin/login 리다이렉트
 * - /admin/login 접근 시 이미 인증된 사용자 → /admin 리다이렉트
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Supabase 세션 갱신 (쿠키 읽기/쓰기)
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

  // getUser()로 세션 유효성 검증 (getSession보다 안전)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // /admin/login 이외의 /admin/* 경로 보호
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/admin/login'

  if (isAdminRoute && !isLoginPage && !user) {
    // 미인증 → 로그인 페이지로
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('next', pathname) // 로그인 후 원래 경로로 복귀
    return NextResponse.redirect(loginUrl)
  }

  if (isLoginPage && user) {
    // 이미 로그인된 상태로 /admin/login 접근 → /admin으로
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
