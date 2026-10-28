/**
 * FluidSim — WebGL2 유체 잉크 시뮬레이션 (무의존성)
 *
 * 흐름: 와도(curl) → 와도 보강 → 발산 → 압력(야코비 반복) → 압력 기울기 빼기 → 속도·잉크 이류
 * 잉크는 rgb = 색 × 양, a = 양 으로 저장해 밝은 배경 위에 '잉크가 풀린' 색으로 그린다.
 *
 * 좌표: 모든 입력은 캔버스 기준 0~1 (x 오른쪽, y 아래쪽). 내부에서 GL 좌표로 뒤집는다.
 * WebGL2 + 반정밀 렌더 타깃을 못 쓰는 환경이면 create()가 null을 돌려준다 → 호출부에서 정적 배경으로 대체.
 */

type RGB = readonly [number, number, number]

interface Target {
  tex: WebGLTexture
  fbo: WebGLFramebuffer
  w: number
  h: number
  bind: (unit: number) => number
}

interface DoubleTarget {
  read: Target
  write: Target
  swap: () => void
}

interface Program {
  prog: WebGLProgram
  u: Record<string, WebGLUniformLocation | null>
}

const HDR = '#version 300 es\nprecision highp float;\nprecision highp sampler2D;\n'
const VS = `${HDR}in vec2 aPos;uniform vec2 texel;out vec2 vUv;out vec2 vL;out vec2 vR;out vec2 vT;out vec2 vB;
void main(){vUv=aPos*.5+.5;vL=vUv-vec2(texel.x,0.);vR=vUv+vec2(texel.x,0.);vT=vUv+vec2(0.,texel.y);vB=vUv-vec2(0.,texel.y);gl_Position=vec4(aPos,0.,1.);}`
const NB = 'in vec2 vUv;in vec2 vL;in vec2 vR;in vec2 vT;in vec2 vB;out vec4 o;'

const FS: Record<string, string> = {
  splat: 'in vec2 vUv;out vec4 o;uniform sampler2D uTarget;uniform float aspect;uniform float radius;uniform vec2 point;uniform vec4 color;void main(){vec2 p=vUv-point;p.x*=aspect;o=texture(uTarget,vUv)+exp(-dot(p,p)/radius)*color;}',
  advect: 'in vec2 vUv;out vec4 o;uniform sampler2D uVelocity;uniform sampler2D uSource;uniform vec2 vtexel;uniform float dt;uniform float dissipation;void main(){vec2 c=vUv-dt*texture(uVelocity,vUv).xy*vtexel;o=texture(uSource,c)/(1.+dissipation*dt);}',
  divergence: `${NB}uniform sampler2D uVelocity;void main(){float L=texture(uVelocity,vL).x;float R=texture(uVelocity,vR).x;float T=texture(uVelocity,vT).y;float B=texture(uVelocity,vB).y;vec2 C=texture(uVelocity,vUv).xy;if(vL.x<0.)L=-C.x;if(vR.x>1.)R=-C.x;if(vT.y>1.)T=-C.y;if(vB.y<0.)B=-C.y;o=vec4(.5*(R-L+T-B),0.,0.,1.);}`,
  curl: `${NB}uniform sampler2D uVelocity;void main(){float L=texture(uVelocity,vL).y;float R=texture(uVelocity,vR).y;float T=texture(uVelocity,vT).x;float B=texture(uVelocity,vB).x;o=vec4(.5*(R-L-T+B),0.,0.,1.);}`,
  vorticity: `${NB}uniform sampler2D uVelocity;uniform sampler2D uCurl;uniform float curl;uniform float dt;void main(){float L=texture(uCurl,vL).x;float R=texture(uCurl,vR).x;float T=texture(uCurl,vT).x;float B=texture(uCurl,vB).x;float C=texture(uCurl,vUv).x;vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));f/=length(f)+.0001;f*=curl*C;f.y*=-1.;vec2 v=texture(uVelocity,vUv).xy+f*dt;o=vec4(clamp(v,-1000.,1000.),0.,1.);}`,
  pressure: `${NB}uniform sampler2D uPressure;uniform sampler2D uDivergence;void main(){float L=texture(uPressure,vL).x;float R=texture(uPressure,vR).x;float T=texture(uPressure,vT).x;float B=texture(uPressure,vB).x;float d=texture(uDivergence,vUv).x;o=vec4((L+R+B+T-d)*.25,0.,0.,1.);}`,
  gradient: `${NB}uniform sampler2D uPressure;uniform sampler2D uVelocity;void main(){float L=texture(uPressure,vL).x;float R=texture(uPressure,vR).x;float T=texture(uPressure,vT).x;float B=texture(uPressure,vB).x;vec2 v=texture(uVelocity,vUv).xy-vec2(R-L,T-B);o=vec4(v,0.,1.);}`,
  clear: 'in vec2 vUv;out vec4 o;uniform sampler2D uTexture;uniform float value;void main(){o=value*texture(uTexture,vUv);}',
  display: 'in vec2 vUv;out vec4 o;uniform sampler2D uDye;uniform vec2 dtexel;uniform vec3 bg;void main(){vec4 d=texture(uDye,vUv);float a=clamp(d.a,0.,1.);vec3 c=d.rgb/max(d.a,.001);float l=texture(uDye,vUv-vec2(dtexel.x,0.)).a;float r=texture(uDye,vUv+vec2(dtexel.x,0.)).a;float t=texture(uDye,vUv+vec2(0.,dtexel.y)).a;float b=texture(uDye,vUv-vec2(0.,dtexel.y)).a;float s=clamp(1.+(l-r+b-t)*.8,.7,1.2);o=vec4(mix(bg,clamp(c*s,0.,1.),smoothstep(0.,.85,a)),1.);}',
}

