# NWCN 프로젝트 설계 문서

> 뉴미디어콘텐츠과 공식 홈페이지  
> 작성일: 2026-05-20

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | NWCN (뉴미디어콘텐츠과 공식 홈페이지) |
| 목적 | 재학생·입시생·외부 방문자를 위한 학과 공식 허브 구축 |
| 개발 담당 | 이성효 (팀장) |
| 디자인 | 김윤서 (UI/UX), 민경 김 (그래픽) |
| 기획 | 박민지 |

### 일정
- **5월 29일** — 콘텐츠기획 및 디자인 마감
- **6월 10일** — 웹페이지 제작 완료
- **6월 17일** — 배포 완료

---

## 2. 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | Next.js 14 (App Router) | SSR/SSG 혼용 |
| 언어 | TypeScript | |
| 스타일링 | Tailwind CSS | 커스텀 디자인 토큰 적용 |
| 데이터베이스 | Supabase (PostgreSQL) | 인프라 방안 C |
| 이미지/파일 | Cloudflare R2 | CDN 포함 |
| 배포 | Vercel | 글로벌 엣지 |
| 패키지 매니저 | pnpm | |
| 코드 품질 | ESLint + Prettier | |

---

## 3. 프로젝트 폴더 구조

```
nwcn/
├── app/                          # Next.js App Router
│   ├── (main)/                   # 메인 레이아웃 그룹
│   │   ├── page.tsx              # 메인 홈 (Hero + 성과 + Footer)
│   │   ├── work/
│   │   │   ├── showcase/
│   │   │   │   └── page.tsx      # 학생 작품 전시
│   │   │   └── archive/
│   │   │       └── page.tsx      # 졸업전시 기록
│   │   ├── about/
│   │   │   ├── department/
│   │   │   │   └── page.tsx      # 학과 소개
│   │   │   ├── faculty/
│   │   │   │   └── page.tsx      # 교수진
│   │   │   ├── curriculum/
│   │   │   │   └── page.tsx      # 교육과정
│   │   │   └── lab/
│   │   │       └── page.tsx      # 시설 안내
│   │   ├── ninc/
│   │   │   ├── awards/
│   │   │   │   └── page.tsx      # 수상 성과
│   │   │   ├── project/
│   │   │   │   └── page.tsx      # 산학협력/해외교류
│   │   │   └── event/
│   │   │       └── page.tsx      # 이벤트·행사
│   │   ├── ncr-trend/
│   │   │   ├── latest/
│   │   │   │   └── page.tsx      # 최신 리포트
│   │   │   └── archive/
│   │   │       └── page.tsx      # 리포트 아카이브
│   │   └── info/
│   │       ├── admission/
│   │       │   └── page.tsx      # 입시 안내
│   │       ├── contact/
│   │       │   └── page.tsx      # 연락처
│   │       └── privacy/
│   │           └── page.tsx      # 개인정보처리방침
│   ├── layout.tsx                # 루트 레이아웃
│   └── globals.css               # 전역 스타일
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # 상단 고정 네비게이션
│   │   ├── Footer.tsx            # 푸터
│   │   └── MobileMenu.tsx        # 모바일 햄버거 메뉴
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── Tag.tsx
│   ├── sections/                 # 페이지별 섹션 컴포넌트
│   │   ├── HeroSection.tsx
│   │   ├── AwardsSection.tsx
│   │   └── ...
│   └── common/
│       ├── PageHeader.tsx        # 서브페이지 공통 헤더
│       └── FilterBar.tsx         # 필터 공통 컴포넌트
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts
├── types/
│   └── index.ts                  # 전역 타입 정의
├── public/
│   ├── fonts/                    # A2Z체 폰트 파일
│   └── images/
└── tailwind.config.ts
```

---

## 4. IA (정보 구조)

```
NWCN
├── [메인] 홈
│   ├── Hero 섹션
│   ├── 주요 성과·기사
│   └── Footer
├── WORK (작품·기록)
│   ├── SHOWCASE — 학생 작품 전시 (필터 + 조회수)
│   └── ARCHIVE — 졸업전시 타임라인
├── ABOUT (학과 소개)
│   ├── DEPARTMENT — 교육목표·방침·진로·자격증
│   ├── FACULTY — 교수진 프로필
│   ├── CURRICULUM — 학년별 이수 체계
│   └── LAB — 시설 안내 (추후 결정)
├── NINC (지금 뉴미디어콘텐츠과에서는)
│   ├── AWARDS — 수상 성과
│   ├── PROJECT — 산학협력·해외교류
│   └── EVENT — 이벤트·행사 (캘린더 뷰)
├── NCR TREND (트렌드 리포트)
│   ├── LATEST REPORT — 최신 리포트
│   └── ARCHIVE — 지난 리포트
└── INFO (안내)
    ├── ADMISSION — 입시 요강·FAQ
    ├── CONTACT — 연락처·오시는 길
    └── PRIVACY — 개인정보처리방침
```

---

## 5. 디자인 시스템

### 컬러 팔레트

