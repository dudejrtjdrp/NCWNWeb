/**
 * 홈 장식용 글로시 3D 레터 (N·W·C·N → NWCN)
 * Figma: 1152:3642(N) / 1152:3641(W) / 1152:3640(C) / 1152:3639(N)
 *
 * - 순수 장식: aria-hidden, pointer-events-none, select-none
 * - 부모는 반드시 position: relative + overflow-x: clip (가로 스크롤 방지)
 * - float 애니메이션은 prefers-reduced-motion 시 globals.css 전역 규칙으로 자동 정지
 */

export interface DecorLetterProps {
  /** 레터 PNG 경로 (예: /images/home/letter-1.png) */
  src: string
  /** 위치/크기 등 배치용 클래스 (absolute top/left/right + width) */
  className?: string
  /** 추가 인라인 스타일 (정밀 배치용) */
  style?: React.CSSProperties
  /** 부드러운 상하 부유 애니메이션 (기본 true) */
  float?: boolean
  /** 애니메이션 시작 지연(ms) — 레터마다 다르게 주어 리듬감 */
  delay?: number
}

export default function DecorLetter({
  src,
  className = '',
  style,
  float = true,
  delay = 0,
}: DecorLetterProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`pointer-events-none select-none absolute z-0 ${float ? 'animate-floaty' : ''} ${className}`}
      style={{ animationDelay: `${delay}ms`, ...style }}
    />
  )
}
