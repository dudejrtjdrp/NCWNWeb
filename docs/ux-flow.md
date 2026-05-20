# NWCN 웹사이트 UX 흐름 문서

> 최종 업데이트: 2026-05-21  
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

### NINC BASE 컴포넌트 (Figma node: 280:*)

#### NincHeroBanner (components/base/NincHeroBanner.tsx) — Figma 280:401/537
```
Props: pageName, heroImageUrl, tagline (ReactNode), className?

레이아웃:
- 높이 725px, 전체 너비
- 이미지 레이어: absolute fill, object-cover
- 상단 그라디언트: rgba(40,76,61,0) → #303030 (높이 201px)
- 하단 그라디언트: rgba(40,76,61,0) → #303030 (높이 640px, top 85px)
- 텍스트 영역: absolute bottom-[75px] px-[123px], flex justify-between items-end
  - pageName: A2Z Bold 80px, white, 좌측
  - tagline: Pretendard 34px, white, 우측 (ReactNode — 색상 강조 지원)
```

#### NincCardItem (components/base/NincCardItem.tsx) — Figma 280:410/428/446
```
Props: thumbnail?, caption, subCaption?, badge? (ReactNode), trophyIconUrl

구조:
- relative 컨테이너
- 트로피 아이콘: absolute top=-3px, left=36px, w=35px, h=74px (카드 위 오버랩)
- 이미지 영역: bg-[#efefef], h=209px — thumbnail 없으면 회색 박스
  - badge: absolute top-3 right-3 (우상단 오버랩)
- 캡션 영역: bg-[#f9f9f9], h=48px, mt=18px
  - caption: Pretendard Medium 14px, #323131, flex-1 truncate
  - subCaption: Pretendard Normal 12px, #B9B8B6, 우측 고정
```

#### NincCardGrid (components/base/NincCardGrid.tsx) — Figma 280:409
```
'use client' (onSearchChange, onPageChange 이벤트 전달)

Props: items, searchValue, onSearchChange, searchPlaceholder?,
       page, totalPages, onPageChange, sectionTitle, emptyMessage?

레이아웃:
- bg-white 전체 래퍼
- 섹션 타이틀: Pretendard Light 24px, black, 중앙 정렬, pt-86px pb-28px
- 검색바: max-w-1011px, h-47px, border-black rounded-[229px], pb-100px
- 그리드 영역: max-w-1440px mx-auto px-87px
  - 3열 그리드: grid-cols-3, gap-x-35px, gap-y-145px
  - 좌측 장식(Vector2): absolute left-0, top-203px, rotate-180, 247×239px
  - 우측 장식(Vector3): absolute right-0, top-647px, scaleY(-1), 247×239px
  - 빈 상태: py-24 중앙 메시지

ASSETS (7일 만료 — TODO /public/images 교체):
- trophy: Figma asset 66d649d2-...
- leftDecor: Figma asset 6fea072c-...
- rightDecor: Figma asset 26854bba-...
```

#### NincPagination (components/base/NincPagination.tsx)
```
'use client' (onPageChange 이벤트 전달)
totalPages <= 1이면 null 반환

버튼 스펙:
- 크기: w-9 h-9 (36×36px), rounded-full
- 활성 페이지: bg-nwcn-text-default (#050505), text-white
- 비활성: border border-nwcn-text-default, text-nwcn-text-default
  hover: bg-nwcn-text-default, text-white
- 이전/다음: ← / → 텍스트, disabled opacity-30
```

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

### ABOUT/Department (/about/department) — Figma 291:76

