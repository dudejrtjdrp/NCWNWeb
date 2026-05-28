'use client'

/**
 * LangTab — 한국어 / English 탭 전환 UI
 * Admin 폼 내부에서 사용. 각 폼은 이 컴포넌트로 탭을 감싸고,
 * 두 언어 섹션을 각각 렌더링합니다.
 */

import { useState } from 'react'

interface LangTabProps {
  koContent: React.ReactNode
  enContent: React.ReactNode
}

export default function LangTab({ koContent, enContent }: LangTabProps) {
  const [lang, setLang] = useState<'ko' | 'en'>('ko')

  return (
    <div className="space-y-4">
      {/* 탭 버튼 */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/8 w-fit">
        <button
          type="button"
          onClick={() => setLang('ko')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-body text-xs font-medium transition-all ${
            lang === 'ko'
              ? 'bg-nwcn-green text-nwcn-text-default'
              : 'text-white/40 hover:text-white'
          }`}
        >
          🇰🇷 한국어
        </button>
        <button
          type="button"
          onClick={() => setLang('en')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-body text-xs font-medium transition-all ${
            lang === 'en'
              ? 'bg-nwcn-green text-nwcn-text-default'
              : 'text-white/40 hover:text-white'
          }`}
        >
          🇺🇸 English
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className={lang === 'ko' ? 'block' : 'hidden'}>{koContent}</div>
      <div className={lang === 'en' ? 'block' : 'hidden'}>
        <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="font-body text-xs text-blue-400">
            비워두면 영어 페이지에서 한국어 원문이 그대로 표시됩니다.
          </p>
        </div>
        {enContent}
      </div>
    </div>
  )
}
