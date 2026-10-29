import { type PanelEngine, type PanelFrame, ghostAt } from './types'

/**
 * 비눗방울 — 무지갯빛 막을 가진 방울이 천천히 떠오른다. 커서로 건드리면 터지고 아래에서 새 방울이 올라온다.
 * 가만히 있으면 떠도는 점이 방울을 살짝 밀어낸다.
 */
interface Bubble { x: number; y: number; r: number; vy: number; ph: number }
interface Pop { x: number; y: number; r: number; t: number }

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

  private spawn(b: Bubble, w: number, h: number, first: boolean) {
    b.r = 18 + Math.random() * 52
    b.x = Math.random() * w
    b.y = first ? Math.random() * h : h + b.r * 2
    b.vy = -(0.25 + Math.random() * 0.45)
    b.ph = Math.random() * Math.PI * 2
  }

  frame(f: PanelFrame) {
    const { g } = this
    const d = f.dpr
    const w = Math.round(f.w * d)
    const h = Math.round(f.h * d)
    if (w !== this.W || h !== this.H) {
      this.W = w
      this.H = h
      this.B = Array.from({ length: 16 }, () => { const b = { x: 0, y: 0, r: 0, vy: 0, ph: 0 }; this.spawn(b, f.w, f.h, true); return b })
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
      b.y += b.vy * sp
      b.x += Math.sin(t * 0.8 + b.ph) * 0.25
      const dm = Math.hypot(b.x - p.x, b.y - p.y)
      if (!idle && dm < b.r) { this.pops.push({ x: b.x, y: b.y, r: b.r, t: f.now }); this.spawn(b, f.w, f.h, false); continue }
      if (idle && dm < b.r + 30) b.x += ((b.x - p.x) / (dm || 1)) * 0.6
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
      const rim = typeof g.createConicGradient === 'function' ? g.createConicGradient(t * 0.6 + b.ph, X, Y) : g.createLinearGradient(X - R, Y, X + R, Y)
      rim.addColorStop(0, 'rgba(9,245,147,0.75)')
      rim.addColorStop(0.3, 'rgba(227,233,77,0.6)')
      rim.addColorStop(0.55, 'rgba(160,120,255,0.45)')
      rim.addColorStop(0.8, 'rgba(5,143,86,0.55)')
      rim.addColorStop(1, 'rgba(9,245,147,0.75)')
      g.strokeStyle = rim
      g.lineWidth = Math.max(1, R * 0.06)
      g.beginPath()
      g.arc(X, Y, R * 0.97, 0, Math.PI * 2)
      g.stroke()
      g.fillStyle = 'rgba(255,255,255,0.85)'
      g.beginPath()
      g.ellipse(X - R * 0.38, Y - R * 0.42, R * 0.16, R * 0.08, -0.7, 0, Math.PI * 2)
      g.fill()
    }
    this.pops = this.pops.filter((q) => f.now - q.t < 420)
    for (const q of this.pops) {
      const k = (f.now - q.t) / 420
      g.strokeStyle = `rgba(5,143,86,${0.6 * (1 - k)})`
      g.lineWidth = 1.2 * d
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2
        const r1 = q.r * d * (0.9 + k * 0.6)
        const r2 = r1 + 8 * d
        g.beginPath()
        g.moveTo(q.x * d + Math.cos(a) * r1, q.y * d + Math.sin(a) * r1)
        g.lineTo(q.x * d + Math.cos(a) * r2, q.y * d + Math.sin(a) * r2)
        g.stroke()
      }
    }
  }
}