```
UX 흐름:
1. 진입 → SubPageLayout (NavBar fixed + HomeFooter)
2. HeroArea: "ABOUT" 타이틀(우측, Pretendard ExtraBold 56px) + 대형 NWCN 그린 로고 이미지
3. AboutSubNav 서브 탭: DEPARTMENT(활성) | FACULTY | CURRICULLIM | LAB
   - 탭 클릭 → 해당 페이지로 라우팅 (Link)
   - 활성 탭: Bold + 하단 3px 라인 / 비활성 탭: Light #888
4. 학과 소개 섹션:
   - 하향 화살표(rotate-180) → 섹션 진입 인디케이터
   - SymbolCard(히어로 이미지 606×320px)
   - 소개 문구: 일반 텍스트 + 그라데이션 강조 문구(#00844D → #09F593)
5. 교육 목표 섹션:
   - 번호 01~05 (Nova Slim 76px, nwcn-green)
   - 지그재그 레이아웃(홀수: 좌, 짝수: 우)
   - 배경: 대각선 벡터 패턴(opacity-25)
6. 세부 교육 목표 섹션:
   - 3개 이미지 카드(378×283px, object-cover)
7. 교육방침 섹션:
   - 이미지1: 우측 다크 그라데이션 + 우측 정렬 텍스트(2줄)
   - 이미지2: 좌측 다크 그라데이션 + 좌측 정렬 텍스트(3줄)
8. 졸업 후 진로 섹션:
   - 배경 유기적 패턴 이미지(opacity-30)
   - 기울어진 텍스트 3개("뉴미디어콘텐츠과는", "졸업 후", "무슨 일을 하나요?")
   - 글래스모피즘 태그 14개 (flex-wrap)
     - 스타일: backdrop-blur + rgba(9,245,147,0.06) + inset shadow (#46F5AC 라인)
9. 자격증 섹션 (CertificateSlider):
   - 가로형 scroll-snap 슬라이드
   - 카드: 461×582px 회색 배경 + 자격증명 텍스트(Bold 24px)
   - 좌우 이전/다음 버튼 (원형 버튼, backdrop-blur)
   - 마우스 드래그 스크롤 지원
   - 기본 자격증 8종: 웹디자인기능사, 정보처리산업기사,
     멀티미디어콘텐츠제작전문가, GTQ, 컴퓨터그래픽스운용기능사,
     방송통신기능사, ACA, 영상편집기능사

컴포넌트 구조:
  app/about/department/page.tsx
    └── SubPageLayout
          └── DepartmentSection  (components/base/DepartmentSection.tsx)
                ├── HeroArea (ABOUT + NWCN large logo)
                ├── AboutSubNav  (components/base/AboutSubNav.tsx)
                ├── IntroSection (arrow + SymbolCard + 소개문)
                ├── GoalSection (01~05 지그재그)
                ├── DetailGoalSection (3카드)
                ├── PolicySection (2 이미지 배너)
                ├── CareerSection (글래스모피즘 태그)
                └── CertSection → CertificateSlider  (components/base/CertificateSlider.tsx)

Props 인터페이스:
  DepartmentSection: className?
  AboutSubNav: className?
  CertificateSlider: certificates?: Certificate[], className?
  Certificate: { id, name, imageSrc? }
```

### ABOUT/Faculty (/about/faculty) — Figma 427:889

