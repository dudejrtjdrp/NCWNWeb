# 프로덕션 체크리스트 (SEO · GEO · 성능)

> 작성: 2026-06-16 · 대상: NWCN 뉴미디어콘텐츠과 웹 (Next.js 14 App Router + next-intl)

실제 운영 환경에서 점검해야 할 항목을 정리하고, 이번에 코드로 적용한 항목과 남은 권장 작업을 구분한다.

---

## 1. 이번에 적용한 변경 (코드 반영 완료)

### SEO

| 항목 | 내용 | 파일 |
| --- | --- | --- |
| canonical 상속 버그 수정 | 레이아웃에 고정돼 있던 `canonical: 홈URL`을 제거. 자체 메타데이터가 없던 모든 정적 서브페이지가 "정규 URL = 홈"으로 잘못 선언해 색인에서 누락되던 문제 해결 | `app/[locale]/layout.tsx` |
| hreflang x-default | ko/en에 더해 `x-default`(ko) 추가. 홈에 로케일별 canonical/hreflang 명시 | `lib/seo/metadata.ts`, `app/[locale]/page.tsx` |
| sitemap 보강 | 전 항목에 ko/en hreflang 대체 URL 부여, 교수진 상세·`/work/archive`·`/info/privacy` 추가 | `app/sitemap.ts` |
| 파비콘/앱 아이콘 | 브라우저 탭·iOS 홈 아이콘 동적 생성 (기존엔 아예 없었음) | `app/icon.tsx`, `app/apple-icon.tsx` |
| PWA manifest | 모바일 홈 추가용 매니페스트 | `app/manifest.ts` |

### GEO (생성형 엔진 최적화)

| 항목 | 내용 | 파일 |
| --- | --- | --- |
| AI 크롤러 정책 명시 | GPTBot·ClaudeBot·PerplexityBot·Google-Extended·Applebot-Extended 등 명시 허용 → ChatGPT/Claude/Perplexity/Gemini 답변에 인용되도록 | `app/robots.ts` |
| 기관 구조화 데이터 | 홈에 `CollegeOrUniversity`(학과) + `WebSite` JSON-LD. 구글 지식 패널 및 AI의 기관 인식 | `lib/seo/structured-data.ts`, `app/[locale]/page.tsx` |
| 인물 구조화 데이터 | 교수진 상세에 `Person`(worksFor=학과) + `BreadcrumbList` | `app/[locale]/about/faculty/[id]/page.tsx` |
| 경로 구조화 데이터 | NCR 아티클 상세에 `BreadcrumbList` 추가 (기존 `Article` 유지) | `app/[locale]/ncr-trend/[id]/page.tsx` |

### 성능

| 항목 | 내용 | 파일 |
| --- | --- | --- |
| 폰트 CDN preconnect | fonts.googleapis / fonts.gstatic / jsdelivr 사전 연결로 렌더 블로킹 폰트 로드 지연 완화 (LCP 개선) | `app/layout.tsx` |
| 번들 최적화 | `optimizePackageImports`(swiper/leaflet/react-leaflet)로 트리셰이킹 | `next.config.mjs` |
| 이미지 포맷 | AVIF/WebP 우선 서빙 | `next.config.mjs` |
| 헤더 정리 | `poweredByHeader: false`로 X-Powered-By 노출 제거 | `next.config.mjs` |
| 미들웨어 matcher | `/icon`·`/apple-icon`·`/manifest.webmanifest`를 intl 리다이렉트에서 제외 | `middleware.ts` |

---

## 2. 이미 잘 갖춰져 있던 항목 (변경 불필요)

- 동적 `robots.ts` / `sitemap.ts` (Supabase 연동)
- 페이지별 `generateMetadata` (OpenGraph·Twitter Card)
- 동적 OG 이미지 (`opengraph-image.tsx`)
- NCR 아티클 `Article` JSON-LD
- 보안 헤더 + CSP (`middleware.ts`: HSTS·X-Frame-Options·CSP 등)
- `font-display: swap`, `<html lang>`, viewport/themeColor
- Google Search Console 인증 메타
- `next/image` remotePatterns (R2/Supabase)

---

## 3. 남은 권장 작업 (이번 범위 외 · 우선순위 순)

### 높음

1. **프로덕션 빌드 검증** — 로컬에서 `npm run build` 1회 실행해 메타데이터 라우트(icon/manifest/sitemap)와 구조화 데이터가 정상 생성되는지 확인. (이번엔 타입검사까지만 수행)
2. **폰트 셀프호스팅** — Pretendard·A2z·Nova Slim을 CDN `@import`(렌더 블로킹) 대신 `public/fonts`에 두고 `next/font/local`로 로드. LCP·CLS·외부 의존성 모두 개선. CSP `style-src`/`font-src`에서 외부 출처 제거 가능.
3. **정적 서브페이지 canonical/hreflang** — `lib/seo/metadata.ts`의 `localizedAlternates(locale, path)`를 about/info/ninc/work 목록 페이지의 `generateMetadata`에 적용. (현재는 canonical 미설정 = 자기참조로 동작하나 hreflang 페어링은 미적용)

### 중간

4. **공개 컴포넌트 raw `<img>` → `next/image`** — `DepartmentSection`·`NincCardGrid`·`CertCarousel` 등. 자동 리사이즈/AVIF/lazy 적용. 단 레이아웃 회귀 위험 있어 컴포넌트별 검증 필요.
5. **이미지 사이즈 명시 / priority** — 히어로 LCP 이미지에 `priority`, 그 외 `sizes` 속성으로 과대 다운로드 방지.
6. **OG 이미지 페이지별 다양화** — 현재 공통 OG. 아티클/작품 상세는 썸네일 기반 OG로 공유 클릭률 개선.

### 낮음

7. **구조화 데이터 추가** — 작품 상세 `CreativeWork`, 수상 `Award`, 입학 FAQ에 `FAQPage`.
8. **성능 모니터링** — Lighthouse CI 또는 Vercel Speed Insights 연동, Core Web Vitals 추적.
9. **`NEXT_PUBLIC_SITE_URL` 확정** — 현재 기본값이 `ncwn-web.vercel.app`. 커스텀 도메인 확정 시 env 갱신(전 메타/사이트맵/구조화데이터가 이 값을 사용).

---

## 4. 운영 점검 루틴 (배포 후)

- Google Search Console: sitemap 제출, 색인 커버리지·hreflang 오류 확인
- 리치 결과 테스트: <https://search.google.com/test/rich-results> 로 JSON-LD 검증
- robots: `https://<도메인>/robots.txt` 에서 AI 크롤러 규칙 노출 확인
- PageSpeed Insights: 모바일 LCP/CLS/INP 측정
