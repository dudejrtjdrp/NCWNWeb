'use client'

/**
 * Admin 로그인 폼 (Client Component)
 *
 * 인증 방식: 브라우저에서 직접 Supabase signInWithPassword 호출
 *   - createBrowserClient(@supabase/ssr)가 세션 쿠키를 브라우저에 직접 저장
 *   - 서버 쿠키 세팅 이슈를 완전히 우회
 *   - 성공 시 window.location.href 로 /admin 하드 이동
 *     (router.push 는 Next.js 라우터 캐시 때문에 인증 전 상태가 남을 수 있음)
 */

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email    = (formData.get('email')    as string).trim()
    const password = (formData.get('password') as string).trim()

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setLoading(false)
      if (signInError.message.includes('Invalid login credentials')) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      } else if (signInError.message.includes('Email not confirmed')) {
        setError('이메일 인증이 완료되지 않았습니다.')
      } else {
        setError(`로그인 실패: ${signInError.message}`)
      }
      return
    }

    // 브라우저가 세션 쿠키를 저장한 뒤 하드 이동
    // → /admin Server Component 에서 getUser()가 쿠키를 읽어 인증 통과
    const params = new URLSearchParams(window.location.search)
    window.location.href = params.get('next') ?? '/admin'
  }

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

          <form onSubmit={handleSubmit} className="space-y-5">

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
            {error && (
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
                <p className="font-body text-xs text-red-400">{error}</p>
              </div>
            )}

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-nwcn-green text-nwcn-text-default font-body font-semibold text-sm py-4 rounded-xl transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
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
