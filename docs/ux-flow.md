# NWCN 웹사이트 UX 흐름 문서

> 최종 업데이트: 2026-05-20  
> 프레임워크: Next.js 14 (App Router) + TypeScript + Tailwind CSS  
> 디자인 소스: Figma — `qsivnPCWhkDHrJZzuHpXWZ`

---

## 1. 전체 페이지 구조

```
/ (홈)
├── NavBar (transparent overlay on Hero)
├── HeroSection — 300vh 스크롤 애니메이션
├── WhatIsSection — 학과 소개 영상
├── NincSection — Now In NewCon 슬라이드
├── NcrTrendSection — 최신 트렌드 카드
└── HomeFooter

/work
├── /work/showcase — 학생 작품 전시 (필터 기능)
└── /work/archive — 졸업전시 기록 (타임라인)

/about
├── /about/department — 학과 소개
├── /about/faculty — 교수진
├── /about/curriculum — 교육과정
└── /about/lab — 시설 안내

/ninc
├── /ninc/awards — 수상 성과
├── /ninc/project — 산학협력/해외교류
└── /ninc/event — 이벤트·행사

/ncr-trend
├── /ncr-trend/latest — 최신 리포트
└── /ncr-trend/archive — 리포트 아카이브 (시즌 필터)

/info
├── /info/admission — 입시 안내
├── /info/contact — 문의 및 오시는 길
└── /info/privacy — 개인정보처리방침
```

---

## 2. 레이아웃 아키텍처

### 홈 페이지 (/)
```
RootLayout (html + body, globals.css)
└── page.tsx
    ├── <NavBar transparent />        ← fixed overlay, 스크롤시 백그라운드 전환
    ├── <HeroSection scrollHeight="300vh" />  ← 스크롤 애니메이션 컨테이너
    ├── <WhatIsSection />
    ├── <NincSection />
    ├── <NcrTrendSection />
    └── <HomeFooter />
```

### 서브 페이지 (모든 non-home 페이지)
```
RootLayout
└── page.tsx
    └── <SubPageLayout>          ← NavBar(white) + HomeFooter 래핑
        ├── <PageHeader />       ← 카테고리명 + 제목 + 설명
        └── <section>...</section>
```

---

## 3. 컴포넌트 계층 및 Props 흐름

### NavBar

```
NavBar (transparent?: boolean)
├── [transparent=true] — HeroSection 위 fixed overlay, 스크롤시 bg-white 전환
└── [transparent=false (default)] — 항상 bg-white, 64px fixed top

상태:
- scrolled: boolean — 스크롤 감지로 bg 전환
- menuOpen: boolean — 모바일 드로어 제어
- activeDropdown: string | null — 현재 열린 드롭다운 메뉴

드롭다운 메뉴 구조:
- WORK: Showcase, Archive
- ABOUT: 학과소개, 교수진, 교육과정, 시설안내
- NINC: 수상성과, 프로젝트, 이벤트
- NCR TREND: 최신리포트, 아카이브
- INFO: 입시안내, 문의·오시는길
```

### HeroSection

```
HeroSection (scrollHeight?: string)
├── 300vh 컨테이너 (스크롤 캡처)
└── sticky top-0 h-screen (시각 영역)
    ├── 좌 패널: conic-gradient(green) → translateX(-panelOffset%)
    ├── 우 패널: reverse gradient → translateX(+panelOffset%)
    └── 슬라이드 배너 (#151515) — 하단 페이드인

애니메이션 로직:
- scrollProgress = scrollY / (scrollHeight - viewportHeight)
- animProgress = easeInOut(min(progress / 0.85, 1))
- panelOffset = animProgress * 50 (%)
- RAF-based scroll listener (역방향 재생 지원)
```

### SubPageLayout

```tsx
SubPageLayout({ children })
→ <NavBar /> + <main style={{ paddingTop: '64px' }}>{children}</main> + <HomeFooter />
```

---

## 4. 공통 컴포넌트 시스템 (Figma node: 88:41)

