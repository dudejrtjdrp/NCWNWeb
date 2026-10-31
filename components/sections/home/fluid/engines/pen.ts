import type { PanelFrame } from './types'

/**
 * 펜 — NCR 글자 칸 위에서 마우스를 누른 채 움직이면 펜(커서 펜촉)으로 글씨가 써진다.
 * 쓴 지 2초가 지나면 쓴 순서대로 선이 앞에서부터 모래처럼 부서져 알갱이로 흘러내리며 사라진다
 * (부서지는 속도는 쓴 속도보다 1.6배 느리게 — 서서히).
 * 글자 붓결(BrushEngine) 위에 겹친 투명 캔버스에 매 프레임 다시 그린다(붓결 그림은 건드리지 않음).
 * 동작 줄이기면 알갱이가 떨어지지 않고 그 자리에서 옅어진다.
 */

interface Pt { x: number; y: number; t: number; w: number }
interface Stroke { pts: Pt[]; cut: number; t0: number }
interface Grain { x: number; y: number; vx: number; vy: number; life: number; max: number; s: number; c: number }

const HOLD_MS = 2000
/** 부서지는 속도 — 쓴 시간의 몇 배에 걸쳐 지울지 */
const ERASE_SLOW = 1.6
const MAX_GRAINS = 6000
const INK = '#151515'
const SAND = ['#151515', '#3a3c37', '#5b5f58', '#058f56'] as const

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

export class PenEngine {
  private g: CanvasRenderingContext2D
  private strokes: Stroke[] = []
  private cur: Stroke | null = null
  private grains: Grain[] = []

  constructor(private canvas: HTMLCanvasElement) {
    const g = canvas.getContext('2d')
    if (!g) throw new Error('2d')
    this.g = g
  }

  /** 지울 선이나 떨어지는 알갱이가 남아 있는지 — 칸이 바뀐 뒤에도 끝까지 사라지게 계속 돌린다 */
  get busy() {
    return this.strokes.length > 0 || this.grains.length > 0
  }

  private crumble(a: Pt, b: Pt, reduce: boolean) {
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    const w = (a.w + b.w) / 2
    const n = Math.max(1, Math.round(len * w * 0.55))
    const nx = len ? -(b.y - a.y) / len : 0
    const ny = len ? (b.x - a.x) / len : 0
    for (let i = 0; i < n; i++) {
      const k = Math.random()
      const off = (Math.random() - 0.5) * w
      const max = (reduce ? 0.45 : 0.7) + Math.random() * (reduce ? 0.3 : 0.8)
      this.grains.push({
        x: a.x + (b.x - a.x) * k + nx * off,
        y: a.y + (b.y - a.y) * k + ny * off,
        vx: reduce ? 0 : (Math.random() - 0.5) * 26,
        vy: reduce ? 0 : -Math.random() * 16,
        life: max,
        max,
        s: 0.9 + Math.random() * 1.1,
        c: Math.random() < 0.08 ? 3 : Math.floor(Math.random() * 3),
      })
    }
    if (this.grains.length > MAX_GRAINS) this.grains.splice(0, this.grains.length - MAX_GRAINS)
  }

  frame(f: PanelFrame) {
    const { g } = this
    const d = f.dpr
    const w = Math.round(f.w * d)
    const h = Math.round(f.h * d)
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
    }

    // 쓰기: 누르고 있는 동안 점을 잇는다(빠르게 그으면 가늘게)
    const p = f.pointer
    if (p && p.down) {
      if (!this.cur) {
        this.cur = { pts: [], cut: 0, t0: f.now }
        this.strokes.push(this.cur)
      }
      const pts = this.cur.pts
      const last = pts[pts.length - 1]
      const dist = last ? Math.hypot(p.x - last.x, p.y - last.y) : 0
      if (!last || dist > 1.2) {
        const speed = last ? dist / Math.max(f.dt, 1 / 120) : 0
        const want = clamp(3.6 - speed * 0.0024, 1.2, 3.6)
        pts.push({ x: p.x, y: p.y, t: f.now, w: last ? last.w + (want - last.w) * 0.35 : 2.8 })
      }
    } else this.cur = null

    // 부서지기: 쓴 지 2초 지난 마디부터 차례로 알갱이로
    for (const s of this.strokes) {
      const due = (pt: Pt) => s.t0 + HOLD_MS + (pt.t - s.t0) * ERASE_SLOW
      while (s.cut < s.pts.length - 1 && f.now > due(s.pts[s.cut + 1])) {
        this.crumble(s.pts[s.cut], s.pts[s.cut + 1], f.reduce)
        s.cut++
      }
      if (s !== this.cur && s.pts.length === 1 && s.cut === 0 && f.now - s.pts[0].t > HOLD_MS) {
        this.crumble(s.pts[0], { ...s.pts[0], x: s.pts[0].x + 0.5 }, f.reduce)
        s.cut = 1
      }
    }
    this.strokes = this.strokes.filter((s) => s === this.cur || s.cut < s.pts.length - 1)

    g.clearRect(0, 0, w, h)

    // 남은 선
    g.lineCap = 'round'
    g.lineJoin = 'round'
    g.strokeStyle = INK
    for (const s of this.strokes) {
      const pts = s.pts
      if (pts.length === 1) {
        g.fillStyle = INK
        g.beginPath()
        g.arc(pts[0].x * d, pts[0].y * d, (pts[0].w / 2) * d, 0, Math.PI * 2)
        g.fill()
        continue
      }
      for (let i = s.cut; i < pts.length - 1; i++) {
        const a = pts[i]
        const b = pts[i + 1]
        g.lineWidth = ((a.w + b.w) / 2) * d
        g.beginPath()
        g.moveTo(a.x * d, a.y * d)
        g.lineTo(b.x * d, b.y * d)
        g.stroke()
      }
    }

    // 모래 알갱이: 살짝 튀었다가 흘러내리며 옅어짐
    const dt = f.dt
    const grav = f.reduce ? 0 : 150
    let keep = 0
    for (const q of this.grains) {
      q.life -= dt
      if (q.life <= 0) continue
      q.vx *= 0.97
      q.vy += grav * dt
      q.x += q.vx * dt
      q.y += q.vy * dt
      this.grains[keep++] = q
    }
    this.grains.length = keep
    for (let c = 0; c < SAND.length; c++) {
      g.fillStyle = SAND[c]
      for (const q of this.grains) {
        if (q.c !== c) continue
        g.globalAlpha = clamp(q.life / q.max, 0, 1) * 0.9
        const s = q.s * d
        g.fillRect(q.x * d - s / 2, q.y * d - s / 2, s, s)
      }
    }
    g.globalAlpha = 1
  }
}
