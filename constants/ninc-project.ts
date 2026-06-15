/**
 * NINC / PROJECT 페이지 정적 데이터
 * - 가족회사 로고, 산학협력/해외교류 쇼케이스 슬라이드
 * - 이미지 클릭 시 연결될 링크(href)는 추후 교체 예정 → 현재는 '#' placeholder
 * - 실제 이미지 파일은 아래 경로에 넣어주세요(없으면 이름 텍스트로 폴백 렌더링)
 *     public/images/ninc/partners/*.png
 *     public/images/ninc/showcase/*.png
 */

/** 산학협력 / 가족회사 로고 */
export interface PartnerLogo {
  /** 회사명 (로고 이미지 없을 때 폴백 텍스트 + alt) */
  name: string
  /** 로고 이미지 경로 */
  logoSrc: string
  /** 클릭 시 이동 링크 (추후 교체) */
  href: string
}

export const PARTNER_LOGOS: PartnerLogo[] = [
  { name: 'Partner 1', logoSrc: '/images/ninc/partners/partner-1.png', href: '#' },
  { name: '소머정', logoSrc: '/images/ninc/partners/partner-3.png', href: '#' },
  { name: 'MOON COMPANY', logoSrc: '/images/ninc/partners/partner-4.png', href: '#' },
  { name: 'EAST', logoSrc: '/images/ninc/partners/partner-5.png', href: '#' },
]

/** 쇼케이스 슬라이드(개별 프로젝트) */
export interface ShowcaseSlide {
  /** 대표 이미지 경로 */
  image: string
  /** 일시 */
  date: string
  /** 장소 */
  place: string
  /** 프로젝트명 */
  title: string
  /** 클릭 시 이동 링크 (추후 교체) */
  href: string
}

/** 카테고리(해외교류 / 산학협력) 단위 쇼케이스 블록 */
export interface ShowcaseBlock {
  /** 뱃지 라벨 */
  label: string
  /** 뱃지/슬라이드바 색상 — 'yellow' | 'green' */
  accent: 'yellow' | 'green'
  /** 이미지를 오른쪽에 둘지 여부(true=이미지 우측, 텍스트 좌측) */
  imageRight: boolean
  slides: ShowcaseSlide[]
}

export const SHOWCASE_BLOCKS: ShowcaseBlock[] = [
  {
    label: '해외교류',
    accent: 'yellow',
    imageRight: true,
    slides: [
      {
        image: '/images/ninc/showcase/showcase-1.png',
        date: '2026.01.18 – 01.23',
        place: 'Ho Chi Minh City, Vietnam',
        title: 'DIMA KR X RMIT VN Global Workshop',
        href: '#',
      },
    ],
  },
  {
    label: '산학협력',
    accent: 'green',
    imageRight: false,
    slides: [
      {
        image: '/images/ninc/showcase/showcase-2.png',
        date: '일시',
        place: '장소',
        title: '프로젝트명',
        href: '#',
      },
    ],
  },
]
