/**
 * NINC / PROJECT 페이지 정적 데이터
 * - 가족회사 로고, 산학협력/해외교류 쇼케이스 슬라이드
 * - 쇼케이스 슬라이드는 실제 DB 프로젝트(getProjects)로 구성하며,
 *   DB가 비어 있을 때만 아래 SHOWCASE_BLOCKS 정적 폴백을 사용한다.
 * - 실제 이미지 파일은 아래 경로에 넣어주세요(없으면 이름 텍스트로 폴백 렌더링)
 *     public/images/ninc/partners/*.png
 *     public/images/ninc/showcase/*.png
 */

import type { ProjectItem } from '@/lib/supabase/queries/projects'

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
  { name: 'Partner 1', logoSrc: '/images/ninc/partners/0.png', href: '#' },
  { name: '소머정', logoSrc: '/images/ninc/partners/1.png', href: '#' },
  { name: 'MOON COMPANY', logoSrc: '/images/ninc/partners/2.png', href: '#' },
  { name: 'EAST', logoSrc: '/images/ninc/partners/3.png', href: '#' },
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

/**
 * 프로젝트 유형(international=해외교류 / industry=산학협력)별 쇼케이스 메타
 * - 해외교류는 노란색·이미지 우측, 산학협력은 초록색·이미지 좌측으로 교차 배치
 */
const SHOWCASE_TYPE_META = {
  international: { label: '해외교류', accent: 'yellow', imageRight: true },
  industry: { label: '산학협력', accent: 'green', imageRight: false },
} as const

/** 슬라이드 썸네일이 없을 때 사용할 폴백 이미지 */
const SHOWCASE_FALLBACK_IMAGE = '/images/ninc/project-hero.png'

/**
 * 실제 DB 프로젝트 목록을 유형별 쇼케이스 블록으로 변환한다.
 * - 각 슬라이드는 상세 페이지(/ninc/project/[id])로 직접 연결된다.
 * - 유형에 해당하는 프로젝트가 하나도 없으면 그 블록은 생성하지 않는다.
 * - 정렬은 입력 순서(getProjects: 연도·생성일 내림차순)를 그대로 따른다.
 */
export function buildShowcaseBlocks(projects: ProjectItem[]): ShowcaseBlock[] {
  const order: Array<keyof typeof SHOWCASE_TYPE_META> = ['international', 'industry']

  return order
    .map((type) => {
      const meta = SHOWCASE_TYPE_META[type]
      const slides: ShowcaseSlide[] = projects
        .filter((p) => p.type === type)
        .map((p) => ({
          image: p.thumbnail_url || SHOWCASE_FALLBACK_IMAGE,
          date: p.duration?.trim() || String(p.year),
          place: p.partner?.trim() || '',
          title: p.title,
          href: `/ninc/project/${p.id}`,
        }))

      return { label: meta.label, accent: meta.accent, imageRight: meta.imageRight, slides }
    })
    .filter((block) => block.slides.length > 0)
}