```
UX 흐름:
1. 진입 → SubPageLayout (NavBar fixed + HomeFooter)
2. HeroArea: "ABOUT" 타이틀(우측, Pretendard ExtraBold 56px) + 대형 NWCN 그린 로고 이미지
   (Department 페이지와 동일한 히어로 패턴)
3. AboutSubNav 서브 탭: DEPARTMENT | FACULTY(활성) | CURRICULLIM | LAB
   - 탭 클릭 → 해당 페이지로 라우팅 (Link)
   - 활성 탭: Bold + 하단 3px 라인 / 비활성 탭: Light #888
4. 교수진 섹션:
   - 섹션 진입 화살표 인디케이터 (rotate-180)
   - "교수진" 라벨 (Pretendard Bold 24px, #444)
   - 3열 플렉스 그리드 (gap-[41px]), 교수 6인 카드
5. FacultyCard 인터랙션:
   - hover → scale(1.04) + drop-shadow 강화 + 어두운 그라디언트 오버레이 노출
   - 오버레이: 이름(한글) + 직급 + "자세히 보기" 버튼 표시
   - click → /about/faculty/[id] 상세 페이지 이동
6. 조교 섹션:
   - 섹션 진입 화살표 인디케이터
   - "조교" 라벨
   - 1개 카드 (중앙 정렬, 노란 배경 #E3E94D)

FacultyCard 디자인 스펙:
- 크기: 290×379px, rounded-[5.21px], drop-shadow
- colorVariant 3종:
  - green-solid    : bg #09F593, 이름 gradient black→#007042
  - green-gradient : bg #00FF95→#007E4A, 이름 gradient white→#00FF95
  - yellow         : bg #E3E94D (조교), 이름 gradient black→#5A5E00
- 좌측 수직 이름: rotate-90, Pretendard ExtraBold 36.5px, bg-clip-text gradient
- 우측 상단 화살표 아이콘: inset[2.64%_5.52%_82.87%_74.48%], -scale-x-100

교수 상세 페이지 (/about/faculty/[id]):
- SubPageLayout 사용
- 교수 사진 (카드 디자인 유지) + 정보 영역 (2열 레이아웃)
- 한글 이름 + 영문 이름 + 직급 배지 + 이메일
- 교수님의 한마디 (border-l-4 border-nwcn-green 인용문 스타일)
- 학력/경력 (데이터 있을 경우 표시)
- "교수진으로 돌아가기" 뒤로가기 링크

컴포넌트 구조:
  app/about/faculty/page.tsx
    └── SubPageLayout
          └── FacultySection  (components/base/FacultySection.tsx)
                ├── HeroArea (ABOUT + NWCN large logo)
                ├── AboutSubNav  (components/base/AboutSubNav.tsx)
                ├── 교수진 섹션 → FacultyCard ×6  (components/base/FacultyCard.tsx)
                └── 조교 섹션  → FacultyCard ×1

  app/about/faculty/[id]/page.tsx
    └── SubPageLayout
          └── FacultyDetailPage (인라인)
                ├── 뒤로 가기 링크
                ├── 교수 사진 카드 (290×379 Figma 디자인 유지)
                ├── 이름/직급/이메일
                ├── 교수님의 한마디 (blockquote)
                └── 학력/경력 (optional)

Props 인터페이스:
  FacultySection: className?
  FacultyCard:
    id: string              — 라우팅 ID
    nameEn: string          — 영문 이름 (수직 텍스트)
    nameKo: string          — 한글 이름 (호버 오버레이 + 상세 페이지)
    role: '교수' | '조교'
    photoUrl?: string       — 사진 URL (없으면 이니셜 플레이스홀더)
    colorVariant?: FacultyCardVariant
    className?: string

데이터 출처:
  FACULTY_LIST (components/base/FacultySection.tsx)
  → TODO: Supabase fetch로 교체 (faculty 테이블)
```

### ABOUT/* (/about/curriculum, lab)
- Curriculum: 학년별 학기별 과목 그리드
- Lab: 시설 안내 이미지 + 설명

### NINC/Awards (/ninc/awards) — Figma 280:384
```
UX 흐름:
1. 진입 → NincHeroBanner (pageName="AWARDS", 히어로 이미지 + 태그라인)
   - 태그라인: "당신의 노력이 [빛나는: #09F593 Bold] 순간"
2. 섹션 타이틀 "AWARDS" 표시
3. 검색바: 대회명, 수상 등급, 수상자 검색 — 실시간 필터링
4. 카드 그리드: 3열 × 3행 = 9개/페이지
   - caption: 대회명
   - subCaption: 연도 (숫자)
   - badge: Badge 컴포넌트 (수상등급)
     - 대상/금상 → variant='new' (green)
     - 최우수상/우수상 → variant='hot' (yellow)
     - 장려상 → variant='number' (dark)
5. 검색 결과 없으면 빈 상태 메시지
6. 페이지네이션: totalPages > 1일 때 표시

상태 (awards/page.tsx TARGET):
- searchQuery: 필터링 문자열
- currentPage: 1-based 페이지 번호 (검색 변경 시 1로 초기화)
- PAGE_SIZE = 9
```

