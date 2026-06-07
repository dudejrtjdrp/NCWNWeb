/**
 * 루트 레벨 404 페이지
 *
 * Next.js App Router는 [locale] 세그먼트 안의 not-found.tsx만으로는
 * 루트 경로 404를 처리하지 못함. 루트에 이 파일이 없으면 Next.js 기본
 * 404("This page could not be found.")가 노출됨.
 *
 * next-intl의 getLocale()로 현재 로케일을 읽고,
 * NextIntlClientProvider + NotFound404Page를 직접 렌더링.
 * onBack은 서버 컴포넌트에서 주입 불가하므로 생략(뒤로가기 버튼은 숨김).
 */

import { getLocale, getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import NotFound404Page from '@/components/base/NotFound404Page'

export default async function RootNotFound() {
  const locale = await getLocale()
  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NotFound404Page homeHref="/" />
    </NextIntlClientProvider>
  )
}
