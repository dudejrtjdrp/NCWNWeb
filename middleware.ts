import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // 현재는 패스스루 — 추후 Supabase Auth 세션 갱신 로직 추가 예정
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 아래 경로 제외하고 모든 요청에 매칭:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
