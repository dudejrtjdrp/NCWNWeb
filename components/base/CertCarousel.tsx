'use client'

/**
 * CertCarousel — 자격증 curved stage 캐러셀
 *
 * ── 원리 (SimeonC CSS-only + 삼각함수 arc 방식 참고) ──────────────
 *  흰색 타원 3개를 카드 위(z3)에 겹쳐서 그레이 배경을 오목하게 마스킹.
 *  타원 경계가 카드 엣지를 위치별로 다르게 가려 → 시각적 곡선 효과.
 *
 *  수학적 레이아웃 계산 (CARD_W=400, GAP=20, PADDING=0):
 *   대칭 조건: 2 × scrollLeft = 4×CARD_W + 3×GAP − containerW
 *             2 × 110 = 1600 + 60 − 1440 = 220  ✓
 *   → scrollLeft=110: 카드0(x=-110~290, 타원 커버 이후 70px 노출),
 *                     카드1·2 전체, 카드3(x=1150~1550, 70px 노출)
 *
 *  좌우 타원 곡선 시각화 (semi_x=220, semi_y=340, center_y=340):
 *   카드 상단 y=110 → 타원 x=147 커버 → 카드 143px 노출 (넓음)
 *   카드 중앙 y=360 → 타원 x=220 커버 → 카드  70px 노출 (좁음)
 *   카드 하단 y=610 → 타원 x=134 커버 → 카드 156px 노출 (넓음)
 *   ⇒ 세로 방향으로 가시 폭이 변화 = 오목(concave) 곡선 벽 시각화
 *
 * z0: 회색 전체 배경
 * z2: 카드 트랙 (수평 스크롤)
 * z3: 흰색 타원 3개 (상단·좌측·우측)
 * z4: 라벨, 화살표
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

const CARD_W = 400
const CARD_H = 480
const CARD_GAP = 20
/**
 * INIT_SCROLL 계산:
 *   2 × INIT_SCROLL = 4×CARD_W + 3×CARD_GAP − 1440
 *   2 × 110 = 1600 + 60 − 1440 = 220  ✓
 *   → 카드1·2가 뷰포트 정중앙 대칭, 카드0·3 각 70px씩 대칭 노출
 */
const INIT_SCROLL = 110

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

      {/* ── z2: 카드 트랙 ──
           패딩 없음(PADDING=0) — INIT_SCROLL=110으로 대칭 배치 유지
           scrollSnap 제거 — snap point가 INIT_SCROLL=110과 충돌 방지
      ── */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        style={{
          position: 'absolute',
          top: 110,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'flex-start',
          gap: CARD_GAP,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
          zIndex: 2,
          WebkitOverflowScrolling: 'touch' as never,
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

      {/* ── z3: 상단 흰색 타원 — 오목 아치 ──────────────────────────
           center_y = -300 + 250 = -50
           bottom@center(x=720): -50 + 250 = 200px  (카드 상단 110보다 아래)
           bottom@edge(x=0):     -50 + 160 = 110px  (엣지는 카드 상단과 맞춤)
           → 중앙 200 · 엣지 110 = 오목 아치 (drum 상단 곡선)
      ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: -300,
          transform: 'translateX(-50%)',
          width: '130%',
          height: 500,
          background: '#fff',
          borderRadius: '50%',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* ── z3: 좌측 흰색 타원 — 오목 좌벽 ─────────────────────────
           left=-240, width=440 → semi_x=220, center_x=0
           height='100%'(680px) → semi_y=340, center_y=340 (translateY(-50%))

           y=110(카드상단): semi_y norm=(110-340)/340=-0.676 → x=220×0.736=162 → 143px 노출
           y=360(카드중앙): semi_y norm=(360-340)/340= 0.059 → x=220×0.998=220 →  70px 노출
           y=610(카드하단): semi_y norm=(610-340)/340= 0.794 → x=220×0.608=134 → 156px 노출

           ⇒ 카드가 중앙에서 좁아지고 상하로 넓어짐 = 오목 곡선 벽 효과
      ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: -240,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 440,
          height: '100%',
          background: '#fff',
          borderRadius: '50%',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* ── z3: 우측 흰색 타원 — 오목 우벽 (좌측과 대칭) ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: -240,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 440,
          height: '100%',
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
          top: 48,
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

      {/* ── z4: 좌 화살표 ─────────────────────────────────────────
           left=260: 타원 최대 범위 220px 바깥 → 그레이 영역에 표시
      ── */}
      {canPrev && (
        <button
          onClick={() => scroll('prev')}
          aria-label="이전"
          style={{
            position: 'absolute',
            left: 260,
            top: '55%',
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
            right: 260,
            top: '55%',
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
