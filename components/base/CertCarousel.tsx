'use client'

/**
 * CertCarousel — 자격증 Curved Carousel
 *
 * CSS Only Curved Carousel 기법을 그대로 적용:
 * - section::before / ::after 흰색 타원으로 상·하단 아치 생성
 * - --v-offset: 60px / --curve-height: 120px CSS 변수 그대로 사용
 * - display:grid + grid-auto-flow:column 수평 배치
 * - scroll-snap-type: x mandatory
 *
 * 원본 CSS 대비 변경:
 * - grid-template-rows: 300px → 582px  (Figma 카드 높이)
 * - grid-auto-columns: 461px           (Figma 카드 너비)
 * - grid-gap: 24px → 42px             (Figma 간격)
 */

import { useRef, useState, useCallback, useEffect } from 'react'
import styles from './CertCarousel.module.css'

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

// 초기 스크롤: 4장 대칭 배치 (4×461 + 3×42 − 1440) / 2 = 265
const INIT_SCROLL = 265
const STEP        = 461 + 42  // 카드 1장 이동량

export default function CertCarousel() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(true)
  const [canNext, setCanNext] = useState(true)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    el.scrollLeft = INIT_SCROLL
    setCanPrev(INIT_SCROLL > 10)
    setCanNext(INIT_SCROLL < el.scrollWidth - el.clientWidth - 10)
  }, [])

  const scroll = useCallback((dir: 'prev' | 'next') => {
    const el = wrapperRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'next' ? STEP : -STEP, behavior: 'smooth' })
  }, [])

  const onScroll = useCallback(() => {
    const el = wrapperRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 10)
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  return (
    <section className={styles.section}>
      {/* 라벨 */}
      <p className={styles.label}>자격증</p>

      {/* 카드 트랙 — 원본 .wrapper */}
      <div
        ref={wrapperRef}
        className={styles.wrapper}
        onScroll={onScroll}
      >
        {CERTS.map((name) => (
          <div key={name} className={styles.card}>
            <p
              style={{
                margin: 0,
                fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
                fontWeight: 700,
                fontSize: 22,
                color: '#1d1d1d',
                textAlign: 'center',
                lineHeight: 1.5,
                padding: '0 28px',
                wordBreak: 'keep-all',
              }}
            >
              {name}
            </p>
          </div>
        ))}
      </div>

      {/* 화살표 */}
      {canPrev && (
        <button
          className={`${styles.arrow} ${styles.arrowPrev}`}
          onClick={() => scroll('prev')}
          aria-label="이전"
        >
          ‹
        </button>
      )}
      {canNext && (
        <button
          className={`${styles.arrow} ${styles.arrowNext}`}
          onClick={() => scroll('next')}
          aria-label="다음"
        >
          ›
        </button>
      )}
    </section>
  )
}
