import { type PanelEngine, type PanelFrame, ghostAt } from './types'

/**
 * 비눗방울 — 무지갯빛 막을 가진 방울이 천천히 떠오른다. 커서로 건드리면 터지고 아래에서 새 방울이 올라온다.
 * 터질 때는 건드린 쪽부터 막이 찢어지듯 열리며 살짝 부풀고, 작은 물방울이 퍼지며 사라진다.
 * 가만히 있으면 떠도는 점이 방울을 살짝 밀어낸다.
 */
interface Bubble { x: number; y: number; r: number; vy: number; ph: number }
interface Drop { a: number; dist: number; s: number; c: string }
interface Pop { x: number; y: number; r: number; t: number; ang: number; ph: number; drops: Drop[] }

const COUNT = 34
const POP_MS = 650
const DROP_COLORS = ['rgba(9,245,147,', 'rgba(227,233,77,', 'rgba(160,120,255,', 'rgba(5,143,86,', 'rgba(255,255,255,']

const easeOut = (k: number) => 1 - (1 - k) ** 3
const easeInOut = (k: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, k))

export class BubbleEngine implements PanelEngine {
  private g: CanvasRenderingContext2D
  private B: Bubble[] = []
  private pops: Pop[] = []
  private W = 0
  private H = 0

  constructor(canvas: HTMLCanvasElement) {
    const g = canvas.getContext('2d')
    if (!g) throw new Error('2d')
    this.g = g
  }

  /** 작은 방울이 더 많게(크기 분포를 작은 쪽으로 치우침), 작은 방울이 조금 더 빨리 떠오른다 */
  private spawn(b: Bubble, w: number, h: number, first: boolean) {
    const u = Math.random() ** 1.7
    b.r = 9 + u * 54
    b.x = Math.random() * w
    b.y = first ? Math.random() * h : h + b.r * 2 + Math.random() * 60
    b.vy = -(16 + (1 - u) * 18 + Math.random() * 14)
    b.ph = Math.random() * Math.PI * 2
  }