| 이름 | 헥스 | 용도 |
|------|------|------|
| Main Green | `#09F593` | 강조, CTA, 활성 상태 |
| Sub Yellow-Green | `#E3E94D` | 서브 강조, 호버 |
| Black | `#0A0A0A` | 배경 (다크 모드 기본) |
| White | `#FFFFFF` | 텍스트, 카드 배경 |
| Gray 600 | `#6B7280` | 보조 텍스트 |
| Gray 100 | `#F3F4F6` | 라이트 배경 |

### 폰트

| 폰트 | 용도 | 예시 |
|------|------|------|
| A2Z체 | 브랜딩·헤드라인 | Hero 슬로건, 섹션 인트로 |
| Pretendard | 본문·UI | 메뉴, 카드 내용, 캡션 |

### Tailwind 커스텀 토큰 (tailwind.config.ts)

```ts
colors: {
  nwcn: {
    green: '#09F593',
    yellow: '#E3E94D',
    dark: '#0A0A0A',
  }
},
fontFamily: {
  brand: ['A2Z', 'sans-serif'],
  body: ['Pretendard', 'sans-serif'],
}
```

---

## 6. 데이터베이스 스키마 (Supabase)

### showcase_works (WORK/SHOWCASE)
```sql
id            uuid PRIMARY KEY
title         text NOT NULL
author        text NOT NULL
description   text
thumbnail_url text
tech_stack    text[]         -- 필터용 태그 배열
view_count    integer DEFAULT 0
year          integer
created_at    timestamptz DEFAULT now()
```

### archive_exhibitions (WORK/ARCHIVE)
```sql
id            uuid PRIMARY KEY
year          integer NOT NULL
title         text NOT NULL
poster_url    text
description   text
```

### faculty (ABOUT/FACULTY)
```sql
id            uuid PRIMARY KEY
name          text NOT NULL
title         text
email         text
photo_url     text
education     text[]
career        text[]
sort_order    integer
```

### awards (NINC/AWARDS)
```sql
id            uuid PRIMARY KEY
year          integer NOT NULL
competition   text NOT NULL
award_name    text
winner        text
team_members  text[]
description   text
```

### ncr_reports (NCR TREND)
```sql
id            uuid PRIMARY KEY
title         text NOT NULL
type          text            -- 'editorial' | 'card_news' | 'trend'
thumbnail_url text
external_url  text            -- NCR 블로그 링크
season        text
published_at  timestamptz
```

### events (NINC/EVENT)
```sql
id            uuid PRIMARY KEY
title         text NOT NULL
type          text            -- '특강' | '워크숍' | '캠퍼스투어' 등
start_date    date NOT NULL
end_date      date
location      text
description   text
```

---

## 7. 네비게이션 구조

### 상단 고정 메뉴 (GNB)
```
[NWCN 로고]   WORK   ABOUT   NINC   NCR TREND   INFO
```

### 드롭다운 서브메뉴
- **WORK**: SHOWCASE · ARCHIVE
- **ABOUT**: DEPARTMENT · FACULTY · CURRICULUM · LAB
- **NINC**: AWARDS · PROJECT · EVENT
- **NCR TREND**: LATEST REPORT · ARCHIVE
- **INFO**: ADMISSION · CONTACT · PRIVACY

---

## 8. Git 브랜치 전략

```
main          ← 배포 브랜치 (Vercel 자동 배포)
├── develop   ← 개발 통합 브랜치
│   ├── feature/setup-project
│   ├── feature/design-system
│   ├── feature/main-page
│   ├── feature/work-pages
│   ├── feature/about-pages
│   ├── feature/ninc-pages
│   ├── feature/ncr-trend-pages
│   └── feature/info-pages
```

### 커밋 컨벤션 (Angular)
```
feat: 새로운 기능 추가
fix: 버그 수정
style: 스타일 변경
refactor: 코드 리팩토링
chore: 빌드·설정 변경
docs: 문서 수정
```

---

## 9. 인프라 구성 (방안 C — Vercel + Supabase)

| 구성 요소 | 서비스 | 월 비용 |
|-----------|--------|---------|
| 웹 서버 | Vercel Pro | ₩28,000 |
| 데이터베이스 | Supabase Pro | ₩35,000 |
| 이미지/파일 | Cloudflare R2 | ≈ ₩0 |
| 영상 | YouTube 임베드 | 무료 |
| 도메인 | — | ₩1,500 |
| **월 합계** | | **₩63,000~** |

> 인수인계 편의성과 자동화된 보안 관리를 고려해 방안 C 채택

---

## 10. 개발 진행 순서

1. **[완료] 설계 문서 작성**
2. Next.js 프로젝트 초기 설정 + Git 설정
3. 디자인 시스템 & 공통 컴포넌트
4. 레이아웃 (Header + Footer)
5. 메인 페이지
6. WORK 페이지 (SHOWCASE, ARCHIVE)
7. ABOUT 페이지 (4개 서브)
8. NINC 페이지 (3개 서브)
9. NCR TREND 페이지 (2개 서브)
10. INFO 페이지 (3개 서브)
11. Figma 디자인 연동 & 픽셀 퍼펙트
12. Vercel 배포 + 최종 점검
