'use client'

/**
 * 크기 조절 가능한 이미지 확장 (Tiptap)
 *
 * - @tiptap/extension-image를 확장해 `width`(인라인 style) 속성 추가
 * - 선택 시 25/50/75/100% 프리셋 버튼 + 우하단 드래그 핸들로 폭 조절
 * - getHTML 직렬화 시 style에 width가 포함되어 상세페이지에도 동일 반영
 *   (lib/sanitize.ts에서 img의 width/max-width/height 스타일 허용)
 */

import Image from '@tiptap/extension-image'
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { useRef } from 'react'

function ImageNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, title, width } = node.attrs as {
    src: string; alt?: string; title?: string; width?: string | null
  }
  const imgRef = useRef<HTMLImageElement>(null)

  const setPercent = (p: number | null) => {
    updateAttributes({ width: p === null ? null : `${p}%` })
  }

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startW = imgRef.current?.offsetWidth ?? 0
    const parentW = imgRef.current?.parentElement?.parentElement?.offsetWidth ?? startW
    const onMove = (ev: MouseEvent) => {
      const next = Math.max(80, Math.min(parentW, startW + (ev.clientX - startX)))
      updateAttributes({ width: `${Math.round((next / parentW) * 100)}%` })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <NodeViewWrapper className="article-img-block" style={{ position: 'relative', lineHeight: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt ?? ''}
        title={title ?? undefined}
        style={{
          width: width ?? 'auto',
          maxWidth: '100%',
          height: 'auto',
          borderRadius: 10,
          display: 'inline-block',
          outline: selected ? '2px solid #09F593' : 'none',
          outlineOffset: 2,
        }}
        draggable={false}
      />
      {selected && (
        <>
          {/* 프리셋 크기 버튼 */}
          <div
            contentEditable={false}
            style={{
              position: 'absolute', top: 6, left: 6, display: 'flex', gap: 4,
              background: 'rgba(0,0,0,0.6)', padding: '3px 5px', borderRadius: 8,
            }}
          >
            {[25, 50, 75, 100].map((p) => (
              <button
                key={p}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setPercent(p)}
                style={{
                  fontSize: 11, lineHeight: 1.4, color: '#fff', padding: '2px 6px',
                  borderRadius: 5, border: 'none', cursor: 'pointer',
                  background: width === `${p}%` ? '#09F593' : 'rgba(255,255,255,0.15)',
                }}
              >
                {p}%
              </button>
            ))}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setPercent(null)}
              style={{
                fontSize: 11, lineHeight: 1.4, color: '#fff', padding: '2px 6px',
                borderRadius: 5, border: 'none', cursor: 'pointer',
                background: !width ? '#09F593' : 'rgba(255,255,255,0.15)',
              }}
            >
              원본
            </button>
          </div>
          {/* 우하단 드래그 핸들 */}
          <span
            contentEditable={false}
            onMouseDown={startDrag}
            style={{
              position: 'absolute', right: -7, bottom: 1, width: 14, height: 14,
              background: '#09F593', border: '2px solid #fff', borderRadius: 4,
              cursor: 'nwse-resize',
            }}
          />
        </>
      )}
    </NodeViewWrapper>
  )
}

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      // 부모(Image)의 src/alt/title 속성 유지
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => (element as HTMLElement).style.width || element.getAttribute('width') || null,
        renderHTML: (attributes) =>
          attributes.width
            ? { style: `width: ${attributes.width}; max-width: 100%; height: auto;` }
            : {},
      },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView)
  },
})

export default ResizableImage
