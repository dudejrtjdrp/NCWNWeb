# NWCN — 동아방송예술대학교 뉴미디어콘텐츠과 웹사이트

학과 소개, 학생 작품, 활동 기록, 트렌드 아티클을 한곳에 모은 학과 공식 웹사이트와 이를 운영하는 관리자(CMS)입니다.

2026.05 ~ 운영 중 · 4인 팀 팀장, 개발 1인(Figma 시안 구현, 프론트엔드, Supabase 백엔드, 관리자) · Next.js 14, TypeScript, Tailwind CSS, Supabase, Cloudflare R2, next-intl · https://www.dima-nwcn.com

## 왜 만들었나

학과의 작품, 수상, 산학 프로젝트, 학사 일정이 여러 채널에 흩어져 있었습니다. 방문자는 한 사이트에서 학과를 파악할 수 있어야 했고, 개발자가 아닌 교수·조교가 콘텐츠를 직접 올리고 고칠 수 있어야 했습니다. 그래서 공개 사이트와 관리자 페이지를 함께 만들었습니다.

## 주요 기능

- 학과 소개: 학과·교육방침, 교수진 카드와 교수 인터뷰 상세, 1~3학년 커리큘럼, 자격증 캐러셀
- WORK: 학생 작품 쇼케이스(마소너리 그리드, 필터, 검색, 무한 스크롤), 작품 유형별 상세(디자인 갤러리, 영상, 3D 임베드), 조회수, 졸업전시 커버플로우
- NINC(지금 뉴미디어콘텐츠과에서는): 수상, 산학 프로젝트, 학사 일정
- NCR Trend: Tiptap 기반 WYSIWYG 에디터로 작성하는 트렌드 아티클(본문 이미지, 유튜브·비메오 임베드)
- 관리자(`/admin`): 작품·아티클·수상·프로젝트·이벤트·전시·유형 CRUD, 한국어/영어 입력 탭, 이미지 업로드
- 한/영 다국어(`app/[locale]`), sitemap·robots·JSON-LD 구조화 데이터

## 기술적으로 고민한 것

**1. 끝나지 않는 로딩 스피너**
- 문제: 전역 로딩 오버레이를 정수 카운터 하나로 관리해서, show 호출이 hide보다 많아지면(중복 pushState, cleanup 없는 effect, finally 없는 fetch) 데이터를 다 받은 뒤에도 스피너가 남았습니다.
- 선택: 호출자마다 고유 키를 갖는 `Set` 기반으로 Provider를 다시 쓰고, 각 탭에 `useId` 키를 주고, fetch 핸들러에 try/finally를 넣었습니다. 10초 강제 해제를 마지막 안전장치로 두었습니다.
- 결과: 호출자끼리 서로 간섭하지 않고, 같은 키로 여러 번 호출해도 한 번으로 처리됩니다. (`components/providers/LoadingProvider.tsx`)

**2. Windows에서만 떨리고 사라지는 홈 히어로**
- 문제: 스크롤 연동 히어로가 Mac에서는 멀쩡했지만 Windows(DPR 1)에서는 떨렸습니다. 원인은 두 가지였습니다. 소수 배율 stage와 `translate(-50%)` 위에 올린 GPU 레이어가 매 프레임 픽셀 반올림됐고, `scroll-behavior: smooth`가 Lenis와 충돌했습니다. 이 문제를 고치려고 `prefers-reduced-motion` 분기를 넣자, OS 애니메이션을 끈 Windows에서 스크롤 구간이 줄고 요소가 사라지는 문제가 새로 생겼습니다.
- 선택: stage 배율을 픽셀 단위로 맞추고, 전역 smooth scroll을 없애고, 콘텐츠·스크롤 길이를 모션 설정과 분리했습니다.
- 결과: 원인과 조치를 `docs/mac-windows-rendering-analysis.md`에 정리했습니다.

**3. 비로그인 방문자의 조회수 증가와 RLS**
- 문제: `showcase_works`의 UPDATE는 RLS 때문에 로그인 사용자만 할 수 있습니다. 그런데 호출하던 RPC가 마이그레이션에 없었고, 대신 실행되던 anon UPDATE는 에러 없이 0행만 바꾸고 있었습니다.
- 선택: `search_path`를 고정한 `SECURITY DEFINER` 함수를 만들어 anon과 authenticated에만 실행 권한을 줬습니다. 증가에 성공하면 `revalidateTag('works')`를 호출합니다.
- 결과: 테이블 권한은 넓히지 않고 조회수 컬럼만 원자적으로 늘립니다. (`supabase/migrations/add_increment_view_count_rpc.sql`)

**4. 스토리지 비용과 이미지 파이프라인**
- 문제: Supabase Storage 무료 티어 한도에 가까워졌습니다.
- 선택: 업로드 호출을 `uploadToStorage`/`deleteFromStorage` 두 함수에만 두어, 그 내부만 Cloudflare R2(S3 SDK)로 바꿨습니다. 업로드 때 sharp로 webp(quality 80)로 바꾸고 최대 2000px로 줄이며, GIF는 원본을 유지합니다.
- 결과: 호출하는 쪽 코드는 바꾸지 않고 저장소를 옮겼습니다. (`lib/r2/client.ts`, `lib/server/image.ts`)

## 구조

```
app/
├── [locale]/          # 공개 페이지 (about, work, ninc, ncr-trend, info)
├── admin/             # 관리자 CMS (탭별 서브 페이지 + server actions)
├── api/               # admin 로그인, 조회수, 교수 사진 프록시
├── robots.ts / sitemap.ts / manifest.ts
components/            # base(Figma 기반 UI), layout, sections, ui, providers
lib/
├── supabase/queries/  # 도메인별 조회 (works, ncr, awards, projects ...)
├── server/            # validation, rateLimiter, withHandler, image
├── r2/  seo/  tiptap/
supabase/migrations/   # 스키마 변경·RPC·시드 SQL
messages/ko.json, en.json
middleware.ts          # next-intl 로케일 + 보안 헤더(CSP)
```

## 실행 방법

```bash
npm install
cp .env.local.example .env.local   # Supabase URL/anon key, R2 설정 입력
npm run dev                         # http://localhost:3000
```

- 그 밖의 스크립트: `npm run build`, `npm run lint`, `npm run type-check`
- 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` (선택: `NEXT_PUBLIC_SITE_URL`)
- DB 스키마는 `supabase/migrations/`의 SQL을 적용합니다. 자세한 내용은 `docs/supabase-setup.md`에 있습니다.
- 요구 Node 버전: 18.17 이상

## 회고

기능을 늘리는 것보다 운영에서 생긴 버그를 고치는 데 시간이 더 들었습니다. 로딩 누수, 필터와 무한 스크롤의 경쟁 상태, OS별 렌더링 차이가 그랬습니다. 증상보다 원인을 먼저 찾고, 그 기록을 `docs/`에 남기는 습관을 이 프로젝트에서 들였습니다.
