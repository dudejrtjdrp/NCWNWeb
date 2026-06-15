/**
 * 로케일 레이아웃
 * - 언어별 메타데이터, html lang 속성, 폰트 처리
 * - next-intl NextIntlClientProvider 제공
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import SmoothScroll from '@/components/providers/SmoothScroll'
import ScrollToTopOnNavigate from '@/components/providers/ScrollToTopOnNavigate'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ncwn-web.vercel.app'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'common' })

  const isKo = locale === 'ko'

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t('siteName'),
      template: '%s | NWCN',
    },
    description: t('siteDescription'),
    keywords: isKo
      ? ['뉴미디어콘텐츠과', 'NWCN', '동아방송예술대학교', '뉴미디어', '미디어콘텐츠', 'NCR TREND', '학과 소개', '입학']
      : ['New Media Contents', 'NWCN', 'Dong-A Broadcasting Arts University', 'New Media', 'Media Contents', 'NCR TREND'],
    // NOTE: canonical/hreflang 은 페이지별로 지정한다.
    // 레이아웃에 홈 URL을 고정하면 모든 서브페이지가 홈을 canonical 로 상속해
    // 색인에서 누락되는 문제가 있어 여기서는 설정하지 않는다. (홈은 page.tsx 에서 지정)
    openGraph: {
      type: 'website',
      locale: isKo ? 'ko_KR' : 'en_US',
      url: SITE_URL,
      siteName: t('siteName'),
      title: t('siteName'),
      description: t('siteDescription'),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('siteName'),
      description: t('siteDescription'),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
    },
    verification: {
      google: 'UXv7WRr34HWG-YLRrP5yO_ev4m0goVrY7VPP1Dltdk0',
    },
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // 지원하지 않는 로케일은 404
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // 서버에서 메시지 로드 → 클라이언트 Provider에 전달
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <SmoothScroll>
        <ScrollToTopOnNavigate />
        {children}
      </SmoothScroll>
    </NextIntlClientProvider>
  )
}
