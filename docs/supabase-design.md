# Supabase DB & API 설계서

> **프로젝트**: 동아방송예술대학교 뉴미디어콘텐츠과 (NWCNew)  
> **환경**: Dev — Supabase (PostgreSQL + Storage)  
> **작성 기준**: 현재 코드베이스 기준 (2026-05-27)

---

## 목차

1. [데이터 모델 전체 구조](#1-데이터-모델-전체-구조)
2. [테이블 상세 스키마](#2-테이블-상세-스키마)
3. [Storage 버킷 구조](#3-storage-버킷-구조)
4. [RLS 정책](#4-rls-정책)
5. [데이터 fetching 패턴](#5-데이터-fetching-패턴)
6. [API Routes](#6-api-routes)
7. [Home 섹션 서버 연동 & Fallback 전략](#7-home-섹션-서버-연동--fallback-전략)
8. [SQL DDL (실행 순서 포함)](#8-sql-ddl-실행-순서-포함)

---

## 1. 데이터 모델 전체 구조

```
NWCNew
├── WORK
│   ├── showcase_works        학생 작품 쇼케이스
│   └── exhibitions           졸업전시 아카이브
│
├── ABOUT
│   ├── faculty               교수진·조교 정보
│   └── curriculum            교육과정(학년/학기별 과목)
│
├── NINC  (Now In NewCon)
│   ├── awards                공모전·수상
│   ├── projects              산학협력·해외교류 프로젝트
│   ├── events                특강·워크숍·캠퍼스투어
│   └── ninc_home_cards       홈 NincSection 슬라이드 이미지 ★
│
└── NCR TREND
    ├── ncr_reports           아티클 본문 (editorial/trend/card_news)
    └── ncr_report_relations  아티클 간 "관련 아티클" 연결 (junction)
```

---

## 2. 테이블 상세 스키마

### 2-1. `faculty` — 교수진·조교

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | `text` PK | 영문 slug (예: `lee-ju-heon`) |
| name_ko | `text` NOT NULL | 한글 이름 |
| name_en | `text` NOT NULL | 영문 이름 (카드 표기용) |
| role | `text` NOT NULL | `'교수'` \| `'조교'` |
| photo_url | `text` | Storage URL (nullable) |
| color_variant | `text` NOT NULL | `'green-solid'` \| `'green-gradient'` \| `'yellow'` |
| quote | `text` | 한 줄 코멘트 |
| email | `text` | 이메일 (nullable) |
| education | `text[]` | 학력 배열 |
| career | `text[]` | 경력 배열 |
| sort_order | `int2` DEFAULT 0 | 표시 순서 |
| created_at | `timestamptz` DEFAULT now() | |

> **Storage**: `faculty-photos/{id}.png`  
> **현재 상태**: `lib/faculty-data.ts` 정적 데이터 → Supabase로 이전 예정

---

### 2-2. `curriculum` — 교육과정

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | `uuid` PK DEFAULT gen_random_uuid() | |
| year | `int2` NOT NULL | 학년 (1\|2\|3\|4) |
| semester | `int2` NOT NULL | 학기 (1\|2) |
| course_name | `text` NOT NULL | 과목명 |
| credits | `int2` NOT NULL | 학점 |
| category | `text` NOT NULL | 분류 (전공필수/전공선택/교양 등) |
| sort_order | `int2` DEFAULT 0 | 학년·학기 내 정렬 |

---

### 2-3. `showcase_works` — 학생 작품 쇼케이스

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | `uuid` PK | |
| title | `text` NOT NULL | 작품 제목 |
| author | `text` NOT NULL | 작성자 이름 |
| description | `text` | 작품 설명 (nullable) |
| thumbnail_url | `text` | Storage URL (nullable) |
| tech_stack | `text[]` DEFAULT '{}' | 기술/장르 태그 (Video, Graphic 등) |
| view_count | `int4` DEFAULT 0 | 조회수 |
| year | `int2` NOT NULL | 작품 연도 |
| is_featured | `bool` DEFAULT false | 피처드 여부 |
| created_at | `timestamptz` DEFAULT now() | |

> **Storage**: `work-thumbnails/{year}/{id}.webp`

---

### 2-4. `exhibitions` — 졸업전시 아카이브

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | `uuid` PK | |
| year | `int2` NOT NULL UNIQUE | 전시 연도 |
| title | `text` NOT NULL | 전시 제목 (예: `FLUX — 흐름과 변화`) |
| theme | `text` | 전시 테마 설명 (nullable) |
| description | `text` | 부가 설명 (nullable) |
| poster_url | `text` | Storage URL (nullable) |
| created_at | `timestamptz` DEFAULT now() | |

> **Storage**: `exhibition-posters/{year}.webp`

---

### 2-5. `awards` — 공모전·수상

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | `uuid` PK | |
| year | `int2` NOT NULL | 수상 연도 |
| competition | `text` NOT NULL | 대회명 |
| award_name | `text` NOT NULL | 수상 등급 (대상/금상/최우수상/우수상/장려상) |
| winner | `text` | 수상자 이름 (nullable) |
| team_members | `text[]` DEFAULT '{}' | 팀원 배열 |
| description | `text` | 작품 설명 (nullable) |
| thumbnail_url | `text` | Storage URL (nullable) |
| created_at | `timestamptz` DEFAULT now() | |

> **Storage**: `ninc-images/awards/{id}.webp`

---

### 2-6. `projects` — 산학협력·해외교류 프로젝트

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | `uuid` PK | |
| title | `text` NOT NULL | 프로젝트 제목 |
| type | `text` NOT NULL | `'industry'` (산학협력) \| `'international'` (해외교류) |
| partner | `text` | 파트너 기관 (nullable) |
| description | `text` | 설명 (nullable) |
| year | `int2` NOT NULL | 프로젝트 연도 |
| thumbnail_url | `text` | Storage URL (nullable) |
| created_at | `timestamptz` DEFAULT now() | |

> **Storage**: `ninc-images/projects/{id}.webp`

---

### 2-7. `events` — 특강·워크숍·캠퍼스투어

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | `uuid` PK | |
| title | `text` NOT NULL | 이벤트 제목 |
| type | `text` NOT NULL | `'특강'` \| `'워크숍'` \| `'캠퍼스투어'` \| `'기타'` |
| start_date | `date` NOT NULL | 시작일 |
| end_date | `date` | 종료일 (nullable, 당일 이벤트이면 null) |
| location | `text` | 장소 (nullable) |
| description | `text` | 설명 (nullable) |
| is_published | `bool` DEFAULT true | 공개 여부 |
| created_at | `timestamptz` DEFAULT now() | |

---

### 2-8. `ninc_home_cards` — 홈 NincSection 슬라이드 카드 ★

> 홈 페이지 "Now In NewCon" 섹션의 슬라이드 이미지 카드를 관리.  
> 관리자가 직접 활동 사진을 업로드하면 홈에 반영됨.  
> **레코드가 없으면 기존 SVG 목데이터로 자동 fallback.**

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | `uuid` PK | |
| image_url | `text` NOT NULL | Storage URL |
| alt_text | `text` | 이미지 alt 텍스트 |
| link_href | `text` | 클릭 시 이동할 URL (nullable, 예: `/ninc/project`) |
| card_width | `int2` NOT NULL | Figma 카드 너비 (px) |
| card_height | `int2` NOT NULL | Figma 카드 높이 (px) |
| sort_order | `int2` DEFAULT 0 | 슬라이드 순서 |
| is_active | `bool` DEFAULT true | 활성 여부 |
| created_at | `timestamptz` DEFAULT now() | |

> **Storage**: `ninc-home/{id}.webp`  
> **초기값**: 4장 기준 (512×310 / 282×389 / 287×268 / 390×354)

---

### 2-9. `ncr_reports` — NCR Trend 아티클

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | `uuid` PK | |
| title | `text` NOT NULL | 아티클 제목 |
| type | `text` NOT NULL | `'editorial'` \| `'trend'` \| `'card_news'` |
| thumbnail_url | `text` | Storage URL (nullable) |
| season | `text` | 시즌 레이블 (예: `Season 3`, nullable) |
| author | `text` | 작성자 (nullable, 예: `NCR 에디터팀`) |
| excerpt | `text` | 목록용 요약 (nullable) |
| content | `text` | 본문 마크다운 (nullable) |
| tags | `text[]` DEFAULT '{}' | 태그 배열 |
| read_time | `text` | 예상 읽기 시간 (예: `8분`, nullable) |
| is_published | `bool` DEFAULT true | 공개 여부 |
| published_at | `timestamptz` NOT NULL | 발행일 (정렬·표시 기준) |
| created_at | `timestamptz` DEFAULT now() | |

> **Storage**: `ncr-thumbnails/{season}/{id}.webp`  
> **홈 연동**: `published_at DESC` 기준 최신 2개를 홈 NcrTrendSection에 노출

---

### 2-10. `ncr_report_relations` — 관련 아티클 연결

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | `uuid` PK | |
| report_id | `uuid` FK → ncr_reports(id) ON DELETE CASCADE | |
| related_id | `uuid` FK → ncr_reports(id) ON DELETE CASCADE | |

> `UNIQUE(report_id, related_id)` 제약 추가  
> 양방향 관계는 양쪽 모두 insert 하거나, 조회 시 OR 조건으로 처리

---

## 3. Storage 버킷 구조

```
Supabase Storage
├── faculty-photos/           (public)  교수·조교 사진
│   └── {id}.png
│
├── work-thumbnails/          (public)  학생 작품 썸네일
│   └── {year}/{id}.webp
│
├── exhibition-posters/       (public)  졸업전시 포스터
│   └── {year}.webp
│
├── ninc-images/              (public)  NINC 수상·프로젝트 이미지
│   ├── awards/{id}.webp
│   └── projects/{id}.webp
│
├── ninc-home/                (public)  홈 NINC 슬라이드 카드
│   └── {id}.webp
│
└── ncr-thumbnails/           (public)  NCR 아티클 썸네일
    └── {season}/{id}.webp
```

**공통 정책**: 모든 버킷은 `public` 읽기. 쓰기는 `authenticated` (관리자)만 허용.

---

## 4. RLS 정책

### 전체 테이블 공통 원칙

```sql
-- 모든 테이블: 비인증 사용자는 읽기만 가능
-- authenticated(관리자)만 INSERT / UPDATE / DELETE 가능

-- 예시 (모든 테이블에 동일 패턴 적용)
ALTER TABLE ncr_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON ncr_reports
  FOR SELECT TO public USING (is_published = true);

CREATE POLICY "admin_all" ON ncr_reports
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

### 테이블별 read 조건

| 테이블 | 공개 read 조건 |
|--------|---------------|
| faculty | 전체 공개 (조건 없음) |
| curriculum | 전체 공개 |
| showcase_works | 전체 공개 |
| exhibitions | 전체 공개 |
| awards | 전체 공개 |
| projects | 전체 공개 |
| events | `is_published = true` |
| ninc_home_cards | `is_active = true` |
| ncr_reports | `is_published = true` |
| ncr_report_relations | 전체 공개 |

---

## 5. 데이터 fetching 패턴

### 원칙

- **Server Components**: Supabase server client를 직접 사용 (API Route 불필요)
- **Client Components**: `useEffect` + `/api/*` 또는 서버 컴포넌트로 데이터를 props로 전달
- **뮤테이션** (조회수 증가 등): API Route 사용

### 파일 구조 (lib/supabase/)

```
lib/
├── supabase/
│   ├── client.ts          # Browser client (기존)
│   ├── server.ts          # Server client (기존)
│   └── queries/           # 도메인별 fetch 함수 모음
│       ├── faculty.ts
│       ├── curriculum.ts
│       ├── works.ts
│       ├── exhibitions.ts
│       ├── awards.ts
│       ├── projects.ts
│       ├── events.ts
│       ├── ncr.ts
│       └── home.ts        # 홈 전용 fetch (ninc_home_cards + ncr_reports)
```

### 예시 — `lib/supabase/queries/ncr.ts`

```typescript
import { createClient } from '@/lib/supabase/server'

export async function getNcrReports(options?: {
  limit?: number
  type?: 'editorial' | 'trend' | 'card_news'
}) {
  const supabase = createClient()
  let query = supabase
    .from('ncr_reports')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (options?.limit) query = query.limit(options.limit)
  if (options?.type) query = query.eq('type', options.type)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getNcrReportById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ncr_reports')
    .select(`
      *,
      relations:ncr_report_relations!report_id(
        related:related_id(id, title, type, thumbnail_url, published_at)
      )
    `)
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (error) throw error
  return data
}
```

---

## 6. API Routes

Server Components가 직접 Supabase를 호출하는 경우가 많으므로, API Route는 **뮤테이션 / 클라이언트 전용 작업**에만 사용.

### 구조

```
app/api/
├── works/
│   └── [id]/
│       └── view/route.ts     POST — 조회수 +1 (클라이언트에서 호출)
├── faculty-photo/route.ts    GET  — 기존 라우트 유지 (Supabase URL로 교체 예정)
└── (admin은 별도 admin API 또는 Supabase Dashboard 활용)
```

### `/api/works/[id]/view` — 조회수 증가

```typescript
// app/api/works/[id]/view/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { error } = await supabase.rpc('increment_view_count', { work_id: params.id })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

```sql
-- Supabase SQL Editor에서 함수 생성
CREATE OR REPLACE FUNCTION increment_view_count(work_id uuid)
RETURNS void AS $$
  UPDATE showcase_works SET view_count = view_count + 1 WHERE id = work_id;
$$ LANGUAGE sql SECURITY DEFINER;
```

### 나머지 read 작업은 Server Components에서 직접 처리

```typescript
// app/ninc/awards/page.tsx (Server Component로 전환 후)
import { getAwards } from '@/lib/supabase/queries/awards'

export default async function AwardsPage() {
  const awards = await getAwards()  // 직접 Supabase 호출
  // ...
}
```

---

## 7. Home 섹션 서버 연동 & Fallback 전략

### 7-1. NincSection (홈 슬라이드 카드)

**데이터 흐름**:
```
ninc_home_cards 테이블 조회 (is_active=true, ORDER BY sort_order)
  ↓ 데이터 있음 → Supabase Storage 이미지 표시
  ↓ 데이터 없음 → MOCK_SLIDE_CARDS (기존 SVG) 표시
```

**`lib/supabase/queries/home.ts`**:
```typescript
export async function getHomeNincCards() {
  const supabase = createClient()
  const { data } = await supabase
    .from('ninc_home_cards')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  return data ?? []
}
```

**`components/base/NincSection.tsx` 변경** (Server Component로 전환):
```typescript
// 목데이터 (Supabase에 데이터 없을 때 fallback)
const MOCK_SLIDE_CARDS = [
  { image_url: '/images/ninc/card1.svg', card_width: 512, card_height: 310, alt_text: 'NINC 활동 1', link_href: null },
  { image_url: '/images/ninc/card2.svg', card_width: 282, card_height: 389, alt_text: 'NINC 활동 2', link_href: null },
  { image_url: '/images/ninc/card3.svg', card_width: 287, card_height: 268, alt_text: 'NINC 활동 3', link_href: null },
  { image_url: '/images/ninc/card4.svg', card_width: 390, card_height: 354, alt_text: 'NINC 활동 4', link_href: null },
]

export default async function NincSection() {
  const cards = await getHomeNincCards()
  const displayCards = cards.length > 0 ? cards : MOCK_SLIDE_CARDS
  // ...
}
```

---

### 7-2. NcrTrendSection (홈 NCR Trend)

**데이터 흐름**:
```
ncr_reports 최신 2개 조회 (is_published=true, ORDER BY published_at DESC, LIMIT 2)
  ↓ 2개 이상 → mainCard = reports[0], subCard = reports[1]
  ↓ 1개만    → mainCard = reports[0], subCard = MOCK_SUB
  ↓ 0개      → mainCard = MOCK_MAIN, subCard = MOCK_SUB
```

**`lib/supabase/queries/home.ts`** (추가):
```typescript
export async function getHomeNcrReports() {
  const supabase = createClient()
  const { data } = await supabase
    .from('ncr_reports')
    .select('id, title, type, thumbnail_url, published_at, season, excerpt')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(2)
  return data ?? []
}
```

**`components/base/NcrTrendSection.tsx` 변경** (Server Component로 전환):
```typescript
const MOCK_MAIN = {
  id: 'mock-main',
  title: 'AI 시대, 학과의 강점과 비전을 묻다',
  type: 'editorial' as const,
  thumbnail_url: '/images/ncr/main.svg',
  published_at: '2025-08-25',
  season: null,
}

const MOCK_SUB = {
  id: 'mock-sub',
  title: '보성 미디어파사드 워크숍',
  type: 'trend' as const,
  thumbnail_url: '/images/ncr/sub.png',
  published_at: '2026-05-05',
  season: null,
}

export default async function NcrTrendSection() {
  const reports = await getHomeNcrReports()
  const mainCard = reports[0] ?? MOCK_MAIN
  const subCard  = reports[1] ?? MOCK_SUB
  
  // mainCard.id가 mock이면 href를 /ncr-trend/latest로, 
  // 실제 데이터면 /ncr-trend/{id}로 라우팅
  const mainHref = mainCard.id.startsWith('mock') ? '/ncr-trend/latest' : `/ncr-trend/${mainCard.id}`
  const subHref  = subCard.id.startsWith('mock')  ? '/ncr-trend/latest' : `/ncr-trend/${subCard.id}`
  // ...
}
```

---

## 8. SQL DDL (실행 순서 포함)

Supabase SQL Editor에서 아래 순서대로 실행.

```sql
-- ════════════════════════════════════════════════
-- 1. EXTENSIONS
-- ════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ════════════════════════════════════════════════
-- 2. ABOUT
-- ════════════════════════════════════════════════

CREATE TABLE faculty (
  id            text PRIMARY KEY,
  name_ko       text NOT NULL,
  name_en       text NOT NULL,
  role          text NOT NULL CHECK (role IN ('교수', '조교')),
  photo_url     text,
  color_variant text NOT NULL CHECK (color_variant IN ('green-solid', 'green-gradient', 'yellow')),
  quote         text,
  email         text,
  education     text[] DEFAULT '{}',
  career        text[] DEFAULT '{}',
  sort_order    smallint DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE curriculum (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year        smallint NOT NULL CHECK (year BETWEEN 1 AND 4),
  semester    smallint NOT NULL CHECK (semester IN (1, 2)),
  course_name text NOT NULL,
  credits     smallint NOT NULL,
  category    text NOT NULL,
  sort_order  smallint DEFAULT 0
);

-- ════════════════════════════════════════════════
-- 3. WORK
-- ════════════════════════════════════════════════

CREATE TABLE showcase_works (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  author        text NOT NULL,
  description   text,
  thumbnail_url text,
  tech_stack    text[] DEFAULT '{}',
  view_count    integer DEFAULT 0,
  year          smallint NOT NULL,
  is_featured   boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE exhibitions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year        smallint NOT NULL UNIQUE,
  title       text NOT NULL,
  theme       text,
  description text,
  poster_url  text,
  created_at  timestamptz DEFAULT now()
);

-- ════════════════════════════════════════════════
-- 4. NINC
-- ════════════════════════════════════════════════

CREATE TABLE awards (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year          smallint NOT NULL,
  competition   text NOT NULL,
  award_name    text NOT NULL,
  winner        text,
  team_members  text[] DEFAULT '{}',
  description   text,
  thumbnail_url text,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE projects (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  type          text NOT NULL CHECK (type IN ('industry', 'international')),
  partner       text,
  description   text,
  year          smallint NOT NULL,
  thumbnail_url text,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  type         text NOT NULL CHECK (type IN ('특강', '워크숍', '캠퍼스투어', '기타')),
  start_date   date NOT NULL,
  end_date     date,
  location     text,
  description  text,
  is_published boolean DEFAULT true,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE ninc_home_cards (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url   text NOT NULL,
  alt_text    text,
  link_href   text,
  card_width  smallint NOT NULL,
  card_height smallint NOT NULL,
  sort_order  smallint DEFAULT 0,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- ════════════════════════════════════════════════
-- 5. NCR TREND
-- ════════════════════════════════════════════════

CREATE TABLE ncr_reports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  type          text NOT NULL CHECK (type IN ('editorial', 'trend', 'card_news')),
  thumbnail_url text,
  season        text,
  author        text,
  excerpt       text,
  content       text,
  tags          text[] DEFAULT '{}',
  read_time     text,
  is_published  boolean DEFAULT true,
  published_at  timestamptz NOT NULL,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE ncr_report_relations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id  uuid NOT NULL REFERENCES ncr_reports(id) ON DELETE CASCADE,
  related_id uuid NOT NULL REFERENCES ncr_reports(id) ON DELETE CASCADE,
  UNIQUE (report_id, related_id)
);

-- ════════════════════════════════════════════════
-- 6. INDEXES
-- ════════════════════════════════════════════════

CREATE INDEX idx_showcase_works_year     ON showcase_works (year DESC);
CREATE INDEX idx_showcase_works_tech     ON showcase_works USING GIN (tech_stack);
CREATE INDEX idx_awards_year             ON awards (year DESC);
CREATE INDEX idx_projects_year           ON projects (year DESC);
CREATE INDEX idx_events_start_date       ON events (start_date);
CREATE INDEX idx_events_published        ON events (is_published);
CREATE INDEX idx_ninc_home_cards_active  ON ninc_home_cards (is_active, sort_order);
CREATE INDEX idx_ncr_reports_published   ON ncr_reports (is_published, published_at DESC);
CREATE INDEX idx_ncr_relations_report    ON ncr_report_relations (report_id);

-- ════════════════════════════════════════════════
-- 7. RLS
-- ════════════════════════════════════════════════

-- 모든 테이블 RLS 활성화
ALTER TABLE faculty              ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum           ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_works       ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE awards               ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects             ENABLE ROW LEVEL SECURITY;
ALTER TABLE events               ENABLE ROW LEVEL SECURITY;
ALTER TABLE ninc_home_cards      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ncr_reports          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ncr_report_relations ENABLE ROW LEVEL SECURITY;

-- 단순 공개 테이블 (조건 없이 전체 공개)
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'faculty','curriculum','showcase_works','exhibitions',
    'awards','projects','ncr_report_relations'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY public_read ON %I FOR SELECT TO public USING (true)', tbl
    );
    EXECUTE format(
      'CREATE POLICY admin_all ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl
    );
  END LOOP;
END $$;

-- is_published / is_active 조건 있는 테이블
CREATE POLICY public_read    ON events          FOR SELECT TO public USING (is_published = true);
CREATE POLICY admin_all      ON events          FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY public_read    ON ninc_home_cards FOR SELECT TO public USING (is_active = true);
CREATE POLICY admin_all      ON ninc_home_cards FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY public_read    ON ncr_reports     FOR SELECT TO public USING (is_published = true);
CREATE POLICY admin_all      ON ncr_reports     FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ════════════════════════════════════════════════
-- 8. STORAGE BUCKETS (Supabase Dashboard 또는 API로 생성)
-- ════════════════════════════════════════════════
-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('faculty-photos',     'faculty-photos',     true),
--   ('work-thumbnails',    'work-thumbnails',     true),
--   ('exhibition-posters', 'exhibition-posters',  true),
--   ('ninc-images',        'ninc-images',         true),
--   ('ninc-home',          'ninc-home',           true),
--   ('ncr-thumbnails',     'ncr-thumbnails',      true);

-- ════════════════════════════════════════════════
-- 9. HELPER FUNCTION — 조회수 증가
-- ════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION increment_view_count(work_id uuid)
RETURNS void AS $$
  UPDATE showcase_works SET view_count = view_count + 1 WHERE id = work_id;
$$ LANGUAGE sql SECURITY DEFINER;
```

---

## 구현 우선순위 (Dev 단계)

| 순서 | 작업 | 비고 |
|------|------|------|
| 1 | SQL DDL 실행 + Storage 버킷 생성 | Supabase Dashboard |
| 2 | `lib/supabase/server.ts` createClient 확인 | 기존 파일 있음 ✓ |
| 3 | `lib/supabase/queries/` 함수 작성 | home.ts 우선 |
| 4 | **Home NincSection / NcrTrendSection** 서버 연동 | 이 문서 7번 참고 |
| 5 | `ncr_reports` 데이터 입력 + 홈 연동 확인 | |
| 6 | `ninc_home_cards` 데이터 입력 + 홈 연동 확인 | |
| 7 | `faculty` → Supabase 이전 (`lib/faculty-data.ts` 대체) | |
| 8 | `awards` / `projects` / `events` 페이지 서버 연동 | |
| 9 | `showcase_works` 페이지 서버 연동 | |
| 10 | 조회수 증가 API Route 구현 | |
