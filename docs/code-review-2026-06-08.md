# NWCN 프로젝트 점검 보고서 (보안 · 리팩토링)

> 점검일: 2026-06-08 · 대상: Next.js 14 (App Router) + Supabase + next-intl

전반적으로 코드 품질은 높습니다. 서버 액션의 `getUser()` 검증, UUID·파일·텍스트 길이 검증, 에러 메시지 마스킹, 보안 헤더/CSP, revalidate 캐시 무효화 등 기본기가 잘 갖춰져 있습니다. 다만 **인증 경계(서버 가드)와 RLS 운영 검증**에서 실제 위험이 남아 있어 우선 처리가 필요합니다.

---

## 🔴 Critical — 즉시 확인/조치

### 1. RLS가 실제 DB에 적용됐는지 검증 불가 (가장 중요)
RLS 정책 SQL이 `docs/supabase-design.md`에만 있고 `supabase/migrations/`에는 `add_en_columns.sql` 하나뿐입니다. 코드 전반이 **브라우저에 노출되는 anon 키**(`NEXT_PUBLIC_SUPABASE_ANON_KEY`)로 DB에 접근합니다. 만약 라이브 DB에 RLS가 비활성 상태라면, 누구나 anon 키로 Supabase REST API를 직접 호출해 **모든 테이블을 읽기/쓰기/삭제**할 수 있습니다. 앱의 `requireAuth`는 우회됩니다.

- 조치: Supabase Dashboard → Database → 각 테이블 RLS **활성 여부 직접 확인**. 문서의 정책을 `supabase/migrations/`에 마이그레이션 파일로 커밋해 형상관리.

### 2. `admin_all ... TO authenticated USING(true)` + 회원가입 활성 가능성
문서의 정책은 "인증된 사용자면 전부 허용"입니다. Supabase Auth는 **이메일 회원가입이 기본 ON**이라, 외부인이 임의 계정을 만들면 `authenticated` 역할을 얻어 전 테이블을 쓰고 지울 수 있습니다.

- 조치: Supabase Auth → **"Allow new users to sign up" OFF**. 또는 정책을 특정 관리자(예: 허용 이메일/role claim) 기준으로 강화. 관리자 계정은 대시보드에서 수동 생성.

### 3. 의존성 취약점 (npm audit: critical 1 포함)
`next@14.2.3`에 다수 권고(DoS, 캐시 포이즈닝, 이미지 최적화 DoS 등) + `postcss` XSS.

- 조치: `npm audit fix --force` 또는 `next`를 `14.2.35`로 업그레이드 후 회귀 테스트.

---

## 🟠 High

### 4. `/admin`에 서버사이드 인증 가드 없음
미들웨어는 `/admin`에서 세션 쿠키 **갱신만** 할 뿐 리다이렉트하지 않습니다. admin 페이지(Server Component)들도 인증 체크가 없고, 가드는 오직 `AdminShell`(`'use client'`)의 `useEffect` → `window.location.href`뿐입니다. 결과적으로 비인증 사용자에게도 admin 화면이 일단 서버 렌더되어 전달되고, 클라이언트 하이드레이션 후에야 로그인으로 튕깁니다(서버 경계 아님). 데이터 변경은 `requireAuth`로 막히지만, 관리 UI가 공개 도달 가능한 상태입니다.

- 조치: `app/admin/layout.tsx`를 Server Component로 만들어 `getUser()` 확인 후 미인증 시 `redirect('/admin/login')`. (login 레이아웃은 분리하거나 layout에서 경로 예외 처리.)

### 5. 로그인 경로가 3중화 — 실제 사용 경로엔 레이트리밋 없음
- 실제 사용: `_LoginForm.tsx`(클라이언트에서 `signInWithPassword` 직접 호출) → **브루트포스 레이트리밋 없음**, 게다가 `로그인 실패: ${error.message}`로 **Supabase 원본 에러 노출**.
- 미사용(데드코드): `app/api/admin/login/route.ts`(레이트리밋+리다이렉트 정규화 보유)와 `actions.ts`의 `signIn` 액션.

즉, 레이트리밋이 붙은 구현은 안 쓰이고, 쓰이는 구현은 보호가 없습니다.

