'use client'

/**
 * FluidHome — 홈 3차(3-2B) 셸
 *
 * 1) 첫 화면: 유체 잉크 그래픽이 화면을 꽉 채우고, 학과명 · 큰 제목 · 잉크 색 고르기 · Scroll만 보인다(메뉴 바 없음).
 * 2) 스크롤: 스크롤 양(화면 높이의 1.2배 구간)에 맞춰 그래픽 상자가 둥근 직사각형으로 서서히 줄며 왼쪽 패널 자리로 이동.
 *    그림은 상자와 함께 통째로 축소된다(캔버스는 화면 크기 그대로, CSS로 가운데 채우기).
 * 3) 도착 후: 왼쪽 패널에 지금 보는 섹션 번호·이름이 뜨고, 오른쪽 열에 학과 정보가 이어진다. 패널은 푸터에 닿으면 밀려 올라간다.
 *    모바일은 패널 대신 둥근 카드로 줄어든 뒤 페이지와 함께 올라간다.
 *
 * 커서가 없어도 보이지 않는 붓 두 개가 계속 휘저어 멈추지 않는다.
 * prefers-reduced-motion(동작 줄이기)이면 잉크를 더 느리고 옅게 흘리고 자동 방울·섹션 물결만 끈다. 스크롤 전환은 스크롤을 그대로 따라간다.
 * 매 프레임 setState를 하지 않고 상자·히어로·헤더 스타일을 ref로 직접 갱신한다(끊김 방지).
 */

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import Header from '@/components/layout/Header'
import { FluidSim, hexToRgb } from './fluidSim'
import styles from './FluidHome.module.css'

/** 잉크 색 — 사이트 토큰(nwcn-green / yellow / green-darker / neutral-900) */
const INKS = ['#09F593', '#E3E94D', '#058F56', '#151515'] as const
const BG = '#EEF0EA'

interface SectionMeta {
  label: string
  caption: string
}

export interface FluidHomeProps {
  brand: string
  headline: readonly [string, string]
  scroll: string
  inkLabel: string
  inkNames: readonly string[]
  graphicLabel: string
  sections: SectionMeta[]
  children: ReactNode
  footer: ReactNode
}

interface Box { x: number; y: number; w: number; h: number; r: number }

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

