'use client'

/**
 * Admin 로그인 페이지: /admin/login
 * Supabase Auth 이메일/비밀번호 로그인
 * 성공 시 /admin (또는 ?next= 파라미터 경로)으로 리다이렉트
 */

import { useFormState, useFormStatus } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { signIn } from '@/app/admin/actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 bg-nwcn-green text-nwcn-text-default font-body font-semibold text-sm py-4 rounded-xl transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <svg
            className="animate-spin w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          로그인 중...
        </>
      ) : (
        '로그인'
      )}
    </button>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackError = searchParams.get('error')

  const [state, formAction] = useFormState(signIn, null)
  const errorMsg = (state as { error?: string } | null)?.error ??
    (callbackError ? '인증 오류가 발생했습니다. 다시 시도해주세요.' : null)

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">

        {/* 로고 */}
        <div className="text-center mb-10">
          <span className="font-brand text-[32px] text-nwcn-green tracking-tight">NWCN</span>
          <p className="font-body text-xs text-white/30 mt-2 tracking-widest uppercase">
            Admin Dashboard
          </p>
        </div>

        {/* 카드 */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8">
          <h1 className="font-body font-bold text-[20px] text-white mb-1">로그인</h1>
          <p className="font-body text-xs text-white/30 mb-8">
            관리자 계정으로 로그인하세요
          </p>

          <form action={formAction} className="space-y-5">
            {/* 이메일 */}
            <div>
              <label
                htmlFor="email"
                className="block font-body text-xs font-semibold text-white/40 uppercase tracking-wider mb-2"
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="admin@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-body text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-nwcn-green/50 transition-colors"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label
                htmlFor="password"
                className="block font-body text-xs font-semibold text-white/40 uppercase tracking-wider mb-2"
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-body text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-nwcn-green/50 transition-colors"
              />
            </div>

            {/* 에러 메시지 */}
            {errorMsg && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  className="flex-shrink-0 mt-0.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="font-body text-xs text-red-400">{errorMsg}</p>
              </div>
            )}

            {/* 로그인 버튼 */}
            <SubmitButton />
          </form>
        </div>

        {/* 돌아가기 */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="font-body text-xs text-white/20 hover:text-white/40 transition-colors"
          >
            ← 사이트로 돌아가기
          </a>
        </div>
      </div>
    </div>
  )
}

// useSearchParams는 Suspense 바운더리 안에서 사용
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
