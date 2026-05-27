/**
 * API Route: /api/faculty-photo?name=[id]
 * /public/images/faculty/[name].jpg 정적 파일로 리다이렉트
 * Figma MCP URL 의존성 제거 완료
 */

import { NextRequest, NextResponse } from 'next/server'
import { logError, logInfo } from '../../../lib/server/logger'

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
  try {
    const name = req.nextUrl.searchParams.get('name')
    if (!name || !VALID_NAMES.has(name)) {
      return new NextResponse(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'content-type': 'application/json' } })
    }

    // 정적 자원으로 리다이렉트 — CDN 캐시를 적극 활용하도록 Cache-Control 설정
    const target = new URL(`/images/faculty/${name}.png`, req.url)
    const resp = NextResponse.redirect(target)
    resp.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    logInfo('faculty-photo redirect', name)
    return resp
  } catch (err) {
    logError('faculty-photo GET failed', err)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
