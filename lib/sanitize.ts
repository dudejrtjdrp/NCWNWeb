/**
 * 아티클 본문 HTML sanitize (서버 렌더링용)
 *
 * 블로그형 에디터가 저장한 HTML을 상세페이지에서 안전하게 렌더하기 위해
 * isomorphic-dompurify로 정화한다. 유튜브/비메오 iframe 임베드는 허용한다.
 */

import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_IFRAME_HOSTS = [
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
]

let hookRegistered = false
function ensureHook() {
  if (hookRegistered) return
  hookRegistered = true
  // 허용된 호스트가 아닌 iframe은 제거
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName !== 'iframe') return
    const el = node as Element
    const src = el.getAttribute('src') || ''
    try {
      const host = new URL(src).hostname
      if (!ALLOWED_IFRAME_HOSTS.includes(host)) el.remove()
    } catch {
      el.remove()
    }
  })
}

/** 본문 HTML 정화 — 허용 태그/속성 + 유튜브·비메오 iframe */
export function sanitizeArticleHtml(html: string): string {
  ensureHook()
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'target', 'data-embed'],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel',
      'allow', 'allowfullscreen', 'frameborder', 'data-embed', 'width', 'height',
    ],
  })
}

/** 문자열이 HTML 마크업을 포함하는지(블로그 에디터 출력) 간단 판별 */
export function isHtmlContent(content: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(content)
}
