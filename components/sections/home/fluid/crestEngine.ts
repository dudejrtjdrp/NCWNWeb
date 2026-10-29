/**
 * CrestEngine — 학과 엠블럼을 입체 점 구름으로 그리는 WebGL 엔진
 *
 * 엠블럼 PNG의 불투명 픽셀에서 점을 뽑고, 위치별로 깊이를 줘서(방패는 볼록, 사슴 머리는 앞으로,
 * 리본은 휘고, 양옆 덩굴은 뒤로) 돌렸을 때 입체감이 나게 한다.
 * - 호버: 엠블럼이 커서 쪽으로 고개를 돌리고, 커서 주변 점이 밀려나며 형광으로 빛난다.
 * - 클릭: 누른 자리에서 점이 터져 흩어졌다가 스프링처럼 제자리로 모인다.
 * - 처음 화면에 들어오면 흩어진 점이 모여 엠블럼이 된다.
 * 물리는 CPU(Float32Array)에서, 회전·원근·색은 셰이더에서 처리한다. 움직임이 멎으면 물리 계산을 쉰다.
 */

const VS = `
attribute vec4 aP;
attribute vec2 aS;
uniform mat3 uR;
uniform float uCam;
uniform vec2 uScale;
uniform float uPx;
uniform float uT;
uniform float uSweep;
varying float vE;
varying float vB;
varying float vD;
void main() {
  vec3 w = uR * aP.xyz;
  float persp = uCam / (uCam - w.z);
  gl_Position = vec4(w.xy * persp * uScale, 0.0, 1.0);
  float s = aP.x * 0.6 + aP.y * 0.8 - uSweep;
  float band = exp(-s * s / 0.004);
  float e = max(aP.w, band * 0.4);
  float tw = 0.78 + 0.22 * sin(uT * 1.6 + aS.x * 60.0);
  gl_PointSize = uPx * persp * (1.0 + e * 0.9) * (0.8 + 0.4 * fract(aS.x * 13.7));
  vE = e;
  vB = aS.y * tw;
  vD = w.z;
}
`

const FS = `
precision mediump float;
uniform vec3 uBase;
uniform vec3 uHot;
uniform vec3 uSpark;
varying float vE;
varying float vB;
varying float vD;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c);
  if (d > 0.25) discard;
  float a = smoothstep(0.25, 0.02, d);
  vec3 col = mix(uBase, uHot, smoothstep(0.05, 0.5, vE));
  col = mix(col, uSpark, smoothstep(0.6, 1.0, vE));
  float depth = clamp(0.7 + vD * 1.4, 0.35, 1.0);
  float al = a * vB * depth * (0.72 + 0.28 * vE);
  gl_FragColor = vec4(col * al, al);
}
`

/** 엠블럼 원본 비율(세로/가로) */
const ASPECT = 885 / 999
const SAMPLE_W = 800
const CAM = 3.4

