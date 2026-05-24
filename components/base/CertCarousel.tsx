'use client'

/**
 * CertCarousel — 자격증 curved drum 캐러셀
 *
 * ── CSS Curved Carousel 기법 적용 ────────────────────────────────────
 *  섹션 overflow:hidden + 상·하단 흰색 타원(border-radius:50%)으로
 *  드럼/배럴 형태의 곡면 마스킹 효과를 구현.
 *
 *  타원 위치 공식 (CSS ref 방식):
 *   top ellipse : top = -0.6 × ELLIPSE_H  (40%만 컨테이너 안에 노출)
 *   bottom ellipse : bottom = -0.6 × ELLIPSE_H
 *
 * ── Figma 실측치 (ABOUT/Department/Desktop §F) ─────────────────────
 *  Group 44  (h=801, w=1460): 전체 캐러셀 컨테이너
 *  Ellipse 19/20 : 1460×219  →  ELLIPSE_W=1460, ELLIPSE_H=219
 *  Card (Rect 87~90): 461×582, gap≈42
 *
 * ── 레이어 구조 ──────────────────────────────────────────────────────
 *  z0: 회색 배경 (#e0e0e0)
 *  z2: 카드 트랙 (수평 스크롤, scroll-snap)
 *  z3: 상단 흰색 타원 (아치 마스크)
 *      하단 흰색 타원 (아치 마스크)
 *  z4: 라벨, 화살표
 */

import { useRef, useState, useCallback, useEffect } from 'react'

const CERTS = [
  '멀티미디어콘텐츠제작전문가',
  'GTQ',
  '정보처리산업기사',
  '웹디자인기능사',
  '컬러리스트산업기사',
  '사무자동화산업기사',
  '인터넷정보관리사',
  '웹마스터전문가',
  '인터넷정보검색사',
  '한국영상자격원 영상전문인(편집)',
  '한국영상자격원 영상전문인(촬영)',
  '한국영상자격원 영상전문인(연출)',
]

// ── 디자인 상수 (Figma 실측 기반) ────────────────────────────────────
const CARD_W      = 461   // 카드 너비
const CARD_H      = 582   // 카드 높이
const CARD_GAP    = 42    // 카드 간격
const CONTAINER_H = 801   // 전체 컨테이너 높이

// 타원: CSS ref 방식으로 위치 결정
// ELLIPSE_W = 컨테이너보다 넓게 (좌우 클립 후 자연스러운 곡면)
const ELLIPSE_W   = 1460
const ELLIPSE_H   = 219   // curve-height

// CSS ref 공식: top/bottom = -0.6 × curve-height → 40%만 내부 노출
const CURVE_INSET = Math.round(ELLIPSE_H * 0.6) // 131px

// 카드 트랙의 수직 위치 = 상단 타원에서 노출되는 높이 (40%)
const TRACK_TOP   = ELLIPSE_H - CURVE_INSET      // 88px

// 초기 스크롤: 4장이 대칭으로 배치되는 오프셋
// visible_4 = 4×461 + 3×42 = 1970  →  (1970 − 1440) / 2 = 265
const INIT_SCROLL = 265

export default function CertCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(true)
  const [canNext, setCanNext] = useState(true)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.scrollLeft = INIT_SCROLL
    setCanPrev(INIT_SCROLL > 10)
    setCanNext(INIT_SCROLL < el.scrollWidth - el.clientWidth - 10)
  }, [])

  const step = CARD_W + CARD_GAP

  const scroll = useCallback(
    (dir: 'prev' | 'next') => {
      const el = trackRef.current
      if (!el) return
      el.scrollBy({ left: dir === 'next' ? step : -step, behavior: 'smooth' })
    },
    [step],
  )

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
        height: CONTAINER_H,
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      {/* ── z0: 회색 배경 ── */}
      <div
        aria-hidden
        style={{ position: 'absolute', inset: 0, background: '#e0e0e0', zIndex: 0 }}
      />

      {/* ── z2: 카드 트랙 (scroll-snap) ────────────────────────────────
           top = TRACK_TOP(88px): 상단 타원 노출 영역 아래부터 카드 시작
           scroll-snap-type: x mandatory → 한 카드씩 스냅
      ── */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        style={{
          position: 'absolute',
          top: TRACK_TOP,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'flex-start',
          gap: CARD_GAP,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
          scrollSnapType: 'x mandatory',
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              scrollSnapAlign: 'center',
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

      {/* ── z3: 상단 흰색 타원 — CSS ref 방식: top = -0.6 × ELLIPSE_H ─
           top = -CURVE_INSET = -131px  (40% = 88px 만 컨테이너 내부)
           width = ELLIPSE_W = 1460px  (좌우 초과 → 자연스러운 아치)
      ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -CURVE_INSET,
          left: '50%',
          transform: 'translateX(-50%)',
          width: ELLIPSE_W,
          height: ELLIPSE_H,
          background: '#fff',
          borderRadius: '50%',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* ── z3: 하단 흰색 타원 — CSS ref 방식: bottom = -0.6 × ELLIPSE_H ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: -CURVE_INSET,
          left: '50%',
          transform: 'translateX(-50%)',
          width: ELLIPSE_W,
          height: ELLIPSE_H,
          background: '#fff',
          borderRadius: '50%',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* ── z4: "자격증" 라벨 ─────────────────────────────────────────
           상단 타원 곡면 내부(흰 배경 영역)에 위치
      ── */}
      <p
        style={{
          position: 'absolute',
          top: Math.round(TRACK_TOP / 2),
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
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 4,
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(0,0,0,0.25)',
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
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 4,
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(0,0,0,0.25)',
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
