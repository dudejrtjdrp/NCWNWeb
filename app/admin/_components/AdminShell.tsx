/**
 * Admin 공통 Shell
 * - 인증 체크
 * - 헤더 (브랜드, 사이트 보기, 로그아웃)
 * - 사이드바 네비게이션 (페이지 링크)
 */

'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '../actions'

const NAV_ITEMS = [
  {
    href: '/admin/work',
    label: '작업물',
    desc: '디자인·영상·3D 등록 및 삭제',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    href: '/admin/article',
    label: 'NCR 아티클',
    desc: '아티클 발행 · 홈 노출 고정',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
      </svg>
    ),
  },
  {
    href: '/admin/awards',
    label: '수상',
    desc: '수상 내역 등록 및 삭제',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ),
  },
  {
    href: '/admin/project',
    label: '프로젝트',
    desc: '산학협력·해외교류 관리',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/admin/event',
    label: '이벤트',
    desc: '특강·워크숍·캠퍼스투어 CRUD',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/admin/exhibition',
    label: '졸업전시',
    desc: '쇼케이스·전시 CRUD',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    href: '/admin/types',
    label: '유형 관리',
    desc: '아티클·프로젝트 유형 추가/삭제',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [authReady, setAuthReady] = useState(false)
  const [signingOut, startSignOut] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/admin/login'
      } else {
        setAuthReady(true)
      }
    })
  }, [])

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <svg className="animate-spin w-8 h-8 text-nwcn-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
    )
  }

  const activeNav = NAV_ITEMS.find((item) => pathname.startsWith(item.href))

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* 상단 헤더 */}
      <header className="border-b border-white/10 bg-[#0f0f0f]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px] h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/work" className="font-brand text-xl text-nwcn-green">NWCN</Link>
            <span className="font-body text-xs text-white/20 px-2 py-0.5 border border-white/10 rounded-full">ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 font-body text-xs text-white/30 hover:text-white/60 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              사이트 보기
            </a>
            <button
              onClick={() => startSignOut(async () => { await signOut() })}
              disabled={signingOut}
              className="flex items-center gap-1.5 font-body text-xs text-white/30 hover:text-red-400 transition-colors disabled:opacity-40"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {signingOut ? '로그아웃 중...' : '로그아웃'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px] py-12">
        <div className="mb-10">
          <h1 className="font-body font-bold text-[28px] text-white mb-2">콘텐츠 관리</h1>
          <p className="font-body text-sm text-white/30">
            작업물, 아티클, 수상, 프로젝트, 이벤트, 전시 콘텐츠를 등록하고 관리합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 사이드 네비게이션 */}
          <aside className="lg:col-span-1">
            <nav className="space-y-1">
              {NAV_ITEMS.map(({ href, label, icon }) => {
                const isActive = pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-nwcn-green/10 text-nwcn-green border border-nwcn-green/20'
                        : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                    }`}
                  >
                    {icon}
                    <span className="font-body text-sm font-medium">{label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="mt-8 p-4 rounded-xl border border-white/8 bg-white/3">
              <div className="flex items-start gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#09F593" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="font-body text-xs text-white/40 leading-relaxed">
                  저장 후 해당 페이지에 즉시 반영됩니다.
                  NCR 아티클 홈 고정은 최대 2개 설정 가능합니다.
                </p>
              </div>
            </div>
          </aside>

          {/* 콘텐츠 영역 */}
          <div className="lg:col-span-3">
            <div className="bg-white/3 border border-white/8 rounded-2xl p-8">
              {/* 페이지 헤더 */}
              {activeNav && (
                <div className="mb-8 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-nwcn-green/10 flex items-center justify-center text-nwcn-green">
                      {activeNav.icon}
                    </div>
                    <div>
                      <h2 className="font-body font-bold text-[18px] text-white">{activeNav.label}</h2>
                      <p className="font-body text-xs text-white/30">{activeNav.desc}</p>
                    </div>
                  </div>
                </div>
              )}
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
