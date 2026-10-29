import { C, ghostAt, type PanelEngine, type PanelFrame } from './types'

/**
 * 파티클 타이포 — 점 2,400개가 글자를 이루고, 커서에 밀리고, 클릭하면 터졌다가 다시 모인다.
 * 빠르게 움직이는 점은 초록으로 빛난다.
 */
export class ParticleEngine implements PanelEngine {
  private g: CanvasRenderingContext2D
  private N = 2400
  private P = new Float32Array(this.N * 4)
  private tone = new Uint8Array(this.N)
  private cidx = new Uint8Array(this.N)
  private jit = new Float32Array(this.N * 2)
  private shape: { pts: Float32Array; n: number; x0: number; y0: number; w: number; h: number; gap: number } | null = null
  private seeded = false
  private lw = 0
  private lh = 0
  private boom: { x: number; y: number } | null = null

  constructor(canvas: HTMLCanvasElement, private text: string) {
    const g = canvas.getContext('2d')
    if (!g) throw new Error('2d')
    this.g = g
    let sd = 11
    const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647 }
    for (let i = 0; i < this.N; i++) {
      const r = rnd()
      this.tone[i] = r < 0.09 ? 1 : r < 0.14 ? 2 : 0
      this.jit[i * 2] = rnd() - 0.5
      this.jit[i * 2 + 1] = rnd() - 0.5
    }
    document.fonts?.ready.then(() => { this.shape = null }).catch(() => {})
  }

  private sample() {
    const fs = 220
    const c = document.createElement('canvas')
    const x = c.getContext('2d')
    if (!x) return null
    const font = `900 ${fs}px 'A2z', 'Arial Black', sans-serif`
    x.font = font
    const tw = Math.ceil(x.measureText(this.text).width) + 24
    const th = Math.ceil(fs * 1.05)
    c.width = tw
    c.height = th
    x.font = font
    x.textBaseline = 'middle'
    x.fillStyle = '#000'
    x.fillText(this.text, 12, th / 2)
    const d = x.getImageData(0, 0, tw, th).data
    const gap = 4
    const pts: number[] = []
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9
    for (let y = 0; y < th; y += gap) {
      for (let xx = 0; xx < tw; xx += gap) {
        if (d[(y * tw + xx) * 4 + 3] > 128) {
          pts.push(xx, y)
          if (xx < x0) x0 = xx
          if (xx > x1) x1 = xx
          if (y < y0) y0 = y
          if (y > y1) y1 = y
        }
      }
    }
    if (!pts.length) return null
    return { pts: new Float32Array(pts), n: pts.length / 2, x0, y0, w: x1 - x0 + gap, h: y1 - y0 + gap, gap }
  }

  down(x: number, y: number) { this.boom = { x, y } }

  frame(f: PanelFrame) {
    const { g, N, P } = this
    const w = Math.round(f.w * f.dpr)
    const h = Math.round(f.h * f.dpr)
    if (!this.shape) this.shape = this.sample()
    const sh = this.shape
    if (!sh) return
    const fit = Math.min((w * 0.84) / sh.w, (h * 0.5) / sh.h)
    const ox = (w - sh.w * fit) / 2 - sh.x0 * fit
    const oy = (h - sh.h * fit) / 2 - sh.y0 * fit - h * 0.08
    if (!this.seeded) {
      for (let i = 0; i < N; i++) { P[i * 4] = Math.random() * w; P[i * 4 + 1] = Math.random() * h }
      this.seeded = true
      this.lw = w
      this.lh = h
    }
    if (w !== this.lw || h !== this.lh) {
      for (let i = 0; i < N; i++) { P[i * 4] *= w / this.lw; P[i * 4 + 1] *= h / this.lh }
      this.lw = w
      this.lh = h
    }
    const ptr = f.pointer ?? (f.idleMs > 2500 ? ghostAt(f.now, f.w, f.h) : null)
    const ghost = !f.pointer
    const t = f.now / 1000
    const mr = Math.max(50 * f.dpr, Math.min(w, h) * 0.2)
    const mx = ptr ? ptr.x * f.dpr : -1e9
    const my = ptr ? ptr.y * f.dpr : -1e9
    const push = ghost ? 4 : 9
    const b = this.boom
    const br = b ? Math.max(w, h) * 0.7 : 0
    const thr = 9 * f.dpr * f.dpr
    const k = 0.055 * Math.min(2, f.dt * 60)
    for (let i = 0; i < N; i++) {
      const j = i * 4
      const q = Math.floor((i * sh.n) / N) * 2
      const tx = ox + (sh.pts[q] + this.jit[i * 2] * sh.gap) * fit + Math.sin(t * 1.3 + i) * 0.7 * f.dpr
      const ty = oy + (sh.pts[q + 1] + this.jit[i * 2 + 1] * sh.gap) * fit + Math.cos(t * 1.1 + i * 0.7) * 0.7 * f.dpr
      let vx = P[j + 2] + (tx - P[j]) * k
      let vy = P[j + 3] + (ty - P[j + 1]) * k
      const dx = P[j] - mx
      const dy = P[j + 1] - my
      const d2 = dx * dx + dy * dy
      if (d2 < mr * mr) {
        const d = Math.sqrt(d2) || 1
        const kk = 1 - d / mr
        const F = kk * kk * push * f.dpr
        vx += (dx / d) * F
        vy += (dy / d) * F
      }
      if (b) {
        const ex = P[j] - b.x * f.dpr
        const ey = P[j + 1] - b.y * f.dpr
        const ed = Math.sqrt(ex * ex + ey * ey) || 1
        if (ed < br) { const F = (1 - ed / br) * 48 * f.dpr; vx += (ex / ed) * F; vy += (ey / ed) * F }
      }
      vx *= 0.84
      vy *= 0.84
      P[j] += vx
      P[j + 1] += vy
      P[j + 2] = vx
      P[j + 3] = vy
      this.cidx[i] = vx * vx + vy * vy > thr ? 1 : this.tone[i]
    }
    this.boom = null
    g.fillStyle = 'rgba(238,240,234,0.32)'
    g.fillRect(0, 0, w, h)
    const ps = Math.max(1, Math.min(4 * f.dpr, fit * sh.gap * 0.55))
    const COL = [C.ink, C.green, C.yellow]
    for (const c of [0, 2, 1]) {
      g.fillStyle = COL[c]
      for (let i = 0; i < N; i++) if (this.cidx[i] === c) g.fillRect(P[i * 4] - ps / 2, P[i * 4 + 1] - ps / 2, ps, ps)
    }
  }
}
