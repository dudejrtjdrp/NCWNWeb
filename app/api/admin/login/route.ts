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
import { logInfo } from '@/lib/server/logger'

export const POST = withHandler(async (request: NextRequest) => {
  const formData = await request.formData()
  const email    = (formData.get('email')    as string)?.trim()
  const password = (formData.get('password') as string)?.trim()
  const next     = (formData.get('next')     as string) || '/admin'

  // 입력값 검증
  if (!email || !password) {
    const url = new URL('/admin/login', request.url)
    url.searchParams.set('error', '이메일과 비밀번호를 입력해주세요.')
    return NextResponse.redirect(url)
  }

  // 브루트포스 방지: IP당 5회/분
  try {
    checkRateLimit(request, 'admin-login', 5, 60_000)
  } catch (err) {
    // 레이트 제한 시 로그인 페이지로 리다이렉트
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('error', '시도 횟수가 많습니다. 잠시 후 다시 시도해주세요.')
    return NextResponse.redirect(loginUrl)
  }

  // 성공 시 리다이렉트할 response를 미리 생성
  // (쿠키를 이 response에 직접 심어야 브라우저가 받을 수 있음)
  const successUrl   = new URL(next, request.url)
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
      loginUrl.searchParams.set('error', `로그인 실패: ${error.message}`)
    }
    return NextResponse.redirect(loginUrl)
  }

  // 세션 쿠키가 심긴 successResponse 반환 → 브라우저가 /admin으로 이동
  logInfo('admin login success', email)
  return successResponse
})
