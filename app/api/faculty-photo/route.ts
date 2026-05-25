/**
 * API Route: /api/faculty-photo?name=[id]
 * /public/images/faculty/[name].jpg 정적 파일로 리다이렉트
 * Figma MCP URL 의존성 제거 완료
 */

import { NextRequest, NextResponse } from 'next/server'

const VALID_NAMES = new Set([
  'bae-yun-gyeong',
  'lee-gwang-soo',
  'lee-seock-hee',
  'lee-ju-heon',
  'ahn-jong-gu',
  'yuk-sim-woong',
  'park-min-yu',
])

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')
  if (!name || !VALID_NAMES.has(name)) {
    return new NextResponse('Not found', { status: 404 })
  }
  return NextResponse.redirect(new URL(`/images/faculty/${name}.png`, req.url))
}
