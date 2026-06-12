/**
 * 아티클 본문 HTML sanitize (서버 렌더링용)
 *
 * 블로그형 에디터가 저장한 HTML을 상세페이지에서 안전하게 렌더하기 위해
 * sanitize-html로 정화한다. (jsdom 비의존 — Next 서버 번들 호환)
 * 유튜브/비메오 iframe 임베드와 글꼴·글자 크기 인라인 스타일을 허용한다.
 */

import sanitizeHtml from 'sanitize-html'

/** 본문 HTML 정화 — 허용 태그/속성 + 유튜브·비메오 iframe + 폰트 스타일 */
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'span', 'div', 'hr',
      'h1', 'h2', 'h3', 'h4',
      'strong', 'b', 'em', 'i', 'u', 's', 'del', 'mark',
      'ul', 'ol', 'li', 'blockquote',
      'a', 'img', 'iframe',
      'figure', 'figcaption', 'code', 'pre',
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'class', 'width', 'height'],
      iframe: ['src', 'allow', 'allowfullscreen', 'frameborder', 'width', 'height', 'data-embed'],
      div: ['class'],
      span: ['class'],
      p: ['class'],
      '*': ['style'],
    },
    allowedStyles: {
      '*': {
        'font-size': [/^\d+(?:px|em|rem|%)$/],
        'font-family': [/^[\w\s",.()-]+$/],
        color: [/^#(?:[0-9a-fA-F]{3}){1,2}$/, /^rgba?\([\d\s,.%]+\)$/],
        'text-align': [/^(?:left|right|center|justify)$/],
        // 이미지 크기 조절 결과 (width %/px)
        width: [/^\d+(?:px|%)$/],
        'max-width': [/^\d+(?:px|%)$/],
        height: [/^auto$/, /^\d+(?:px|%)$/],
      },
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    // 유튜브·비메오 iframe만 허용 (그 외 호스트는 제거)
    allowedIframeHostnames: [
      'www.youtube.com',
      'youtube.com',
      'www.youtube-nocookie.com',
      'player.vimeo.com',
    ],
    allowIframeRelativeUrls: false,
    transformTags: {
      // 외부 링크는 새 탭 + 안전 속성 강제
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }, true),
    },
  })
}

/** 문자열이 HTML 마크업을 포함하는지(블로그 에디터 출력) 간단 판별 */
export function isHtmlContent(content: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(content)
}
