import { type PanelEngine, type PanelFrame, ghostAt } from './types'

/**
 * 군무 — 새 떼(보이드)가 서로 거리·방향·무리 중심을 맞추며 함께 난다.
 * 커서가 다가가면 흩어지고, 가만히 있으면 떠도는 점을 따라 천천히 무리 지어 움직인다.
 */
const PANEL = 'rgba(238,240,234,'
const DEEP = 'rgba(5,143,86,0.78)'
const GREEN = 'rgba(9,245,147,0.92)'
const YELLOW = 'rgba(200,206,40,0.92)'

interface Bird { x: number; y: number; vx: number; vy: number; c: number }

export class FlockEngine implements PanelEngine {
  private g: CanvasRenderingContext2D
  private B: Bird[] = []
  private W = 0
  private H = 0

  constructor(canvas: HTMLCanvasElement) {
    const g = canvas.getContext('2d')
    if (!g) throw new Error('2d')
    this.g = g
  }

  frame(f: PanelFrame) {
    const { g } = this
    const d = f.dpr
    const w = Math.round(f.w * d)
    const h = Math.round(f.h * d)
    if (w !== this.W || h !== this.H) {
      this.W = w
      this.H = h
      g.fillStyle = PANEL + '1)'
      g.fillRect(0, 0, w, h)
      this.B = Array.from({ length: 240 }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: Math.random() - 0.5, vy: Math.random() - 0.5, c: Math.random() }))
    }
    g.fillStyle = PANEL + '0.2)'
    g.fillRect(0, 0, w, h)
    const idle = !f.pointer
    const p = f.pointer ?? ghostAt(f.now, f.w, f.h, 5)
    const mx = p.x * d
    const my = p.y * d
    const sp = f.reduce ? 0.6 : 1
    const R1 = 16 * d, R2 = 46 * d, vmax = 2.6 * d * sp, vmin = 1.2 * d * sp
    const B = this.B
    for (const b of B) {
      let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, n = 0
      for (const o of B) {
        if (o === b) continue
        const dx = o.x - b.x
        const dy = o.y - b.y
        const dd = dx * dx + dy * dy
        if (dd < R2 * R2) {
          ax += o.vx; ay += o.vy; cx += o.x; cy += o.y; n++
          if (dd < R1 * R1) { sx -= dx / (dd + 1); sy -= dy / (dd + 1) }
        }
      }
      if (n) {
        b.vx += (ax / n - b.vx) * 0.05 + (cx / n - b.x) * 0.0006 + sx * 6
        b.vy += (ay / n - b.vy) * 0.05 + (cy / n - b.y) * 0.0006 + sy * 6
      }
      const dx = b.x - mx
      const dy = b.y - my
      const dm = Math.hypot(dx, dy) || 1
      if (idle) { b.vx -= dx * 0.00012; b.vy -= dy * 0.00012 }
      else if (dm < 110 * d) { b.vx += (dx / dm) * 0.5; b.vy += (dy / dm) * 0.5 }
      const m = 40 * d
      if (b.x < m) b.vx += 0.08
      if (b.x > w - m) b.vx -= 0.08
      if (b.y < m) b.vy += 0.08
      if (b.y > h - m) b.vy -= 0.08
      const s = Math.hypot(b.vx, b.vy) || 1
      const cl = Math.min(vmax, Math.max(vmin, s))
      b.vx *= cl / s
      b.vy *= cl / s
      b.x += b.vx
      b.y += b.vy
    }
    for (const b of B) {
      const a = Math.atan2(b.vy, b.vx)
      const L = 7 * d
      const Wd = 2.2 * d
      g.fillStyle = b.c < 0.12 ? GREEN : b.c < 0.2 ? YELLOW : DEEP
      g.beginPath()
      g.moveTo(b.x + Math.cos(a) * L, b.y + Math.sin(a) * L)
      g.lineTo(b.x + Math.cos(a + 2.5) * Wd, b.y + Math.sin(a + 2.5) * Wd)
      g.lineTo(b.x + Math.cos(a - 2.5) * Wd, b.y + Math.sin(a - 2.5) * Wd)
      g.closePath()
      g.fill()
    }
  }
}
