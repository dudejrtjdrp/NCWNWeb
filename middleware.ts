/**
 * Next.js Middleware
 *
 * 역할 ①: next-intl 로케일 감지 및 리다이렉트
 *   - 브라우저 Accept-Language 헤더로 자동 감지 (ko/en)
 *   - 기본 로케일(ko)은 prefix 없이 /로, 영어는 /en/으로
 * 역할 ②: 전체 요청에 보안 헤더 주입
 * 역할 ③: /admin·/auth 경로에서 Supabase 세션 쿠키 자동 갱신
 *
 * 인증 가드는 각 페이지(Server Component)에서 직접 처리:
 *   - /admin        → 비인증 시 /admin/login 으로 redirect
 *   - /admin/login  → 인증 시 /admin 으로 redirect
 */

import createIntlMiddleware from 'next-intl/middleware'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

// ── next-intl 미들웨어 ─────────────────────────────────────
const intlMiddleware = createIntlMiddleware(routing)

// ── 보안 헤더 정의 ─────────────────────────────────────────

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

function buildCSP(): string {
  const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? (() => { try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname } catch { return '*.supabase.co' } })()
    : '*.supabase.co'

  const directives = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
    // Google Fonts(Nova Slim) + jsdelivr(Pretendard) 스타일시트 허용
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net`,
    `img-src 'self' data: blob: https://${supabaseHost} https://*.supabase.co https://www.figma.com`,
    // Google Fonts 폰트 파일(gstatic) + jsdelivr 폰트 파일 허용
    `font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net`,
    // REST API + Realtime WebSocket(wss://) 허용
    `connect-src 'self' https://${supabaseHost} https://*.supabase.co wss://${supabaseHost} wss://*.supabase.co`,
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
      // admin/auth 경로: Supabase 세션 갱신 (로케일 미들웨어 제외)
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

      await supabase.auth.getUser()
      applySecurityHeaders(supabaseResponse)
      return supabaseResponse
    }

    // 일반 경로: next-intl 로케일 처리 + 보안 헤더
    const response = intlMiddleware(request)
    applySecurityHeaders(response)
    return response
  } catch {
    console.error('[middleware] 예외 발생')
    const response = NextResponse.next({ request })
    applySecurityHeaders(response)
    return response
  }
}

export const config = {
  matcher: [
    /*
     * 모든 경로에 적용. 단 Next.js 내부 정적 자원은 제외:
     * - _next/static, _next/image
     * - favicon.ico
     * - 정적 파일 확장자 (.svg, .png, .jpg 등)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)',
  ],
}
