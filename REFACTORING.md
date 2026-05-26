# NWCN 리팩토링 설계 문서

> 작성일: 2026-05-26  
> 목적: 10년차 Next.js 시니어 관점의 컴포넌트 구조 개선 및 재사용성 극대화

---

## 1. 현재 구조의 문제점 진단

### 🔴 Critical: 중복 컴포넌트

| 현재 파일 A | 현재 파일 B | 문제 |
|---|---|---|
| `components/base/NavBar.tsx` | `components/layout/Header.tsx` | 동일 역할(글로벌 네비게이션), 두 곳에서 NAV_ITEMS 배열 하드코딩 중복 |
| `components/base/HomeFooter.tsx` | `components/layout/Footer.tsx` | 두 개의 Footer, SubPageLayout은 HomeFooter 사용 중 |
| `components/base/HeroSection.tsx` | `components/sections/HeroSection.tsx` | **같은 파일명, 완전히 다른 컴포넌트** (스크롤 애니메이션 vs 텍스트 히어로) |
| `components/base/AboutHero.tsx` | `components/base/AboutSubNav.tsx` | AboutHero 내부에 SubNav 로직이 이미 내장됨, 별도 AboutSubNav 중복 |

### 🟡 Warning: 구조 혼재

- `components/base/` 폴더에 **페이지 전용 대형 컴포넌트**(NincCardGrid, NincHeroBanner, FacultySection 등)와 **원자 컴포넌트**(Tag)가 구분 없이 섞임
- `components/sections/` 폴더가 `components/base/`와 역할 중복 (둘 다 섹션 단위 컴포넌트)
- `components/layout/Header.tsx`, `components/layout/Footer.tsx`는 현재 **아무 페이지에서도 import 되지 않음** (사용 안 됨)

### 🟡 Warning: 스타일 불일치

- `AboutHero.tsx`: 전부 `style={{ ... }}` 인라인 — Tailwind 디자인 시스템과 충돌
- `NincCardGrid.tsx`: 일부 인라인, 일부 Tailwind 혼용
- 나머지: Tailwind + `cn()` 유틸리티 사용 (올바른 패턴)

### 🟡 Warning: 로직/데이터 결합

- `app/ninc/awards/page.tsx` 에 `AWARDS_DATA` 하드코딩 (약 11개 항목)
- `components/layout/Header.tsx`와 `components/base/NavBar.tsx` 모두 `NAV_ITEMS` 배열 각자 선언
- 공용 상수 파일 없음 (`constants/` 폴더 없음)

### 🟡 Warning: 재사용 가능한 패턴 미추출

- 검색바, 페이지네이션이 `NincCardGrid` 안에 강하게 결합
- About/NINC/NCR-Trend 모두 비슷한 "히어로 배너 + 서브탭" 패턴이지만 각자 구현
- `usePagination`, `useFilter` 같은 커스텀 훅 없음

---

## 2. 리팩토링 목표 구조

