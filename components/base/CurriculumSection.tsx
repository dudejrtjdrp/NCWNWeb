'use client'

/**
 * BASE 컴포넌트: CurriculumSection
 * Figma node-id: 450:219 (ABOUT/Curriculum/Desktop)
 *
 * ── 구조 ────────────────────────────────────────────
 *  [1] 교육과정 아이콘 + 타이틀 "교육 과정"
 *  [2] 학년 탭 (1학년 / 2학년 / 3학년)
 *       - 활성: 브랜드 그린 (#09F593) + 그림자
 *       - 비활성: 회색 (#B9B8B6)
 *  [3] 커리큘럼 콘텐츠 (선택된 학년 기준)
 *       - 교양필수 섹션 (#848900)
 *       - 전공필수 섹션 (#007042)
 *       - 전공선택 섹션 (#003F7D)
 *       - 각 섹션: 학기 헤더 + 과목 목록
 * ────────────────────────────────────────────────────
 *
 * Figma 디자인 스펙:
 *  - 전체 패딩: px-[188px] py-[81px]
 *  - 카테고리 헤더: Pretendard Bold 18px, line-height 27px
 *  - 학기 헤더: Pretendard Bold 18px, #050505
 *  - 과목명: Pretendard Medium 18px, #050505
 *  - 과목 설명: Pretendard Medium 18px, #888, line-height 27px
 *  - 섹션 내 gap: 37px
 *  - 과목 간 gap: 52px
 *  - 학기 간 gap: 95px
 *  - 구분선: 1px, #E8E8E8
 */

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'

/* ─── 타입 정의 ─── */
interface Course {
  name: string       // 과목명 + 학점/이론/실기
  description?: string
}

interface Semester {
  label: string      // "1학기" | "2학기"
  courses: Course[]
}

interface CurriculumCategory {
  title: string      // "교양필수" | "전공필수" | "전공선택"
  color: string      // 카테고리 헤더 컬러
  semesters: Semester[]
}

interface GradeData {
  grade: number
  categories: CurriculumCategory[]
}

