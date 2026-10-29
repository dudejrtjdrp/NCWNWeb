import { C, ghostAt, type PanelEngine, type PanelFrame } from './types'

/**
 * ASCII 렌즈 — 학생 작품 이미지를 글자로 다시 그린다. 커서(또는 떠도는 렌즈) 안은 원본 이미지.
 * 5초마다 다음 작품으로 글자가 해독되듯 흘러 바뀌고, 클릭하면 글자 세트(코드 · 한글 자모 · 0과 1)가 바뀐다.
 * 이미지는 같은 출처(/_next/image)로 받아 픽셀을 읽는다.
 */
const SETS = [' .:-=+*#%@', ' ·ㅡㅅㅇㅁㅂ뉴콘뷁', ' .·01▪■']
const COLS = [C.ink, C.greenDarker, '#07C274']

interface Grid { L: Float32Array; S: Uint8Array; cols: number; rows: number; crop: [number, number, number, number] }

export class AsciiEngine implements PanelEngine {
  private g: CanvasRenderingContext2D
  private imgs: HTMLImageElement[]
  private set = 0
  private atlas: HTMLCanvasElement | null = null
  private atlasKey = ''
  private grid: Grid | null = null
  private gridKey = ''
  private cur = -1
  private changedAt = 0
  private sc: HTMLCanvasElement
  private sx: CanvasRenderingContext2D
  private click = false
  private hs = new Float32Array(20000)

  constructor(canvas: HTMLCanvasElement, sources: string[]) {
    const g = canvas.getContext('2d')
    this.sc = document.createElement('canvas')
    const sx = this.sc.getContext('2d', { willReadFrequently: true })
    if (!g || !sx) throw new Error('2d')
    this.g = g
    this.sx = sx
    this.imgs = sources.map((s) => { const im = new Image(); im.decoding = 'async'; im.src = s; return im })
    for (let i = 0; i < this.hs.length; i++) { const v = Math.sin(i * 12.9898) * 43758.5453; this.hs[i] = v - Math.floor(v) }
  }

  down() { this.click = true }

  private buildAtlas(S: number) {
    const chars = SETS[this.set]
    const a = document.createElement('canvas')
    a.width = chars.length * S
    a.height = 3 * S
    const x = a.getContext('2d')
    if (!x) return null
    x.textAlign = 'center'
    x.textBaseline = 'middle'
    x.font = `700 ${Math.round(S * (this.set === 1 ? 0.84 : 0.98))}px 'Pretendard Variable', 'Pretendard', monospace`
    for (let r = 0; r < 3; r++) {
      x.fillStyle = COLS[r]
      for (let k = 1; k < chars.length; k++) x.fillText(chars[k], k * S + S / 2, r * S + S * 0.54)
    }
    return a
  }

