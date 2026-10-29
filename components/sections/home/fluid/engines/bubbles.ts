import { type PanelEngine, type PanelFrame, ghostAt } from './types'

/**
 * 비눗방울 — 무지갯빛 막을 가진 방울이 천천히 떠오른다.
 * 커서를 올리면 방울이 터지면서 크기가 제각각인 작은 방울 여러 개가 퍼져 나오고, 작은 방울도 커서를 올리면 터진다.
 * 터질 때는 건드린 쪽부터 막이 찢어지듯 열리며 살짝 부풀고, 물방울이 퍼지며 사라진다.
 * 가만히 있으면 떠도는 점이 방울을 살짝 밀어낸다(터뜨리지는 않음).
 */
interface Bubble {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  /** 떠오르는 속도(px/s, 음수) */
  rise: number
  ph: number
  /** 태어난 시각(ms) — 작은 방울이 커지며 나타나고, 막 태어난 방울은 바로 터지지 않게 */
  born: number
  kid: boolean
  /** 작은 방울 테두리 색 */
  c: string
}
interface Drop { a: number; dist: number; s: number; c: string }
interface Pop { x: number; y: number; r: number; t: number; ang: number; ph: number; drops: Drop[] }

const COUNT = 24
const MAX_KIDS = 150
const POP_MS = 650
const GROW_MS = 280
const SAFE_MS = 350
const DROP_COLORS = ['rgba(9,245,147,', 'rgba(227,233,77,', 'rgba(160,120,255,', 'rgba(5,143,86,', 'rgba(255,255,255,']
const KID_COLORS = ['rgba(9,245,147,0.75)', 'rgba(227,233,77,0.7)', 'rgba(160,120,255,0.6)', 'rgba(5,143,86,0.65)']

const easeOut = (k: number) => 1 - (1 - Math.min(1, k)) ** 3
const easeInOut = (k: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, k))
const pick = <T>(a: readonly T[]) => a[(Math.random() * a.length) | 0]

export class BubbleEngine implements PanelEngine {
  private g: CanvasRenderingContext2D
  private B: Bubble[] = []
  private kids: Bubble[] = []
  private pops: Pop[] = []
  private W = 0
  private H = 0

  constructor(canvas: HTMLCanvasElement) {
    const g = canvas.getContext('2d')
    if (!g) throw new Error('2d')
    this.g = g
  }

  private spawn(b: Bubble, w: number, h: number, first: boolean, now: number) {
    const u = Math.random() ** 1.4
    b.r = 20 + u * 42
    b.x = Math.random() * w
    b.y = first ? Math.random() * h : h + b.r * 2 + Math.random() * 60
    b.vx = 0
    b.rise = -(16 + (1 - u) * 16 + Math.random() * 12)
    b.vy = b.rise
    b.ph = Math.random() * Math.PI * 2
    b.born = first ? now - 1e4 : now
    b.kid = false
  }

