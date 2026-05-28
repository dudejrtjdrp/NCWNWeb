'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  images: (string | null)[]
  title: string
}

export default function DesignViewer({ images, title }: Props) {
  const [selected, setSelected] = useState(0)

  return (
    <div className="w-full space-y-4">
      {/* 메인 이미지 */}
      <div className="aspect-[4/3] w-full rounded-2xl bg-[#efefef] overflow-hidden flex items-center justify-center relative">
        {images[selected] ? (
          <Image src={images[selected]!} alt={`${title} ${selected + 1}`} fill className="object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-3 opacity-30">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#323131" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="font-body text-sm text-nwcn-text-sub">이미지 {selected + 1}</span>
          </div>
        )}
      </div>

      {/* 썸네일 그리드 */}
      {images.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`aspect-square rounded-lg overflow-hidden bg-[#efefef] border-2 transition-all ${
                selected === i ? 'border-nwcn-text-default' : 'border-transparent hover:border-nwcn-text-sub/40'
              }`}
            >
              {img ? (
                <Image src={img} alt={`thumb ${i + 1}`} width={80} height={80} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-body text-[10px] text-nwcn-text-sub">{i + 1}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
