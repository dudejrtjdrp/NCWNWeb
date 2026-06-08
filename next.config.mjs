import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

// R2 공개 도메인(R2_PUBLIC_URL)에서 호스트명을 추출해 next/image 허용 목록에 추가
const r2PublicHost = (() => {
  try {
    return process.env.R2_PUBLIC_URL
      ? new URL(process.env.R2_PUBLIC_URL).hostname
      : null
  } catch {
    return null
  }
})()

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Server Actions 파일 업로드 크기 제한 (actions.ts 검증 한도와 일치)
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      // R2 커스텀 도메인 (현재 이미지 호스트)
      ...(r2PublicHost
        ? [{ protocol: 'https', hostname: r2PublicHost }]
        : []),
      {
        // 레거시 Supabase Storage (데이터 이전 완료 후 제거 가능)
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        // Figma MCP 에셋 (임시 — 7일 만료, /public/images 교체 권장)
        protocol: 'https',
        hostname: 'www.figma.com',
        pathname: '/api/mcp/asset/**',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
