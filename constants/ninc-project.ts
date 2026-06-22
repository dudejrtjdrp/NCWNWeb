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
  { name: '티슈오피스', logoSrc: '/images/ninc/partners/0.png', href: 'https://www.tissueoffice.info/' },
  { name: '소이정', logoSrc: '/images/ninc/partners/1.png', href: 'https://www.soijeong.com/' },
  { name: '모온 컴퍼니', logoSrc: '/images/ninc/partners/2.png', href: 'https://themo-on.com/' },
  { name: '이스트허그', logoSrc: '/images/ninc/partners/3.png', href: 'https://www.easthug.com/index' },
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

/** 슬라이드 썸네일이 없을 때 사용할 폴백 이미지 (실제 존재하는 파일) */
const SHOWCASE_FALLBACK_IMAGE = '/images/ninc/project-hero.png'

// 정적 폴백 — DB에 프로젝트가 하나도 없을 때만 사용.
// (이전엔 존재하지 않는 showcase-1/2.png 를 가리켜 회색으로 비어 보였음 → 존재하는 hero 이미지로 교체)
export const SHOWCASE_BLOCKS: ShowcaseBlock[] = [
  {
    label: '해외교류',
    accent: 'yellow',
    imageRight: true,
    slides: [
      {
        image: SHOWCASE_FALLBACK_IMAGE,
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
        image: SHOWCASE_FALLBACK_IMAGE,
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

/**
 * 실제 DB 프로젝트 목록을 유형별 쇼케이스 블록으로 변환한다.
 * - 각 슬라이드는 상세 페이지(/ninc/project/[id])로 직접 연결된다.
 * - 'international' 은 해외교류 블록, 그 외 모든 유형(industry 및 커스텀 유형)은
 *   산학협력 블록으로 묶는다. → 유형 제약 완화(relax_type_constraints)로 커스텀
 *   유형이 들어와도 프로젝트가 누락되지 않는다. (이전엔 두 리터럴과 정확히
 *   일치하지 않으면 전부 빠져 쇼케이스가 비고 정적 폴백→회색이 됐음)
 * - 빈 블록은 생성하지 않는다. 정렬은 입력 순서(연도·생성일 내림차순)를 따른다.
 */
export function buildShowcaseBlocks(projects: ProjectItem[]): ShowcaseBlock[] {
  const buckets: Record<keyof typeof SHOWCASE_TYPE_META, ProjectItem[]> = {
    international: [],
    industry: [],
  }
  for (const p of projects) {
    const key = p.type === 'international' ? 'international' : 'industry'
    buckets[key].push(p)
  }

  const order: Array<keyof typeof SHOWCASE_TYPE_META> = ['international', 'industry']

  return order
    .map((type) => {
      const meta = SHOWCASE_TYPE_META[type]
      const slides: ShowcaseSlide[] = buckets[type].map((p) => ({
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
