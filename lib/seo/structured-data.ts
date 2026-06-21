/**
 * schema.org 구조화 데이터 빌더 (SEO + GEO)
 * - 검색엔진 리치 결과 및 AI 답변 인용 시 정확한 엔티티 정보 제공
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.dima-nwcn.com'

/**
 * EducationalOrganization — 학과(기관) 엔티티.
 * 구글 지식 패널 및 AI가 "동아방송예술대학교 뉴미디어콘텐츠과"를
 * 하나의 기관으로 인식하도록 한다.
 */
export function educationalOrganizationLd(locale: string) {
  const isKo = locale !== 'en'
  return {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: isKo
      ? '동아방송예술대학교 뉴미디어콘텐츠과'
      : 'Dong-Ah Institute of Media and Arts, New Media Contents',
    // 실제 검색에 쓰이는 변형·약칭을 모두 동의어로 등록한다.
    // (정확한 풀네임뿐 아니라 '동방예대', '뉴콘', 'DIMA', '과' 없는 표기로도 매칭되도록)
    alternateName: isKo
      ? [
          'NWCN',
          'DIMA NWCN',
          '뉴미디어콘텐츠과',
          '뉴미디어콘텐츠',
          '뉴콘',
          'NewCon',
          '동방예대 뉴미디어콘텐츠과',
          '동방예대 뉴미디어콘텐츠',
          '동방예대 뉴콘',
          '동아방송예술대학교 뉴미디어콘텐츠',
          '동아방송예술대학교 뉴콘',
          'New Media Contents',
        ]
      : [
          'NWCN',
          'DIMA NWCN',
          'NewCon',
          'New Media Contents',
          'Dong-Ah Institute of Media and Arts New Media Contents',
        ],
    url: SITE_URL,
    logo: `${SITE_URL}/apple-icon`,
    description: isKo
      ? '동아방송예술대학교 뉴미디어콘텐츠과 공식 홈페이지. 예술과 기술이 만나는 곳에서 새로운 미디어를 만들어냅니다.'
      : 'Official site of the New Media Contents Department at Dong-Ah Institute of Media and Arts.',
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: isKo ? '동아방송예술대학교' : 'Dong-Ah Institute of Media and Arts',
      // 본교 약칭: '동방예대' / 'DIMA'
      alternateName: isKo ? ['동방예대', 'DIMA'] : ['DIMA', '동아방송예술대학교', '동방예대'],
    },
    sameAs: [
      'https://www.instagram.com/',
      'https://www.youtube.com/',
    ],
  }
}

/**
 * WebSite — 사이트 엔티티 + 사이트 내 검색(SearchAction).
 * 구글 사이트링크 검색창 및 AI의 사이트 구조 이해에 사용.
 */
export function webSiteLd(locale: string) {
  const isKo = locale !== 'en'
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: isKo ? '동아방송예술대학교 뉴미디어콘텐츠과' : 'Dong-Ah Institute of Media and Arts, New Media Contents',
    alternateName: isKo
      ? ['NWCN', '뉴콘', 'NewCon', '동방예대 뉴미디어콘텐츠과', '동방예대 뉴콘', 'DIMA NWCN']
      : ['NWCN', 'NewCon', 'DIMA NWCN'],
    url: SITE_URL,
    inLanguage: isKo ? 'ko-KR' : 'en-US',
    publisher: {
      '@type': 'Organization',
      name: '동아방송예술대학교 뉴미디어콘텐츠과',
      alternateName: ['동방예대 뉴미디어콘텐츠과', '뉴콘', 'NWCN'],
      url: SITE_URL,
    },
  }
}

/**
 * BreadcrumbList — 페이지 계층 경로.
 * 검색결과 빵부스러기 표시 + AI가 콘텐츠 맥락(어느 섹션 글인지)을 파악하도록.
 * @param items [{ name, path }] — path 는 SITE_URL 기준 상대 경로
 */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}