```
components/
  ├── ui/               ← 🔵 Atomic (최소 단위, 순수 UI)
  │   ├── Button.tsx        (✅ 유지)
  │   ├── Badge.tsx         (✅ 유지)
  │   ├── Tag.tsx           (base/Tag.tsx → 이동)
  │   ├── Input.tsx         (SearchBar 내부 input → 추출)
  │   └── Pagination.tsx    (NincPagination → 일반화하여 이동)
  │
  ├── common/           ← 🟢 Molecular (ui 조합, 페이지 무관하게 재사용)
  │   ├── PageHeader.tsx    (✅ 유지 — 서브페이지 공통 헤더)
  │   ├── FilterBar.tsx     (✅ 유지)
  │   ├── SearchBar.tsx     (NincCardGrid 내부 → 추출, 독립 컴포넌트)
  │   ├── SectionTitle.tsx  (반복되는 섹션 타이틀 패턴 추출)
  │   ├── CardGrid.tsx      (일반화된 그리드 레이아웃 래퍼)
  │   ├── EmptyState.tsx    (빈 상태 UI 공통화)
  │   └── SubNav.tsx        (AboutSubNav → 일반화, NINC도 재사용 가능)
  │
  ├── layout/           ← 🟣 Layout (전체 페이지 골격)
  │   ├── Header.tsx        (NavBar + Header 통합 → 하나로)
  │   ├── Footer.tsx        (HomeFooter + Footer 통합 → 하나로)
  │   ├── MobileMenu.tsx    (✅ 유지)
  │   └── SubPageLayout.tsx (✅ 유지, Header/Footer import 경로 수정)
  │
  └── sections/         ← 🟠 Organism (페이지별 큰 섹션)
      │
      ├── home/
      │   ├── HomeHeroSection.tsx   (base/HeroSection.tsx → 명확한 이름으로)
      │   ├── WhatIsSection.tsx     (base/WhatIsSection.tsx → 이동)
      │   ├── NincPreviewSection.tsx (base/NincSection.tsx → 이동)
      │   └── NcrTrendPreviewSection.tsx (base/NcrTrendSection.tsx → 이동)
      │
      ├── about/
      │   ├── AboutHeroBanner.tsx   (base/AboutHero.tsx → 리네임, inline→Tailwind)
      │   ├── DepartmentSection.tsx (base/DepartmentSection.tsx → 이동)
      │   ├── FacultySection.tsx    (base/FacultySection.tsx → 이동)
      │   ├── FacultyCard.tsx       (base/FacultyCard.tsx → 이동)
      │   ├── CurriculumSection.tsx (base/CurriculumSection.tsx → 이동)
      │   └── LabSection.tsx        (base/Lab 관련 → 이동)
      │
      ├── ninc/
      │   ├── NincHeroBanner.tsx    (base/NincHeroBanner.tsx → 이동)
      │   └── NincCardGrid.tsx      (base/NincCardGrid.tsx → SearchBar/Pagination 분리 후 유지)
      │
      ├── ncr-trend/
      │   └── (추후 작업)
      │
      └── work/
          ├── ShowcaseGrid.tsx      (sections/ShowcaseGrid.tsx → 이동)
          └── AwardsPreview.tsx     (sections/AwardsPreview.tsx → 이동)

constants/                ← 📌 새로 생성
  ├── nav-items.ts          (NAV_ITEMS 배열 단일 소스)
  └── site.ts               (사이트 메타데이터, 연락처 등)

hooks/                    ← 📌 새로 생성
  ├── usePagination.ts      (페이지네이션 로직)
  └── useFilter.ts          (검색/필터링 로직)

lib/
  ├── utils.ts              (✅ 유지)
  ├── faculty-data.ts       (✅ 유지)
  └── supabase/             (✅ 유지)

types/
  └── index.ts              (✅ 유지)
```

---

## 3. Phase별 작업 계획

### Phase 1 — 중복 제거 + 구조 정리 (최우선)

#### 1-1. 공용 상수 추출
```
constants/nav-items.ts 생성
  → NAV_ITEMS 배열을 단일 소스로 관리
  → Header.tsx, NavBar.tsx 양쪽 중복 제거
```

#### 1-2. Header 통합
```
Before:
  components/base/NavBar.tsx        (흰 배경, SubPageLayout에서 사용)
  components/layout/Header.tsx      (다크 배경, 현재 미사용)

After:
  components/layout/Header.tsx      (단일 Header, variant="light"|"dark"|"transparent")
  
- SubPageLayout → Header import 경로 업데이트
- app/page.tsx → Header transparent prop으로 교체
- components/base/NavBar.tsx 삭제
```

#### 1-3. Footer 통합
```
Before:
  components/base/HomeFooter.tsx    (SubPageLayout에서 사용)
  components/layout/Footer.tsx      (현재 미사용)

After:
  components/layout/Footer.tsx      (단일 Footer)
  
- SubPageLayout → Footer import 경로 업데이트
- components/base/HomeFooter.tsx 삭제
```

