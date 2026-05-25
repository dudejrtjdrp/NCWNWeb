'use client'

import { useEffect, useRef } from 'react'
import styles from './CertCarousel.module.css'

/* ── 플레이스홀더 — 추후 실제 자격증 이미지로 교체 예정 ── */
const PLACEHOLDER_COLORS = [
  '#e74c3c','#3498db','#2ecc71','#f39c12',
  '#9b59b6','#1abc9c','#e67e22','#34495e',
  '#e91e63','#00bcd4','#8bc34a','#ff9800',
  '#673ab7','#009688','#ff5722','#607d8b',
]
const IMAGES = PLACEHOLDER_COLORS.map((color, i) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="500">
    <rect width="380" height="500" fill="${color}" rx="16"/>
    <text x="190" y="265" text-anchor="middle" fill="white"
      font-size="64" font-family="sans-serif" font-weight="bold">${i + 1}</text>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
})

/* ── 레이아웃 상수 ── */
const CARD_W      = 380   // 카드 너비 (px) — CSS .card width와 동일 ★ CSS 변경 시 반드시 같이 수정
const Z_DEPTH     = 350   // 중앙 카드 z 밀림 깊이
const PERSPECTIVE = 1000  // CSS .scene perspective 값과 반드시 동일
const ROT_MAX     = 35    // 끝 카드 최대 rotateY (deg)
const SHOW_R      = 1.5
const VISIBLE_R   = 2.3
const GAP         = 28    // 카드 간 시각적 여백 (px) — 이 값 하나로 전체 간격 조정
const DRAG_PX     = 420
const INIT_POS    = 7.5

/* ── z 깊이 (포물선) ── */
function zAt(absOff: number) {
  const t = Math.min(absOff / SHOW_R, 1)
  return -Z_DEPTH * (1 - t * t)
}

/* ────────────────────────────────────────────────────────────────
   핵심 아이디어:
   rotateY(θ)로 기울어진 카드의 좌·우 엣지는 서로 다른 z 깊이에 위치.
   (예: rotateY(-35°) 카드의 왼쪽 엣지 z = -132, 오른쪽 엣지 z = +132)
   → 같은 translateX라도 두 엣지가 perspective에 의해 비대칭 투영됨.
   → 카드 중심이 아닌 "서로 마주보는 엣지"의 투영 위치를 직접 역산해야
     시각적 간격이 실제로 GAP px가 됨.

   엣지 투영 공식 (rotateY(θ), 카드 중심 translateX = T, translateZ = z_c):
     오른쪽 카드 왼쪽(내향) 엣지:
       x_world = T - W/2 · cosθ,   z_world = z_c - W/2 · sinθ
       projected = x_world · P / (P - z_world)

   T_IN, T_OUT: 균등 GAP 조건을 만족하는 translateX를 역산
   actualXAt:  offset → T 값을 구간별 선형 보간
──────────────────────────────────────────────────────────────── */
const ROT_RAD = ROT_MAX * (Math.PI / 180)

// 내측 카드 (|offset|=0.5) 파라미터
const t_in  = 0.5 / SHOW_R
const ca_in = Math.cos(t_in * ROT_RAD)   // cos of inner rotY magnitude
const sa_in = Math.sin(t_in * ROT_RAD)   // sin of inner rotY magnitude
const za_in = zAt(0.5)

// ① 중앙 GAP 조건: 내측 카드 내향 엣지 투영 = GAP / 2
//    → T_IN 역산
const T_IN =
  CARD_W / 2 * ca_in +
  GAP / 2 * (PERSPECTIVE - za_in + CARD_W / 2 * sa_in) / PERSPECTIVE

// ② 내측 카드 외향 엣지 투영 위치 계산
const E_inner_out =
  (T_IN + CARD_W / 2 * ca_in) * PERSPECTIVE /
  (PERSPECTIVE - za_in - CARD_W / 2 * sa_in)

// 외측 카드 (|offset|=1.5) 파라미터 (z = 0)
const ca_out = Math.cos(ROT_RAD)
const sa_out = Math.sin(ROT_RAD)

