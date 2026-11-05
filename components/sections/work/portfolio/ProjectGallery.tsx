'use client'

/**
 * ProjectGallery — 포트폴리오 프로젝트 이미지 (대표 1장 크게 + 나머지 2열) + 눌러서 크게 보기
 * 크게 보기: 화면 가득 어두운 바탕, ←/→(키보드·버튼)로 넘기기, Esc·바깥 누르기로 닫기, 열린 동안 배경 스크롤 잠금.
 * PDF 쪽 이미지는 글씨가 작아 작은 칸에서는 못 읽기 때문에, 모든 이미지를 누를 수 있게 했다.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

interface Labels {
  open: string
  close: string
  prev: string
  next: string
}

export default function ProjectGallery({ cover, rest, title, labels }: { cover: string | null; rest: string[]; title: string; labels: Labels }) {
  const all = [...(cover ? [cover] : []), ...rest]
  const [at, setAt] = useState<number | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  const close = useCallback(() => setAt(null), [])
  const go = useCallback((d: number) => setAt((i) => (i == null ? i : (i + d + all.length) % all.length)), [all.length])

  useEffect(() => {
    if (at == null) return
    restoreRef.current = document.activeElement as HTMLElement | null
    const { body, documentElement: html } = document
    const prev = body.style.overflow
    body.style.overflow = 'hidden'
    html.classList.add('lenis-stopped')
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Tab') {
        // 포커스를 크게 보기 안에 가둔다 (버튼 3개)
        const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-lightbox] button'))
        const i = nodes.indexOf(document.activeElement as HTMLElement)
        e.preventDefault()
        nodes[(i + (e.shiftKey ? -1 : 1) + nodes.length) % nodes.length]?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      body.style.overflow = prev
      html.classList.remove('lenis-stopped')
      restoreRef.current?.focus?.()
    }
    // at 이 바뀔 때마다(넘길 때) 다시 걸 필요는 없어 열림/닫힘만 본다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [at == null, close, go])

  if (!all.length) return null
  const thumb = (src: string, i: number, big: boolean) => (
    <button
      type="button"
      onClick={() => setAt(i)}
      aria-label={`${labels.open} — ${title} ${i + 1}/${all.length}`}
      className="group relative block aspect-[16/10] w-full cursor-zoom-in overflow-hidden bg-nwcn-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark focus-visible:ring-offset-2"
    >
      <Image
        src={src}
        alt={big ? title : ''}
        fill
        sizes={big ? '(min-width: 1024px) 60vw, 100vw' : '(min-width: 1024px) 30vw, 50vw'}
        className="object-contain transition-transform duration-slow ease-nwcn group-hover:scale-[1.015]"
      />
      <span aria-hidden="true" className="absolute bottom-2 right-2 bg-nwcn-dark/80 px-1.5 py-0.5 font-semibold text-caption text-white opacity-0 transition-opacity duration-fast ease-nwcn group-hover:opacity-100 group-focus-visible:opacity-100">
        ⤢
      </span>
    </button>
  )

  return (
    <>
      {cover && thumb(cover, 0, true)}
      {rest.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3">
          {rest.map((src, j) => (
            <li key={src}>{thumb(src, j + (cover ? 1 : 0), !cover && j === 0)}</li>
          ))}
        </ul>
      )}

      {at != null &&
        createPortal(
          <div data-lightbox role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[90] flex flex-col bg-nwcn-dark text-white">
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <p className="m-0 min-w-0 truncate font-semibold text-body-sm">
                {title} <span className="ml-2 tabular-nums text-white/60">{at + 1} / {all.length}</span>
              </p>
              <button ref={closeRef} type="button" onClick={close} aria-label={labels.close} className="grid h-10 w-10 shrink-0 place-items-center border border-white/40 transition-colors duration-fast ease-nwcn hover:bg-white hover:text-nwcn-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="relative min-h-0 flex-1" onClick={(e) => e.target === e.currentTarget && close()}>
              {/* 원본(R2 webp, 긴 변 2000px)을 그대로 — 크게 볼 때 서버 이미지 변환을 기다리지 않게 */}
              <Image key={all[at]} src={all[at]} alt={`${title} ${at + 1}`} fill unoptimized className="object-contain p-2 sm:p-6" />
            </div>
            {all.length > 1 && (
              <div className="flex items-center justify-center gap-3 px-4 py-4">
                <button type="button" onClick={() => go(-1)} aria-label={labels.prev} className="grid h-11 w-11 place-items-center border border-white/40 text-lead transition-colors duration-fast ease-nwcn hover:bg-white hover:text-nwcn-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  <span aria-hidden="true">←</span>
                </button>
                <button type="button" onClick={() => go(1)} aria-label={labels.next} className="grid h-11 w-11 place-items-center border border-white/40 text-lead transition-colors duration-fast ease-nwcn hover:bg-white hover:text-nwcn-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  )
}