- 조치: 한 경로로 통일. 레이트리밋이 있는 Route Handler(`/api/admin/login`)로 폼을 전환하거나, 클라이언트 로그인을 유지하되 Supabase Auth Rate Limit 설정에 의존함을 명시. 미사용 `signIn` 액션/Route는 제거. 클라이언트 에러 메시지는 일반 문구로.

### 6. 조회수 증가 경로와 RLS 충돌 가능
`/api/works/[id]/view`는 anon 클라이언트로 `showcase_works`를 UPDATE합니다. 문서 RLS상 UPDATE는 `authenticated`만 가능하므로, RPC `increment_view_count`가 `SECURITY DEFINER`가 아니면 RPC도 fallback UPDATE도 **모두 실패**합니다(기능 버그 겸 권한 설계 이슈).

- 조치: `increment_view_count`를 `SECURITY DEFINER`로 정의하고 fallback UPDATE 경로 제거. RPC 정의도 마이그레이션으로 커밋.

---

## 🟡 Medium

### 7. CSP에 `'unsafe-inline'` + `'unsafe-eval'`
`script-src`의 두 지시어가 XSS 방어를 크게 약화시킵니다.
- 조치: Next.js nonce 기반 CSP로 전환, 최소한 프로덕션에서 `unsafe-eval` 제거 검토.

### 8. 레이트리밋이 인메모리
서버리스(Vercel) 다중 인스턴스/콜드스타트에서 공유되지 않아 사실상 우회 가능(코드 주석도 인지). 로그인·조회수 보호가 약합니다.
- 조치: Upstash Redis 등 외부 스토어 기반으로 교체.

### 9. `@supabase/ssr` 쿠키 API 혼재
`server.ts`·미들웨어는 `get/set/remove`(구버전 API), 로그인 Route·`callback`은 `getAll/setAll`. `package.json`은 `^0.3.0`이라 상위 버전으로 해석될 수 있어 동작 불일치 위험.
- 조치: 버전 핀 고정 + 한쪽 API로 표준화(`getAll/setAll` 권장).

### 10. 파일 업로드 MIME 우회 여지
`if (file.type && ...)`라 `type`이 비면 MIME 검증을 건너뛰고 확장자만 신뢰. 공개 버킷이라 위험은 제한적이나, 매직바이트 검사 또는 서버측 재인코딩 권장.

---

## 🟢 Low / 리팩토링

### 11. `actions.ts` 대규모 중복 (1,188줄)
6개 엔티티의 save/update가 폼 파싱 → 검증 → 썸네일 업로드/삭제 → insert/update → revalidate 패턴을 거의 동일하게 반복합니다.
- 제안: `parseFields`, `handleThumbnail(bucket, oldUrl)`, `withAuth(action)` 같은 공통 헬퍼로 추출. 유지보수 비용·실수 위험 큰 폭 감소.

### 12. `/api/faculty-photo` 불필요한 간접화
하드코딩된 이름 검증 후 `/images/faculty/{name}.png` 정적 파일로 리다이렉트만 함(Figma 의존 제거 후 레거시). 정적 경로 직접 참조로 대체하고 라우트 제거 가능.

### 13. 기타
- `logInfo('admin login success', email)` — 로그에 관리자 이메일(PII) 기록. 마스킹 권장.
- `error.message.includes(...)` 문자열 매칭은 깨지기 쉬움 → Supabase 에러 코드 기반 분기 권장.
- `withHandler`에 테스트 헬퍼(`_resetRateLimiter` 등)는 있으나 실제 테스트 없음 → 인증/검증 핵심 경로 단위테스트 추가 권장.
- `getSettings`는 인증 없는 공개 읽기 → 저장 값에 민감정보 없도록 주의.

---

## 우선순위 요약

| 순위 | 항목 | 성격 |
|---|---|---|
| 1 | RLS 라이브 적용 검증 + 마이그레이션화 (#1) | 보안 |
| 2 | 회원가입 OFF / 정책 강화 (#2) | 보안 |
| 3 | `next` 업그레이드 (#3) | 보안 |
| 4 | admin 서버 가드 추가 (#4) | 보안 |
| 5 | 로그인 경로 통일·데드코드 제거 (#5) | 보안/정리 |
| 6 | 조회수 RPC `SECURITY DEFINER` (#6) | 보안/버그 |
| 7~ | CSP, 레이트리밋, 쿠키 API, actions 중복 리팩토링 | 강화/품질 |