### NINC/Project (/ninc/project) — Figma 280:520
```
UX 흐름:
1. 진입 → NincHeroBanner (pageName="PROJECT", 히어로 이미지 + 태그라인)
   - 태그라인: "학과를 넘어 [현장: 그라디언트 E3E94D→09F593]과, [세계: 그라디언트 09F593→E3E94D]로"
   - 그라디언트 적용: WebkitBackgroundClip text, WebkitTextFillColor transparent
2. 섹션 타이틀 "PROJECT" 표시
3. 검색바: 프로젝트명, 파트너, 유형 검색 — 실시간 필터링
4. 카드 그리드: 3열 × 3행 = 9개/페이지
   - caption: 프로젝트 제목
   - subCaption: "파트너 · 연도"
   - badge: Tag 컴포넌트 (협력 유형)
     - industry(산학협력) → type='primary' (green)
     - international(해외교류) → type='secondary' (yellow)
5. 검색 결과 없으면 빈 상태 메시지
6. 페이지네이션: totalPages > 1일 때 표시

상태 (project/page.tsx TARGET):
- searchQuery: 필터링 문자열 (title/partner/description/type 레이블 대상)
- currentPage: 1-based 페이지 번호 (검색 변경 시 1로 초기화)
- PAGE_SIZE = 9
```

### 404 Not Found (`/*` — 잘못된 경로)

Figma 노드 ID: `376:1202` / 파일: `qsivnPCWhkDHrJZzuHpXWZ`

```
UX 흐름:
1. 진입 → 잘못된 URL → Next.js App Router가 app/not-found.tsx 렌더링
2. 화면 표시:
   - 배경 #f0f0f0 (밝은 회색)
   - 상단 NWCN 로고 (홈 링크)
   - 대형 "404" (nwcn-green, brand font)
   - "PAGE NOT FOUND!" (Pretendard Bold 48px)
   - 안내 문구 2줄 (Pretendard Regular 20px)
3. 탈출 경로 두 가지:
   - [메인으로] 버튼 (primary) → href="/" → 홈으로 이동
   - [← 이전으로] 버튼 (ghost) → router.back() → 히스토리 뒤로 이동

컴포넌트 구조:
  app/not-found.tsx  ('use client')
    └── NotFound404Page  (components/base/NotFound404Page.tsx)
          ├── NWCN 로고 링크
          ├── 404 텍스트 (nwcn-green)
          ├── PAGE NOT FOUND! 제목
          ├── 설명 문구
          └── [메인으로] [← 이전으로] 버튼 2개

Props 인터페이스 (NotFound404PageProps):
  onBack?: () => void   — 이전 버튼 핸들러
  homeHref?: string     — 메인 버튼 링크 (기본: "/")
```

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
| 2026-05-21 | NINC BASE 컴포넌트 4종 신규 생성: NincHeroBanner, NincCardItem, NincCardGrid, NincPagination |
| 2026-05-21 | ninc/awards/page.tsx — TARGET 리팩터링: NincHeroBanner+NincCardGrid 통합, 검색+페이지네이션 상태 관리 |
| 2026-05-21 | ninc/project/page.tsx — TARGET 리팩터링: 그라디언트 태그라인, Tag 컴포넌트 배지 연동 |
| 2026-05-21 | 404 Not Found 페이지 — Figma 376:1202 디자인 적용: NotFound404Page BASE 컴포넌트 생성, not-found.tsx 리팩터링 (이전으로/메인으로 버튼, #f0f0f0 배경, 로고 상단 배치) |
| 2026-05-21 | About/Department 페이지 — Figma 291:76 디자인 전면 구현: DepartmentSection, AboutSubNav, CertificateSlider BASE 컴포넌트 신규 생성. ABOUT 히어로, 서브탭, 교육목표(01~05 지그재그), 세부교육목표(3카드), 교육방침(2 이미지), 졸업 후 진로(글래스모피즘 태그 14종), 자격증(가로형 슬라이드) 구현. department/page.tsx TARGET 리팩터링 완료. |
| 2026-05-21 | About/Faculty 교수진 페이지 — Figma 427:889 디자인 구현: FacultyCard, FacultySection BASE 컴포넌트 신규 생성. 교수 카드 3종 colorVariant(green-solid/green-gradient/yellow), 호버 오버레이 애니메이션(scale+오버레이 "자세히 보기"), 교수 6인+조교 1인 그리드 레이아웃. /about/faculty/[id] 상세 페이지(사진+이름+한마디+학력/경력) 신규 추가. faculty/page.tsx TARGET 리팩터링 완료. |
