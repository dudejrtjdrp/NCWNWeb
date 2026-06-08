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
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-white">
      <p className="font-brand text-[80px] text-red-500/20 leading-none select-none">!</p>
      <h1 className="font-brand text-3xl text-nwcn-text-default mt-4 mb-3">오류가 발생했어요</h1>
      <p className="font-body text-sm text-nwcn-text-muted/60 mb-8">
        잠시 후 다시 시도해 주세요.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center px-6 py-3 font-body font-semibold text-[16px] bg-nwcn-green text-nwcn-dark transition-all duration-200 hover:bg-[#133728] hover:text-nwcn-green active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-green focus-visible:ring-offset-2"
      >
        다시 시도
      </button>
    </div>
  )
}
