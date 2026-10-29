import { ghostAt, type PanelEngine, type PanelFrame } from './types'

/**
 * 반응-확산(Gray-Scott) — 두 물질이 퍼지고 반응하며 산호·세포·미로 무늬가 스스로 자란다.
 * 글자에서 자라나기 시작하고, 커서·클릭한 자리에 씨앗이 뿌려진다. 몇 초마다 반응 규칙이 천천히 바뀌어 무늬 모양이 변해 간다.
 */
const PRESETS: ReadonlyArray<readonly [number, number]> = [
  [0.0545, 0.062], // 산호
  [0.0367, 0.0649], // 세포분열
  [0.029, 0.057], // 미로
  [0.039, 0.058], // 구멍
]

const mix = (a: number[], b: number[], t: number) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

export class GrowthEngine implements PanelEngine {
  private g: CanvasRenderingContext2D
  private GW = 0
  private GH = 0
  private A = new Float32Array(0)
  private B = new Float32Array(0)
  private A2 = new Float32Array(0)
  private B2 = new Float32Array(0)
  private off: HTMLCanvasElement
  private octx: CanvasRenderingContext2D
  private img: ImageData | null = null
  private u32 = new Uint32Array(0)
  private lut = new Uint32Array(256)
  private F = PRESETS[0][0]
  private K = PRESETS[0][1]
  private iters = 8
  private lastSeed = 0
  private boom: { x: number; y: number } | null = null
  private aspect = 0

  constructor(canvas: HTMLCanvasElement, private text: string) {
    const g = canvas.getContext('2d')
    this.off = document.createElement('canvas')
    const o = this.off.getContext('2d')
    if (!g || !o) throw new Error('2d')
    this.g = g
    this.octx = o
    const BG = [238, 240, 234], GREEN = [9, 245, 147], DEEP = [5, 143, 86], INK = [21, 21, 21]
    for (let i = 0; i < 256; i++) {
      const v = i / 255
      const c = v < 0.22 ? BG : v < 0.36 ? mix(BG, GREEN, (v - 0.22) / 0.14) : v < 0.5 ? mix(GREEN, DEEP, (v - 0.36) / 0.14) : mix(DEEP, INK, Math.min(1, (v - 0.5) / 0.2))
      this.lut[i] = ((255 << 24) | (Math.round(c[2]) << 16) | (Math.round(c[1]) << 8) | Math.round(c[0])) >>> 0
    }
  }

