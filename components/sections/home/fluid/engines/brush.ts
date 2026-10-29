import { ghostAt, type PanelEngine, type PanelFrame } from './types'

/**
 * 유화 붓결 — 입자가 부드러운 흐름장을 따라 움직이며 짧은 붓질을 남기고, 붓질이 쌓여 한 장의 그림이 된다.
 * 커서 주변으로 붓결이 휜다. mask를 주면 붓질이 그 글자 안에만 쌓여 글자가 그려진다(바깥은 옅은 민트).
 */
type RGB = readonly [number, number, number]
const PAL: Record<string, RGB> = {
  green: [9, 245, 147], deep: [5, 143, 86], yellow: [227, 233, 77], mint: [205, 240, 222], white: [255, 255, 255],
}
const BG: RGB = [238, 240, 234]
const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`

interface Stroke { x: number; y: number; life: number; c: number; w: number; inside: boolean }

export class BrushEngine implements PanelEngine {
  private g: CanvasRenderingContext2D
  private W = 0
  private H = 0
  private ps: Stroke[] = []
  private mask: Uint8ClampedArray | null = null
  private maskPts: number[] = []
  private maskDirty = false
  private ma = 0
  /** 처음 보일 때 빈 화면으로 시작하지 않도록 몇 프레임 동안 붓질을 여러 번 쌓는다 */
  private warm = 0
  private colors: RGB[]
  private weights: number[]

  constructor(private canvas: HTMLCanvasElement, private opts: { mask?: string } = {}) {
    const g = canvas.getContext('2d')
    if (!g) throw new Error('2d')
    this.g = g
    if (opts.mask) {
      this.colors = [PAL.green, PAL.deep, PAL.yellow, PAL.deep]
      this.weights = [0.36, 0.3, 0.14, 0.2]
      document.fonts?.load("900 100px 'A2z'").then(() => { this.maskDirty = true }).catch(() => {})
    } else {
      this.colors = [PAL.green, PAL.deep, PAL.yellow, PAL.mint, PAL.white]
      this.weights = [0.3, 0.2, 0.18, 0.16, 0.16]
    }
  }

  private pick() {
    let r = Math.random()
    let i = 0
    while (i < this.weights.length - 1 && r > this.weights[i]) { r -= this.weights[i]; i++ }
    return i
  }

  private buildMask() {
    const { W, H } = this
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const x = c.getContext('2d')
    if (!x || !this.opts.mask) return
    x.fillStyle = '#000'
    x.textAlign = 'center'
    x.textBaseline = 'middle'
    let fs = H * 0.42
    const font = (s: number) => `900 ${s}px 'A2z', 'Arial Black', sans-serif`
    x.font = font(fs)
    const tw = x.measureText(this.opts.mask).width
    if (tw > W * 0.84) { fs *= (W * 0.84) / tw; x.font = font(fs) }
    x.fillText(this.opts.mask, W / 2, H * 0.42)
    this.mask = x.getImageData(0, 0, W, H).data
    this.maskPts = []
    for (let y = 0; y < H; y += 3) for (let xx = 0; xx < W; xx += 3) if (this.mask[(y * W + xx) * 4 + 3] > 128) this.maskPts.push(xx, y)
  }

  private inMask(x: number, y: number) {
    const xi = x | 0
    const yi = y | 0
    if (!this.mask || xi < 0 || yi < 0 || xi >= this.W || yi >= this.H) return false
    return this.mask[(yi * this.W + xi) * 4 + 3] > 128
  }

  private spawn(p: Stroke, dpr: number) {
    if (this.maskPts.length && Math.random() < 0.93) {
      const k = Math.floor((Math.random() * this.maskPts.length) / 2) * 2
      p.x = this.maskPts[k]
      p.y = this.maskPts[k + 1]
      p.inside = true
    } else {
      p.x = Math.random() * this.W
      p.y = Math.random() * this.H
      p.inside = false
    }
    p.life = this.opts.mask ? 30 + Math.random() * 80 : 60 + Math.random() * 160
    p.c = this.pick()
    p.w = (this.opts.mask ? 2 + Math.random() * 3 : 2 + Math.random() * 5) * dpr
  }

  frame(f: PanelFrame) {
    const { g } = this
    const d = f.dpr
    const w = Math.round(f.w * d)
    const h = Math.round(f.h * d)
    if (w !== this.W || h !== this.H) {
      this.W = w
      this.H = h
      g.fillStyle = rgba(BG, 1)
      g.fillRect(0, 0, w, h)
      if (this.opts.mask) this.buildMask()
      this.ps = Array.from({ length: 700 }, () => { const p = { x: 0, y: 0, life: 0, c: 0, w: 0, inside: false }; this.spawn(p, d); return p })
      this.warm = 60
    }
    const reps = this.warm > 0 ? 6 : 1
    this.warm -= reps
    if (this.maskDirty) { this.maskDirty = false; this.buildMask() }
    const speedK = f.reduce ? 0.5 : 1
    const t = (f.now / 1000) * speedK
    const ptr = f.pointer ?? ghostAt(f.now, f.w, f.h, 3)
    this.ma += ((f.pointer ? 1 : 0.5) - this.ma) * Math.min(1, f.dt * 4)
    g.fillStyle = rgba(BG, this.opts.mask ? 0.014 : 0.012)
    g.fillRect(0, 0, w, h)
    const mx = ptr.x * d
    const my = ptr.y * d
    const mr = Math.min(w, h) * 0.35
    const s = 0.0011 / d
    const step = (this.opts.mask ? 1.1 : 1.6) * d * speedK
    g.lineCap = 'round'
    for (let r = 0; r < reps; r++) for (const p of this.ps) {
      let a = (Math.sin(p.x * s + t * 0.11) + Math.cos(p.y * s * 1.3 - t * 0.08) + Math.sin((p.x + p.y) * s * 0.7 + t * 0.05)) * Math.PI * 0.55 - Math.PI / 2
      const dx = p.x - mx
      const dy = p.y - my
      const dist = Math.hypot(dx, dy)
      if (dist < mr) { const k = (1 - dist / mr) * this.ma; a = a * (1 - k) + (Math.atan2(dy, dx) + Math.PI / 2) * k }
      const nx = p.x + Math.cos(a) * step
      const ny = p.y + Math.sin(a) * step
      const outside = this.opts.mask && !p.inside
      g.strokeStyle = outside ? rgba(PAL.mint, 0.12) : rgba(this.colors[p.c], this.opts.mask ? 0.24 : 0.16)
      g.lineWidth = p.w
      g.beginPath()
      g.moveTo(p.x, p.y)
      g.lineTo(nx, ny)
      g.stroke()
      p.x = nx
      p.y = ny
      p.life -= 1
      const out = p.x < 0 || p.y < 0 || p.x > w || p.y > h || (p.inside && !this.inMask(p.x, p.y))
      if (p.life <= 0 || out) this.spawn(p, d)
    }
  }
}
