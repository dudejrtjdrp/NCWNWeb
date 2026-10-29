/** 왼쪽 패널에서 섹션마다 바뀌는 미디어아트 엔진 공통 형태 (2D 캔버스) */
export interface PanelPointer {
  /** 상자 기준 CSS 좌표 */
  x: number
  y: number
  down: boolean
}

export interface PanelFrame {
  now: number
  /** 초 단위 프레임 간격 */
  dt: number
  /** 캔버스 CSS 크기 */
  w: number
  h: number
  dpr: number
  pointer: PanelPointer | null
  /** 마지막으로 커서를 움직인 뒤 지난 시간(ms) — 오래 가만히 있으면 엔진이 스스로 조금씩 움직인다 */
  idleMs: number
  reduce: boolean
}

export interface PanelEngine {
  frame(f: PanelFrame): void
  down?(x: number, y: number): void
  up?(): void
  dispose?(): void
}

/** 사이트 토큰 색 */
export const C = {
  bg: '#EEF0EA',
  ink: '#151515',
  green: '#09F593',
  greenDarker: '#058F56',
  yellow: '#E3E94D',
} as const

/** 보이지 않는 커서 — 오래 가만히 있을 때 화면 위를 천천히 떠도는 위치 */
export const ghostAt = (now: number, w: number, h: number, phase = 0) => ({
  x: w * (0.5 + 0.32 * Math.sin(now / 1000 * 0.37 + phase)),
  y: h * (0.5 + 0.3 * Math.sin(now / 1000 * 0.53 + 1.3 + phase)),
  down: false,
})
