/**
 * Tiptap 커스텀 확장 (NCR 아티클 에디터용)
 *
 * - FontSize : TextStyle 마크에 font-size 속성을 추가 (글자 크기 조절)
 * - Embed    : 유튜브/비메오 등 영상 링크를 iframe으로 임베드하는 atom 노드
 */

import { Extension, Node, mergeAttributes } from '@tiptap/core'

// ── 글자 크기 (TextStyle 확장) ─────────────────────────────
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
    embed: {
      setEmbed: (src: string) => ReturnType
    }
  }
}

export const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) =>
              attributes.fontSize ? { style: `font-size: ${attributes.fontSize}` } : {},
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize:
        (size) =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    }
  },
})

// ── 영상 링크 → 임베드 URL 변환 ────────────────────────────
/** 유튜브/비메오 URL을 iframe src(embed URL)로 변환. 지원 안 되면 원본 반환 */
export function toEmbedUrl(raw: string): string {
  const url = raw.trim()
  // YouTube
  const yt =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/) ?? null
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/) ?? null
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return url
}

// ── 영상 임베드 노드 ──────────────────────────────────────
export const Embed = Node.create({
  name: 'embed',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return { src: { default: null } }
  },

  parseHTML() {
    return [{ tag: 'iframe[data-embed]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { class: 'article-embed' },
      [
        'iframe',
        mergeAttributes(HTMLAttributes, {
          'data-embed': 'true',
          frameborder: '0',
          allow:
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowfullscreen: 'true',
        }),
      ],
    ]
  },

  addCommands() {
    return {
      setEmbed:
        (src) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { src: toEmbedUrl(src) } }),
    }
  },
})
