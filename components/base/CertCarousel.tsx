'use client'

/**
 * CertCarousel — 자격증 curved stage 캐러셀
 *
 * 구조:
 *  - z0: 회색 전체 배경
 *  - z2: 카드 트랙 (스크롤)
 *  - z3: 흰색 타원 3개 (상단·좌측·우측) → 카드 위에 올려서 곡선 마스크 효과
 *  - z4: 라벨, 화살표
 */

import { useRef, useState, useCallback, useEffect } from 'react'

const CERTS = [
  '웹디자인기능사',
  '정보처리산업기사',
  '멀티미디어콘텐츠제작전문가',
  'GTQ',
  '컴퓨터활용능력',
  'ACA',
]

const CARD_W = 420
const CARD_H = 500
const CARD_GAP = 24

export default function CertCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  /* 초기 스크롤: 카드 0이 왼쪽에 살짝만 보이도록 */
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    /* 카드1 시작 위치 - 왼쪽 흰색 영역(170px) = 스크롤 오프셋 */
    el.scrollLeft = CARD_W + CARD_GAP - 170
  }, [])

  const step = CARD_W + CARD_GAP

  const scroll = useCallback((dir: 'prev' | 'next') => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'next' ? step : -step, behavior: 'smooth' })
  }, [step])

  const onScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 10)
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 680,
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      {/* ── z0: 회색 전체 배경 ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: '#e0e0e0',
          zIndex: 0,
        }}
      />

      {/* ── z2: 카드 트랙 ── */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        style={{
          position: 'absolute',
          top: 120,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'flex-start',
          gap: CARD_GAP,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          paddingLeft: 40,
          paddingRight: 40,
          zIndex: 2,
        }}
      >
        <style>{`div::-webkit-scrollbar{display:none}`}</style>

        {CERTS.map((name) => (
          <div
            key={name}
            style={{
              flexShrink: 0,
              width: CARD_W,
              height: CARD_H,
              background: '#d9d9d9',
              scrollSnapAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
                fontWeight: 700,
                fontSize: 22,
                color: '#1d1d1d',
                textAlign: 'center',
                lineHeight: '1.5',
                padding: '0 28px',
                wordBreak: 'keep-all',
              }}
            >
              {name}
            </p>
          </div>
        ))}
      </div>

      {/* ── z3: 상단 흰색 타원 — 위쪽 오목 아치 ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: -320,
          transform: 'translateX(-50%)',
          width: '130%',
          height: 580,
          background: '#fff',
          borderRadius: '50%',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* ── z3: 좌측 흰색 타원 — 왼쪽 오목 곡선 ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: -220,
          top: '50%',
          transform: 'translateY(-40%)',
          width: 440,
          height: '160%',
          background: '#fff',
          borderRadius: '50%',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* ── z3: 우측 흰색 타원 — 오른쪽 오목 곡선 ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: -220,
          top: '50%',
          transform: 'translateY(-40%)',
          width: 440,
          height: '160%',
          background: '#fff',
          borderRadius: '50%',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* ── z4: "자격증" 라벨 ── */}
      <p
        style={{
          position: 'absolute',
          top: 52,
          left: '50%',
          transform: 'translateX(-50%)',
          margin: 0,
          fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
          fontWeight: 700,
          fontSize: 24,
          color: '#444',
          whiteSpace: 'nowrap',
          zIndex: 4,
        }}
      >
        자격증
      </p>

      {/* ── z4: 좌 화살표 ── */}
      {canPrev && (
        <button
          onClick={() => scroll('prev')}
          aria-label="이전"
          style={{
            position: 'absolute',
            left: 60,
            top: '55%',
            transform: 'translateY(-50%)',
            zIndex: 4,
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(0,0,0,0.2)',
            color: '#fff',
            fontSize: 24,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ‹
        </button>
      )}

      {/* ── z4: 우 화살표 ── */}
      {canNext && (
        <button
          onClick={() => scroll('next')}
          aria-label="다음"
          style={{
            position: 'absolute',
            right: 60,
            top: '55%',
            transform: 'translateY(-50%)',
            zIndex: 4,
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(0,0,0,0.2)',
            color: '#fff',
            fontSize: 24,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ›
        </button>
      )}
    </div>
  )
}