/* ─── 커리큘럼 데이터 ─── */
const CURRICULUM_DATA: GradeData[] = [
  /* ══════════════════════ 1학년 ══════════════════════ */
  {
    grade: 1,
    categories: [
      {
        title: '교양필수',
        color: '#848900',
        semesters: [
          {
            label: '1학기',
            courses: [
              { name: '기초실용영어 (2학점 / 이론1 실기1)' },
            ],
          },
          {
            label: '2학기',
            courses: [
              { name: '프리젠테이션영어 (2학점 / 이론1 실기1)' },
            ],
          },
        ],
      },
      {
        title: '전공필수',
        color: '#007042',
        semesters: [
          {
            label: '1학기',
            courses: [
              {
                name: '취창업과진로설계 ( 1학점 / 이론1)',
                description:
                  '진로 심리 검사를 통해 자신의 적성과 흥미를 분석하고, 창업 및 취업과 관련된 실무 지식을 익혀 실질적인 진로 목표를 수립할 수 있도록 한다. 또한 창업을 위한 기본적 교육과 대학의 창업·취업 지원 프로그램에 대한 이해를 통해 진로 목표를 설정할 수 있도록 함.',
              },
            ],
          },
        ],
      },
      {
        title: '전공선택',
        color: '#003F7D',
        semesters: [
          {
            label: '1학기',
            courses: [
              {
                name: '웹프로그래밍기초 (3학점 / 이론1 실기2)',
                description:
                  '뉴미디어콘텐츠제작자로서 스마트 문화 콘텐츠의 제작을 위한 도구로서 프로그래밍언어를 이해하고, 이를 활용하여 어플리케이션을 개발할 수 있는 기초지식과 기술을 함양한다.',
              },
              {
                name: '예술과테크놀로지 (3학점 / 이론1 실기2)',
                description:
                  '예술과 기술의 융합에 대하여 이해하고, 스마트 문화 콘텐츠 발굴에 필요한 지식과 기술을 연마한다. 이론과 실습 위주의 교과목이며, 향후 인터랙티브 프로그래밍, 가상현실콘텐츠제작, 객체지향언어실습, 미디어 아트 실습, 디지털 사이니지 실습 교과목의 기초과목임.',
              },
              {
                name: '디지털영상기초 (3학점 / 이론1 실기2)',
              },
              {
                name: '뉴미디어콘텐츠서비스 (3학점 / 이론1 실기2)',
                description:
                  '미디어와 뉴미디어의 기본 개념을 이해하고, 뉴미디어 산업의 생태계 특성을 바탕으로 성공적인 콘텐츠서비스를 개발하기 위한 관련 지식을 학습한다. 뉴미디어 환경에서 콘텐츠 서비스를 개발하기 위한 구성요소를 학습하고 실제 콘텐츠서비스 사업계획서 작성에 대해 학습한다.',
              },
              {
                name: '디자인기초 (3학점 / 이론1 실기2)',
                description:
                  '포토샵을 통해 이미지 편집·보정·합성·드로잉·컬러링을 학습하여 비트맵 방식을 이해하고, 일러스트레이터를 통해 기본툴을 익히고 벡터방식의 이미지 속성을 이해한다. 다양한 멀티미디어 요소의 제작을 통해 컴퓨터 그래픽 기초이미지 학습을 이해하고 영상 및 그래픽 프로그램 기초를 학습하는 교과목.',
              },
            ],
          },
          {
            label: '2학기',
            courses: [
              {
                name: '디지털영상응용 (3학점 / 이론1 실기2)',
              },
              {
                name: '디자인응용 (3학점 / 이론1 실기2)',
                description:
                  '에프터이펙트 저작툴의 기본 환경과 사용법을 익히고 모션효과, 영상편집, 다양한 이펙트를 실습한다. 직접 스토리를 제작하여 하나의 영상과정 프로세스를 완수하고, 웹·앱 및 다양한 플랫폼에 사용될 영상그래픽 요소를 개발한다.',
              },
              {
                name: '프로그래밍기초 (3학점 / 이론1 실기2)',
                description:
                  '스마트 문화 콘텐츠 제작을 위한 도구로서 프로그래밍언어를 이해하고, 이를 활용하여 어플리케이션을 개발할 수 있는 기초지식과 기술을 함양한다. 이론과 실습 위주의 교과목이며 향후 인터랙티브 프로그래밍, 가상현실 콘텐츠 제작, 객체지향언어 실습, 미디어 아트 실습 및 디지털 사이니지 실습 교과목의 기초과목임.',
              },
              {
                name: '뉴미디어콘텐츠기획 (3학점 / 이론1 실기2)',
                description:
                  '뉴미디어 콘텐츠 기획의 구성요소를 분석하고, 콘텐츠 기획 단계에 따른 투입요소와 일정계획이 포함된 콘텐츠 제작 기획서 작성을 학습한다. 작성된 기획서의 평가지표를 작성하고 이를 반영한 최종 기획서를 바탕으로 실제 뉴미디어 콘텐츠 사업계획서를 작성한다.',
              },
              {
                name: '웹프로그래밍응용 (3학점 / 이론1 실기2)',
                description:
                  '웹프로그래밍기초를 선수과목으로 한다. HTML5·CSS3로 작성된 페이지에 Javascript를 적용하는 방법을 실습하고, HTML5 API를 활용하여 웹 페이지를 제작하는 방법과 하이브리드 앱 개발을 위한 모바일 HTML5 APIs를 활용하는 방법을 연습한다.',
              },
              {
                name: '색채실습 (3학점 / 이론1 실기2)',
                description:
                  '색채론, 색채조화론, 색채관리론, 색의 이미지표현, 실무 색채계획, 실무 배색활용 등 색의 원리를 이해하고, 색의 문화적 상징성 및 사회적 의미를 파악하여 콘텐츠 제작에 있어서 색채 활용을 심도 깊게 배운다.',
              },
            ],
          },
        ],
      },
    ],
  },

  /* ══════════════════════ 2학년 ══════════════════════ */
  {
    grade: 2,
    categories: [
      {
        title: '교양필수',
        color: '#848900',
        semesters: [
          {
            label: '1학기',
            courses: [
              {
                name: '소통및협업 (2학점 / 이론1 실기1)',
                description:
                  '문서를 읽고 이해하고 작성하는 방법과 다른 사람의 의견을 경청하는 능력을 기르며, 상대방에 대한 이해와 배려를 바탕으로 인간관계를 조화롭게 이뤄나가는 방법을 배운다. 자신의 생각을 글로 표현하고 상대방과 의견을 자유롭게 주고받는 능력을 기를 수 있고, 생각이 다른 상대방과 어떻게 조화로운 관계를 이뤄나갈 수 있는지를 배울 수 있다.',
              },
            ],
          },
        ],
      },
      {
        title: '전공필수',
        color: '#007042',
        semesters: [
          {
            label: '1학기',
            courses: [
              {
                name: 'UI/UX기획 (3학점 / 이론1 실기2)',
                description:
                  'UI/UX 개발을 위한 환경 분석을 수행하고, 내부 역량 분석과 리소스 활용계획 수립에 대해 학습한다. 또한 UI/UX 설계를 위한 사용자리서치의 개념과 프로토타입 제작에 대해 학습하여 UI/UX 콘셉트를 도출할 수 있도록 한다.',
              },
              {
                name: '객체지향언어실습 (3학점 / 이론1 실기2)',
                description:
                  '스마트 문화 콘텐츠의 제작을 위한 도구로서 객체지향 프로그래밍 언어를 이해하고, 이를 활용하여 어플리케이션을 개발할 수 있는 기초지식과 기술을 함양한다.',
              },
            ],
          },
        ],
      },
      {
        title: '전공선택',
        color: '#003F7D',
        semesters: [
          {
            label: '1학기',
            courses: [
              {
                name: '인터랙티브미디어디자인 (3학점 / 이론1 실기2)',
              },
              {
                name: '인터랙티브프로그래밍 (3학점 / 이론1 실기2)',
                description:
                  'Processing 언어를 이해하고, 멀티미디어를 활용하는 스마트 문화 콘텐츠 어플리케이션 개발을 위한 지식과 기술을 함양한다. 이론과 실습 위주의 교과목이며 향후 미디어 아트 실습 및 디지털 사이니지 실습 교과목의 기초과목임.',
              },
              {
                name: 'DB구축및관리 (3학점 / 이론1 실기2)',
                description:
                  'DBMS를 활용하기 위한 방법들을 실습하고, 실세계의 데이터들을 구조화하여 ER다이어그램으로 표현하는 방법을 실습한다. DBMS에 데이터베이스를 만들고 테이블을 만드는 방법을 실습하며, 입력·조회·갱신·삭제를 위한 SQL문 사용방법을 연습한다.',
              },
            ],
          },
          {
            label: '2학기',
            courses: [
              {
                name: 'UI/UX디자인 (3학점 / 이론1 실기2)',
                description:
                  'UI/UX 콘셉트 기획 문서를 바탕으로 와이어프레임, 태스크 플로우를 설계하고, 비주얼 디자인 콘셉트를 도출하여 UI/UX 가이드에 따른 GUI 상세 디자인을 수행한다. 제작된 UI를 검증하기 위한 사용성 테스트 계획·수행·분석·결과 보고의 각 과정에 대해 학습한다.',
              },
              {
                name: '콘텐츠미학실습 (3학점 / 이론1 실기2)',
                description:
                  '빛, 조명, 색채, 구도, 공간, 레이아웃, 미장센, 시간, 동작 등 미학적 접근을 토대로 콘텐츠를 분석하고, 제작과정 역시 미학적 접근을 토대로 이루어지며, 제작된 콘텐츠를 어떤 플랫폼에 어떠한 방법으로 노출시킬 것인지에 대한 분석도 이루어진다.',
              },
              {
                name: '가상현실콘텐츠제작 (3학점 / 이론1 실기2)',
                description:
                  'Unity 게임엔진에 대하여 이해하고 이를 활용한 저작툴과 C# 프로그래밍 언어에 대하여 이해한다. 멀티미디어를 활용하는 스마트 문화 콘텐츠 제작에 필요한 지식과 기술을 연마할 수 있으며, 특히 AR 및 VR 등 가상현실 기반의 콘텐츠를 제작할 수 있다.',
              },
              {
                name: '콘텐츠스토리텔링 (3학점 / 이론1 실기2)',
                description:
                  '스토리텔링의 기본 개념을 이해하고, 브랜드에서 활용되는 스토리텔링의 사례를 조사하여 실제 뉴미디어 환경에서 서비스될 수 있는 스토리를 기획한다. 기획된 스토리를 디지털콘텐츠로 서비스하기 위한 스토리보드를 작성하고, 스토리보드 검증 과정을 거쳐 실제 스토리텔링 디지털 콘텐츠를 제작한다.',
              },
              {
                name: '자료구조 (3학점 / 이론1 실기2)',
                description:
                  '자료구조 전반에 대한 개념과 알고리즘에 대한 이해를 바탕으로 선형 자료구조인 리스트, 선형 리스트, 연결 리스트, 스택과 큐, 비선형 구조인 트리와 그래프에 대해서 학습한다. 또한 자료처리에서 자주 사용되는 정렬과 검색기법에 대해서 학습한다.',
              },
            ],
          },
        ],
      },
    ],
  },

  /* ══════════════════════ 3학년 ══════════════════════ */
  {
    grade: 3,
    categories: [
      {
        title: '전공필수',
        color: '#007042',
        semesters: [
          {
            label: '1학기',
            courses: [
              {
                name: '프로젝트스튜디오 (3학점 / 이론1 실기2)',
                description:
                  '프로젝트 중심의 교과목으로 콘텐츠의 기획·디자인·제작하는 전 과정을 경험을 통해 현장에서 적용할 수 있는 콘텐츠를 제작한다. 3학년 졸업작품을 준비하는 교과목으로 실제 실무중심의 프로젝트를 제작하고 개인 포트폴리오를 만드는 교과목임.',
              },
            ],
          },
          {
            label: '2학기',
            courses: [
              {
                name: '취창업실전코칭 (1학점 / 이론1)',
                description:
                  '창업 및 취업 고용현황에 대한 올바른 이해와 취업실무를 익혀 성공적인 창업·취업을 이룰 수 있도록 하며, 구체적인 창업·취업연계 활동을 통해 실질적인 도움을 제공한다.',
              },
            ],
          },
        ],
      },
      {
        title: '전공선택',
        color: '#003F7D',
        semesters: [
          {
            label: '1학기',
            courses: [
              {
                name: '앱콘텐츠기획 (3학점 / 이론1 실기2)',
                description:
                  '어플리케이션 제작에 필요한 기획방법과 기획서 작성법을 학습하며, 기획의 구성요소와 국내외 사례 등을 통해 새로운 어플리케이션을 기획하고 프로토타입을 제작하여 어플리케이션이 기획되는 단계를 체험한다.',
              },
              {
                name: '미디어아트실습(캡스톤디자인) (3학점 / 이론1 실기2)',
                description:
                  'Processing·Arduino·Unity 등의 프로그래밍 언어 혹은 제작 툴을 활용하여 인터랙티브한 스마트 문화 콘텐츠 제작을 위한 지식과 기술을 함양한다. 특히 가상현실 API에 대해서도 이해하고, 미디어 아트 기반의 스마트 문화 콘텐츠 제작에 필요한 지식과 기술을 연마한다. 이론과 실습 위주의 교과목임.',
              },
              {
                name: '웹서버프로그래밍 (3학점 / 이론1 실기2)',
                description:
                  'JAVA 언어를 활용하여 웹 응용프로그램을 작성하는 방법을 연습한다. Servlet의 작성과 등록방법을 연습하고, JSP 문법과 JSP 페이지 제작방법, JSTL, 데이터베이스 활용한 페이지 제작방법, WAS(Web Application Server)의 설치 및 관리 방법 등을 실습한다. 하나의 웹 사이트를 직접 제작해서 서비스하는 과정을 실습한다.',
              },
              {
                name: '웹콘텐츠기획 (3학점 / 이론1 실기2)',
                description:
                  '웹이라는 특수 플랫폼 양식에 대한 이해를 바탕으로 디지털 콘텐츠에 대한 설계와 기획을 실습한다. 사용자의 목적과 정확한 분석을 통해 웹콘셉트를 설정하고, 사용성 및 편리성을 고려한 기획·설계·스토리보드 제작을 통해 웹사이트 플랫폼에 맞춘 기획을 실습한다. 다양한 사례연구(벤치마킹), 정보수집 시장조사 트렌드분석, 타깃의 요구사항 반영에 대한 실습을 한다.',
              },
              {
                name: 'AI활용한뉴미디어콘텐츠제작 (3학점 / 이론1 실기2)',
                description:
                  '생성형 AI, 디지털 기술, ICT 기술 등 최신 뉴미디어 기술을 활용하여 문화와 산업의 트렌드에 맞는 콘텐츠를 기획하고 제작하는 교과목임. 생성형 AI 기반의 프롬프트 설계, 데이터 활용, VR·AR 콘텐츠 제작 등 융합적 역량을 학습하며, 창의적이고 실질적인 사용자 경험을 제공할 콘텐츠를 개발하는 과정을 익힌다.',
              },
              {
                name: '현장실습 (3학점 / 실기3)',
                description:
                  '학교교육을 통해 습득한 전공 지식을 바탕으로 관련 직무 현장에서 이론의 적용, 실무교육 및 실습 등을 실시하는 산학협력 교육과정으로, 계절학기에 이수하는 단기로 진행되는 현장실습이다.',
              },
            ],
          },
          {
            label: '2학기',
            courses: [
              {
                name: '디지털사이니지(캡스톤디자인) (3학점 / 이론1 실기2)',
                description:
                  'Processing·VVVV·VDMX 등을 통해 스마트 문화 콘텐츠 제작과 운영을 위한 지식과 기술을 함양한다. 디지털 기술과 멀티미디어를 기반으로 하는 스마트 문화 콘텐츠 제작을 위한 기획 및 설계와 앱개발에 대한 이해를 바탕으로 광고·홍보·이벤트를 위한 스마트 문화 콘텐츠 제작에 필요한 기술을 연마한다. 이론과 실습 위주의 교과목임.',
              },
              {
                name: '앱콘텐츠개발 (3학점 / 이론1 실기2)',
                description:
                  '어플리케이션 제작에 필요한 툴, 언어, 모듈, 알고리즘에 대한 기초를 학습하며, 다양한 레퍼런스 어플리케이션을 개발·테스트하여 어플리케이션이 제작되는 단계를 체험한다.',
              },
              {
                name: '웹콘텐츠개발 (3학점 / 이론1 실기2)',
                description:
                  'HTML5·CSS3·Javascript·jQuery를 사용하여 다양한 디바이스 환경에 맞추어 화면크기와 콘텐츠를 배치하는 반응형 웹에 대한 이해를 통한 웹 플랫폼 개념을 습득한다. 콘텐츠를 제작하는 과정에서 발생하는 오류를 검사하고 이를 해결하는 방법을 실습하며, 스토리보드에 따라 제작되었는지 평가하는 방법을 실습한다.',
              },
            ],
          },
        ],
      },
    ],
  },
]