const hex = (h: string): [number, number, number] => {
  const n = parseInt(h.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** 엠블럼 위 한 점의 깊이. x ∈ [-1, 1], y ∈ [-ASPECT, ASPECT] (위가 +) */
function depthAt(x: number, y: number, r: number) {
  const v = 0.5 - y / (2 * ASPECT) // 0 = 위, 1 = 아래 (원본 이미지 기준)
  let z = 0.16 * Math.max(0, 1 - (x / 0.8) ** 2 - ((y + 0.05) / 0.95) ** 2) // 방패 볼록
  z += 0.3 * Math.exp(-((x / 0.3) ** 2 + ((y + 0.26) / 0.42) ** 2)) // 사슴 머리
  z += 0.1 * Math.exp(-((x / 0.12) ** 2 + ((y + 0.48) / 0.12) ** 2)) // 콧등
  if (v > 0.1 && v < 0.4) z += 0.1 * Math.cos(x * 2.4) * Math.sin(((v - 0.1) / 0.3) * Math.PI) // 리본
  if (Math.abs(x) > 0.66 && v > 0.33) z -= 0.06 + 0.05 * Math.sin(y * 7 + x * 3) // 양옆 덩굴
  return z + (r - 0.5) * 0.03
}

export interface CrestOptions {
  /** 앞면 점 개수(뒷면 두께 점은 따로 22%) */
  count: number
  reduce: boolean
  onLost?: () => void
}

export class CrestEngine {
  private gl: WebGLRenderingContext
  private prog: WebGLProgram
  private bufP: WebGLBuffer
  private bufS: WebGLBuffer
  private u: Record<string, WebGLUniformLocation | null> = {}
  private n: number
  private home: Float32Array
  private pos: Float32Array
  private vel: Float32Array
  private out: Float32Array
  private reduce: boolean
  private canvas: HTMLCanvasElement
  private cssW = 1
  private cssH = 1
  private dpr = 1
  private scale: [number, number] = [1, 1]
  private unit = 1
  private yaw = 0
  private pitch = 0
  private rot = new Float32Array(9)
  private hover = { on: false, sx: 0, sy: 0 }
  /** 스프링을 잠깐 약하게 해서 점이 떠다니다 모이게 한다. heat는 흩어졌을 때 빛나는 정도 */
  private soft = { t0: -1e9, dur: 1, k0: 1, heat: 1 }
  private active = true
  private last = 0
  private lost = false
  private onLost?: () => void

  private constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext, prog: WebGLProgram, pts: { home: Float32Array; seeds: Float32Array }, o: CrestOptions) {
    this.canvas = canvas
    this.gl = gl
    this.prog = prog
    this.reduce = o.reduce
    this.onLost = o.onLost
    this.n = pts.home.length / 3
    this.home = pts.home
    this.pos = new Float32Array(pts.home)
    this.vel = new Float32Array(pts.home.length)
    this.out = new Float32Array(this.n * 4)
    this.writeOut()

    gl.useProgram(prog)
    for (const k of ['uR', 'uCam', 'uScale', 'uPx', 'uT', 'uSweep', 'uBase', 'uHot', 'uSpark']) this.u[k] = gl.getUniformLocation(prog, k)
    gl.uniform3fv(this.u.uBase, hex('#DDEFE5'))
    gl.uniform3fv(this.u.uHot, hex('#09F593'))
    gl.uniform3fv(this.u.uSpark, hex('#E3E94D'))
    gl.uniform1f(this.u.uCam, CAM)

    this.bufP = gl.createBuffer() as WebGLBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufP)
    gl.bufferData(gl.ARRAY_BUFFER, this.out, gl.DYNAMIC_DRAW)
    const aP = gl.getAttribLocation(prog, 'aP')
    gl.enableVertexAttribArray(aP)
    gl.vertexAttribPointer(aP, 4, gl.FLOAT, false, 0, 0)

    this.bufS = gl.createBuffer() as WebGLBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufS)
    gl.bufferData(gl.ARRAY_BUFFER, pts.seeds, gl.STATIC_DRAW)
    const aS = gl.getAttribLocation(prog, 'aS')
    gl.enableVertexAttribArray(aS)
    gl.vertexAttribPointer(aS, 2, gl.FLOAT, false, 0, 0)

    gl.disable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE) // 겹치는 점이 빛처럼 더해진다
    gl.clearColor(0, 0, 0, 0)

    canvas.addEventListener('webglcontextlost', this.handleLost)
    this.resize()
  }

  /** WebGL이 없거나 이미지를 못 읽으면 null — 호출한 쪽에서 정적 이미지를 보여 준다. */
  static async create(canvas: HTMLCanvasElement, src: string, o: CrestOptions): Promise<CrestEngine | null> {
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' })
    if (!gl) return null
    const prog = link(gl)
    if (!prog) return null
    try {
      const img = new Image()
      img.src = src
      await img.decode()
      return new CrestEngine(canvas, gl, prog, sample(img, o.count), o)
    } catch {
      return null
    }
  }

  setReduce(r: boolean) {
    this.reduce = r
  }

  resize() {
    const r = this.canvas.getBoundingClientRect()
    this.cssW = Math.max(1, r.width)
    this.cssH = Math.max(1, r.height)
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas.width = Math.round(this.cssW * this.dpr)
    this.canvas.height = Math.round(this.cssH * this.dpr)
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    // 엠블럼 한 단위가 몇 CSS px인지: 세로 84%, 가로 86% 안에 들어가게
    this.unit = Math.min((0.84 * this.cssH) / 2 / ASPECT, (0.86 * this.cssW) / 2)
    this.scale = [this.unit / (this.cssW / 2), this.unit / (this.cssH / 2)]
  }

  /** 흩어진 점이 모여 엠블럼이 되는 첫 등장 */
  intro(now: number) {
    if (this.reduce) return
    const r = mulberry32(7)
    for (let i = 0; i < this.n; i++) {
      const th = r() * Math.PI * 2, ph = Math.acos(2 * r() - 1), rad = 1.4 + r() * 1.4
      this.pos[i * 3] = Math.sin(ph) * Math.cos(th) * rad
      this.pos[i * 3 + 1] = Math.sin(ph) * Math.sin(th) * rad * 0.8
      this.pos[i * 3 + 2] = Math.cos(ph) * rad * 0.6
      this.vel[i * 3] = this.vel[i * 3 + 1] = this.vel[i * 3 + 2] = 0
    }
    this.soft = { t0: now / 1000, dur: 2.2, k0: 0.03, heat: 0.45 }
    this.active = true
  }

  pointer(x: number, y: number) {
    this.hover = { on: true, sx: (x / this.cssW) * 2 - 1, sy: 1 - (y / this.cssH) * 2 }
    this.active = true
  }

  leave() {
    this.hover.on = false
  }

  /** 누른 자리에서 점이 터져 흩어진다 */
  burst(x: number, y: number, now: number) {
    const [mx, my] = this.toModel((x / this.cssW) * 2 - 1, 1 - (y / this.cssH) * 2)
    const g = this.reduce ? 0.45 : 1
    const { pos, vel } = this
    for (let i = 0; i < this.n; i++) {
      const rx = pos[i * 3] - mx, ry = pos[i * 3 + 1] - my
      const d = Math.sqrt(rx * rx + ry * ry) + 1e-3
      const s = g * (3.6 * Math.exp(-d * 1.5) + 0.6)
      const k = 0.5 + Math.random()
      vel[i * 3] += (rx / d) * s * k + (Math.random() - 0.5) * 0.6 * s
      vel[i * 3 + 1] += (ry / d) * s * k + (Math.random() - 0.5) * 0.6 * s
      vel[i * 3 + 2] += (Math.random() * 1.6 - 0.4) * s
    }
    this.soft = { t0: now / 1000, dur: 0.9, k0: 0.12, heat: 1 }
    this.active = true
  }

  frame(now: number) {
    if (this.lost) return
    const gl = this.gl
    const t = now / 1000
    const dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 1 / 60
    this.last = now

    // 회전: 가만히 있으면 천천히 흔들리고, 커서가 오면 그쪽으로 고개를 돌린다
    const amp = this.reduce ? 0.4 : 1
    let ty = amp * 0.26 * Math.sin(t * 0.33)
    let tp = amp * 0.07 * Math.sin(t * 0.47 + 1)
    if (this.hover.on) {
      ty = this.hover.sx * 0.42
      tp = -this.hover.sy * 0.3
    }
    const kr = 1 - Math.exp(-dt * (this.hover.on ? 4 : 1.5))
    this.yaw += (ty - this.yaw) * kr
    this.pitch += (tp - this.pitch) * kr
    this.updateRot()

    if (this.active) {
      // 프레임이 느려도 같은 속도로 모이도록 1/60초 단위로 나눠 계산
      const n = Math.min(4, Math.ceil(dt * 60 - 0.01))
      for (let s = 0; s < n && this.active; s++) this.step(t, dt / n, s === n - 1)
    }

    const period = this.reduce ? 11 : 7
    const ph = (t % period) / period
    gl.useProgram(this.prog)
    gl.uniformMatrix3fv(this.u.uR, false, this.rot)
    gl.uniform2f(this.u.uScale, this.scale[0], this.scale[1])
    gl.uniform1f(this.u.uPx, Math.min(2.2, Math.max(1.2, this.unit * 0.0082)) * this.dpr)
    gl.uniform1f(this.u.uT, this.reduce ? t * 0.4 : t)
    gl.uniform1f(this.u.uSweep, -1.8 + ph * 5)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.POINTS, 0, this.n)
  }

  dispose() {
    this.canvas.removeEventListener('webglcontextlost', this.handleLost)
    const gl = this.gl
    gl.deleteBuffer(this.bufP)
    gl.deleteBuffer(this.bufS)
    gl.deleteProgram(this.prog)
  }

  private handleLost = (e: Event) => {
    e.preventDefault()
    this.lost = true
    this.onLost?.()
  }

  private step(t: number, dt: number, upload: boolean) {
    const { pos, vel, home } = this
    const since = t - this.soft.t0
    const ramp = since >= this.soft.dur ? 1 : this.soft.k0 + (1 - this.soft.k0) * smooth(0, this.soft.dur, since)
    const k = 30 * ramp
    // 흩어진 직후에는 저항도 약하게 해서 점이 멀리 미끄러지게
    const damp = (this.reduce ? 7 : 5.2) * (0.55 + 0.45 * ramp)
    const rep = this.reduce ? 6 : 14
    const R = 0.3, RG = 0.4
    let mx = 0, my = 0
    const hov = this.hover.on
    const heat = this.soft.heat
    if (hov) [mx, my] = this.toModel(this.hover.sx, this.hover.sy)
    let maxD = 0, maxV = 0
    const out = this.out
    for (let i = 0; i < this.n; i++) {
      const j = i * 3
      let px = pos[j], py = pos[j + 1], pz = pos[j + 2]
      let vx = vel[j], vy = vel[j + 1], vz = vel[j + 2]
      let ax = k * (home[j] - px) - damp * vx
      let ay = k * (home[j + 1] - py) - damp * vy
      const az = k * (home[j + 2] - pz) - damp * vz
      let glow = 0
      let azr = 0
      if (hov) {
        const rx = px - mx, ry = py - my, d2 = rx * rx + ry * ry
        if (d2 < RG * RG) {
          const d = Math.sqrt(d2) + 1e-4
          glow = (1 - d / RG) * 0.6
          if (d < R) {
            const f = (1 - d / R) ** 2 * rep
            ax += (rx / d) * f
            ay += (ry / d) * f
            azr = f * 0.9
          }
        }
      }
      vx += ax * dt
      vy += ay * dt
      vz += (az + azr) * dt
      px += vx * dt
      py += vy * dt
      pz += vz * dt
      pos[j] = px; pos[j + 1] = py; pos[j + 2] = pz
      vel[j] = vx; vel[j + 1] = vy; vel[j + 2] = vz
      const ddx = px - home[j], ddy = py - home[j + 1], ddz = pz - home[j + 2]
      const disp = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz)
      if (disp > maxD) maxD = disp
      const sp = Math.abs(vx) + Math.abs(vy) + Math.abs(vz)
      if (sp > maxV) maxV = sp
      const o = i * 4
      out[o] = px; out[o + 1] = py; out[o + 2] = pz
      out[o + 3] = Math.min(1, Math.max(disp * 3.2 * heat, glow))
    }
    if (!hov && ramp >= 1 && maxD < 0.002 && maxV < 0.01) {
      this.pos.set(home)
      this.vel.fill(0)
      this.writeOut()
      this.active = false
    }
    if (!upload && this.active) return
    const gl = this.gl
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufP)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.out)
  }

  /** 멈춘 상태(빛 없음)로 버퍼 내용을 맞춘다 */
  private writeOut() {
    for (let i = 0; i < this.n; i++) {
      this.out[i * 4] = this.pos[i * 3]
      this.out[i * 4 + 1] = this.pos[i * 3 + 1]
      this.out[i * 4 + 2] = this.pos[i * 3 + 2]
      this.out[i * 4 + 3] = 0
    }
  }

  private updateRot() {
    const cy = Math.cos(this.yaw), sy = Math.sin(this.yaw), cp = Math.cos(this.pitch), sp = Math.sin(this.pitch)
    // R = Rx(pitch) · Ry(yaw), 열 우선으로 저장
    const m = this.rot
    m[0] = cy; m[1] = sp * sy; m[2] = -cp * sy
    m[3] = 0; m[4] = cp; m[5] = sp
    m[6] = sy; m[7] = -sp * cy; m[8] = cp * cy
  }

  /** 화면 좌표(NDC)를 엠블럼 평면(z=0) 위의 점으로 — 카메라 광선과 회전된 평면의 교점 */
  private toModel(sx: number, sy: number): [number, number] {
    const m = this.rot
    const nx = m[6], ny = m[7], nz = m[8] // R·(0,0,1)
    const a = sx / (this.scale[0] * CAM), b = sy / (this.scale[1] * CAM)
    const q = nx * a + ny * b
    const den = q - nz
    const tz = Math.abs(den) < 1e-5 ? 0 : (q * CAM) / den
    const wx = a * (CAM - tz), wy = b * (CAM - tz), wz = tz
    // Rᵀ·w
    return [m[0] * wx + m[1] * wy + m[2] * wz, m[3] * wx + m[4] * wy + m[5] * wz]
  }
}

