import { C, type PanelEngine, type PanelFrame } from './types'

/**
 * 물리 키워드 — 학과에서 배우는 것들이 공이 되어 떨어지고 쌓인다.
 * 공을 끌어서 던질 수 있고, 빈 곳을 누르면 튕겨 나간다. 가만히 있으면 가끔 공 하나가 통통 튄다.
 */
const WORDS: ReadonlyArray<readonly [string, number]> = [
  ['기획', 1], ['디자인', 1], ['개발', 1], ['영상', 0.8], ['모션', 0.7], ['3D', 0.72], ['웹', 0.62], ['앱', 0.55],
  ['UX/UI', 0.75], ['게임', 0.7], ['XR', 0.6], ['AI', 0.62], ['사운드', 0.55], ['그래픽', 0.7], ['인터랙션', 0.82],
  ['미디어파사드', 0.92], ['브랜딩', 0.6], ['사진', 0.55], ['전시', 0.6], ['포트폴리오', 0.88],
]

interface Body { x: number; y: number; vx: number; vy: number; a: number; br: number; r: number; label: string; st: number }

export class PhysicsEngine implements PanelEngine {
  private g: CanvasRenderingContext2D
  private B: Body[] | null = null
  private grab = -1
  private gOff: [number, number] = [0, 0]
  private boom: [number, number] | null = null
  private lastHop = 0
  private baseArea = WORDS.reduce((a, w) => a + Math.PI * Math.pow(30 + 58 * w[1], 2), 0)

  constructor(private canvas: HTMLCanvasElement) {
    const g = canvas.getContext('2d')
    if (!g) throw new Error('2d')
    this.g = g
  }

  private hit(x: number, y: number) {
    if (!this.B) return -1
    for (let i = this.B.length - 1; i >= 0; i--) if (Math.hypot(x - this.B[i].x, y - this.B[i].y) < this.B[i].r) return i
    return -1
  }

  down(x: number, y: number) {
    const i = this.hit(x, y)
    if (i >= 0 && this.B) { this.grab = i; this.gOff = [x - this.B[i].x, y - this.B[i].y] }
    else this.boom = [x, y]
  }

  up() { this.grab = -1 }

  frame(f: PanelFrame) {
    const { w } = f
    /* 아래쪽 섹션 이름 표시 위로 공이 쌓이도록 바닥을 띄운다 */
    const h = Math.max(f.h * 0.5, f.h - 150)
    const sc = Math.min(1.1, Math.sqrt((w * h * 0.36) / this.baseArea), (w * 0.46) / 88)
    if (!this.B) {
      this.B = WORDS.map(([label, wt], i) => ({ x: w * (0.12 + 0.76 * ((i * 0.618) % 1)), y: -90 - i * 64, vx: 0, vy: 0, a: 0, br: 30 + 58 * wt, r: 30, label, st: i % 5 === 0 ? 1 : i % 7 === 3 ? 2 : 0 }))
    }
    const B = this.B
    const ptr = f.pointer
    /* 가만히 있으면 4초마다 공 하나가 통통 */
    if (!ptr && f.idleMs > 2500 && f.now - this.lastHop > 4000) {
      this.lastHop = f.now
      const b = B[Math.floor(Math.random() * B.length)]
      b.vy -= f.reduce ? 6 : 11
      b.vx += (Math.random() - 0.5) * 6
    }
    for (const b of B) { b.r = b.br * sc; b.vy += 0.5; b.vx *= 0.995; b.vy *= 0.995 }
    if (this.grab >= 0 && ptr) {
      const b = B[this.grab]
      b.vx = (ptr.x - this.gOff[0] - b.x) * 0.3
      b.vy = (ptr.y - this.gOff[1] - b.y) * 0.3
    } else if (ptr && !ptr.down) {
      for (const b of B) {
        const dx = b.x - ptr.x, dy = b.y - ptr.y, d = Math.hypot(dx, dy), rr = b.r + 40
        if (d < rr && d > 0.1) { const k = (1 - d / rr) * 1.4; b.vx += (dx / d) * k; b.vy += (dy / d) * k }
      }
    }
    if (this.boom) {
      const [bx, by] = this.boom
      for (const b of B) {
        const dx = b.x - bx, dy = b.y - by, d = Math.hypot(dx, dy) || 1
        if (d < 340) { const k = (1 - d / 340) * 24; b.vx += (dx / d) * k; b.vy += (dy / d) * k - k * 0.4 }
      }
      this.boom = null
    }
    for (const b of B) {
      const sp = Math.hypot(b.vx, b.vy)
      if (sp > 45) { b.vx *= 45 / sp; b.vy *= 45 / sp }
      b.x += b.vx
      b.y += b.vy
      b.a += b.vx / Math.max(8, b.r)
      if (Math.abs(b.vx) < 0.4) b.a *= 0.95
    }
    for (let it = 0; it < 4; it++) {
      for (let i = 0; i < B.length; i++) {
        for (let j = i + 1; j < B.length; j++) {
          const a = B[i], c = B[j]
          const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy) || 0.01, m = a.r + c.r
          if (d < m) {
            const nx = dx / d, ny = dy / d, ov = m - d, ma = a.r * a.r, mc = c.r * c.r, ta = mc / (ma + mc), tc = ma / (ma + mc)
            a.x -= nx * ov * ta; a.y -= ny * ov * ta; c.x += nx * ov * tc; c.y += ny * ov * tc
            const rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny
            if (rv < 0) { const imp = -1.25 * rv; a.vx -= nx * imp * ta; a.vy -= ny * imp * ta; c.vx += nx * imp * tc; c.vy += ny * imp * tc }
          }
        }
      }
      for (const b of B) {
        if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * 0.4 }
        if (b.x > w - b.r) { b.x = w - b.r; b.vx = -Math.abs(b.vx) * 0.4 }
        if (b.y > h - b.r) { b.y = h - b.r; b.vy = -Math.abs(b.vy) * 0.3; b.vx *= 0.96 }
      }
    }
    const hov = ptr ? this.hit(ptr.x, ptr.y) : -1
    this.canvas.style.cursor = this.grab >= 0 ? 'grabbing' : hov >= 0 ? 'grab' : ''
    const g = this.g
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.fillStyle = C.bg
    g.fillRect(0, 0, this.canvas.width, this.canvas.height)
    g.setTransform(f.dpr, 0, 0, f.dpr, 0, 0)
    for (const b of B) {
      g.beginPath()
      g.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      g.fillStyle = b.st === 1 ? C.ink : b.st === 2 ? C.green : '#FFFFFF'
      g.fill()
      g.lineWidth = Math.max(1, b.r * 0.03)
      g.strokeStyle = C.ink
      g.stroke()
      if (b.r > 13) {
        const fs = Math.min(b.r * 0.5, (b.r * 1.55) / Math.max(1.6, b.label.length * 0.95))
        g.save()
        g.translate(b.x, b.y)
        g.rotate(b.a)
        g.font = `700 ${fs}px 'Pretendard Variable', 'Pretendard', sans-serif`
        g.textAlign = 'center'
        g.textBaseline = 'middle'
        g.fillStyle = b.st === 1 ? '#FFFFFF' : C.ink
        g.fillText(b.label, 0, fs * 0.04)
        g.restore()
      }
    }
  }
}
