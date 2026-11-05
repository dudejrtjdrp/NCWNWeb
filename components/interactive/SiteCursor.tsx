'use client'

/**
 * SiteCursor — 사이트 전체 커서 (기본 커서 대신)
 * ────────────────────────────────────────────────────────────
 * 마우스(정밀 포인터 + hover) 기기에서만 켜지고, 켜지면 <html class="has-site-cursor"> 로 기본 커서를 숨긴다(globals.css).
 * JS 가 안 돌면 기본 커서가 그대로 남는다.
 *  - 평소(젤리): 초록 원이 살짝 늦게 따라오며 움직이는 방향으로 늘어났다 돌아온다. 가운데 작은 점이 실제 클릭 지점.
 *  - 링크·버튼 위: 원이 커지며 'VIEW' / 글 입력칸 위: 세로 막대 / 누르는 동안: 조금 작아짐
 *  - 미디어아트 위: 그 작품에 맞는 도구로 바뀐다 — 요소의 data-cursor 값
 *      brush(붓 크기 링: 홈 첫 화면 유체 잉크·유화) · needle(바늘: 비눗방울) · glow(초록 빛무리: 엠블럼 점 구름)
 *      hawk(매: 군무) · nib(펜촉: NCR 글자)
 *    붓 링 가운데 점 색은 요소의 CSS 변수 --cursor-ink (홈에서 고른 잉크 색). 같은 요소에서 작품이 바뀌어도(스크롤) 매 프레임 다시 읽는다.
 *  - 창 밖·iframe(지도·영상) 위: 숨김(iframe 안은 그 페이지 커서)
 * 화면 전체를 덮는 레이어·blend 없이 작은 요소 몇 개의 transform 만 바꾼다(Windows + Lenis 떨림 방지).
 * 모션 최소화 설정이면 늘어나기·뒤따라오기 없이 바로 움직인다.
 */

import { useEffect, useRef, useState } from 'react'

const INTERACTIVE =
  'a[href], button:not(:disabled), [role="button"], [role="tab"], [role="link"], [role="option"], select, summary, label[for], input[type="checkbox"], input[type="radio"], input[type="submit"], input[type="button"], input[type="range"], [data-cursor="link"]'
const TEXT =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]):not([type="range"]):not([type="hidden"]), textarea, [contenteditable="true"], [contenteditable=""]'
const ARTS = ['brush', 'needle', 'glow', 'hawk', 'nib'] as const
type Art = (typeof ARTS)[number]
type Mode = 'default' | 'link' | 'text' | 'art' | 'hidden'

/** 도구 그림의 클릭 지점(px, 그림 왼쪽 위 기준)과 기울기 방식 */
/** 바늘 그림의 기본 방향 — 귀(위 오른쪽)에서 끝(아래 왼쪽)으로, 화면 각도(→ 0°, ↓ 90°) */
const NEEDLE_TIP_DEG = 128

const ART_SPEC: Record<Art, { hx: number; hy: number; tilt: 'drag' | 'heading' | 'aim' | 'none' }> = {
  brush: { hx: 24, hy: 24, tilt: 'none' },
  // 바늘: 끝이 움직이는 방향을 향한다 (끝을 축으로 돌림)
  needle: { hx: 10.5, hy: 43.5, tilt: 'aim' },
  nib: { hx: 10.5, hy: 43.5, tilt: 'drag' },
  glow: { hx: 48, hy: 48, tilt: 'none' },
  hawk: { hx: 24, hy: 24, tilt: 'heading' },
}

const isArt = (v: string | undefined): v is Art => !!v && (ARTS as readonly string[]).includes(v)

function classify(el: EventTarget | null): { mode: Mode; artEl: HTMLElement | null } {
  if (!(el instanceof Element)) return { mode: 'default', artEl: null }
  if (el.tagName === 'IFRAME') return { mode: 'hidden', artEl: null }
  if (el.closest(TEXT)) return { mode: 'text', artEl: null }
  if (el.closest(INTERACTIVE)) return { mode: 'link', artEl: null }
  const artEl = el.closest<HTMLElement>('[data-cursor]')
  if (artEl && isArt(artEl.dataset.cursor)) return { mode: 'art', artEl }
  return { mode: 'default', artEl }
}