  private seed(cx: number, cy: number, r: number) {
    const { GW, GH, B } = this
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if (x * x + y * y > r * r) continue
        const X = cx + x
        const Y = cy + y
        if (X < 1 || Y < 1 || X >= GW - 1 || Y >= GH - 1) continue
        B[Y * GW + X] = 1
      }
    }
  }

  private init(w: number, h: number) {
    this.aspect = w / h
    this.GW = 200
    this.GH = Math.max(80, Math.round((200 * h) / w))
    const n = this.GW * this.GH
    this.A = new Float32Array(n).fill(1)
    this.B = new Float32Array(n)
    this.A2 = new Float32Array(n).fill(1)
    this.B2 = new Float32Array(n)
    this.off.width = this.GW
    this.off.height = this.GH
    this.img = this.octx.createImageData(this.GW, this.GH)
    this.u32 = new Uint32Array(this.img.data.buffer)
    const t = document.createElement('canvas')
    t.width = this.GW
    t.height = this.GH
    const x = t.getContext('2d')
    if (x) {
      x.fillStyle = '#000'
      x.font = `900 ${Math.round(this.GW * 0.34)}px 'A2z', 'Arial Black', sans-serif`
      x.textAlign = 'center'
      x.textBaseline = 'middle'
      x.fillText(this.text, this.GW / 2, this.GH * 0.42)
      const d = x.getImageData(0, 0, this.GW, this.GH).data
      for (let i = 0; i < n; i++) if (d[i * 4 + 3] > 128 && ((i % this.GW) + Math.floor(i / this.GW)) % 3 === 0) this.B[i] = 1
    }
    for (let k = 0; k < 8; k++) this.seed(Math.floor(this.GW * (0.1 + 0.8 * Math.random())), Math.floor(this.GH * (0.1 + 0.8 * Math.random())), 2)
    for (let k = 0; k < 120; k++) this.step()
  }

  private step() {
    const { GW: w, GH: h, F: f } = this
    const kf = this.K + f
    const A = this.A, B = this.B, A2 = this.A2, B2 = this.B2
    for (let y = 1; y < h - 1; y++) {
      const r = y * w
      for (let x = 1; x < w - 1; x++) {
        const i = r + x
        const a = A[i]
        const b = B[i]
        const la = (A[i - 1] + A[i + 1] + A[i - w] + A[i + w]) * 0.2 + (A[i - w - 1] + A[i - w + 1] + A[i + w - 1] + A[i + w + 1]) * 0.05 - a
        const lb = (B[i - 1] + B[i + 1] + B[i - w] + B[i + w]) * 0.2 + (B[i - w - 1] + B[i - w + 1] + B[i + w - 1] + B[i + w + 1]) * 0.05 - b
        const abb = a * b * b
        const na = a + la - abb + f * (1 - a)
        const nb = b + 0.5 * lb + abb - kf * b
        A2[i] = na < 0 ? 0 : na > 1 ? 1 : na
        B2[i] = nb < 0 ? 0 : nb > 1 ? 1 : nb
      }
    }
    this.A = A2; this.A2 = A; this.B = B2; this.B2 = B
  }

  down(x: number, y: number) { this.boom = { x, y } }

  frame(f: PanelFrame) {
    const w = Math.round(f.w * f.dpr)
    const h = Math.round(f.h * f.dpr)
    if (!this.GW || Math.abs(f.w / f.h - this.aspect) > 0.15) this.init(f.w, f.h)
    /* 9초마다 다음 규칙으로 천천히 넘어간다 */
    const idx = Math.floor(f.now / 9000) % PRESETS.length
    this.F += (PRESETS[idx][0] - this.F) * 0.01
    this.K += (PRESETS[idx][1] - this.K) * 0.01
    const s = Math.max(w / this.GW, h / this.GH)
    const dw = this.GW * s
    const dh = this.GH * s
    const dx = (w - dw) / 2
    const dy = (h - dh) / 2
    const toG = (px: number, py: number) => [Math.round((px * f.dpr - dx) / s), Math.round((py * f.dpr - dy) / s)]
    const p = f.pointer ?? (f.idleMs > 2500 ? ghostAt(f.now, f.w, f.h, 2) : null)
    if (p) {
      const gap = p.down ? 16 : f.pointer ? 110 : 420
      if (f.now - this.lastSeed > gap) {
        const [gx, gy] = toG(p.x, p.y)
        this.seed(gx, gy, p.down ? 4 : f.pointer ? 2 : 2)
        this.lastSeed = f.now
      }
    }
    if (this.boom) {
      const [gx, gy] = toG(this.boom.x, this.boom.y)
      this.seed(gx, gy, 7)
      this.boom = null
    }
    const t0 = performance.now()
    const n = f.reduce ? Math.max(2, Math.floor(this.iters / 2)) : this.iters
    for (let k = 0; k < n; k++) this.step()
    const el = performance.now() - t0
    this.iters = el > 8 ? Math.max(2, this.iters - 1) : el < 4 ? Math.min(12, this.iters + 1) : this.iters
    const total = this.GW * this.GH
    for (let i = 0; i < total; i++) {
      let v = this.B[i] * 2.6
      if (v > 1) v = 1
      this.u32[i] = this.lut[(v * 255) | 0]
    }
    if (this.img) this.octx.putImageData(this.img, 0, 0)
    this.g.imageSmoothingEnabled = true
    this.g.fillStyle = '#EEF0EA'
    this.g.fillRect(0, 0, w, h)
    this.g.drawImage(this.off, dx, dy, dw, dh)
  }
}