function link(gl: WebGLRenderingContext): WebGLProgram | null {
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)
    if (!s) return null
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
  }
  const v = sh(gl.VERTEX_SHADER, VS), f = sh(gl.FRAGMENT_SHADER, FS)
  const p = gl.createProgram()
  if (!v || !f || !p) return null
  gl.attachShader(p, v)
  gl.attachShader(p, f)
  gl.linkProgram(p)
  return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null
}

/**
 * 엠블럼 이미지에서 점을 뽑는다. 선의 가장자리에 점을 많이 두고 면 안쪽은 듬성하게 둬서,
 * 사슴 머리의 다각형 면이 철선(와이어프레임)처럼 드러나게 한다. 일부 점은 뒤쪽에 한 겹 더 깔아 두께를 낸다.
 */
function sample(img: HTMLImageElement, count: number) {
  const W = SAMPLE_W, H = Math.round(SAMPLE_W * ASPECT)
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const x = c.getContext('2d', { willReadFrequently: true })
  if (!x) throw new Error('2d context')
  x.drawImage(img, 0, 0, W, H)
  const data = x.getImageData(0, 0, W, H).data

  // 투명한 곳까지의 맨해튼 거리(두 번 훑는 거리 변환)
  const BIG = 1 << 20
  const dist = new Int32Array(W * H)
  for (let i = 0; i < W * H; i++) dist[i] = data[i * 4 + 3] > 128 ? BIG : 0
  for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {
    const i = y * W + xx
    if (!dist[i]) continue
    const up = y ? dist[i - W] : 0, lf = xx ? dist[i - 1] : 0
    dist[i] = Math.min(dist[i], up + 1, lf + 1)
  }
  for (let y = H - 1; y >= 0; y--) for (let xx = W - 1; xx >= 0; xx--) {
    const i = y * W + xx
    if (!dist[i]) continue
    const dn = y < H - 1 ? dist[i + W] : 0, rt = xx < W - 1 ? dist[i + 1] : 0
    dist[i] = Math.min(dist[i], dn + 1, rt + 1)
  }
  // 가장자리(1px) · 가장자리 근처(2~3px) · 안쪽 — 갈래별 가중치
  const groups: number[][] = [[], [], []]
  for (let i = 0; i < W * H; i++) {
    const d = dist[i]
    if (d) groups[d === 1 ? 0 : d <= 3 ? 1 : 2].push(i)
  }
  const weight = [1, 0.15, 0.06].map((w, g) => w * groups[g].length)
  const sum = weight[0] + weight[1] + weight[2]
  if (!sum) throw new Error('empty crest')

  const r = mulberry32(1998)
  const back = Math.round(count * 0.22)
  const total = count + back
  const home = new Float32Array(total * 3)
  const seeds = new Float32Array(total * 2)
  for (let i = 0; i < count; i++) {
    const u = r() * sum
    const list = groups[u < weight[0] ? 0 : u < weight[0] + weight[1] ? 1 : 2]
    const k = list[(r() * list.length) | 0]
    const px = (k % W) + r(), py = Math.floor(k / W) + r()
    const X = (px / W) * 2 - 1
    const Y = (0.5 - py / H) * 2 * ASPECT
    home[i * 3] = X
    home[i * 3 + 1] = Y
    home[i * 3 + 2] = depthAt(X, Y, r())
    seeds[i * 2] = r()
    seeds[i * 2 + 1] = 0.7 + r() * 0.3
  }
  for (let b = 0; b < back; b++) {
    const s = (r() * count) | 0, i = count + b
    home[i * 3] = home[s * 3]
    home[i * 3 + 1] = home[s * 3 + 1]
    home[i * 3 + 2] = home[s * 3 + 2] - 0.07
    seeds[i * 2] = r()
    seeds[i * 2 + 1] = 0.32
  }
  return { home, seeds }
}