export default function SiteCursor() {
  const [enabled, setEnabled] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const blobRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const artRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setEnabled(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const html = document.documentElement
    html.classList.add('has-site-cursor')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pos = { x: 0, y: 0 }
    const trail = { x: 0, y: 0 }
    const vel = { x: 0, y: 0 }
    let heading = -90
    let aim = NEEDLE_TIP_DEG
    let seen = false
    let mode: Mode = 'hidden'
    let art: Art | '' = ''
    let artEl: HTMLElement | null = null
    let ink = ''
    let down = false
    let raf = 0
    let last = 0
    let prev = { x: 0, y: 0 }

    const paint = () => {
      const r = rootRef.current
      if (!r) return
      r.dataset.mode = mode
      r.dataset.art = art
      r.dataset.down = down ? 'true' : 'false'
    }
    const apply = (target: EventTarget | null) => {
      const c = classify(target)
      mode = c.mode
      artEl = c.artEl
      art = mode === 'art' && artEl && isArt(artEl.dataset.cursor) ? artEl.dataset.cursor : ''
      paint()
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      pos.x = e.clientX
      pos.y = e.clientY
      if (!seen) {
        seen = true
        trail.x = prev.x = pos.x
        trail.y = prev.y = pos.y
        apply(e.target)
      }
    }
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      apply(e.target)
    }
    const onOut = (e: PointerEvent) => {
      if (e.relatedTarget) return
      seen = false
      mode = 'hidden'
      paint()
    }
    const onDown = () => {
      down = true
      paint()
    }
    const onUp = () => {
      down = false
      paint()
    }

    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick)
      if (!seen) return
      const dt = last ? Math.min((ts - last) / 1000, 0.1) : 1 / 60
      last = ts

      // 같은 요소 위에서 작품이 바뀌는 경우(홈 패널이 스크롤로 바뀜) — 매 프레임 data-cursor 를 다시 읽는다
      if (artEl && (mode === 'art' || mode === 'default')) {
        const v = artEl.dataset.cursor
        const nextArt: Art | '' = isArt(v) ? v : ''
        const nextMode: Mode = nextArt ? 'art' : 'default'
        if (nextArt !== art || nextMode !== mode) {
          art = nextArt
          mode = nextMode
          paint()
        }
        if (art) {
          const c = artEl.style.getPropertyValue('--cursor-ink').trim()
          if (c !== ink && rootRef.current) {
            ink = c
            rootRef.current.style.setProperty('--cursor-ink', c || '#09f593')
          }
        }
      }

      // 젤리 원: 살짝 늦게 따라오며 움직이는 방향으로 늘어남
      const k = still ? 1 : 1 - Math.pow(1 - 0.28, dt * 60)
      const dx = pos.x - trail.x
      const dy = pos.y - trail.y
      trail.x += dx * k
      trail.y += dy * k
      if (blobRef.current) {
        let d = still ? 0 : Math.min(Math.hypot(dx, dy) / 70, 0.55)
        let a = (Math.atan2(dy, dx) * 180) / Math.PI
        if (mode === 'link') {
          d *= 0.2
          a = 0
        }
        blobRef.current.style.transform = `translate3d(${Math.round(trail.x)}px, ${Math.round(trail.y)}px, 0) rotate(${a.toFixed(1)}deg) scale(${(1 + d).toFixed(3)}, ${(1 - d * 0.55).toFixed(3)})`
      }
      const px = Math.round(pos.x)
      const py = Math.round(pos.y)
      if (pinRef.current) pinRef.current.style.transform = `translate3d(${px}px, ${py}px, 0)`
      if (barRef.current) barRef.current.style.transform = `translate3d(${px}px, ${py}px, 0)`

      // 도구 커서: 클릭 지점을 포인터에 맞추고, 끌리는 방향으로 살짝 기울이거나(펜촉) 나는 방향을 보거나(매) 끝이 움직이는 쪽을 향한다(바늘)
      const mvx = (pos.x - prev.x) / Math.max(dt, 1 / 240)
      const mvy = (pos.y - prev.y) / Math.max(dt, 1 / 240)
      prev = { x: pos.x, y: pos.y }
      const vk = 1 - Math.pow(1 - 0.2, dt * 60)
      vel.x += (mvx - vel.x) * vk
      vel.y += (mvy - vel.y) * vk
      if (artRef.current && art) {
        const spec = ART_SPEC[art]
        let rot = 0
        if (!still && spec.tilt === 'drag') rot = Math.max(-14, Math.min(14, vel.x * 0.012))
        if (spec.tilt === 'heading') {
          if (Math.hypot(vel.x, vel.y) > 60) {
            const want = (Math.atan2(vel.y, vel.x) * 180) / Math.PI + 90
            let diff = ((want - heading + 540) % 360) - 180
            if (still) diff = 0
            heading += diff * Math.min(1, dt * 8)
          }
          rot = heading + 90
        }
        if (spec.tilt === 'aim') {
          if (Math.hypot(vel.x, vel.y) > 80) {
            const want = (Math.atan2(vel.y, vel.x) * 180) / Math.PI
            let diff = ((want - aim + 540) % 360) - 180
            if (still) diff = 0
            aim = (aim + diff * Math.min(1, dt * 7) + 360) % 360
          }
          rot = aim - NEEDLE_TIP_DEG
        }
        const s = artRef.current.style
        s.transformOrigin = `${spec.hx}px ${spec.hy}px`
        s.transform = `translate3d(${px - spec.hx}px, ${py - spec.hy}px, 0) rotate(${rot.toFixed(1)}deg)`
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.addEventListener('pointerout', onOut, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('blur', onUp)
    raf = requestAnimationFrame(tick)

    return () => {
      html.classList.remove('has-site-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('blur', onUp)
      cancelAnimationFrame(raf)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div ref={rootRef} className="site-cursor" data-mode="hidden" data-art="" aria-hidden="true">
      <div ref={blobRef} className="sc-blob-w">
        <span className="sc-blob">VIEW</span>
      </div>
      <div ref={pinRef} className="sc-pin-w">
        <span className="sc-pin" />
      </div>
      <div ref={barRef} className="sc-bar-w">
        <span className="sc-bar" />
      </div>
      <div ref={artRef} className="sc-art">
        {/* 붓 크기 링 — 그림 프로그램의 붓 크기 원, 가운데 점은 고른 잉크 색 */}
        <svg className="sc-tool sc-brush" viewBox="0 0 48 48" width="48" height="48">
          <circle cx="24" cy="24" r="17" fill="none" stroke="#f6f7f3" strokeWidth="3.2" opacity="0.9" />
          <circle cx="24" cy="24" r="17" fill="none" stroke="#151515" strokeWidth="1.3" />
          <circle className="sc-brush-dot" cx="24" cy="24" r="4" fill="var(--cursor-ink, #09f593)" stroke="#151515" strokeWidth="1.2" />
        </svg>
        {/* 바늘 — 실은 학과 초록 */}
        <svg className="sc-tool sc-needle" viewBox="0 0 64 64" width="48" height="48">
          <g transform="rotate(38 14 58)">
            <path d="M14 8 C 22 2, 34 10, 30 20 S 40 36, 50 30" stroke="#09f593" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M14 58 L15.7 40 L15.7 9.5 A1.7 1.7 0 0 0 12.3 9.5 L12.3 40 Z" fill="#dfe2dc" stroke="#151515" strokeWidth="1.1" strokeLinejoin="round" />
            <ellipse cx="14" cy="13" rx="0.8" ry="2.6" fill="#151515" />
            <path d="M13.2 20 L13.2 38" stroke="rgba(255,255,255,0.9)" strokeWidth="0.7" />
          </g>
        </svg>
        {/* 펜촉 */}
        <svg className="sc-tool sc-nib" viewBox="0 0 64 64" width="48" height="48">
          <g transform="rotate(38 14 58)">
            <path d="M14 58 L6.5 37 C 6 32, 8 28, 8 23 L8 14 L20 14 L20 23 C 20 28, 22 32, 21.5 37 Z" fill="#151515" stroke="#f6f7f3" strokeWidth="1" strokeLinejoin="round" />
            <rect x="8" y="10" width="12" height="5" fill="#09f593" stroke="#151515" strokeWidth="1" />
            <path d="M14 57 L14 33" stroke="#09f593" strokeWidth="1.1" />
            <circle cx="14" cy="31" r="2.1" fill="#09f593" />
          </g>
        </svg>
        {/* 초록 빛무리 — 엠블럼 점이 커서 주변에서 형광으로 빛나는 효과와 이어짐 */}
        <svg className="sc-tool sc-glow" viewBox="0 0 96 96" width="96" height="96">
          <defs>
            <radialGradient id="sc-glow-g">
              <stop offset="0" stopColor="#09f593" stopOpacity="0.6" />
              <stop offset="0.45" stopColor="#09f593" stopOpacity="0.2" />
              <stop offset="1" stopColor="#09f593" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle className="sc-glow-halo" cx="48" cy="48" r="48" fill="url(#sc-glow-g)" />
          <circle cx="48" cy="48" r="3.4" fill="#ffffff" stroke="#058f56" strokeWidth="1.4" />
        </svg>
        {/* 매 — 위에서 본 날개 편 모습, 나는 방향을 본다 */}
        <svg className="sc-tool sc-hawk" viewBox="0 0 48 48" width="48" height="48">
          <path
            d="M24 7 L26.2 11.5 L26.8 16 L41 19.5 L46 23.5 L39 24 L30 25.5 L28.6 32 L32.5 40 L24 37.2 L15.5 40 L19.4 32 L18 25.5 L9 24 L2 23.5 L7 19.5 L21.2 16 L21.8 11.5 Z"
            fill="#151515"
            stroke="#f6f7f3"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <circle cx="22.6" cy="12.6" r="0.9" fill="#09f593" />
          <circle cx="25.4" cy="12.6" r="0.9" fill="#09f593" />
        </svg>
      </div>
    </div>
  )
}