  private sample(src: HTMLImageElement, cols: number, rows: number): Grid | null {
    const iw = src.naturalWidth
    const ih = src.naturalHeight
    if (!iw || !ih) return null
    this.sc.width = cols
    this.sc.height = rows
    const ga = cols / rows
    const ia = iw / ih
    const sw = ia > ga ? ih * ga : iw
    const shh = ia > ga ? ih : iw / ga
    const crop: [number, number, number, number] = [(iw - sw) / 2, (ih - shh) / 2, sw, shh]
    this.sx.drawImage(src, crop[0], crop[1], crop[2], crop[3], 0, 0, cols, rows)
    let d: Uint8ClampedArray
    try { d = this.sx.getImageData(0, 0, cols, rows).data } catch { return null }
    const L = new Float32Array(cols * rows)
    const S = new Uint8Array(cols * rows)
    let lo = 1, hi = 0
    for (let i = 0; i < cols * rows; i++) {
      const r = d[i * 4], gg = d[i * 4 + 1], b = d[i * 4 + 2]
      const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b)
      L[i] = (0.299 * r + 0.587 * gg + 0.114 * b) / 255
      S[i] = mx > 90 && (mx - mn) / mx > 0.5 ? 1 : 0
      if (L[i] < lo) lo = L[i]
      if (L[i] > hi) hi = L[i]
    }
    /* 어두운 포스터도 형태가 보이도록 밝기 범위를 0~1로 늘린다 */
    const span = Math.max(0.15, hi - lo)
    for (let i = 0; i < L.length; i++) L[i] = Math.min(1, Math.max(0, (L[i] - lo) / span) * 0.85 + 0.12)
    return { L, S, cols, rows, crop }
  }

  frame(f: PanelFrame) {
    const { g } = this
    const cw = Math.round(f.w * f.dpr)
    const ch = Math.round(f.h * f.dpr)
    if (this.click) { this.click = false; this.set = (this.set + 1) % SETS.length; this.changedAt = f.now }
    const css = Math.max(7, Math.min(14, Math.round(Math.min(f.w, f.h) / 44)))
    const S = Math.max(4, Math.round(css * f.dpr))
    const cols = Math.ceil(cw / S)
    const rows = Math.ceil(ch / S)
    const ready = this.imgs.filter((im) => im.complete && im.naturalWidth)
    const want = ready.length ? Math.floor(f.now / 5000) % ready.length : -1
    if (want !== this.cur) { this.cur = want; this.changedAt = f.now }
    const src = want >= 0 ? ready[want] : null
    const key = `${want}|${cols}|${rows}`
    if (src && key !== this.gridKey) { const gr = this.sample(src, cols, rows); if (gr) { this.grid = gr; this.gridKey = key } }
    if (this.atlasKey !== `${this.set}|${S}`) { this.atlas = this.buildAtlas(S); this.atlasKey = `${this.set}|${S}` }
    g.fillStyle = C.bg
    g.fillRect(0, 0, cw, ch)
    const atlas = this.atlas
    if (!atlas) return
    const chars = SETS[this.set]
    const NL = chars.length
    const t = f.now / 1000
    const since = f.now - this.changedAt
    const grid = this.grid && this.grid.cols === cols && this.grid.rows === rows ? this.grid : null
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x
        const h = this.hs[i % this.hs.length]
        let l = grid ? grid.L[i] : 0.55 + 0.4 * Math.sin(x * 0.18 + t) * Math.cos(y * 0.22 - t * 0.7)
        l += (f.reduce ? 0.03 : 0.07) * Math.sin(x * 0.21 + y * 0.09 + t * 1.6)
        let k = Math.round((1 - l) * 1.15 * (NL - 1))
        if (k > NL - 1) k = NL - 1
        if (since < 1100) {
          const rv = since - (x / cols) * 700 - h * 260
          if (rv < 0) { if (rv > -300) k = 1 + ((i * 7 + ((f.now / 50) | 0)) % (NL - 1)); else continue }
        }
        if (k <= 0) continue
        const c = grid && grid.S[i] ? 1 : h < 0.035 ? 2 : 0
        g.drawImage(atlas, k * S, c * S, S, S, x * S, y * S, S, S)
      }
    }
    /* 렌즈 — 원 안은 원본. 가만히 있으면 렌즈가 천천히 떠돈다 */
    const p = f.pointer ?? (f.idleMs > 1500 ? ghostAt(f.now, f.w, f.h, 4) : null)
    if (p && src && grid) {
      const rr = Math.min(120, Math.min(f.w, f.h) * 0.28) * f.dpr
      const px = p.x * f.dpr
      const py = p.y * f.dpr
      const cr = grid.crop
      g.save()
      g.beginPath()
      g.arc(px, py, rr, 0, Math.PI * 2)
      g.clip()
      g.drawImage(src, cr[0], cr[1], cr[2], cr[3], 0, 0, cols * S, rows * S)
      g.restore()
      g.lineWidth = 2 * f.dpr
      g.strokeStyle = C.ink
      g.beginPath()
      g.arc(px, py, rr, 0, Math.PI * 2)
      g.stroke()
    }
  }
}