#### 1-4. HeroSection 이름 충돌 해소
```
Before:
  components/base/HeroSection.tsx   (스크롤 패널 애니메이션, 홈 전용)
  components/sections/HeroSection.tsx (텍스트 히어로, 미사용으로 추정)

After:
  components/sections/home/HomeHeroSection.tsx (스크롤 패널 애니메이션 홈 전용)
  components/sections/HeroSection.tsx → 삭제 또는 보존 여부 확인 후 결정
```

#### 1-5. AboutHero + AboutSubNav 정리
```
Before:
  components/base/AboutHero.tsx     (SubNav 내장, inline styles)
  components/base/AboutSubNav.tsx   (독립 SubNav, Tailwind)

After:
  1. AboutHero → AboutHeroBanner (순수 배너만, SubNav 제거)
     → inline styles를 Tailwind로 전환
  2. AboutSubNav → components/common/SubNav.tsx (범용화)
     → NINC 서브탭도 같은 컴포넌트로 재사용
```

---

### Phase 2 — 공용 컴포넌트 추출

#### 2-1. Pagination 공용화
```
Before: components/base/NincPagination.tsx (NINC 전용 명칭)
After:  components/ui/Pagination.tsx

- Props: { page, totalPages, onPageChange, className? }
- NINC, Work, NCR-Trend 등 모든 목록 페이지에서 재사용
```

#### 2-2. SearchBar 독립
```
Before: NincCardGrid.tsx 내부 인라인 <input>
After:  components/common/SearchBar.tsx

- Props: { value, onChange, placeholder, label? }
- NincCardGrid에서 import하여 사용
- 추후 다른 검색이 필요한 페이지에서 재사용
```

#### 2-3. SectionTitle 추출
```
Before: 각 섹션마다 반복되는 패턴
  <p className="font-body text-xs font-semibold tracking-widest text-nwcn-green">{category}</p>
  <h2 className="font-brand ...">{title}</h2>

After: components/common/SectionTitle.tsx
- Props: { eyebrow, title, description?, align?, className? }
```

#### 2-4. SubNav 범용화
```
Before: components/base/AboutSubNav.tsx (About 전용)
After:  components/common/SubNav.tsx

interface SubNavItem { label: string; href: string }
interface SubNavProps { items: SubNavItem[]; className? }

사용처:
  - About 섹션 (DEPARTMENT | FACULTY | CURRICULLIM | LAB)
  - NINC 섹션 (AWARDS | PROJECT | EVENT) — 추후 추가
  - NCR-Trend 섹션 (LATEST REPORT | ARCHIVE) — 추후 추가
```

#### 2-5. EmptyState 공용화
```
Before: 각 페이지마다 <p>검색 결과가 없습니다</p> 반복
After:  components/common/EmptyState.tsx

- Props: { message, icon?, action? }
```

---

### Phase 3 — 커스텀 훅 추출

#### 3-1. usePagination
```typescript
// hooks/usePagination.ts
export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(items.length / pageSize)
  const paged = items.slice((page - 1) * pageSize, page * pageSize)
  const reset = () => setPage(1)
  return { page, setPage, totalPages, paged, reset }
}
```

#### 3-2. useFilter
```typescript
// hooks/useFilter.ts
export function useFilter<T>(
  items: T[],
  searchFn: (item: T, query: string) => boolean
) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    if (!query.trim()) return items
    return items.filter(item => searchFn(item, query.toLowerCase()))
  }, [items, query])
  return { query, setQuery, filtered }
}
```

#### 사용 예시 (awards/page.tsx)
```typescript
const { query, setQuery, filtered } = useFilter(AWARDS_DATA, (a, q) =>
  a.competition.includes(q) || a.award_name.includes(q) || a.winner.includes(q)
)
const { page, setPage, totalPages, paged, reset } = usePagination(filtered, PAGE_SIZE)

// query 변경 시 페이지 리셋
const handleSearch = (v: string) => { setQuery(v); reset() }
```

