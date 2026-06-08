/**
 * 뉴미디어콘텐츠과 공식 SNS 링크 — 단일 소스
 * Footer, 소개 페이지 등 모든 컴포넌트에서 이 파일을 import
 */

export interface SocialLink {
  /** i18n 키 (messages/ko.json, en.json의 footer.sns.* 키) */
  key: string
  href: string
  icon: string
  /** 링크 그룹 분류 */
  group: 'official' | 'club' | 'community' | 'school'
}

/** 과 공식 채널 */
export const DEPT_SNS: SocialLink[] = [
  {
    key: 'youtube',
    href: 'https://www.youtube.com/@dimanewcon',
    icon: '/images/common/youtube.svg',
    group: 'official',
  },
  {
    key: 'instagram',
    href: 'https://www.instagram.com/2026newcon',
    icon: '/images/common/instagram.svg',
    group: 'official',
  },
]

/** 과 동아리 채널 */
export const CLUB_SNS: SocialLink[] = [
  {
    key: 'instagramPlan',
    href: 'https://www.instagram.com/plan.26archive',
    icon: '/images/common/instagram.svg',
    group: 'club',
  },
  {
    key: 'instagramYhr',
    href: 'https://www.instagram.com/yhr_club',
    icon: '/images/common/instagram.svg',
    group: 'club',
  },
]

/** 네이버 커뮤니티 */
export const NAVER_SNS: SocialLink[] = [
  {
    key: 'naverCafe',
    href: 'https://cafe.naver.com/dimaclassroom',
    icon: '/images/common/naver.svg',
    group: 'community',
  },
  {
    key: 'naverBlog',
    href: 'https://blog.naver.com/newconncr',
    icon: '/images/common/naver.svg',
    group: 'community',
  },
]

/** 학교 공식 홈페이지 */
export const SCHOOL_LINK: SocialLink = {
  key: 'schoolSite',
  href: 'https://www.dima.ac.kr/',
  icon: '/images/common/external-link.svg',
  group: 'school',
}

/** Footer에 노출할 SNS 링크 (과 공식 + 네이버 커뮤니티) */
export const FOOTER_SNS_LINKS: SocialLink[] = [
  ...DEPT_SNS,
  ...NAVER_SNS,
]

/** 전체 공식 SNS 링크 */
export const ALL_SNS_LINKS: SocialLink[] = [
  ...DEPT_SNS,
  ...CLUB_SNS,
  ...NAVER_SNS,
  SCHOOL_LINK,
]
