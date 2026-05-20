<<<<<<< HEAD
# NWCN — 뉴미디어콘텐츠과 공식 홈페이지

동아방송예술대학교 뉴미디어콘텐츠과 공식 웹사이트입니다.

## 시작하기

### 1. 의존성 설치

```bash
# npm
npm install

# 또는 pnpm (권장)
pnpm install
```

### 2. 환경 변수 설정

```bash
cp .env.local.example .env.local
# .env.local 파일을 열어 Supabase 키를 입력하세요
```

### 3. 개발 서버 실행

```bash
npm run dev
# 또는
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열면 확인할 수 있습니다.

---

## Git 초기화 (최초 1회)

```bash
git init
git add .
git commit -m "chore: Next.js 14 프로젝트 초기 설정

- App Router 기반 전체 라우팅 구조 구성
- 디자인 시스템 구축 (컬러 토큰, 폰트, 공통 컴포넌트)
- 전체 페이지 스켈레톤 구현 (WORK/ABOUT/NINC/NCR TREND/INFO)
- Supabase SSR 클라이언트 설정"
```

---

## 프로젝트 구조

```
nwcn/
├── app/                  # Next.js App Router 페이지
│   ├── page.tsx          # 메인 홈
│   ├── work/             # 작품·기록
│   ├── about/            # 학과 소개
│   ├── ninc/             # 지금 뉴미디어콘텐츠과에서는
│   ├── ncr-trend/        # 트렌드 리포트
│   └── info/             # 안내
├── components/
│   ├── layout/           # Header, Footer, MobileMenu
│   ├── ui/               # Button, Badge
│   ├── common/           # PageHeader, FilterBar
│   └── sections/         # 페이지별 섹션 컴포넌트
├── lib/
│   ├── supabase/         # Supabase 클라이언트
│   └── utils.ts
└── types/
    └── index.ts          # 전역 타입 정의
```

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## 컬러 시스템

| 토큰 | 값 | 용도 |
|------|----|------|
| `nwcn-green` | `#09F593` | 메인 컬러, CTA |
| `nwcn-yellow` | `#E3E94D` | 서브 컬러, 호버 |
| `nwcn-dark` | `#0A0A0A` | 배경 |

## 폰트

- **A2Z체** — 브랜딩 헤드라인 (`font-brand`)
- **Pretendard** — 본문 및 UI (`font-body`)
