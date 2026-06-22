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
  /** 하이라이트 강조 단어 (closing quote 내 SVG blob 장식 대상 텍스트) */
  closingHighlight?: string
  /** 하이라이트 SVG blob의 절대 위치 */
  closingHighlightStyle?: {
    top: number
    left: string
    transform?: string
  }
}

/**
 * CAREER 외 추가 이력 섹션 (논문/공연/전시/학술지 등)
 * label: 영문 대문자 헤딩 (e.g., "PUBLICATION") — CAREER와 동일 스타일로 렌더
 * items: 항목 리스트
 */
export interface FacultyExtraSection {
  label: string
  items: string[]
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
  /** 타원(배경 원)과 프로필 사진이 합쳐진 이미지 — 있으면 상세 페이지에서 타원+사진 대신 사용 */
  combinedImageUrl?: string
  colorVariant: FacultyCardVariant
  quote: string
  email?: string
  education?: string[]
  career?: string[]
  /** CAREER 아래에 추가로 표시할 이력 섹션 (논문/공연/전시/학술지 등) */
  extraSections?: FacultyExtraSection[]
  interview?: FacultyInterview
}

/**
 * photoUrl: /public/images/faculty/[id].png 정적 파일 경로
 */
function photoUrl(id: string): string {
  return `/images/faculty/${id}.png`
}

/**
 * combinedImageUrl: 타원 배경과 프로필 사진이 하나로 합쳐진 이미지 경로
 * /public/images/faculty/professor/[id].png
 */
