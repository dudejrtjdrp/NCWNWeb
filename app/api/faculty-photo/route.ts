/**
 * API Route: /api/faculty-photo?name=[id]
 * Figma MCP 스크린샷 URL을 서버에서 프록시해 이미지 제공
 * public/images/faculty/[name].png 파일이 없을 때 fallback으로 동작
 * TODO: public/images/faculty/ 에 파일 저장 후 이 라우트 제거 가능
 */

import { NextRequest, NextResponse } from 'next/server'

// Figma MCP get_screenshot으로 받은 단기 URL (약 7일 유효)
// 만료 시 Cowork에서 재생성 필요
const PHOTO_URLS: Record<string, string> = {
  'bae-yung-yung': 'https://www.figma.com/api/mcp/asset/f03e2a03-7c61-4066-b4c4-f1f2fd6d46b4',
  'lee-gwang-soo':  'https://www.figma.com/api/mcp/asset/0c5e68ad-627e-4b0c-9568-465a1e62fcd2',
  'lee-seock-hee':  'https://www.figma.com/api/mcp/asset/71687c92-9ec2-4582-a2d1-5b98bc636ea9',
  'lee-ju-heon':    'https://www.figma.com/api/mcp/asset/3910066f-6fee-4e3b-8443-16292fda708e',
  'ahn-jong-gu':    'https://www.figma.com/api/mcp/asset/33c03796-c749-49f8-96aa-b990a8920c84',
  'yuk-sim-woong':  'https://www.figma.com/api/mcp/asset/de0a8bec-65df-4bff-b5aa-3c3dc8639c26',
  'park-min-yu':    'https://www.figma.com/api/mcp/asset/7675b7d7-ad01-4413-891c-0c6d1a1b82ff',
}

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')
  if (!name || !PHOTO_URLS[name]) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const upstream = await fetch(PHOTO_URLS[name], {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NWCN/1.0)' },
      next: { revalidate: 3600 }, // 1시간 캐시
    })
    if (!upstream.ok) {
      return new NextResponse('Upstream error', { status: 502 })
    }
    const buf = await upstream.arrayBuffer()
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    })
  } catch {
    return new NextResponse('Fetch failed', { status: 502 })
  }
}
