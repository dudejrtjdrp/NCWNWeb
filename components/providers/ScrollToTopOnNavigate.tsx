'use client'

/**
 * ScrollToTopOnNavigate
 *
 * 페이지 경로(pathname)가 바뀔 때마다 스크롤을 최상단으로 이동.
 * Lenis가 window.__lenis에 등록되어 있으면 lenis.scrollTo(0, { immediate: true })를 사용하고,
 * 그렇지 않으면 window.scrollTo({ top: 0, behavior: 'instant' })로 fallback.
 */

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import type Lenis from 'lenis'

export default function ScrollToTopOnNavigate() {
  const pathname = usePathname()

  useEffect(() => {
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
  }, [pathname])

  return null
}
