import type { Metadata } from 'next'

/**
 * 로케일별 canonical + hreflang 대체 URL 빌더.
 * - 기본 로케일(ko)은 prefix 없음, 영어는 /en prefix
 * - x-default 는 기본 로케일(ko)로 지정
 * @param locale 현재 페이지 로케일
 * @param path   SITE_URL 기준 상대 경로 (홈은 '')
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ncwn-web.vercel.app'

export function localizedAlternates(locale: string, path = ''): Metadata['alternates'] {
  const koUrl = `${SITE_URL}${path}`
  const enUrl = `${SITE_URL}/en${path}`
  return {
    canonical: locale === 'en' ? enUrl : koUrl,
    languages: {
      ko: koUrl,
      en: enUrl,
      'x-default': koUrl,
    },
  }
}
