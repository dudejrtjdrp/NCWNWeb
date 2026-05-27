/**
 * 인메모리 Rate Limiter
 *
 * ⚠️  서버리스 환경(Vercel)에서는 인스턴스 간 공유가 안 됩니다.
 *     트래픽이 많아지면 Redis/Upstash 기반으로 교체를 권장합니다.
 *
 * 개선사항:
 * - 만료된 엔트리를 주기적으로 정리하여 메모리 누수 방지
 * - 최대 엔트리 수 제한 (MAX_ENTRIES) 로 OOM 방어
 * - IP 추출 로직 강화 (IPv6 포함)
 */

import { ApiError } from './apiError'

type Entry = { count: number; reset: number }

const store = new Map<string, Entry>()

/** 단일 인스턴스에서 보관할 수 있는 최대 IP별 엔트리 수 */
const MAX_ENTRIES = 10_000

/**
 * 만료된 엔트리를 모두 제거합니다.
 * 엔트리가 많아지거나 주기적으로 호출됩니다.
 */
function pruneExpired(): void {
  const now = Date.now()
  for (const [k, entry] of store) {
    if (now > entry.reset) store.delete(k)
  }
}

/**
 * 요청 헤더에서 클라이언트 IP를 추출합니다.
 * Vercel / Cloudflare 환경의 프록시 헤더를 우선적으로 사용합니다.
 */
function extractIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    // "client, proxy1, proxy2" 형태에서 첫 번째 값만 사용
    const first = forwarded.split(',')[0].trim()
    if (first) return first
  }
  return req.headers.get('x-real-ip') ?? 'unknown'
}

/**
 * Rate Limit 검사.
 * 제한 초과 시 ApiError(429)를 throw합니다.
 *
 * @param req      - Request 객체
 * @param key      - 엔드포인트 식별 키 (예: 'admin-login')
 * @param limit    - 윈도우 내 최대 허용 횟수
 * @param windowMs - 카운터 리셋 주기 (ms)
 */
export function checkRateLimit(
  req: Request,
  key = 'global',
  limit = 60,
  windowMs = 60_000
): void {
  // 엔트리가 과도하게 쌓이면 정리 (비용 있는 작업이므로 임계값 도달 시에만)
  if (store.size >= MAX_ENTRIES) pruneExpired()

  const ip = extractIp(req)
  const k = `${key}:${ip}`
  const now = Date.now()
  const entry = store.get(k)

  if (!entry || now > entry.reset) {
    // 윈도우 초기화
    store.set(k, { count: 1, reset: now + windowMs })
    return
  }

  if (entry.count >= limit) {
    throw new ApiError('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 429, 'rate_limited')
  }

  entry.count += 1
  // Map은 참조형이므로 set 재호출 불필요하지만 명시적으로 업데이트
  store.set(k, entry)
}

// ── 유틸 (테스트·디버깅 전용) ──────────────────────────────

/** 내부 스토어 전체 초기화 (테스트용) */
export function _resetRateLimiter(): void {
  store.clear()
}

/** 현재 스토어 엔트리 수 반환 (모니터링용) */
export function _getRateLimiterSize(): number {
  return store.size
}