export const hexToRgb = (hex: string): RGB => {
  const n = parseInt(hex.replace('#', ''), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export class FluidSim {
  private gl: WebGL2RenderingContext
  private P: Record<string, Program> = {}
  private vel!: DoubleTarget
  private dye!: DoubleTarget
  private prs!: DoubleTarget
  private div!: Target
  private curlT!: Target
  private simW: number
  private simH: number
  private dyeW: number
  private dyeH: number
  private aspect: number
  private bg: RGB

  private constructor(gl: WebGL2RenderingContext, aspect: number, small: boolean, bg: RGB) {
    this.gl = gl
    this.aspect = aspect
    this.bg = bg
    this.simH = 128
    this.simW = Math.round(128 * aspect)
    this.dyeH = small ? 360 : 640
    this.dyeW = Math.round(this.dyeH * aspect)
  }

  /** 지원하지 않는 환경이면 null */
  static create(canvas: HTMLCanvasElement, opts: { aspect: number; small: boolean; bg: string }): FluidSim | null {
    try {
      const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false })
      if (!gl) return null
      if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) return null
      const sim = new FluidSim(gl, opts.aspect, opts.small, hexToRgb(opts.bg))
      sim.init()
      return sim
    } catch (err) {
      console.warn('[FluidSim] 초기화 실패 — 정적 배경으로 대체', err)
      return null
    }
  }

  private compile(type: number, src: string): WebGLShader {
    const gl = this.gl
    const s = gl.createShader(type)
    if (!s) throw new Error('shader')
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'compile')
    return s
  }

  private program(vs: WebGLShader, fs: string): Program {
    const gl = this.gl
    const prog = gl.createProgram()
    if (!prog) throw new Error('program')
    gl.attachShader(prog, vs)
    gl.attachShader(prog, this.compile(gl.FRAGMENT_SHADER, HDR + fs))
    gl.bindAttribLocation(prog, 0, 'aPos')
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link')
    const u: Record<string, WebGLUniformLocation | null> = {}
    const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(prog, i)
      if (info) u[info.name] = gl.getUniformLocation(prog, info.name)
    }
    return { prog, u }
  }

  private target(w: number, h: number): Target {
    const gl = this.gl
    const tex = gl.createTexture()
    const fbo = gl.createFramebuffer()
    if (!tex || !fbo) throw new Error('target')
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('framebuffer incomplete')
    gl.viewport(0, 0, w, h)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    return {
      tex, fbo, w, h,
      bind: (unit: number) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); return unit },
    }
  }

  private double(w: number, h: number): DoubleTarget {
    let a = this.target(w, h)
    let b = this.target(w, h)
    return {
      get read() { return a },
      get write() { return b },
      swap() { const t = a; a = b; b = t },
    }
  }

  private init() {
    const gl = this.gl
    const vs = this.compile(gl.VERTEX_SHADER, VS)
    Object.keys(FS).forEach((k) => { this.P[k] = this.program(vs, FS[k]) })
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(0)
    this.vel = this.double(this.simW, this.simH)
    this.prs = this.double(this.simW, this.simH)
    this.div = this.target(this.simW, this.simH)
    this.curlT = this.target(this.simW, this.simH)
    this.dye = this.double(this.dyeW, this.dyeH)
  }

  private use(k: string) { this.gl.useProgram(this.P[k].prog); return this.P[k].u }

  private blit(t: Target | null) {
    const gl = this.gl
    if (t) { gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo); gl.viewport(0, 0, t.w, t.h) }
    else { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight) }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  /**
   * 잉크 한 방울. x, y: 0~1 (y 아래쪽), dx, dy: 속도(시뮬레이션 픽셀/초), amount: 잉크 양
   */
  splat(x: number, y: number, dx: number, dy: number, color: RGB, amount: number, radius = 0.0026) {
    const gl = this.gl
    const u = this.use('splat')
    gl.uniform1f(u.aspect, this.aspect)
    gl.uniform2f(u.point, x, 1 - y)
    gl.uniform1f(u.radius, radius * Math.max(1, this.aspect))
    gl.uniform1i(u.uTarget, this.vel.read.bind(0))
    gl.uniform4f(u.color, dx, -dy, 0, 0)
    this.blit(this.vel.write); this.vel.swap()
    gl.uniform1i(u.uTarget, this.dye.read.bind(0))
    gl.uniform4f(u.color, color[0] * amount, color[1] * amount, color[2] * amount, amount)
    this.blit(this.dye.write); this.dye.swap()
  }

  step(dt: number) {
    const gl = this.gl
    const tx = 1 / this.simW
    const ty = 1 / this.simH
    let u = this.use('curl')
    gl.uniform2f(u.texel, tx, ty); gl.uniform1i(u.uVelocity, this.vel.read.bind(0)); this.blit(this.curlT)
    u = this.use('vorticity')
    gl.uniform2f(u.texel, tx, ty); gl.uniform1i(u.uVelocity, this.vel.read.bind(0)); gl.uniform1i(u.uCurl, this.curlT.bind(1))
    gl.uniform1f(u.curl, 20); gl.uniform1f(u.dt, dt); this.blit(this.vel.write); this.vel.swap()
    u = this.use('divergence')
    gl.uniform2f(u.texel, tx, ty); gl.uniform1i(u.uVelocity, this.vel.read.bind(0)); this.blit(this.div)
    u = this.use('clear')
    gl.uniform1i(u.uTexture, this.prs.read.bind(0)); gl.uniform1f(u.value, 0.8); this.blit(this.prs.write); this.prs.swap()
    u = this.use('pressure')
    gl.uniform2f(u.texel, tx, ty); gl.uniform1i(u.uDivergence, this.div.bind(0))
    for (let i = 0; i < 18; i++) { gl.uniform1i(u.uPressure, this.prs.read.bind(1)); this.blit(this.prs.write); this.prs.swap() }
    u = this.use('gradient')
    gl.uniform2f(u.texel, tx, ty); gl.uniform1i(u.uPressure, this.prs.read.bind(0)); gl.uniform1i(u.uVelocity, this.vel.read.bind(1))
    this.blit(this.vel.write); this.vel.swap()
    u = this.use('advect')
    gl.uniform2f(u.vtexel, tx, ty); gl.uniform1f(u.dt, dt)
    gl.uniform1i(u.uVelocity, this.vel.read.bind(0)); gl.uniform1i(u.uSource, this.vel.read.bind(0)); gl.uniform1f(u.dissipation, 0.25)
    this.blit(this.vel.write); this.vel.swap()
    gl.uniform1i(u.uVelocity, this.vel.read.bind(0)); gl.uniform1i(u.uSource, this.dye.read.bind(1)); gl.uniform1f(u.dissipation, 0.32)
    this.blit(this.dye.write); this.dye.swap()
  }

  render() {
    const gl = this.gl
    const u = this.use('display')
    gl.uniform1i(u.uDye, this.dye.read.bind(0))
    gl.uniform2f(u.dtexel, 1 / this.dyeW, 1 / this.dyeH)
    gl.uniform3f(u.bg, this.bg[0], this.bg[1], this.bg[2])
    this.blit(null)
  }

  dispose() {
    this.gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
}
