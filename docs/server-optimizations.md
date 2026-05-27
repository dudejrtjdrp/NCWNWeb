# 서버 비용 최적화 및 보안 권장안

이 문서는 프로젝트의 서버 비용을 절감하고 성능 및 보안을 향상시키기 위한 우선순위 전략과 구체적 권장 작업을 정리합니다.

## 1. 요약 (우선순위)
1. `view_count` 등 빈번한 업데이트는 DB 직접 업데이트 대신 RPC/버퍼/배치 처리로 전환
2. 읽기 중심 API는 CDN/Edge/ISR 캐싱을 적극 활용
3. 비용이 큰 쿼리(전체 테이블 스캔, `select *`)를 최소화하고 필요한 컬럼만 조회
4. 인덱스 검토 및 추가(자주 사용하는 `WHERE`/`ORDER BY` 컬럼)
5. 레이트리밋/캡 차단(특히 로그인/카운터 엔드포인트) — Redis 기반 권장
6. 서버 전용 키 관리 및 환경변수 분리(클라이언트 공개 키와 서버 역할 키 분리)
7. 모니터링/알림 도입(에러/쿼리 비용/지연)

## 2. 구체적 권장 작업

### A. 조회/카운터 패턴
- 문제: 현재 `view` 엔드포인트는 `SELECT` 후 `UPDATE`를 수행합니다. 높은 동시성 시 레이스와 다수의 쓰기 요청이 발생해 비용 증가.
- 권장:
  - 데이터베이스 측에 `increment_view_count(work_id uuid)` RPC를 만들어 atomic하게 `UPDATE ... SET view_count = view_count + 1 WHERE id = work_id` 수행. Supabase에서는 `rpc()`로 호출 가능.
  - 더 나아가 쓰기 빈도가 매우 높은 항목은 Redis 같은 메모리 캐시에서 카운터를 유지하고 주기적으로 DB로 flush(예: 1분 간격, 또는 배치 사이즈 도달 시)하는 패턴 권장.
  - 장점: DB 쓰기 횟수 감소, 비용 절감, 레이턴시 개선.

### B. 캐싱 전략
- 정적 자원: `public/images` 등은 CDN(예: Vercel, Cloudflare)으로 캐시하고 `Cache-Control: public, max-age=31536000, immutable` 사용.
- 동적 페이지/데이터:
  - 변경이 적은 데이터는 ISR(Incremental Static Regeneration) 또는 Edge Cache 사용.
  - `stale-while-revalidate` 패턴으로 사용자 지연 최소화.
- 서버 API에 `Cache-Control` 헤더를 적절히 설정해 CDN 계층에서 캐시되도록 유도.

### C. 쿼리 최적화
- `select '*'` 사용 지양: 필요한 필드만 명시.
- 페이지네이션: 목록 API에서 전체를 반환하지 말고 `limit/offset` 혹은 cursor 기반 페이지네이션 사용.
- N+1 문제 점검: 관계형 joins 혹은 관계 조회 시 `select`로 관련 필드만 조인하여 한 번의 쿼리로 처리.
- 인덱스: `id`, `slug`, `is_published`, `published_at`, `year`, `view_count`(정렬 빈도 높은 컬럼) 등에 적절한 인덱스 존재 여부 확인.

### D. 환경변수·키 관리
- 현재 서버 코드에서 `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 사용중인 곳이 있음. 서버 전용 작업(예: DB 관리, 증가 등)은 `SUPABASE_SERVICE_ROLE_KEY` 같은 서버 전용 키를 사용하고 절대 클라이언트에 노출하지 말 것.
- 키는 주기적 회전과 최소 권한 원칙 적용.

### E. 레이트 리미팅 및 비용 보호
- 로그인, 뷰 카운트, API 목록 엔드포인트에 레이트리밋 적용.
- 인메모리 제한(현재 추가한 구현)은 배포된 멀티 인스턴스 환경에서 일관되지 않을 수 있으므로 Redis 기반 중앙 카운터로 전환 권장.

### F. 모니터링 및 비용 추적
- 쿼리 성능 및 비용을 추적(예: Supabase 로그, pg_stat_statements)하고, 비용 이상 시 알림.
- 에러 및 성능 지표는 Sentry/Datadog 등으로 집계.

## 3. 코드 변경 예시
- `app/api/works/[id]/view/route.ts`에서 `rpc('increment_view_count', { work_id: id })`를 우선 호출하도록 변경(프로젝트에 RPC 함수 배포 필요).
- Redis 버퍼: `INCR`로 카운터를 올리고 주기적 크론(job)으로 DB 반영.

예시 RPC SQL (Postgres):

```sql
create or replace function increment_view_count(work_id uuid) returns void as $$
begin
  update showcase_works set view_count = view_count + 1 where id = work_id;
end; $$ language plpgsql;
```

## 4. 마이그레이션/배포 계획(권장)
1. DB에 `increment_view_count` RPC 추가.
2. API에서 RPC 호출을 우선하도록 배포(현재 구현은 RPC 실패 시 fallback 유지).
3. Redis 인프라(혹은 Supabase Realtime/Edge KV) 준비 후, 카운터 버퍼링 실험 적용.
4. 모니터링 대시보드(쿼리 비용, 쓰기량, 에러율) 설정 및 경보 규칙 추가.

## 5. 다음 단계 제안
- 제가 다음으로 할 수 있는 작업들:
  1. 코드베이스 전체에서 `select '*'` 와 대량 읽기 API 목록을 추출해 최적화 우선순위 산정
  2. 인덱스 검토를 위한 테이블-컬럼 매핑 문서 초안 작성
  3. Redis 기반 카운터 예제 구현(코드 + 간단한 로컬 테스트)

원하시면 바로 1번(대상 API 추출 및 우선순위 산정)을 실행하겠습니다.