function combinedUrl(id: string): string {
  return `/images/faculty/professor/${id}.png`
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
    combinedImageUrl: combinedUrl('bae-yun-gyeong'),
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
      closingHighlightStyle: { top: 39, left: '50%', transform: 'translateX(-10%)' },
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
    email: 'marklee@dima.ac.kr',
    career: [
      '경기대학교 인터넷비즈니스 전공 (석사)',
      '경기대학교 e-비즈니스 전공 (박사)',
      '전) 아이앤에이치 대표이사',
    ],
    extraSections: [
      {
        label: 'PUBLICATION',
        items: [
          '이광수. 2022. "The Effect of Lifelong Education Quality on City Brand Equity and Intention to Reuse Focusing on the Case of Lifelong Education in Osan". IJOC, 18(2).',
          '이광수. 2024. "Influence of YouTube Content Characteristics on Destination Image, Visit Intention, and e-WOM : Focused on Fishing Village Tourism on YouTube". The e-Business Studies, 25(1).',
          '이광수 외 2명. 2024. 기업 브랜드 아이덴티티가 소비자 브랜드 관계 및 충성도에 미치는 영향에 관한 연구. 아시아태평양융합연구교류논문지, 10(11).',
          '이광수. 2025. "메타버스 가상체험이 구전의도에 미치는 영향 : 원격실재감과 몰입의 이중매개 효과". 미디어예술연구지. vol.9.',
          '이광수 외 3. 2025. "Sustainable Consumer Behavior in the Social Exclusion Context: Impact on Upcycled Product Adoption and Environmental Sustainability Metrics". Sustainability. Vol.17.',
        ],
      },
    ],
  },
  {
    id: 'lee-seock-hee',
    nameEn: 'LEESEOCKHEE',
    nameKo: '이석희',
    role: '교수',
    photoUrl: photoUrl('lee-seock-hee'),
    combinedImageUrl: combinedUrl('lee-seock-hee'),
    colorVariant: 'green-solid',
    quote: '콘텐츠를 통해 세상과 소통하는 창작자로 성장하길 응원합니다.',
    email: 'seoklee@dima.ac.kr',
    career: [
      '충북대학교 정보통신공학 전공(박사)',
      '전 주/디지털아이 기술개발부 이사',
      '전 터보컴퓨터 소프트웨어개발부 팀장',
    ],
    interview: {
      qa: [
        {
          question: '1. 교수님께서 담당하시는 과목과 전문 분야를 간단히 소개해 주세요!',
          answer: `웹프로그래밍 기초, 웹프로그래밍 응용, 객체지향언어, 데이터베이스, 자료구조, 웹서버구축 등의 과목을 담당하고 있습니다. 전문 분야는 데이터베이스와 데이터 검색입니다.`,
        },
        {
          question: '2. 뉴미디어콘텐츠과에서 학생들이 가장 중요하게 배워야 할 역량은 무엇이라고 생각하시나요?',
          answer: `저는 세 가지 역량이 중요하다고 생각합니다.\n\n첫째는 '**기획 역량**'입니다. 무엇을 만들지 구상하고 계획하는 힘이 기반이 됩니다.\n\n둘째는 '**디자인 역량**'입니다. 기획한 것을 시각적으로 표현하는 능력입니다.\n\n셋째는 '**프로그래밍 역량**'입니다. 기획과 디자인을 실제로 구현해내는 기술적 역량입니다.\n\n이 세 가지가 융합될 때 뉴미디어 콘텐츠를 온전히 만들어낼 수 있다고 생각합니다.`,
        },
        {
          question: '3. 재학생들이 학과 생활을 더욱 의미 있게 보내기 위해 꼭 해보면 좋은 경험이나 조언이 있다면 부탁드립니다.',
          answer: `동아리 활동에 적극적으로 참여하고, 각종 공모전에 도전해 보시길 권합니다. 수업에서 배운 내용을 실제 작품으로 만들어 외부에서 검증받는 경험은 큰 성장의 계기가 됩니다.`,
        },
        {
          question: '4. 교수님께서 생각하시기에 뉴미디어콘텐츠과와 잘 맞는 학생은 어떤 학생인가요?',
          answer: `**능동적인 학생**이 잘 맞다고 생각합니다. 모르는 것을 스스로 찾아서 공부하고, 새로운 것에 적극적으로 시도해 보는 학생이라면 이 학과에서 크게 성장할 수 있습니다.`,
        },
        {
          question: '5. 학생들이 졸업 후 어떤 모습으로 성장하길 바라시나요?',
          answer: `**능동적인 삶**을 살아가길 바랍니다. 주변에 선한 영향력을 끼치고, 무엇보다 스스로 행복한 사람이 되었으면 합니다.`,
        },
      ],
      closingQuestion: '마지막으로, 뉴미디어콘텐츠과를 한 문장으로 표현한다면?',
      closingQuote: `"뉴미디어콘텐츠과는 구성원이 모두 함께 성장하고\n함께 행복한 학과가 되었으면 하는 바람입니다.\n\n현재 충실하며 미래를 꿈꾸는 학과가 되었으면 좋겠습니다."`,
      closingHighlight: '함께 행복한',
      closingHighlightStyle: { top: 34, left: 'calc(50% - 204px)' },
    },
  },
  {
    id: 'lee-ju-heon',
    nameEn: 'LEEJUHEON',
    nameKo: '이주헌',
    role: '교수',
    photoUrl: photoUrl('lee-ju-heon'),
    combinedImageUrl: combinedUrl('lee-ju-heon'),
    colorVariant: 'green-gradient',
    quote: '새로운 기술과 예술의 융합으로 미래 미디어를 선도하는 인재를 양성합니다.',
    email: 'vincelee@dima.ac.kr',
    career: [
      '서울대학교 전자공학 전공(박사)',
      '서울대학교 전자공학 석사 (1990)',
      '중앙대학교 예술공학 석사 (2010)',
      '일본 와세다대학교 영상공학 방문교수 (2000~2002)',
      '스페인 바르셀로나 Estudio Nomada 작가 레지던시 (2014)',
    ],
    extraSections: [
      {
        label: 'PERFORMANCE',
        items: [
          '사운드 아트 퍼포먼스 Nows Tomorrow 공연영상감독 (M theater, 서울)',
          'AYAF 콘서트 춤 공연영상감독 (Olympus Hall, 서울)',
          '콘서트 박학기의 서정시대 공연영상감독 (학전블루, 서울)',
          '인터랙티브 미디어 공연영상 행복 한 접시 하실래요 공연영상감독 (재능문화센터, 서울)',
        ],
      },
      {
        label: 'EXHIBITION',
        items: [
          '인터랙티브 미디어 설치 Oriental Mirror, Slow Walking (CENTQUATRE:104, 파리, 프랑스)',
          '인터랙티브 미디어 설치 Memorial Bell 2 (Digital Playground in Island 2013, Malaysia)',
          '인터랙티브 미디어 설치 Ring A Bell (Loop Barcelona 2014, 바르셀로나, 스페인)',
          '증강현실(AR) 미디어 설치 Ssitkim: a litany (2017, Requiem for Hybrid Life, 서울시립미술관 세마창고, 서울)',
          '증강현실(AR) 미디어 설치 Epilogue (2017, 북촌 동재, 서울)',
          '증강현실(AR) 미디어 설치 보이는 것과 보이지 않는 것 (2017, 개인전, 세운상가 ColonB 아츠, 서울)',
        ],
      },
      {
        label: 'JOURNAL',
        items: [
          'Joohun Lee and et al., "A Study on User Interface Based on Hand Gesture Recognition", Intl. Jour. of u- and e- Service, Science & Tech, Vol.8, No. 6, 2015.',
          '이주헌, "증강현실을 이용한 미디어아트 교육" 정보처리학회지, 25(2), 한국정보처리학회, 2018.',
          '이주헌, "현대미술의 도구로서 증강현실을 활용한 미디어아트의 유용성", 문화와융합, 41(4), 한국문화융합학회, 2019.',
        ],
      },
    ],
    interview: {
      qa: [
        {
          question: '1. 교수님께서 담당하시는 과목과 전문 분야를 간단히 소개해 주세요!',
          answer: `프로그래밍 기초, 인터랙티브 콘텐츠 제작, 가상현실 콘텐츠 제작, 공간컴퓨팅 응용 등의 과목을 담당하고 있습니다. 최근에는 AI 분야도 함께 공부하며 수업에 접목시키고 있습니다.`,
        },
        {
          question: '2. 뉴미디어콘텐츠과에서 학생들이 가장 중요하게 배워야 할 역량은 무엇이라고 생각하시나요?',
          answer: `세 가지 역량이 중요하다고 생각합니다.\n\n첫째는 '**학습역량**'입니다. 빠르게 변화하는 미디어 환경에 적응하려면 스스로 배우고 익히는 능력이 무엇보다 중요합니다.\n\n둘째는 '**협업역량**'입니다. 좋은 콘텐츠는 혼자 만들기 어렵습니다. 다양한 분야의 사람들과 함께 협력하는 능력이 필요합니다.\n\n셋째는 '**회복역량**'입니다. 실패하더라도 다시 일어서서 도전하는 힘, 그 회복력이 결국 창작자를 성장시킵니다.`,
        },
        {
          question: '3. 재학생들이 학과 생활을 더욱 의미 있게 보내기 위해 꼭 해보면 좋은 경험이나 조언이 있다면 부탁드립니다.',
          answer: `낯선 환경을 의도적으로 마주해 보시길 권합니다. 여행이든, 전시든, 연극이든 — 평소와 다른 감각을 자극하는 경험들이 창작의 폭을 넓혀줍니다. 익숙함에서 벗어나는 연습을 꾸준히 해보세요.`,
        },
        {
          question: '4. 교수님께서 생각하시기에 뉴미디어콘텐츠과와 잘 맞는 학생은 어떤 학생인가요?',
          answer: `새로운 분야를 두려워하지 않고 호기심을 가지고 도전하는 학생이 이 학과와 가장 잘 맞습니다. 정답이 없는 영역에서 스스로 길을 만들어가는 사람이 여기서 빛납니다.`,
        },
        {
          question: '5. 학생들이 졸업 후 어떤 모습으로 성장하길 바라시나요?',
          answer: `열린 마음으로 세상과 소통하는 사람이 되었으면 합니다. 편견 없이 다양한 시선을 받아들이고, 그 안에서 자신만의 콘텐츠를 만들어나가는 창작자로 성장하길 바랍니다.`,
        },
      ],
      closingQuestion: '마지막으로, 뉴미디어콘텐츠과를 한 문장으로 표현한다면?',
      closingQuote: `"항상 새로움과 싸우는(씨름하는) 학과?"`,
      closingHighlight: '씨름하는',
      closingHighlightStyle: { top: 13, left: 'calc(50%)' },
    },
  },
  {
    id: 'ahn-jong-gu',
    nameEn: 'AHNJONG-GU',
    nameKo: '안종구',
    role: '교수',
    roleLabel: '겸임교수',
    photoUrl: photoUrl('ahn-jong-gu'),
    combinedImageUrl: combinedUrl('ahn-jong-gu'),
    colorVariant: 'green-solid',
    quote: '실무 중심의 교육으로 현장에서 즉시 활약할 수 있는 전문가를 키웁니다.',
    email: 'ray.ahn@dima.ac.kr',
    career: [
      '한국외국어대학교 광고홍보 학사',
      '(현) 더플랜지 이사',
      '(전) 웅진 놀이의발견 전략기획 이사',
      '(전) 야나두 전략기획본부 본부장',
      '(전) 미니스쿨 공동대표',
    ],
    interview: {
      qa: [
        {
          question: '1. 교수님께서 담당하시는 과목과 전문 분야를 간단히 소개해 주세요!',
          answer: `웹/앱 콘텐츠 기획 관련 과목들을 담당하고 있습니다. 전문 분야는 **머릿속의 아이디어를 실제 서비스의 언어와 구조로 전환하는 힘**입니다. 20년 가까이 다양한 디지털 서비스를 기획하고 전략을 세워온 경험을 바탕으로, 현장의 언어를 수업에 녹여내고 있습니다.`,
        },
        {
          question: '2. 뉴미디어콘텐츠과에서 학생들이 가장 중요하게 배워야 할 역량은 무엇이라고 생각하시나요?',
          answer: `저는 '**질문하는 능력**'이 가장 중요하다고 생각합니다. 사람들은 왜 이 콘텐츠에 반응하는가, 이 기능은 왜 필요한가, 이 흐름은 자연스러운가 — 이런 질문을 습관처럼 던질 수 있어야 좋은 기획자이자 콘텐츠 창작자로 성장할 수 있습니다.`,
        },
        {
          question: '3. 재학생들이 학과 생활을 더욱 의미 있게 보내기 위해 꼭 해보면 좋은 경험이나 조언이 있다면 부탁드립니다.',
          answer: `**일단 런칭해보세요.** 완성도가 조금 부족해도 괜찮습니다. 진짜 배움은 만드는 과정보다 실제로 공개하는 순간부터 시작됩니다. 앱이든 영상이든 블로그든, 내가 만든 것을 세상에 내놓아 보는 경험을 꼭 해보시길 권합니다.`,
        },
        {
          question: '4. 교수님께서 생각하시기에 뉴미디어콘텐츠과와 잘 맞는 학생은 어떤 학생인가요?',
          answer: `태도가 중요합니다. 세상의 흐름에 관심이 있고, 사람들의 반응에 늘 궁금한 게 많은 학생이라면 이 학과에서 잘 성장할 수 있습니다. 특별한 스펙보다 호기심과 관찰력이 있는 학생을 환영합니다.`,
        },
        {
          question: '5. 학생들이 졸업 후 어떤 모습으로 성장하길 바라시나요?',
          answer: `직함보다 역할로 기억되는 사람이 되었으면 합니다. 기획자, 디자이너, 개발자라는 경계를 유연하게 넘나들며, 필요한 순간에 필요한 역할을 해낼 수 있는 사람으로 성장하길 바랍니다.`,
        },
      ],
      closingQuestion: '마지막으로, 뉴미디어콘텐츠과를 한 문장으로 표현한다면?',
      closingQuote: `"사용자는 정보는 잊어도 '체험한 가치'는 기억합니다.\n\n우리 과는 단순한 텍스트를 넘어 시장이 반응하는\n'사용자 경험(UX)'을 설계하는 법을 배우는 곳이라고 생각합니다."`,
      closingHighlight: `'사용자 경험(UX)'`,
      closingHighlightStyle: { top: 120, left: 'calc(50% - 322px)' },
    },
  },
  {
    id: 'yuk-sim-woong',
    nameEn: 'YUKSIM-WOONG',
    nameKo: '육심웅',
    role: '교수',
    roleLabel: '겸임교수',
    photoUrl: photoUrl('yuk-sim-woong'),
    combinedImageUrl: combinedUrl('yuk-sim-woong'),
    colorVariant: 'green-gradient',
    quote: '디지털 시대의 변화를 이끄는 창의적 콘텐츠 크리에이터를 함께 만들어갑니다.',
    email: 'youkksw0@naver.com',
    career: [
      '국민대학교 디자인대학원 시각디자인 석사',
      '국민대학교 공간디자인 학사',
      '모티웨이브 대표',
      '전 (주)알렉시스리얼리티 실장',
      '전 수담 책임연구원',
      '전 (주)맥스트 선임연구원',
      '2023 마포구청 주관 과학창의페스티벌 초청기업',
      '2022 서울디자인페스티벌 브랜드페어',
      "2022 우정국 NFT 미디어 아트전 'NEXT STEP' 참여작가",
      '2022 캐릭터라이선싱페어 참여기업',
      '2022 키즈페어 유아교육전 참여기업',
      '2021 서울디자인페스티벌 2021 영디자이너 선정',
    ],
    interview: {
      qa: [
        {
          question: '1. 교수님께서 담당하시는 과목과 전문 분야를 간단히 소개해 주세요!',
          answer: `디자인 기초, 유니티 기반 프로그래밍 기초, AR/VR 콘텐츠 제작, AI 미디어 관련 과목들을 담당하고 있습니다. 1인 기업 모티웨이브를 운영하며 실무 현장의 최신 흐름을 수업에 직접 반영하고 있습니다.`,
        },
        {
          question: '2. 뉴미디어콘텐츠과에서 학생들이 가장 중요하게 배워야 할 역량은 무엇이라고 생각하시나요?',
          answer: `가장 중요한 역량은 '**완성해낸 과정과 그 경험**'이라고 생각합니다. 기술이나 지식보다, 하나의 프로젝트를 시작해서 끝까지 마무리해본 총체적 경험이 학생을 진짜로 성장시킵니다.`,
        },
        {
          question: '3. 재학생들이 학과 생활을 더욱 의미 있게 보내기 위해 꼭 해보면 좋은 경험이나 조언이 있다면 부탁드립니다.',
          answer: `대학생 신분으로 할 수 있는 것들에 적극적으로 도전해 보세요. '**스스로 시작해서 그 과정을 마침표**'를 찍어보는 경험이 중요합니다. '도전'이라는 말이 부담스럽다면 '**시도**'라고 생각해도 좋습니다. 작은 시도들이 쌓여 큰 경험이 됩니다.`,
        },
        {
          question: '4. 교수님께서 생각하시기에 뉴미디어콘텐츠과와 잘 맞는 학생은 어떤 학생인가요?',
          answer: `뉴미디어의 스펙트럼은 매우 넓습니다. 특정 한 가지 정답이 있는 학과가 아니기 때문에, 오히려 누구든 맞아 들어올 수 있는 곳이 바로 우리 학과입니다. 관심사가 다양할수록, 호기심이 많을수록 더 잘 맞습니다.`,
        },
        {
          question: '5. 학생들이 졸업 후 어떤 모습으로 성장하길 바라시나요?',
          answer: `주도적인 창작자로 성장하길 바랍니다. 그리고 단순한 도구 사용자가 아닌, 인터랙션의 원리를 이해하는 단단한 전문가가 되었으면 합니다.`,
        },
      ],
      closingQuestion: '마지막으로, 뉴미디어콘텐츠과를 한 문장으로 표현한다면?',
      closingQuote: `"행하는 사람에 따라 무엇이든 될 수 있는\n잠재력을 품는 학과"`,
      closingHighlight: '잠재력을 품는',
      closingHighlightStyle: { top: 14, left: 'calc(50% + 104px)' },
    },
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
    email: 'minyoopark@dima.ac.kr',
    career: [
      '동아방송예술대학교 뉴미디어콘텐츠과 졸업',
    ],
  },
]
