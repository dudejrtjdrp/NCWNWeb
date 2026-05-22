'use client'

/**
 * 페이지: 404 Not Found
 * Figma node-id: 376:1202
 *
 * BASE 컴포넌트 NotFound404Page를 사용하여 렌더링.
 * 'use client' 선언 이유: useRouter().back()을 통한 이전 페이지 이동 처리
 */

import { useRouter } from 'next/navigation'
import NotFound404Page from '@/components/base/NotFound404Page'

export default function NotFound() {
  const router = useRouter()

  return (
    <NotFound404Page
      homeHref="/"
      onBack={() => router.back()}
    />
  )
}
