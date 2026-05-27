import { ApiError } from './apiError'

type Entry = { count: number; reset: number }

const store = new Map<string, Entry>()

export function checkRateLimit(req: Request, key = 'global', limit = 60, windowMs = 60_000) {
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown').split(',')[0].trim()
  const k = `${key}:${ip}`
  const now = Date.now()
  const e = store.get(k)
  if (!e || now > e.reset) {
    store.set(k, { count: 1, reset: now + windowMs })
    return
  }
  if (e.count >= limit) {
    throw new ApiError('Too many requests', 429, 'rate_limited')
  }
  e.count += 1
  store.set(k, e)
}

// 테스트/디버깅용: 내부 스토어 초기화
export function _resetRateLimiter() {
  store.clear()
}