  /** 터진 방울 자리에서 크기가 제각각인 작은 방울이 퍼져 나온다 */
  private burstKids(p: Bubble, now: number) {
    const n = Math.min(MAX_KIDS - this.kids.length, 4 + Math.round(p.r / 12) + ((Math.random() * 4) | 0))
    const scale = Math.min(1, 0.4 + p.r / 45)
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const sp = 35 + Math.random() * 60
      const off = Math.random() * p.r * 0.55
      this.kids.push({
        x: p.x + Math.cos(a) * off,
        y: p.y + Math.sin(a) * off,
        r: (4 + Math.random() ** 1.3 * 13) * scale,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        rise: -(22 + Math.random() * 26),
        ph: Math.random() * Math.PI * 2,
        born: now,
        kid: true,
        c: pick(KID_COLORS),
      })
    }
  }

  private pop(b: Bubble, px: number, py: number, now: number) {
    const n = 4 + Math.round(b.r / 5)
    const ds = Math.min(1, Math.max(0.45, b.r / 30))
    const drops: Drop[] = Array.from({ length: n }, (_, i) => ({
      a: (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
      dist: 0.35 + Math.random() * 0.6,
      s: (0.7 + Math.random() * 1.8) * ds,
      c: pick(DROP_COLORS),
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

  private draw(b: Bubble, d: number, t: number, now: number) {
    const g = this.g
    const grow = b.kid ? 0.3 + 0.7 * easeOut((now - b.born) / GROW_MS) : 1
    const X = b.x * d, Y = b.y * d, R = b.r * d * grow
    if (R < 16) {
      // 작은 방울: 그라디언트 없이 가볍게
      g.fillStyle = 'rgba(255,255,255,0.18)'
      g.beginPath()
      g.arc(X, Y, R, 0, Math.PI * 2)
      g.fill()
      g.strokeStyle = b.c
      g.lineWidth = Math.max(0.8, R * 0.09)
      g.stroke()
      g.fillStyle = 'rgba(255,255,255,0.9)'
      g.beginPath()
      g.arc(X - R * 0.38, Y - R * 0.4, Math.max(0.6, R * 0.14), 0, Math.PI * 2)
      g.fill()
      return
    }
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

  frame(f: PanelFrame) {
    const { g } = this
    const d = f.dpr
    const w = Math.round(f.w * d)
    const h = Math.round(f.h * d)
    if (w !== this.W || h !== this.H) {
      this.W = w
      this.H = h
      this.kids = []
      this.B = Array.from({ length: COUNT }, () => {
        const b: Bubble = { x: 0, y: 0, r: 0, vx: 0, vy: 0, rise: 0, ph: 0, born: 0, kid: false, c: '' }
        this.spawn(b, f.w, f.h, true, f.now)
        return b
      })
    }
    const sp = f.reduce ? 0.6 : 1
    const dt = f.dt * sp
    const t = (f.now / 1000) * sp
    const grd = g.createLinearGradient(0, 0, 0, h)
    grd.addColorStop(0, 'rgb(246,247,243)')
    grd.addColorStop(1, 'rgb(205,240,222)')
    g.fillStyle = grd
    g.fillRect(0, 0, w, h)

    const idle = !f.pointer
    const p = f.pointer ?? ghostAt(f.now, f.w, f.h, 6)
    const dragX = Math.exp(-2.4 * dt)
    const riseK = 1 - Math.exp(-1.6 * dt)

    // 큰 방울
    for (const b of this.B) {
      b.y += b.vy * dt
      b.x += Math.sin(t * 0.8 + b.ph) * 15 * dt
      const dm = Math.hypot(b.x - p.x, b.y - p.y)
      if (!idle && dm < b.r && f.now - b.born > SAFE_MS) {
        this.pop(b, p.x, p.y, f.now)
        this.burstKids(b, f.now)
        this.spawn(b, f.w, f.h, false, f.now)
        continue
      }
      if (idle && dm < b.r + 30) b.x += ((b.x - p.x) / (dm || 1)) * 36 * dt
      if (b.y < -b.r * 2) this.spawn(b, f.w, f.h, false, f.now)
      this.draw(b, d, t, f.now)
    }

    // 작은 방울: 퍼져 나가다 느려지고, 천천히 떠오른다
    this.kids = this.kids.filter((b) => {
      b.vx *= dragX
      b.vy += (b.rise - b.vy) * riseK
      b.x += (b.vx + Math.sin(t * 1.1 + b.ph) * 10) * dt
      b.y += b.vy * dt
      if (b.y < -b.r * 2 || b.x < -b.r * 2 || b.x > f.w + b.r * 2) return false
      const dm = Math.hypot(b.x - p.x, b.y - p.y)
      if (!idle && dm < b.r + 5 && f.now - b.born > SAFE_MS) {
        this.pop(b, p.x, p.y, f.now)
        return false
      }
      if (idle && dm < b.r + 24) b.x += ((b.x - p.x) / (dm || 1)) * 30 * dt
      this.draw(b, d, t, f.now)
      return true
    })

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
        g.strokeStyle = R < 16 ? `rgba(5,143,86,${0.6 * fade})` : this.rim(X, Y, R, t * 0.6 + q.ph, fade)
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
