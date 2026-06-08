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
      <body>
        <LoadingProvider>
          <NavigationProgress />
          {children}
        </LoadingProvider>
      </body>
    </html>
  )
}
