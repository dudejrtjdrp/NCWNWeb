/**
 * Admin 공통 UI 컴포넌트
 */

'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import type { ActionResult } from '../actions'
import { useLoading } from '@/components/providers/LoadingProvider'

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-body text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
      {children}
    </label>
  )
}

export function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-body text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-nwcn-green/50 transition-colors"
    />
  )
}

export function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-body text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-nwcn-green/50 transition-colors resize-none"
    />
  )
}

export function Sel({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...props}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-nwcn-green/50 transition-colors appearance-none cursor-pointer"
    >
      {children}
    </select>
  )
}

export function FileDropZone({
  accept,
  label,
  onFiles,
}: {
  accept: string
  label: string
  onFiles?: (files: FileList) => void
}) {
  const [dragging, setDragging] = useState(false)
  const [fileNames, setFileNames] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const files = e.dataTransfer.files
    if (files.length) {
      setFileNames(Array.from(files).map((f) => f.name))
      onFiles?.(files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files?.length) {
      setFileNames(Array.from(files).map((f) => f.name))
      onFiles?.(files)
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
        dragging ? 'border-nwcn-green bg-nwcn-green/5' : 'border-white/15 hover:border-white/30'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        {fileNames.length > 0 ? (
          <div className="space-y-1">
            {fileNames.map((name) => (
              <p key={name} className="font-body text-sm text-nwcn-green">{name}</p>
            ))}
          </div>
        ) : (
          <>
            <p className="font-body text-sm text-white/40">{label}</p>
            <p className="font-body text-xs text-white/20">클릭하거나 드래그하세요</p>
          </>
        )}
      </div>
    </div>
  )
}

export function Feedback({ result }: { result: ActionResult | null }) {
  if (!result) return null
  if ('success' in result) {
    return (
      <div className="flex items-center gap-3 bg-nwcn-green/10 border border-nwcn-green/30 rounded-xl p-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#09F593" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <p className="font-body text-sm text-nwcn-green">저장이 완료되었습니다!</p>
      </div>
    )
  }

  // 세션 만료 에러 → 로그인 페이지로 이동
  const isSessionExpired = result.error.includes('세션이 만료') || result.error.includes('인증이 필요')
  if (isSessionExpired) {
    return (
      <div className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="font-body text-sm text-red-400">{result.error} 다시 로그인해주세요.</p>
        </div>
        <button
          type="button"
          onClick={() => { window.location.href = '/admin/login' }}
          className="flex-shrink-0 px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg font-body text-xs hover:bg-red-500/30 transition-colors"
        >
          로그인
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="font-body text-sm text-red-400">{result.error}</p>
    </div>
  )
}

export function SubmitButton({ loading, label = '저장하기' }: { loading: boolean; label?: string }) {
  const { showLoading, hideLoading } = useLoading()

  useEffect(() => {
    if (loading) showLoading()
    else hideLoading()
  }, [loading, showLoading, hideLoading])

  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-nwcn-green text-nwcn-text-default font-body font-semibold text-sm py-4 rounded-xl transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          저장 중...
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {label}
        </>
      )}
    </button>
  )
}

export function DeleteButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()
  const { showLoading, hideLoading } = useLoading()

  useEffect(() => {
    if (pending) showLoading()
    else hideLoading()
  }, [pending, showLoading, hideLoading])

  if (confirming) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => {
            startTransition(async () => {
              await onDelete()
              setConfirming(false)
            })
          }}
          disabled={pending}
          className="px-3 py-1.5 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg font-body text-xs font-semibold hover:bg-red-500/30 disabled:opacity-50 transition-colors"
        >
          {pending ? '삭제 중...' : '확인'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/40 rounded-lg font-body text-xs hover:bg-white/10 transition-colors"
        >
          취소
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/30 rounded-lg font-body text-xs hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-colors"
    >
      삭제
    </button>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <svg className="animate-spin w-5 h-5 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>
  )
}
