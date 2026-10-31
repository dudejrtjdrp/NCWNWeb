/**
 * NINC / PROJECT 페이지 정적 데이터 — 가족회사 로고
 * 로고 파일: public/images/ninc/partners/*.png
 * (프로젝트 목록 자체는 projects 테이블에서 온다)
 */

/** 산학협력 / 가족회사 로고 */
export interface PartnerLogo {
  /** 회사명 (alt·표시용) */
  name: string
  /** 로고 이미지 경로 */
  logoSrc: string
  /** 회사 사이트 */
  href: string
}

export const PARTNER_LOGOS: PartnerLogo[] = [
  { name: '티슈오피스', logoSrc: '/images/ninc/partners/0.png', href: 'https://www.tissueoffice.info/' },
  { name: '소이정', logoSrc: '/images/ninc/partners/1.png', href: 'https://www.soijeong.com/' },
  { name: '모온 컴퍼니', logoSrc: '/images/ninc/partners/2.png', href: 'https://themo-on.com/' },
  { name: '이스트허그', logoSrc: '/images/ninc/partners/3.png', href: 'https://www.easthug.com/index' },
]
