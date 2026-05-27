import { NextResponse } from 'next/server'
import { logError } from './logger'
import { ApiError } from './apiError'

export function withHandler(handler: (req: any, ctx?: any) => Promise<any>) {
  return async (req: any, ctx?: any) => {
    try {
      return await handler(req, ctx)
    } catch (err) {
      // 중앙에서 예외를 포착해 일관된 응답을 보냅니다.
      logError('Unhandled API error', err)
      if (err instanceof ApiError) {
        return NextResponse.json({ error: err.message, code: err.code }, { status: err.status })
      }
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
  }
}