/* ─── 교육과정 아이콘 SVG (Figma Vector 대체) ─── */
function CurriculumIcon() {
  return (
    <svg
      width="64"
      height="61"
      viewBox="0 0 64 61"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ transform: 'rotate(180deg)' }}
    >
      {/* 아이콘 (Figma Vector2 대체: 화살표/별 모양 아이콘) */}
      <path
        d="M32 4L36.5 20H53L39.7 29.5L44.2 45.5L32 36L19.8 45.5L24.3 29.5L11 20H27.5L32 4Z"
        stroke="#09F593"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M32 12L35 22H45.5L37 28L40 38L32 32L24 38L27 28L18.5 22H29L32 12Z"
        fill="#09F593"
        opacity="0.3"
      />
    </svg>
  )
}

/* ─── 과목 아이템 ─── */
function CourseItem({ course }: { course: Course }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 35,
      }}
    >
      {/* 과목명 + 학점 */}
      <p
        style={{
          margin: 0,
          fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
          fontWeight: 500,
          fontSize: 18,
          lineHeight: '27px',
          color: '#050505',
        }}
      >
        {course.name}
      </p>
      {/* 과목 설명 */}
      {course.description && (
        <p
          style={{
            margin: 0,
            fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
            fontWeight: 500,
            fontSize: 18,
            lineHeight: '27px',
            color: '#888',
            whiteSpace: 'pre-wrap',
          }}
        >
          {course.description}
        </p>
      )}
    </div>
  )
}

