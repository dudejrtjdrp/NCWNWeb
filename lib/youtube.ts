/**
 * YouTube 링크 정규화 유틸
 *
 * 관리자가 입력한 다양한 형태의 유튜브 링크를 iframe 임베드용 URL로 변환한다.
 * - https://www.youtube.com/watch?v=VIDEOID&t=10s
 * - https://youtu.be/VIDEOID
 * - https://www.youtube.com/shorts/VIDEOID
 * - https://www.youtube.com/embed/VIDEOID  (이미 임베드 형태)
 * 위 모두 → https://www.youtube.com/embed/VIDEOID 로 통일한다.
 *
 * 유튜브가 아닌 경우(예: vimeo 임베드 등)에는 입력값을 그대로 반환해
 * 다른 영상 임베드도 허용한다. 빈 값/유효하지 않으면 null을 반환한다.
 */

const YT_ID_RE = /^[a-zA-Z0-9_-]{11}$/

/** 다양한 유튜브 URL에서 11자리 video ID를 추출한다. 실패 시 null. */
export function extractYouTubeId(raw: string): string | null {
  const url = raw.trim()
  if (!url) return null

  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '').toLowerCase()

    // youtu.be/VIDEOID
    if (host === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0]
      return id && YT_ID_RE.test(id) ? id : null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      // watch?v=VIDEOID
      const v = u.searchParams.get('v')
      if (v && YT_ID_RE.test(v)) return v

      // /embed/VIDEOID, /shorts/VIDEOID, /v/VIDEOID, /live/VIDEOID
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts.length >= 2 && ['embed', 'shorts', 'v', 'live'].includes(parts[0])) {
        const id = parts[1]
        return id && YT_ID_RE.test(id) ? id : null
      }
    }
  } catch {
    // URL 파싱 실패 → 순수 ID만 입력한 경우 허용
    if (YT_ID_RE.test(url)) return url
  }
  return null
}

/**
 * 영상 임베드용 URL을 반환한다.
 * - 유튜브 링크 → https://www.youtube.com/embed/VIDEOID
 * - 그 외 http(s) URL → 입력값 그대로 (vimeo 등 다른 임베드 허용)
 * - 빈 값/유효하지 않음 → null
 */
export function normalizeVideoEmbed(raw: string | null | undefined): string | null {
  const url = (raw ?? '').trim()
  if (!url) return null

  const id = extractYouTubeId(url)
  if (id) return `https://www.youtube.com/embed/${id}`

  // 유튜브가 아니면 http(s) URL만 통과
  if (/^https?:\/\//i.test(url)) return url
  return null
}