### Button (components/ui/Button.tsx)
| Variant | 배경 | 텍스트 | 호버 bg | 호버 텍스트 |
|---------|------|--------|---------|------------|
| primary | #09F593 | #151515 | #133728 | #09F593 |
| secondary | #E3E94D | #050505 | #1D1E00 | #E3E94D |
| ghost | 투명 (border: #050505) | #050505 | #cacaca | white |
| outline | (secondary 동일, 하위호환) | | | |

Props: `variant`, `size (sm/md/lg)`, `href?`, `external?`, `children`

### Badge (components/ui/Badge.tsx)
| Variant | 배경 | 텍스트 |
|---------|------|--------|
| new / green | #09F593 | #050505 |
| hot / yellow | #E3E94D | #050505 |
| number / outline / gray | #151515 | white |

### Tag (components/base/Tag.tsx) — 신규 추가
| Type | 배경 | 텍스트 | 크기 | 그림자 |
|------|------|--------|------|--------|
| primary | #09F593 | #050505 | 12px Bold | — |
| secondary | #E3E94D | #050505 | 12px Bold | — |
| neutral | #e0e0e0 | #050505 | 12px Bold | — |
| dark | #151515 | white | 12px Bold | — |
| talks | #09F593 | #050505 | 16.88px Medium | drop-shadow |
| contents | #E3E94D | #050505 | 16.88px Medium | drop-shadow |

---

## 5. 페이지별 UX 흐름

### 홈 (/)
1. 진입 → NavBar transparent overlay 표시
2. 스크롤 시작 → HeroSection sticky, 좌우 패널 슬라이드 애니메이션
3. 패널 완전 열림 → 슬라이드 배너 (#151515) 하단 페이드인
4. 300vh 완료 → 일반 스크롤 재개, WhatIsSection 노출
5. WhatIsSection → 학과 소개 영상 + 슬로건
6. NincSection → "Now In NewCon" 가로 스크롤 카드
7. NcrTrendSection → 최신 트렌드 (Talks/Contents 태그 사용)
8. HomeFooter → 연락처, SNS, 개인정보처리방침

### WORK/Showcase (/work/showcase)
- 진입 → SubPageLayout (NavBar + Footer)
- 필터바: 전체 / Video / Graphic / Web / Motion / Photo / AI
- 필터 클릭 → ShowcaseGrid 갱신 (클라이언트 상태)

### WORK/Archive (/work/archive)
- 타임라인 구조: 연도별 졸업전시 나열
- TODO: Supabase에서 실제 데이터 fetch

### ABOUT/* (/about/department, faculty, curriculum, lab)
- PageHeader 상단 → 내용 섹션
- Faculty: 교수 프로필 카드 (사진 + 이름/직위/이메일/학력/경력)
- Curriculum: 학년별 학기별 과목 그리드

### NINC/Awards (/ninc/awards)
- 연도별 수상 내역 그룹핑
- Badge variant='new' (수상등급 표시)

### NCR-TREND (/ncr-trend/*)
- Latest: 최신 리포트 카드 그리드 (외부 링크)
- Archive: 시즌 필터 + 리스트 (클라이언트 상태)

### INFO (/info/admission, contact, privacy)
- Admission: FAQ + 입학처 버튼 (Button variant='primary')
- Contact: 연락처 + 지도 영역 (placeholder)
- Privacy: 개인정보처리방침 섹션 나열

---

## 6. 디자인 토큰

```ts
// tailwind.config.ts
nwcn: {
  green: '#09F593',        // brand primary
  'green-dark': '#07C274', // hover
  'green-darker': '#058F56',
  yellow: '#E3E94D',       // brand secondary
  dark: '#151515',         // background dark (hero, footer)
  'dark-2': '#1A1A1A',
  'text-default': '#050505',
  'text-muted': '#323131',
  'text-sub': '#B9B8B6',
}

// Figma hover 토큰 (inline)
Primary hover bg: #133728
Secondary hover bg: #1D1E00
Ghost hover bg: #cacaca
```

---

## 7. 폰트 시스템

| 역할 | 클래스 | 폰트 | 사용처 |
|------|--------|------|--------|
| 브랜드 헤딩 | `font-brand` | A2Z | 섹션 헤더 (NCR Trend, Now In NewCon, What is NewCon) |
| 본문 | `font-body` | Pretendard Variable | 모든 본문, UI 컴포넌트 |

---

## 8. 변경 이력

| 날짜 | 변경 내용 |
|------|---------|
| 2026-05-20 | 프로젝트 초기 구조 설계 및 전체 페이지 스캐폴딩 |
| 2026-05-20 | 디자인 시스템 화이트 테마로 전환 (dark → white bg) |
| 2026-05-20 | NavBar BASE 컴포넌트 구현 (Figma 376:517, transparent/white 모드) |
| 2026-05-20 | HeroSection 스크롤 애니메이션 구현 (300vh sticky, RAF-based, 역방향 지원) |
| 2026-05-20 | WhatIsSection, NincSection, NcrTrendSection, HomeFooter BASE 컴포넌트 구현 |
| 2026-05-20 | SubPageLayout 생성, 모든 서브 페이지(13개) 적용 |
| 2026-05-20 | app/page.tsx → BASE 컴포넌트 통합 |
| 2026-05-20 | 공통 컴포넌트 Figma 연동: Button(Figma 91:58), Badge(91:71), Tag(91:79) 신규 |
| 2026-05-20 | NcrTrendSection에서 Tag BASE 컴포넌트 사용으로 리팩터링 |