// ③ 바깥 GAP 조건: 외측 카드 내향 엣지 투영 = E_inner_out + GAP
//    → T_OUT 역산
const T_OUT =
  CARD_W / 2 * ca_out +
  (E_inner_out + GAP) * (PERSPECTIVE + CARD_W / 2 * sa_out) / PERSPECTIVE

/* ── offset → 실제 translateX (구간별 선형 보간) ── */
function actualXAt(offset: number): number {
  const abs  = Math.abs(offset)
  const sign = offset >= 0 ? 1 : -1

  let T: number
  if      (abs <= 0.5) T = (abs / 0.5) * T_IN
  else if (abs <= 1.5) T = T_IN + (abs - 0.5) * (T_OUT - T_IN)
  else                 T = T_OUT + (abs - 1.5) * (T_OUT - T_IN)

  return sign * T
}

export default function CertCarousel() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef   = useRef<(HTMLDivElement | null)[]>([])

  const scrollPos  = useRef(INIT_POS)
  const targetPos  = useRef(INIT_POS)
  const dragging   = useRef(false)
  const lastX      = useRef(0)
  const velocity   = useRef(0)
  const rafId      = useRef(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const update = () => {
      const pos = scrollPos.current

      cardsRef.current.forEach((card, i) => {
        if (!card) return
        const offset = i - pos
        const absOff = Math.abs(offset)

        if (absOff > VISIBLE_R) {
          card.style.opacity    = '0'
          card.style.visibility = 'hidden'
          return
        }
        card.style.visibility = 'visible'

        const opacity =
          absOff <= SHOW_R
            ? 1
            : 1 - (absOff - SHOW_R) / (VISIBLE_R - SHOW_R)
        card.style.opacity = String(Math.max(0, opacity))

        const x    = actualXAt(offset)
        const z    = zAt(absOff)
        const rotY = -(offset / SHOW_R) * ROT_MAX

        card.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${rotY}deg)`
        card.style.zIndex    = String(Math.round(z + Z_DEPTH + 10))
      })
    }

    const loop = () => {
      if (!dragging.current) {
        targetPos.current += velocity.current
        velocity.current  *= 0.88

        const MIN_POS = 0.5
        const MAX_POS = IMAGES.length - 1.5
        targetPos.current = Math.max(MIN_POS, Math.min(MAX_POS, targetPos.current))

        const nearest = Math.round(targetPos.current - 0.5) + 0.5
        targetPos.current += (nearest - targetPos.current) * 0.05
      }
      scrollPos.current += (targetPos.current - scrollPos.current) * 0.12
      update()
      rafId.current = requestAnimationFrame(loop)
    }
    loop()

    const onDown = (e: PointerEvent) => {
      dragging.current = true
      lastX.current    = e.clientX
      velocity.current = 0
      section.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      const dx          = e.clientX - lastX.current
      lastX.current     = e.clientX
      const dPos        = -dx / DRAG_PX
      targetPos.current += dPos
      velocity.current   = dPos
    }
    const onUp = () => { dragging.current = false }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      targetPos.current += e.deltaX / DRAG_PX
    }

    section.addEventListener('pointerdown',   onDown)
    section.addEventListener('pointermove',   onMove)
    section.addEventListener('pointerup',     onUp)
    section.addEventListener('pointercancel', onUp)
    section.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      cancelAnimationFrame(rafId.current)
      section.removeEventListener('pointerdown',   onDown)
      section.removeEventListener('pointermove',   onMove)
      section.removeEventListener('pointerup',     onUp)
      section.removeEventListener('pointercancel', onUp)
      section.removeEventListener('wheel', onWheel)
    }
  }, [])

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.scene}>
        <div className={styles.track}>
          {IMAGES.map((src, i) => (
            <div
              key={i}
              className={styles.card}
              ref={(el) => { cardsRef.current[i] = el }}
            >
              <img src={src} alt={`자격증 ${i + 1}`} draggable={false} />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.maskTop}    aria-hidden />
      <div className={styles.maskBottom} aria-hidden />
    </section>
  )
}
