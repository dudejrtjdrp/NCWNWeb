import type { MetadataRoute } from 'next'

/**
 * PWA 웹 앱 매니페스트 (/manifest.webmanifest)
 * - 모바일 홈 화면 추가 시 앱 이름·테마·아이콘 정의
 * - 아이콘은 동적 생성되는 app/icon.tsx, app/apple-icon.tsx 사용
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NWCN — 뉴미디어콘텐츠과',
    short_name: 'NWCN',
    description:
      '동아방송예술대학교 뉴미디어콘텐츠과 공식 홈페이지. 예술과 기술이 만나는 곳에서 새로운 미디어를 만들어냅니다.',
    start_url: '/',
    display: 'standalone',
    background_color: '#151515',
    theme_color: '#09F593',
    lang: 'ko',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
