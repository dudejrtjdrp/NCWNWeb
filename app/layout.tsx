import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: {
    default: 'NWCN — 뉴미디어콘텐츠과',
    template: '%s | NWCN',
  },
  description:
    '동아방송예술대학교 뉴미디어콘텐츠과 공식 홈페이지. 예술과 기술이 만나는 곳에서 새로운 미디어를 만들어냅니다.',
  keywords: ['뉴미디어콘텐츠과', 'NWCN', '동아방송예술대학교', '미디어', '콘텐츠', '디지털'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'NWCN',
    title: 'NWCN — 뉴미디어콘텐츠과',
    description: '예술과 기술이 만나는 곳에서 새로운 미디어를 만들어냅니다.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#09F593',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