/* ─── 학기 블록 ─── */
function SemesterBlock({ semester }: { semester: Semester }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 9,
      }}
    >
      {/* 학기 헤더 */}
      <p
        style={{
          margin: 0,
          fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          lineHeight: '27px',
          color: '#050505',
        }}
      >
        {semester.label}
      </p>
      {/* 과목 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 52 }}>
        {semester.courses.map((course, idx) => (
          <CourseItem key={idx} course={course} />
        ))}
      </div>
    </div>
  )
}

/* ─── 카테고리 섹션 ─── */
function CategorySection({ category }: { category: CurriculumCategory }) {
  return (
    <>
      {/* 섹션 구분선 */}
      <div
        style={{
          width: '100%',
          height: 1,
          background: '#E8E8E8',
          margin: '0 0 81px 0',
        }}
        aria-hidden
      />
      {/* 카테고리 컨테이너 */}
      <div
        style={{
          paddingLeft: 188,
          paddingRight: 188,
          paddingBottom: 81,
          display: 'flex',
          flexDirection: 'column',
          gap: 37,
        }}
      >
        {/* 카테고리 헤더 */}
        <p
          style={{
            margin: 0,
            fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
            fontWeight: 700,
            fontSize: 18,
            lineHeight: '27px',
            color: category.color,
          }}
        >
          {category.title}
        </p>

        {/* 학기 목록 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 95 }}>
          {category.semesters.map((semester, idx) => (
            <SemesterBlock key={idx} semester={semester} />
          ))}
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════
   메인 컴포넌트
══════════════════════════════════════════════════════ */
export interface CurriculumSectionProps {
  className?: string
}

export default function CurriculumSection({ className }: CurriculumSectionProps) {
  const [activeGrade, setActiveGrade] = useState<1 | 2 | 3>(1)
  const t = useTranslations('about.curriculum')

  const currentData = CURRICULUM_DATA.find((d) => d.grade === activeGrade)!

  // 카테고리/학기 레이블 번역 맵
  const categoryLabelMap: Record<string, string> = {
    '교양필수': t('required'),
    '전공필수': t('majorRequired'),
    '전공선택': t('majorElective'),
  }
  const semesterLabelMap: Record<string, string> = {
    '1학기': t('semester1'),
    '2학기': t('semester2'),
  }

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 1440,
        margin: '0 auto',
        background: '#fff',
      }}
      data-node-id="450:219"
    >
      {/* ══════════════════════════════════════════
          [1] 교육과정 아이콘 + 타이틀
          ══════════════════════════════════════ */}
      <AnimateOnScroll variant="fade-up">
        <div
          style={{
            paddingTop: 100,
            paddingBottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <CurriculumIcon />
          <p
            style={{
              margin: 0,
              fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
              fontWeight: 700,
              fontSize: 24,
              lineHeight: 'normal',
              color: '#444',
              textAlign: 'center',
            }}
          >
            {t('title')}
          </p>
        </div>
      </AnimateOnScroll>

      {/* ══════════════════════════════════════════
          [2] 학년 탭
          ══════════════════════════════════════ */}
      <AnimateOnScroll variant="fade-up" delay={80}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          paddingTop: 55,
          paddingBottom: 81,
        }}
        role="tablist"
        aria-label="학년 선택"
      >
        {([1, 2, 3] as const).map((grade) => {
          const isActive = activeGrade === grade
          return (
            <button
              key={grade}
              role="tab"
              aria-selected={isActive}
              aria-controls={`curriculum-panel-${grade}`}
              onClick={() => setActiveGrade(grade)}
              style={{
                padding: '12px 24px',
                border: 'none',
                cursor: 'pointer',
                overflow: 'hidden',
                background: isActive ? '#09F593' : '#B9B8B6',
                boxShadow: isActive
                  ? '0px 4px 10px 0px rgba(0,0,0,0.15)'
                  : 'none',
                transition: 'all 0.2s ease',
                fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
                fontWeight: 700,
                fontSize: 16,
                lineHeight: 'normal',
                color: '#151515',
                whiteSpace: 'nowrap',
              }}
            >
              {t('grade', { grade })}
            </button>
          )
        })}
      </div>
      </AnimateOnScroll>

      {/* ══════════════════════════════════════════
          [3] 커리큘럼 콘텐츠
          ══════════════════════════════════════ */}
      <div
        id={`curriculum-panel-${activeGrade}`}
        role="tabpanel"
        aria-label={t('grade', { grade: activeGrade })}
      >
        {currentData.categories.map((category, idx) => (
          <AnimateOnScroll key={`${activeGrade}-${category.title}`} variant="fade-up" delay={idx * 60} threshold={0.05}>
          <div>
            {idx > 0 && (
              /* 카테고리 간 구분선 */
              <div
                style={{
                  width: 'calc(100% - 376px)',
                  marginLeft: 188,
                  height: 1,
                  background: '#E8E8E8',
                  marginBottom: 81,
                }}
                aria-hidden
              />
            )}
            <div
              style={{
                paddingLeft: 188,
                paddingRight: 188,
                paddingBottom: idx < currentData.categories.length - 1 ? 0 : 81,
                display: 'flex',
                flexDirection: 'column',
                gap: 37,
              }}
            >
              {/* 카테고리 헤더 */}
              <p
                style={{
                  margin: 0,
                  fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                  lineHeight: '27px',
                  color: category.color,
                }}
              >
                {categoryLabelMap[category.title] ?? category.title}
              </p>

              {/* 학기 목록 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 95 }}>
                {category.semesters.map((semester, sIdx) => {
                  const translatedSemester = {
                    ...semester,
                    label: semesterLabelMap[semester.label] ?? semester.label,
                  }
                  return <SemesterBlock key={sIdx} semester={translatedSemester} />
                })}
              </div>
            </div>
          </div>
          </AnimateOnScroll>
        ))}
      </div>

      {/* 하단 구분선 */}
      <div
        style={{
          width: 'calc(100% - 376px)',
          marginLeft: 188,
          height: 1,
          background: '#E8E8E8',
          marginTop: 0,
        }}
        aria-hidden
      />
    </div>
  )
}
