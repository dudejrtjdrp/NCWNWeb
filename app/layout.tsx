/**
 * 루트 레이아웃
 * - Next.js App Router는 반드시 루트에 <html>, <body>가 있어야 함
 * - getLocale()로 현재 로케일을 읽어 lang 속성에 적용
 * - 실제 Provider/컴포넌트 구성은 [locale]/layout.tsx에서 처리
 */
import type { Viewport } from 'next'
import { getLocale } from 'next-intl/server'
import { LoadingProvider } from '@/components/providers/LoadingProvider'
import { NavigationProgress } from '@/components/providers/NavigationProgress'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#09F593',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* 폰트 CDN 사전 연결 — 렌더 블로킹 CSS @import 지연 완화 (LCP 개선) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
      </head>
      <body>
        <LoadingProvider>
          <NavigationProgress />
          {children}
        </LoadingProvider>
      </body>
    </html>
  )
}
