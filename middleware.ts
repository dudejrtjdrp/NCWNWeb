/**
 * Next.js Middleware
 *
 * 역할 ①: 전체 요청에 보안 헤더 주입
 * 역할 ②: /admin·/auth 경로에서 Supabase 세션 쿠키 자동 갱신
 *
 * 인증 가드는 각 페이지(Server Component)에서 직접 처리:
 *   - /admin        → 비인증 시 /admin/login 으로 redirect
 *   - /admin/login  → 인증 시 /admin 으로 redirect
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

// ── 보안 헤더 정의 ─────────────────────────────────────────

/**
 * 모든 응답에 공통으로 주입하는 보안 헤더.
 * HSTS는 HTTPS 환경(프로덕션)에서만 활성화됩니다.
 */
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'X-XSS-Protection': '1; mode=block',
  ...(process.env.NODE_ENV === 'production'
    ? { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains' }
    : {}),
}

/**
 * Content-Security-Policy 헤더 생성.
 * 외부 리소스를 Supabase Storage 도메인으로 제한합니다.
 */
function buildCSP(): string {
  const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? (() => { try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname } catch { return '*.supabase.co' } })()
    : '*.supabase.co'

  const directives = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://${supabaseHost} https://*.supabase.co https://www.figma.com`,
    `font-src 'self'`,
    `connect-src 'self' https://${supabaseHost} https://*.supabase.co`,
    `frame-ancestors 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `upgrade-insecure-requests`,
  ]
  return directives.join('; ')
}

function applySecurityHeaders(response: NextResponse): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }
  response.headers.set('Content-Security-Policy', buildCSP())
}

// ── 미들웨어 본체 ─────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const needsSessionRefresh =
    pathname.startsWith('/admin') || pathname.startsWith('/auth/callback')

  try {
    if (needsSessionRefresh) {
      // 세션 쿠키 갱신이 필요한 경로: Supabase 클라이언트 생성
      let supabaseResponse = NextResponse.next({ request })

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

      // 만료된 토큰 자동 갱신 트리거
      await supabase.auth.getUser()

      applySecurityHeaders(supabaseResponse)
      return supabaseResponse
    }

    // 나머지 경로: 보안 헤더만 주입
    const response = NextResponse.next({ request })
    applySecurityHeaders(response)
    return response
  } catch {
    console.error('[middleware] 세션 갱신 중 예외 발생')
    const response = NextResponse.next({ request })
    applySecurityHeaders(response)
    return response
  }
}

export const config = {
  matcher: [
    /*
     * 보안 헤더는 모든 경로에 적용.
     * Next.js 내부 정적 자원(_next/static, _next/image 등)은 제외.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)',
  ],
}
