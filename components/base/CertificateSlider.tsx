'use client'

/**
 * BASE 컴포넌트: CertificateSlider
 * Figma node-id: 450:212 (자격증 섹션)
 *
 * 자격증 가로형 슬라이드 컴포넌트
 * - 각 카드: 회색 배경 + 자격증명 텍스트 (Pretendard Bold 24px)
 * - 슬라이드 방향: 가로 (horizontal scroll-snap)
 * - 이전/다음 버튼 제공
 * - 마우스 드래그 스크롤 지원
 */

import { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

export interface Certificate {
  id: string
  name: string
  /** 선택적 배경 이미지 URL */
  imageSrc?: string
}

const DEFAULT_CERTIFICATES: Certificate[] = [
  { id: 'web-design', name: '웹디자인기능사' },
  { id: 'info-processing', name: '정보처리산업기사' },
  { id: 'multimedia', name: '멀티미디어콘텐츠제작전문가' },
  { id: 'gtq', name: 'GTQ' },
  { id: 'computer-graphics', name: '컴퓨터그래픽스운용기능사' },
  { id: 'broadcast', name: '방송통신기능사' },
  { id: 'aca', name: 'ACA (Adobe Certified Associate)' },
  { id: 'video-edit', name: '영상편집기능사' },
]

export interface CertificateSliderProps {
  certificates?: Certificate[]
  className?: string
}

export default function CertificateSlider({
  certificates = DEFAULT_CERTIFICATES,
  className,
}: CertificateSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const scrollStartX = useRef(0)

  /** 이전 카드로 */
  const scrollPrev = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: -482, behavior: 'smooth' })
  }, [])

  /** 다음 카드로 */
  const scrollNext = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: 482, behavior: 'smooth' })
  }, [])

  /** 마우스 드래그 스크롤 핸들러 */
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    dragStartX.current = e.pageX
    scrollStartX.current = scrollRef.current?.scrollLeft ?? 0
  }, [])

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      const dx = e.pageX - dragStartX.current
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = scrollStartX.current - dx
      }
    },
    [isDragging]
  )

  const onMouseUp = useCallback(() => setIsDragging(false), [])

  return (
    <div className={cn('relative w-full', className)}>
      {/* 슬라이드 컨테이너 */}
      <div
        ref={scrollRef}
        className={cn(
          'flex gap-[20px] overflow-x-auto scroll-smooth',
          'scrollbar-hide pb-4',
          /* scroll-snap */
          'snap-x snap-mandatory',
          isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
        )}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        role="list"
        aria-label="취득 가능 자격증 목록"
      >
        {certificates.map((cert) => (
          <div
            key={cert.id}
            role="listitem"
            className="snap-start shrink-0 flex flex-col items-center gap-[24px]"
            style={{ width: '461px' }}
          >
            {/* 자격증 카드 이미지 영역 */}
            <div
              className="relative w-full overflow-hidden"
              style={{ height: '582px', background: '#D9D9D9' }}
            >
              {cert.imageSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cert.imageSrc}
                  alt={cert.name}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
              )}
              {/* 그라데이션 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* 자격증명 */}
            <p
              className="font-body font-bold text-[24px] text-black text-center leading-normal"
              style={{ wordBreak: 'keep-all' }}
            >
              {cert.name}
            </p>
          </div>
        ))}
      </div>

      {/* 이전 버튼 */}
      <button
        onClick={scrollPrev}
        aria-label="이전 자격증"
        className={cn(
          'absolute left-0 top-[291px] -translate-y-1/2 -translate-x-1/2',
          'w-[48px] h-[48px] rounded-full',
          'bg-white/80 backdrop-blur-sm shadow-lg',
          'flex items-center justify-center',
          'hover:bg-white transition-all duration-150',
          'z-10'
        )}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M12.5 5L7.5 10L12.5 15" stroke="#151515" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* 다음 버튼 */}
      <button
        onClick={scrollNext}
        aria-label="다음 자격증"
        className={cn(
          'absolute right-0 top-[291px] -translate-y-1/2 translate-x-1/2',
          'w-[48px] h-[48px] rounded-full',
          'bg-white/80 backdrop-blur-sm shadow-lg',
          'flex items-center justify-center',
          'hover:bg-white transition-all duration-150',
          'z-10'
        )}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M7.5 5L12.5 10L7.5 15" stroke="#151515" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
