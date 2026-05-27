/**
 * Admin 로그인 API Route Handler
 *
 * useFormState + Server Action 방식에서는 Set-Cookie 헤더가
 * 브라우저에 제대로 전달되지 않는 Next.js 14 이슈가 있음.
 * Route Handler는 response 객체에 쿠키를 직접 세팅하므로 신뢰성이 높음.
 *
 * POST /api/admin/login
 *   - 성공: 세션 쿠키 set → /admin 리다이렉트
 *   - 실패: /admin/login?error=... 리다이렉트
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { withHandler } from '@/lib/server/withHandler'
import { checkRateLimit } from '@/lib/server/rateLimiter'
import { logInfo, logError } from '@/lib/server/logger'
import { sanitizeRedirectPath } from '@/lib/server/validation'

export const POST = withHandler(async (request: NextRequest) => {
  const formData = await request.formData()
  const email    = (formData.get('email')    as string)?.trim()
  const password = (formData.get('password') as string)?.trim()

  // 오픈 리다이렉트 방지: next 파라미터를 반드시 내부 경로로 정규화
  const rawNext = formData.get('next') as string | null
  const next    = sanitizeRedirectPath(rawNext, '/admin')

  // 입력값 검증
  if (!email || !password) {
    const url = new URL('/admin/login', request.url)
    url.searchParams.set('error', '이메일과 비밀번호를 입력해주세요.')
    return NextResponse.redirect(url)
  }

  // 브루트포스 방지: IP당 5회/분
  try {
    checkRateLimit(request, 'admin-login', 5, 60_000)
  } catch {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('error', '시도 횟수가 많습니다. 잠시 후 다시 시도해주세요.')
    return NextResponse.redirect(loginUrl)
  }

  // 성공 시 리다이렉트할 response를 미리 생성
  // (쿠키를 이 response에 직접 심어야 브라우저가 받을 수 있음)
  // next는 sanitizeRedirectPath에 의해 안전한 내부 경로임이 보장됨
  const successUrl      = new URL(next, request.url)
  const successResponse = NextResponse.redirect(successUrl)

  // Supabase 클라이언트 생성 — setAll을 successResponse에 바인딩
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            successResponse.cookies.set(name, value, options as CookieOptions)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const loginUrl = new URL('/admin/login', request.url)
    if (error.message.includes('Invalid login credentials')) {
      loginUrl.searchParams.set('error', '이메일 또는 비밀번호가 올바르지 않습니다.')
    } else if (error.message.includes('Email not confirmed')) {
      loginUrl.searchParams.set('error', '이메일 인증이 완료되지 않았습니다.')
    } else {
      // Supabase 내부 메시지 노출 방지
      logError('[admin/login] 로그인 실패', error.message)
      loginUrl.searchParams.set('error', '로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }
    return NextResponse.redirect(loginUrl)
  }

  // 세션 쿠키가 심긴 successResponse 반환 → 브라우저가 /admin으로 이동
  logInfo('admin login success', email)
  return successResponse
})