---

### Phase 4 — 스타일 일관성 통일

#### 4-1. AboutHero inline → Tailwind 전환
```
현재: style={{ position: 'absolute', left: 'calc(79.17% - 113px)', top: 157, ... }}
목표: Tailwind + CSS variables 활용

주요 변환:
- position: 'absolute' → className="absolute"
- fontWeight: 800 → className="font-extrabold" (또는 font-body 커스텀)
- background: '#fff' → className="bg-white"
- borderBottom: '1px solid #e8e8e8' → className="border-b border-[#e8e8e8]"
```

---

### Phase 5 — 데이터 분리

#### 5-1. 하드코딩 데이터 분리
```
현재: awards/page.tsx 내 AWARDS_DATA 배열 (11개 항목)
목표: Supabase 연동 전까지 lib/mock-data/ 또는 constants/ 로 이동

constants/
  └── mock-data/
      ├── awards.ts
      ├── projects.ts
      └── events.ts
```

#### 5-2. NAV_ITEMS 단일 소스
```
constants/nav-items.ts
→ Header, MobileMenu 모두 이 파일에서 import
```

---

## 4. 컴포넌트 재활용 체크리스트 (앞으로 작업 시 필수)

새 페이지/기능 작업 전, 반드시 아래 순서로 확인:

### ✅ UI 원자 (ui/)
- [ ] 버튼 필요 → `Button` (variant: primary/secondary/ghost/outline)
- [ ] 배지/태그 필요 → `Badge` (variant: new/hot/number)
- [ ] 목록 필요 → `Pagination`
- [ ] 텍스트 입력 필요 → `Input` (추출 예정)

### ✅ 공통 분자 (common/)
- [ ] 페이지 상단 헤더 필요 → `PageHeader` (category, title, description)
- [ ] 검색창 필요 → `SearchBar`
- [ ] 필터 버튼 그룹 필요 → `FilterBar`
- [ ] 섹션 제목 필요 → `SectionTitle` (eyebrow, title)
- [ ] 탭 내비게이션 필요 → `SubNav` (items 배열)
- [ ] 빈 상태 필요 → `EmptyState`

### ✅ 레이아웃 (layout/)
- [ ] 서브 페이지 → 무조건 `SubPageLayout` 사용 (Header/Footer 직접 import 금지)
- [ ] 홈 페이지 → `Header` with `variant="transparent"` + `Footer` 직접 사용

### ✅ 섹션 (sections/)
- [ ] About 페이지 → `AboutHeroBanner` + `SubNav`
- [ ] NINC 페이지 → `NincHeroBanner` + `SubNav` + `NincCardGrid`
- [ ] 홈 → `HomeHeroSection`, `WhatIsSection`, `NincPreviewSection`, `NcrTrendPreviewSection`

### ✅ 커스텀 훅 (hooks/)
- [ ] 검색/필터링 로직 → `useFilter`
- [ ] 페이지네이션 로직 → `usePagination`

---

## 5. Import Path 가이드

리팩토링 완료 후 표준 import 패턴:

```typescript
// UI 원자
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'

// 공통 분자
import PageHeader from '@/components/common/PageHeader'
import SearchBar from '@/components/common/SearchBar'
import FilterBar from '@/components/common/FilterBar'
import SectionTitle from '@/components/common/SectionTitle'
import SubNav from '@/components/common/SubNav'
import EmptyState from '@/components/common/EmptyState'

// 레이아웃
import SubPageLayout from '@/components/layout/SubPageLayout'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

// 섹션 (페이지별)
import HomeHeroSection from '@/components/sections/home/HomeHeroSection'
import AboutHeroBanner from '@/components/sections/about/AboutHeroBanner'
import NincCardGrid from '@/components/sections/ninc/NincCardGrid'

// 커스텀 훅
import { useFilter } from '@/hooks/useFilter'
import { usePagination } from '@/hooks/usePagination'

// 상수
import { NAV_ITEMS } from '@/constants/nav-items'
```

