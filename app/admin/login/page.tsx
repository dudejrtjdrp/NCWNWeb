/**
 * Admin 로그인 페이지
 *
 * Server Component(outer) + Client Component(inner) 구조:
 *   - 이미 로그인된 경우 → /admin 으로 서버사이드 redirect
 *   - 미로그인인 경우   → 로그인 폼 렌더링
 *
 * 인증 흐름:
 *   form POST → /api/admin/login (Route Handler)
 *     → 성공: 세션 쿠키 set + /admin redirect
 *     → 실패: /admin/login?error=... redirect
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LoginForm from './_LoginForm'

export default async function LoginPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 이미 로그인된 상태면 admin으로 바로 이동
  if (user) {
    redirect('/admin')
  }

  return <LoginForm />
}
