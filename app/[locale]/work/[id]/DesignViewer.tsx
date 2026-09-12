'use client'

/**
 * 작품 상세 — 이미지 뷰어
 * 메인 이미지를 클릭하면 공통 Modal 라이트박스로 원본을 크게 볼 수 있다.
 */

import { useState } from 'react'
import Image from 'next/image'
import Modal from '@/components/ui/Modal'
import { cn } from '@/lib/utils'

interface Props {
  images: (string | null)[]
  title: string
}

function EmptyArt({ index }: { index: number }) {
  return (
    <div className="flex flex-col items-center gap-3 opacity-30">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.2" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span className="font-body text-body-sm text-nwcn-text-sub">이미지 {index + 1}</span>
    </div>
  )
}

export default function DesignViewer({ images, title }: Props) {
  const [selected, setSelected] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const current = images[selected]

  return (
    <div className="w-full space-y-4">
      {/* 메인 이미지 */}
      <button
        type="button"
        onClick={() => current && setZoomed(true)}
        disabled={!current}
        aria-label={current ? `${title} 이미지 크게 보기` : undefined}
        className={cn(
          'focus-ring relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-panel bg-nwcn-neutral-100',
          current && 'cursor-zoom-in'
        )}
      >
        {current ? (
          <Image src={current} alt={`${title} ${selected + 1}`} fill className="object-contain" />
        ) : (
          <EmptyArt index={selected} />
        )}
      </button>

      {/* 썸네일 그리드 */}
      {images.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              aria-label={`${i + 1}번 이미지 보기`}
              aria-current={selected === i}
              className={cn(
                'focus-ring aspect-square overflow-hidden rounded-lg border-2 bg-nwcn-neutral-100',
                'transition-[border-color,transform] duration-fast ease-nwcn hover:-translate-y-0.5',
                selected === i ? 'border-nwcn-text-default' : 'border-transparent hover:border-nwcn-text-sub/40'
              )}
            >
              {img ? (
                <Image src={img} alt="" width={80} height={80} className="h-full w-full object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center font-body text-caption text-nwcn-text-sub">
                  {i + 1}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 라이트박스 */}
      <Modal open={zoomed} onClose={() => setZoomed(false)} title={title} size="full" className="bg-nwcn-dark">
        <div className="relative aspect-[4/3] w-full">
          {current && <Image src={current} alt={`${title} ${selected + 1}`} fill className="object-contain" />}
        </div>
      </Modal>
    </div>
  )
}