---

## 6. 작업 우선순위 로드맵

| 우선순위 | Phase | 작업 | 예상 영향 범위 |
|---|---|---|---|
| 🔴 P0 | 1-1 | constants/nav-items.ts 생성 | Header, NavBar |
| 🔴 P0 | 1-2 | Header 통합 (NavBar → 제거) | SubPageLayout, app/page.tsx |
| 🔴 P0 | 1-3 | Footer 통합 (HomeFooter → 제거) | SubPageLayout |
| 🔴 P0 | 1-4 | HeroSection 이름 충돌 해소 | app/page.tsx |
| 🟡 P1 | 1-5 | AboutHero 정리 + SubNav 분리 | about/* 모든 페이지 |
| 🟡 P1 | 2-1 | Pagination 공용화 | ninc/*, work/* |
| 🟡 P1 | 2-2 | SearchBar 독립 | NincCardGrid |
| 🟢 P2 | 2-3 | SectionTitle 추출 | 전체 섹션 |
| 🟢 P2 | 2-4 | SubNav 범용화 | about/*, ninc/*, ncr-trend/* |
| 🟢 P2 | 3-1 | usePagination 훅 | 목록 페이지 전체 |
| 🟢 P2 | 3-2 | useFilter 훅 | 검색 있는 페이지 |
| 🔵 P3 | 4-1 | AboutHero inline → Tailwind | about/* |
| 🔵 P3 | 5-1 | Mock 데이터 분리 | ninc/* |

---

## 7. 실제 컴포넌트 변경 전/후 비교

### Header 통합 예시

**Before (app/page.tsx)**
```tsx
import NavBar from '@/components/base/NavBar'
<NavBar transparent />
```

**After (app/page.tsx)**
```tsx
import Header from '@/components/layout/Header'
<Header variant="transparent" />
```

---

**Before (SubPageLayout.tsx)**
```tsx
import NavBar from '@/components/base/NavBar'
import HomeFooter from '@/components/base/HomeFooter'
<NavBar />
<HomeFooter />
```

**After (SubPageLayout.tsx)**
```tsx
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
<Header />
<Footer />
```

---

### SubNav 범용화 예시

**Before (about/faculty/page.tsx)**
```tsx
import AboutHero from '@/components/base/AboutHero'
// AboutHero 안에 SubNav 내장됨
<AboutHero />
```

**After (about/faculty/page.tsx)**
```tsx
import AboutHeroBanner from '@/components/sections/about/AboutHeroBanner'
import SubNav from '@/components/common/SubNav'
import { ABOUT_NAV_ITEMS } from '@/constants/nav-items'

<AboutHeroBanner />
<SubNav items={ABOUT_NAV_ITEMS} />
```

---

### 페이지에서 훅 사용 예시

**Before (ninc/awards/page.tsx)**
```tsx
const [searchQuery, setSearchQuery] = useState('')
const [currentPage, setCurrentPage] = useState(1)
const filtered = useMemo(() => { ... }, [searchQuery])
const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
const pagedItems = useMemo(() => { const start = ...; return filtered.slice(...) }, [filtered, currentPage])
const handleSearchChange = (value: string) => { setSearchQuery(value); setCurrentPage(1) }
```

**After (ninc/awards/page.tsx)**
```tsx
const { query, setQuery, filtered } = useFilter(AWARDS_DATA, (a, q) =>
  a.competition.includes(q) || a.award_name.includes(q)
)
const { page, setPage, totalPages, paged, reset } = usePagination(filtered, PAGE_SIZE)
const handleSearch = (v: string) => { setQuery(v); reset() }
```

---

> 이 문서를 기준으로 각 Phase 작업을 진행하며, 작업 완료 시 해당 섹션에 ✅ 표시를 추가합니다.
