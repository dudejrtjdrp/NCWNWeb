import type { Metadata, Viewport } from 'next'
import './globals.css'
import SmoothScroll from '@/components/providers/SmoothScroll'
import ScrollToTopOnNavigate from '@/components/providers/ScrollToTopOnNavigate'

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
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#09F593',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        {/*
          NavBar와 Footer는 각 페이지에서 직접 렌더링.
          홈 페이지는 HeroSection 스크롤 애니메이션 위에 NavBar가 fixed로 올라옴.
          서브 페이지는 SubPageLayout을 통해 공통 Header/Footer를 포함.
        */}
        <SmoothScroll>
          <ScrollToTopOnNavigate />
          {children}
        </SmoothScroll>
      </body>
    </html>
  )
}
