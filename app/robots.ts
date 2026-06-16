import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.dima-nwcn.com'

/** 비공개 경로 — 모든 봇 공통 차단 */
const DISALLOW = ['/admin/', '/admin/login/', '/api/', '/auth/']

/**
 * GEO(생성형 엔진 최적화)를 위해 명시 허용하는 AI 크롤러.
 * ChatGPT·Claude·Perplexity·Gemini 등 AI 답변/검색에 콘텐츠가 인용되도록 허용한다.
 * (학과 홍보 목적이므로 학습·검색 크롤링을 허용. 차단을 원하면 allow → disallow 로 변경)
 */
const AI_BOTS = [
  'GPTBot', // OpenAI 학습 크롤러
  'OAI-SearchBot', // ChatGPT 검색
  'ChatGPT-User', // ChatGPT 브라우징
  'ClaudeBot', // Anthropic 학습 크롤러
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot', // Perplexity
  'Perplexity-User',
  'Google-Extended', // Gemini/Vertex 학습
  'Applebot-Extended', // Apple Intelligence
  'Bytespider', // TikTok/Doubao
  'CCBot', // Common Crawl
  'Amazonbot',
  'cohere-ai',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 일반 검색엔진(구글/네이버/빙 등)
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      // AI 크롤러 — GEO 목적 명시 허용
      {
        userAgent: AI_BOTS,
        allow: '/',
        disallow: DISALLOW,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