export default function FluidHome({ brand, headline, scroll, inkLabel, inkNames, graphicLabel, sections, children, footer }: FluidHomeProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const hdrRef = useRef<HTMLDivElement>(null)
  const colRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  const [active, setActive] = useState(-1)
  const [docked, setDocked] = useState(false)
  const [ink, setInk] = useState(0)

  const inkRef = useRef(0)
  const pointer = useRef<{ x: number; y: number; down: boolean } | null>(null)
  const boom = useRef<{ x: number; y: number } | null>(null)
  const map = useRef({ s: 1, ox: 0, oy: 0 })

  useEffect(() => { inkRef.current = ink }, [ink])

  /* ── 포인터: 상자 기준 CSS 좌표로 저장 → 루프에서 캔버스 0~1 좌표로 변환 ── */
  const local = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = local(e)
    pointer.current = { ...p, down: pointer.current?.down ?? false }
  }
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = local(e)
    pointer.current = { ...p, down: true }
    boom.current = p
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* 무시 */ }
  }
  const onUp = () => { if (pointer.current) pointer.current.down = false }
  const onLeave = () => { if (!pointer.current?.down) pointer.current = null }

  useEffect(() => {
    const canvas = canvasRef.current
    const box = boxRef.current
    if (!canvas || !box) return

    /* '동작 줄이기'(Windows 애니메이션 효과 끔, macOS 동작 줄이기) 환경에서도 멈추거나 뚝 끊기지 않게:
       스크롤 전환은 스크롤을 그대로 따라가고(사용자가 움직이는 만큼만), 잉크는 더 느리고 옅게 계속 흐른다.
       자동으로 터지는 방울·섹션 전환 물결만 끈다. */
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reduce = mq.matches
    const onMq = () => { reduce = mq.matches }
    mq.addEventListener('change', onMq)
    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width = W
    canvas.height = H
    const sim = FluidSim.create(canvas, { aspect: W / H, small: W < 768, bg: BG })
    const COL = INKS.map(hexToRgb)

    /* 지금 보고 있는 섹션 — 화면 가운데 띠에 걸린 섹션 */
    let activeNow = 0
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) activeNow = Number((en.target as HTMLElement).dataset.fluidSection ?? 0)
      }),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    colRef.current?.querySelectorAll('[data-fluid-section]').forEach((el) => io.observe(el))

    const onResize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
    }
    window.addEventListener('resize', onResize)

    let sp = 0
    let raf = 0
    let lastT = 0
    let lastAuto = 0
    let prevActive = -2
    let shownActive = -1
    let shownDocked = false
    let hdrOn = false
    let lastP: { x: number; y: number } | null = null
    const amb: ({ x: number; y: number } | null)[] = [null, null]

    const drop = (amount: number) => {
      if (!sim) return
      const a = Math.random() * Math.PI * 2
      const s = 600 + Math.random() * 900
      sim.splat(0.1 + 0.8 * Math.random(), 0.15 + 0.7 * Math.random(), Math.cos(a) * s, Math.sin(a) * s, COL[Math.floor(Math.random() * COL.length)], amount)
    }
    if (sim) for (let k = 0; k < 6; k++) drop(0.55)

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const y = window.scrollY
      const D = H * 1.2
      const raw = clamp(y / D, 0, 1)
      /* 진행도가 스크롤 위치를 부드럽게 따라간다 — 휠 한 번에 툭 넘어가지 않게 */
      sp += (raw - sp) * (reduce ? 0.3 : 0.18)
      if (Math.abs(raw - sp) < 0.0004) sp = raw
      const e = 0.5 - 0.5 * Math.cos(Math.PI * sp)

      const mobile = W < 768
      const T: Box = mobile
        ? { x: 12, y: 76, w: W - 24, h: Math.min(220, H * 0.3), r: 20 }
        : { x: 24, y: 88, w: clamp(W * 0.4, 340, 600), h: H - 112, r: 28 }
      const R: Box = { x: T.x * e, y: T.y * e, w: W + (T.w - W) * e, h: H + (T.h - H) * e, r: T.r * e }
      if (mobile) {
        if (y > D) R.y -= y - D // 모바일: 카드로 줄어든 뒤 페이지와 함께 올라감
      } else if (endRef.current) {
        const over = R.y + R.h + 24 - endRef.current.getBoundingClientRect().top
        if (over > 0) R.y -= over // 데스크톱: 푸터에 닿으면 밀려 올라감
      }

      const bs = box.style
      bs.transform = `translate3d(${R.x}px, ${R.y}px, 0)`
      bs.width = `${R.w}px`
      bs.height = `${R.h}px`
      bs.borderRadius = `${R.r}px`
      bs.boxShadow = e > 0.02 ? `0 ${28 * e}px ${56 * e}px -${34 * e}px rgba(0,0,0,${0.32 * e})` : 'none'

      /* 캔버스는 화면 크기 그대로 두고 상자에 맞게 통째로 축소(가운데 채우기) */
      const s = Math.max(R.w / W, R.h / H)
      const ox = (R.w - W * s) / 2
      const oy = (R.h - H * s) / 2
      map.current = { s, ox, oy }
      const cs = canvas.style
      cs.width = `${W * s}px`
      cs.height = `${H * s}px`
      cs.transform = `translate3d(${ox}px, ${oy}px, 0)`

      const hero = heroRef.current
      if (hero) {
        const o = Math.max(0, 1 - sp * 2.6)
        hero.style.opacity = String(o)
        hero.style.visibility = o < 0.002 ? 'hidden' : 'visible'
        hero.style.transform = `translate3d(0, ${-sp * 70}px, 0)`
      }
      const hdr = hdrRef.current
      if (hdr) {
        const o = clamp((sp - 0.7) / 0.3, 0, 1)
        hdr.style.opacity = String(o)
        const on = o > 0.5
        if (on !== hdrOn) {
          hdrOn = on
          hdr.style.pointerEvents = on ? 'auto' : 'none'
          if (on) hdr.removeAttribute('inert')
          else hdr.setAttribute('inert', '')
        }
      }

      const act = sp < 0.6 ? -1 : activeNow
      if (act !== shownActive) { shownActive = act; setActive(act) }
      const dk = !mobile && sp > 0.94
      if (dk !== shownDocked) { shownDocked = dk; setDocked(dk) }

      if (!sim) return
      const dt = clamp((now - (lastT || now - 16)) / 1000, 0.008, 0.033)
      lastT = now
      const base = Math.floor(now / 2200) + act + 1
      const m = map.current
      const p = pointer.current
      if (p) {
        const ux = (p.x - m.ox) / (W * m.s)
        const uy = (p.y - m.oy) / (H * m.s)
        if (lastP) {
          const dx = ux - lastP.x
          const dy = uy - lastP.y
          if (Math.abs(dx) + Math.abs(dy) > 0.0003) sim.splat(ux, uy, dx * 6000, dy * 6000, COL[inkRef.current], p.down ? 0.22 : 0.12)
        }
        lastP = { x: ux, y: uy }
      } else lastP = null
      const b = boom.current
      if (b) {
        boom.current = null
        const ux = (b.x - m.ox) / (W * m.s)
        const uy = (b.y - m.oy) / (H * m.s)
        for (let k = 0; k < 7; k++) {
          const a = (k / 7) * Math.PI * 2
          sim.splat(ux, uy, Math.cos(a) * 900, Math.sin(a) * 900, k % 2 ? COL[inkRef.current] : COL[(inkRef.current + k) % COL.length], 0.35, 0.0016)
        }
      }
      if (!reduce && prevActive !== -2 && act !== prevActive) {
        for (let k = 0; k < 4; k++) sim.splat(0.15 + 0.23 * k, 0.5, (k % 2 ? -1 : 1) * 1400, 0, COL[(act + 1 + k) % COL.length], 0.5)
      }
      prevActive = act
      /* 보이지 않는 붓 두 개 — 커서가 화면 밖에 있거나 팔레트 위에 있어도 계속 흐르게.
         프레임 수와 상관없이 같은 속도로 움직이도록 방향만 쓰고 속도·잉크 양은 시간에 비례 */
      const t = now / 1000
      const speed = reduce ? 110 : 260
      const amt = (reduce ? 0.018 : 0.035) * dt * 60
      for (let k = 0; k < 2; k++) {
        const ax = 0.5 + 0.3 * Math.sin(t * (0.23 + k * 0.11) + k * 2.1)
        const ay = 0.5 + 0.3 * Math.sin(t * (0.31 + k * 0.07) + k)
        const prev = amb[k]
        if (prev) {
          const vx = ax - prev.x
          const vy = ay - prev.y
          const len = Math.hypot(vx, vy) || 1
          sim.splat(ax, ay, (vx / len) * speed, (vy / len) * speed, COL[(base + k) % COL.length], amt)
        }
        amb[k] = { x: ax, y: ay }
      }
      if (!reduce && now - lastAuto > (p ? 3000 : 1300)) { lastAuto = now; drop(0.45) }
      sim.step(dt)
      sim.render()
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      mq.removeEventListener('change', onMq)
      io.disconnect()
      window.removeEventListener('resize', onResize)
      sim?.dispose()
    }
  }, [])

  const cur = active >= 0 ? sections[active] : null

  return (
    <>
      <div ref={hdrRef} className={styles.hdr}>
        <Header variant="light" />
      </div>

      <div
        ref={boxRef}
        className={styles.box}
        role="img"
        aria-label={graphicLabel}
        onPointerMove={onMove}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onLeave}
      >
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        {docked && cur && (
          <div className={styles.panelLabel} aria-hidden="true">
            <span className={styles.panelNo}>{String(active + 1).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}</span>
            <strong className={styles.panelTitle}>{cur.label}</strong>
            <span className={styles.panelCap}>{cur.caption}</span>
          </div>
        )}
      </div>

      <div ref={heroRef} className={styles.hero}>
        <div className={styles.fade} aria-hidden="true" />
        <a href="#top" className={styles.brand}>
          <strong className={styles.brandMark}>NWCN</strong>
          <span>{brand}</span>
        </a>
        <div className={styles.inks} role="group" aria-label={inkLabel}>
          <span className={styles.inksLabel}>{inkLabel}</span>
          {INKS.map((c, i) => (
            <button
              key={c}
              type="button"
              className={styles.ink}
              style={{ background: c }}
              aria-label={inkNames[i] ?? c}
              aria-pressed={ink === i}
              onClick={() => setInk(i)}
            />
          ))}
        </div>
        <h1 className={styles.title}>
          <span>{headline[0]}</span>
          <span>{headline[1]}</span>
        </h1>
        <span className={styles.cue} aria-hidden="true">
          <span>{scroll}</span>
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 1v19M2 13l7 7 7-7" />
          </svg>
        </span>
      </div>

      <div id="top" className={styles.track} aria-hidden="true" />
      <div ref={colRef} className={styles.col}>{children}</div>
      <div ref={endRef} />
      {footer}
    </>
  )
}
