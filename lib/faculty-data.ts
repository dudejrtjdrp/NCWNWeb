/**
 * 교수진 데이터 — 서버/클라이언트 공용
 * 'use client' 없이 어디서든 import 가능
 * TODO: Supabase faculty 테이블 fetch로 교체
 */

export type FacultyCardVariant = 'green-solid' | 'green-gradient' | 'yellow'

/** 인터뷰 Q&A — answer에서 **bold** 마커로 강조 텍스트 표현 */
export interface InterviewQA {
  question: string
  answer: string
}

export interface FacultyInterview {
  qa: InterviewQA[]
  closingQuestion: string
  /** 마지막 대표 인용 문구 — 줄바꿈은 \n 사용 */
  closingQuote: string
  /** 하이라이트 강조 단어 (closing quote 내 밑줄 장식 대상 텍스트) */
  closingHighlight?: string
}

export interface FacultyData {
  id: string
  nameEn: string
  nameKo: string
  /** 직급 — 카드·상세 페이지에서 사용 */
  role: '교수' | '조교'
  /** 괄호 내 역할 라벨 (e.g., "학과장") */
  roleLabel?: string
  photoUrl: string
  colorVariant: FacultyCardVariant
  quote: string
  email?: string
  education?: string[]
  career?: string[]
  interview?: FacultyInterview
}

/**
 * photoUrl: /public/images/faculty/[id].png 정적 파일 경로
 */
function photoUrl(id: string): string {
  return `/images/faculty/${id}.png`
}

export const FACULTY_LIST: FacultyData[] = [
  /* ── 교수진 ── */
  {
    id: 'bae-yun-gyeong',
    nameEn: 'BAEYUNGYEONG',
    nameKo: '배윤경',
    role: '교수',
    roleLabel: '학과장',
    photoUrl: photoUrl('bae-yun-gyeong'),
    colorVariant: 'green-solid',
    quote: '창의성과 기술이 만나는 곳, 뉴미디어콘텐츠과에서 여러분의 꿈을 펼치세요.',
    email: 'vision7yk@dima.ac.kr',
    career: [
      '중앙대학교 첨단영상대학원 예술공학 박사 (2016)',
      '런던예술대학교 (Wimbledon College of Arts) Theatre (Visual Language of Performance) 석사 (2007)',
      '전 계원예술대학교 디지털미디어디자인 겸임교수 (2019-2020)',
      '전 휴아시스 연구소장 (2015-2021)',
    ],
    interview: {
      qa: [
        {
          question: '1. 교수님께서 담당하시는 과목과 전문 분야를 간단히 소개해 주세요!',
          answer: `저는 뉴미디어콘텐츠과에서 '예술과 테크놀로지', 'UI/UX 디자인', '미디어아트 실습', '디지털 사이니지' 등 디자인 기반의 교과목들을 담당하고 있습니다. 전문 분야는 공연이나 전시와 같은 공간 안에서 펼쳐지는 콘텐츠를 기획하고, 디자인하고, 제작하는 일입니다.\n\n무대라는 한정된 공간 안에서 서사를 중심으로 시각적 언어를 통해 이야기를 전달하며 극적인 순간을 만들어 내고 있으며, 관객이 콘텐츠 안으로 자연스럽게 들어오는 경험을 디자인하는 일에 가장 큰 애정을 두고 있습니다.`,
        },
        {
          question: '2. 뉴미디어콘텐츠과에서 학생들이 가장 중요하게 배워야 할 역량은 무엇이라고 생각하시나요?',
          answer: `저는 세 가지를 강조하고 싶습니다.\n\n첫째는 '**디자인 사고**'입니다. 보는 사람의 입장에서 문제를 발견하고, 그 답을 시각적인 언어로 풀어내는 힘은 어떤 매체를 다루든 가장 기본이 되는 능력입니다.\n\n둘째는 '**협업 능력**'입니다. 뉴미디어 콘텐츠는 결코 혼자 완성되지 않습니다. 우리 학과는 대부분의 수업에서 팀 프로젝트를 진행하고 있으며, 이 과정에서 길러지는 협업 능력은 학과의 가장 중요한 필수 역량이자, 졸업 후 현장에서도 가장 필요한 자질 중 하나입니다. 기획자, 디자이너, 개발자처럼 서로 다른 언어를 쓰는 사람들과 한 작품을 만들어 가는 과정에서 소통하고 조율하는 능력은 실제 현장에서 가장 빛을 발합니다.\n\n셋째는 '**기술을 도구로 다루는 감각**'입니다. AI 기술의 발전으로 기술 기반의 콘텐츠가 끊임없이 쏟아져 나오고 있습니다. 하지만 기술 그 자체가 목적이 되어서는 안 됩니다. 기술은 자신이 표현하고 싶은 이야기를 위해 자유롭게 골라 쓸 수 있는 도구가 되어야 합니다.\n\n이 세 가지가 균형 있게 갖춰질 때, 비로소 자신만의 콘텐츠를 만들어 낼 수 있다고 생각합니다.`,
        },
        {
          question: '3. 재학생들이 학과 생활을 더욱 의미 있게 보내기 위해 꼭 해보면 좋은 경험이나 조언이 있다면 부탁드립니다.',
          answer: `학과에서 진행하는 다양한 프로젝트에 적극적으로 참여하고, 학교에서 지원하는 여러 프로그램들에도 두려워하지 말고 도전해 보시길 바랍니다. 수업 안에서 배운 것을 실제 프로젝트로 옮겨 보는 경험, 그리고 자신의 작업을 다른 사람 앞에 내놓아 보는 경험은 어떤 강의보다도 큰 배움을 줍니다.\n\n학교에서 보내는 시간은 결국 '**얼마나 많이 시도해 봤는가**'로 남는다고 생각합니다. 실패해도 괜찮으니 가능한 한 많이 경험해 보시길 권합니다.`,
        },
        {
          question: '4. 교수님께서 생각하시기에 뉴미디어콘텐츠과와 잘 맞는 학생은 어떤 학생인가요?',
          answer: `새로운 기술에 호기심이 많고, 스스로 문제를 재정의하며 주도적으로 학습해 나가는 학생입니다. 또한 시도와 도전을 두려워하지 않는 학생이라면 우리 학과와 정말 잘 맞을 것입니다.\n\n처음부터 잘하는 학생보다, "**한번 해볼까?**"라고 먼저 말할 수 있는 학생이 결국 가장 멀리 가더라고요.`,
        },
        {
          question: '5. 학생들이 졸업 후 어떤 모습으로 성장하길 바라시나요?',
          answer: `졸업 후 어떤 길을 선택하든, "**이 사람의 작업에는 분명한 색이 있다**"라고 말할 수 있는 사람이 되었으면 합니다.\n\n디자인과 기술의 경계가 점점 흐려지는 시대인 만큼, 한 분야에만 머무르지 않고 새로운 도구와 매체를 자유롭게 넘나들며 동료들과 함께 멋진 작업을 만들어 갈 수 있는 사람이 되었으면 합니다. 무엇보다 자신의 작업을 사랑하고, 그 과정을 진심으로 즐길 줄 아는 사람이면 좋겠습니다.`,
        },
      ],
      closingQuestion: '마지막으로, 뉴미디어콘텐츠과를 한 문장으로 표현한다면?',
      closingQuote: '"디자인과 기술이 만나,\n공간과 사람을 새롭게 연결하는 콘텐츠를 배우는 곳입니다."',
      closingHighlight: '새롭게 연결하는',
    },
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
