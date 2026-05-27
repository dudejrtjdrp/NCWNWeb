import type { Metadata, Viewport } from 'next'
import './globals.css'
import SmoothScroll from '@/components/providers/SmoothScroll'
import ScrollToTopOnNavigate from '@/components/providers/ScrollToTopOnNavigate'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ncwn-web.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'NWCN — 뉴미디어콘텐츠과',
    template: '%s | NWCN',
  },
  description:
    '동아방송예술대학교 뉴미디어콘텐츠과 공식 홈페이지. 예술과 기술이 만나는 곳에서 새로운 미디어를 만들어냅니다.',
  keywords: [
    '뉴미디어콘텐츠과',
    'NWCN',
    '동아방송예술대학교',
    '동아방송예술대',
    '뉴미디어',
    '미디어콘텐츠',
    '콘텐츠 제작',
    '영상 제작',
    '디지털 미디어',
    'NCR TREND',
    '학과 소개',
    '입학',
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    siteName: 'NWCN — 뉴미디어콘텐츠과',
    title: 'NWCN — 뉴미디어콘텐츠과',
    description:
      '동아방송예술대학교 뉴미디어콘텐츠과 공식 홈페이지. 예술과 기술이 만나는 곳에서 새로운 미디어를 만들어냅니다.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NWCN — 뉴미디어콘텐츠과',
    description:
      '동아방송예술대학교 뉴미디어콘텐츠과 공식 홈페이지. 예술과 기술이 만나는 곳에서 새로운 미디어를 만들어냅니다.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
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