  private pop(b: Bubble, px: number, py: number, now: number) {
    const n = 8 + Math.round(b.r / 6)
    const drops: Drop[] = Array.from({ length: n }, (_, i) => ({
      a: (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
      dist: 0.35 + Math.random() * 0.6,
      s: 1 + Math.random() * 2.2,
      c: DROP_COLORS[(Math.random() * DROP_COLORS.length) | 0],
    }))
    this.pops.push({ x: b.x, y: b.y, r: b.r, t: now, ang: Math.atan2(py - b.y, px - b.x), ph: b.ph, drops })
  }

  /** 무지갯빛 테두리 그라디언트 */
  private rim(X: number, Y: number, R: number, rot: number, alpha: number) {
    const g = this.g
    const rim = typeof g.createConicGradient === 'function' ? g.createConicGradient(rot, X, Y) : g.createLinearGradient(X - R, Y, X + R, Y)
    rim.addColorStop(0, `rgba(9,245,147,${0.75 * alpha})`)
    rim.addColorStop(0.3, `rgba(227,233,77,${0.6 * alpha})`)
    rim.addColorStop(0.55, `rgba(160,120,255,${0.45 * alpha})`)
    rim.addColorStop(0.8, `rgba(5,143,86,${0.55 * alpha})`)
    rim.addColorStop(1, `rgba(9,245,147,${0.75 * alpha})`)
    return rim
  }

  frame(f: PanelFrame) {
    const { g } = this
    const d = f.dpr
    const w = Math.round(f.w * d)
    const h = Math.round(f.h * d)
    if (w !== this.W || h !== this.H) {
      this.W = w
      this.H = h
      this.B = Array.from({ length: COUNT }, () => { const b = { x: 0, y: 0, r: 0, vy: 0, ph: 0 }; this.spawn(b, f.w, f.h, true); return b })
    }
    const sp = f.reduce ? 0.6 : 1
    const t = (f.now / 1000) * sp
    const grd = g.createLinearGradient(0, 0, 0, h)
    grd.addColorStop(0, 'rgb(246,247,243)')
    grd.addColorStop(1, 'rgb(205,240,222)')
    g.fillStyle = grd
    g.fillRect(0, 0, w, h)
    const idle = !f.pointer
    const p = f.pointer ?? ghostAt(f.now, f.w, f.h, 6)
    for (const b of this.B) {
      b.y += b.vy * sp * f.dt
      b.x += Math.sin(t * 0.8 + b.ph) * 15 * f.dt
      const dm = Math.hypot(b.x - p.x, b.y - p.y)
      if (!idle && dm < b.r) { this.pop(b, p.x, p.y, f.now); this.spawn(b, f.w, f.h, false); continue }
      if (idle && dm < b.r + 30) b.x += ((b.x - p.x) / (dm || 1)) * 36 * f.dt
      if (b.y < -b.r * 2) this.spawn(b, f.w, f.h, false)
      const X = b.x * d, Y = b.y * d, R = b.r * d
      const body = g.createRadialGradient(X - R * 0.3, Y - R * 0.35, R * 0.1, X, Y, R)
      body.addColorStop(0, 'rgba(255,255,255,0.05)')
      body.addColorStop(0.75, 'rgba(255,255,255,0.08)')
      body.addColorStop(1, 'rgba(255,255,255,0.35)')
      g.fillStyle = body
      g.beginPath()
      g.arc(X, Y, R, 0, Math.PI * 2)
      g.fill()
      g.strokeStyle = this.rim(X, Y, R, t * 0.6 + b.ph, 1)
      g.lineWidth = Math.max(1, R * 0.06)
      g.beginPath()
      g.arc(X, Y, R * 0.97, 0, Math.PI * 2)
      g.stroke()
      g.fillStyle = 'rgba(255,255,255,0.85)'
      g.beginPath()
      g.ellipse(X - R * 0.38, Y - R * 0.42, R * 0.16, R * 0.08, -0.7, 0, Math.PI * 2)
      g.fill()
    }

    /* 터지는 방울: 막이 건드린 쪽부터 찢어지듯 열리며 부풀고, 물방울이 퍼지며 사라진다 */
    this.pops = this.pops.filter((q) => f.now - q.t < POP_MS)
    g.lineCap = 'round'
    for (const q of this.pops) {
      const k = (f.now - q.t) / POP_MS
      const e = easeOut(k)
      const fade = (1 - k) ** 1.2
      const X = q.x * d, Y = q.y * d, R = q.r * d * (1 + 0.14 * e)
      // 막 안쪽 빛이 먼저 빠르게 빠진다
      if (k < 0.4) {
        g.fillStyle = `rgba(255,255,255,${0.22 * (1 - k / 0.4)})`
        g.beginPath()
        g.arc(X, Y, R, 0, Math.PI * 2)
        g.fill()
      }
      // 찢어지는 막: 건드린 쪽에 틈이 생겨 반대편으로 말려 들어간다
      const gap = Math.PI * 2 * easeInOut(k * 1.2)
      if (gap < Math.PI * 2 - 0.02) {
        g.strokeStyle = this.rim(X, Y, R, t * 0.6 + q.ph, fade)
        g.lineWidth = Math.max(0.8, q.r * d * 0.06 * (1 - e * 0.6))
        g.beginPath()
        g.arc(X, Y, R * 0.97, q.ang + gap / 2, q.ang - gap / 2 + Math.PI * 2)
        g.stroke()
      }
      // 물방울
      for (const dr of q.drops) {
        const rr = R * (0.95 + dr.dist * e)
        const s = dr.s * d * (1 - k * 0.7)
        g.fillStyle = `${dr.c}${0.85 * fade})`
        g.beginPath()
        g.arc(X + Math.cos(dr.a) * rr, Y + Math.sin(dr.a) * rr + 6 * d * e * e, s, 0, Math.PI * 2)
        g.fill()
      }
    }
  }
}
