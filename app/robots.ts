import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ncwn-web.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // 어드민, 인증, API 경로는 크롤링 차단
        disallow: ['/admin/', '/admin/login/', '/api/', '/auth/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
