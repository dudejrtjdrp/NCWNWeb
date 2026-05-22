'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="font-brand text-[80px] text-red-500/10 leading-none select-none">!</p>
      <h1 className="font-brand text-3xl text-white mt-4 mb-3">오류가 발생했어요</h1>
      <p className="font-body text-sm text-white/40 mb-8">
        잠시 후 다시 시도해 주세요.
      </p>
      <button onClick={reset} className="btn-primary">
        다시 시도
      </button>
    </div>
  )
}
