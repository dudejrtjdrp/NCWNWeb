/**
 * 목(mock) 썸네일 폴백 유틸
 * ─────────────────────────────────────────────────────────────
 * thumbnail_url 이 비어 있거나(NULL/''), 외부 placeholder(picsum 등)라서
 * 회색으로만 보이던 카드에 로컬 온브랜드 목 이미지를 결정적으로 매핑한다.
 *
 * - 로컬 자산(/public/images/ninc/mock/*)이라 외부 네트워크 의존이 없어
 *   picsum 차단·지연 등으로 인한 "회색 썸네일"을 근본적으로 방지한다.
 * - id 기반 해시로 매핑하므로 같은 행은 항상 같은 목 이미지를 받는다.
 * - 마이그레이션(scripts/migrate-mock-thumbnails.ts)과 동일한 규칙을 공유한다.
 */

/** 로컬 목 썸네일 풀 (scripts/gen-mocks 로 생성, 12종) */
export const MOCK_THUMBNAILS: string[] = Array.from(
  { length: 12 },
  (_, i) => `/images/ninc/mock/mock-${String(i + 1).padStart(2, '0')}.webp`
)

/** 교체 대상으로 간주하는 외부 placeholder 패턴 */
const PLACEHOLDER_PATTERNS = ['picsum.photos', 'placeholder', 'via.placeholder', 'dummyimage']

/** 실제 이미지가 아니라 폴백(목)으로 채워야 하는 URL인지 판정 */
export function isMissingThumbnail(url: string | null | undefined): boolean {
  if (!url || !url.trim()) return true
  return PLACEHOLDER_PATTERNS.some((p) => url.includes(p))
}

/** seed(보통 행 id)를 12종 풀에 결정적으로 매핑 */
export function mockThumbnail(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return MOCK_THUMBNAILS[h % MOCK_THUMBNAILS.length]
}

/**
 * 카드 렌더에 사용할 썸네일을 결정한다.
 * 실제 이미지가 있으면 그대로, 없거나 placeholder면 로컬 목으로 폴백.
 */
export function resolveThumbnail(url: string | null | undefined, seed: string): string {
  return isMissingThumbnail(url) ? mockThumbnail(seed) : (url as string)
}
