/**
 * 교수진 데이터 — 서버/클라이언트 공용
 * 'use client' 없이 어디서든 import 가능
 * TODO: Supabase faculty 테이블 fetch로 교체
 */

export type FacultyCardVariant = 'green-solid' | 'green-gradient' | 'yellow'

export interface FacultyData {
  id: string
  nameEn: string
  nameKo: string
  role: '교수' | '조교'
  photoUrl: string
  colorVariant: FacultyCardVariant
  quote: string
  email?: string
  education?: string[]
  career?: string[]
}

/**
 * photoUrl 우선순위:
 * 1순위: /images/faculty/[id].png (public 정적 파일 — node scripts/download-faculty-photos.mjs 실행 후)
 * 2순위: /api/faculty-photo?name=[id] (Next.js 서버가 Figma URL 프록시)
 *
 * 정적 파일이 존재하면 Next.js <Image>가 자동으로 최적화합니다.
 * 현재는 API Route fallback을 사용합니다.
 */
function photoUrl(id: string): string {
  // 정적 파일 우선 사용 (빌드 타임에는 알 수 없으므로 API Route 사용)
  return `/api/faculty-photo?name=${id}`
}

export const FACULTY_LIST: FacultyData[] = [
  /* ── 교수진 ── */
  {
    id: 'bae-yung-yung',
    nameEn: 'BAEYUNGYUNG',
    nameKo: '배윤영',
    role: '교수',
    photoUrl: photoUrl('bae-yung-yung'),
    colorVariant: 'green-solid',
    quote: '창의성과 기술이 만나는 곳, 뉴미디어콘텐츠과에서 여러분의 꿈을 펼치세요.',
  },
  {
    id: 'lee-gwang-soo',
    nameEn: 'LEEGWANG-SOO',
    nameKo: '이광수',
    role: '교수',
    photoUrl: photoUrl('lee-gwang-soo'),
    colorVariant: 'green-gradient',
    quote: '미디어의 경계를 넘어 새로운 가능성을 탐구하는 여정을 함께합니다.',
  },
  {
    id: 'lee-seock-hee',
    nameEn: 'LEESEOCKHEE',
    nameKo: '이석희',
    role: '교수',
    photoUrl: photoUrl('lee-seock-hee'),
    colorVariant: 'green-solid',
    quote: '콘텐츠를 통해 세상과 소통하는 창작자로 성장하길 응원합니다.',
  },
  {
    id: 'lee-ju-heon',
    nameEn: 'LEEJUHEON',
    nameKo: '이주헌',
    role: '교수',
    photoUrl: photoUrl('lee-ju-heon'),
    colorVariant: 'green-gradient',
    quote: '새로운 기술과 예술의 융합으로 미래 미디어를 선도하는 인재를 양성합니다.',
    email: 'jhlee@dba.ac.kr',
    education: ['홍익대학교 영상학과 박사'],
    career: ['현) 동아방송예술대학교 뉴미디어콘텐츠과 교수'],
  },
  {
    id: 'ahn-jong-gu',
    nameEn: 'AHNJONG-GU',
    nameKo: '안종구',
    role: '교수',
    photoUrl: photoUrl('ahn-jong-gu'),
    colorVariant: 'green-solid',
    quote: '실무 중심의 교육으로 현장에서 즉시 활약할 수 있는 전문가를 키웁니다.',
  },
  {
    id: 'yuk-sim-woong',
    nameEn: 'YUKSIM-WOONG',
    nameKo: '육심웅',
    role: '교수',
    photoUrl: photoUrl('yuk-sim-woong'),
    colorVariant: 'green-gradient',
    quote: '디지털 시대의 변화를 이끄는 창의적 콘텐츠 크리에이터를 함께 만들어갑니다.',
    email: 'swryuk@dba.ac.kr',
    education: ['중앙대학교 첨단영상대학원 석사'],
    career: ['현) 동아방송예술대학교 뉴미디어콘텐츠과 교수'],
  },
  /* ── 조교 ── */
  {
    id: 'park-min-yu',
    nameEn: 'PARKMIN-YU',
    nameKo: '박민유',
    role: '조교',
    photoUrl: photoUrl('park-min-yu'),
    colorVariant: 'yellow',
    quote: '학과 생활의 첫걸음을 함께하며 든든한 지원군이 되겠습니다.',
  },
]
