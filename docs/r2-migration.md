# Cloudflare R2 이미지 스토리지 이전 가이드

Supabase Storage → Cloudflare R2 전환 작업 문서.
**코드 측 작업은 완료**되어 있으며, 아래는 계정 권한이 필요한 인프라/데이터 작업 절차다.

---

## 요약

| 항목 | 내용 |
| --- | --- |
| 전환 방식 | 단일 R2 버킷(`nwcn-assets`) + key prefix |
| prefix | `work-thumbnails/`, `ncr-thumbnails/`, `ninc-images/` (기존 Supabase 버킷명 그대로) |
| 공개 접근 | 커스텀 도메인 (예: `https://assets.도메인`) |
| 기존 이미지 | rclone 일괄 복사 후 DB URL 치환 |
| 코드 변경점 | `lib/r2/client.ts`(신규), `app/admin/actions.ts`(헬퍼 2개), `next.config.mjs` |

업로드/삭제는 `app/admin/actions.ts`의 `uploadToStorage` / `deleteFromStorage` 두 함수만
거치므로 호출부 18곳은 변경하지 않았다.

---

## 1. Cloudflare R2 버킷 생성

1. Cloudflare 대시보드 → **R2** → **Create bucket**
2. 이름: `nwcn-assets` (`.env`의 `R2_BUCKET_NAME`과 일치)
3. 위치: Automatic 권장

## 2. 커스텀 도메인 연결 (공개 접근)

R2는 기본적으로 비공개다. 공개 서빙은 커스텀 도메인으로 한다.

1. 버킷 → **Settings** → **Public access** → **Custom Domains** → **Connect Domain**
2. 서브도메인 입력 (예: `assets.도메인`) — 해당 도메인이 Cloudflare DNS로 관리되고 있어야 함
3. Cloudflare가 자동으로 CNAME 레코드를 생성/프록시 처리
4. 발급된 도메인이 `R2_PUBLIC_URL` 값이 됨 (예: `https://assets.도메인`)

> r2.dev 개발 URL은 레이트 리밋이 있어 프로덕션 부적합. 커스텀 도메인을 사용한다.

## 3. R2 API 토큰 발급

1. R2 → **Manage R2 API Tokens** → **Create API Token**
2. 권한: **Object Read & Write**, 대상 버킷: `nwcn-assets`
3. 발급된 **Access Key ID / Secret Access Key**, 그리고 계정 ID를 환경변수에 입력

## 4. 환경변수 설정 (`.env.local`)

`.env.local.example`에 템플릿이 있다. 실제 값으로 채운다:

```bash
R2_ACCOUNT_ID=<Cloudflare 계정 ID>
R2_ACCESS_KEY_ID=<API 토큰 Access Key ID>
R2_SECRET_ACCESS_KEY=<API 토큰 Secret Access Key>
R2_BUCKET_NAME=nwcn-assets
R2_PUBLIC_URL=https://assets.도메인        # 끝에 슬래시(/) 없이
```

> `R2_PUBLIC_URL`은 `next.config.mjs`가 next/image 허용 호스트로도 사용하므로
> 값 변경 후에는 **dev 서버 재시작**이 필요하다.

---

## 5. 기존 이미지 일괄 이전 (rclone)

### 5-1. rclone 설치 및 설정

```bash
# 설치 (macOS)
brew install rclone
```

`~/.config/rclone/rclone.conf`에 두 remote 추가:

```ini
# Supabase Storage (S3 호환 — Project Settings → Storage → S3 Connection)
[supabase]
type = s3
provider = Other
access_key_id     = <Supabase S3 Access Key>
secret_access_key = <Supabase S3 Secret Key>
endpoint = https://<PROJECT_REF>.supabase.co/storage/v1/s3
region = <프로젝트 리전, 예: ap-northeast-2>

# Cloudflare R2
[r2]
type = s3
provider = Cloudflare
access_key_id     = <R2 Access Key ID>
secret_access_key = <R2 Secret Access Key>
endpoint = https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
region = auto
```

### 5-2. 버킷 → prefix 복사

기존 Supabase 버킷 3개를 R2 단일 버킷의 prefix로 복사:

```bash
rclone copy supabase:work-thumbnails  r2:nwcn-assets/work-thumbnails  --progress
rclone copy supabase:ncr-thumbnails   r2:nwcn-assets/ncr-thumbnails   --progress
rclone copy supabase:ninc-images      r2:nwcn-assets/ninc-images      --progress
```

복사 검증:

```bash
rclone check supabase:work-thumbnails r2:nwcn-assets/work-thumbnails
rclone check supabase:ncr-thumbnails  r2:nwcn-assets/ncr-thumbnails
rclone check supabase:ninc-images     r2:nwcn-assets/ninc-images
```

---

## 6. DB URL 일괄 치환

복사 완료 후, DB에 저장된 이미지 URL을 Supabase → R2 도메인으로 치환한다.
**반드시 먼저 백업/스냅샷**을 뜬 뒤 실행할 것.

Supabase 공개 URL 형식:
`https://<PROJECT_REF>.supabase.co/storage/v1/object/public/<버킷>/<경로>`
→ R2 형식: `https://assets.도메인/<버킷>/<경로>`

prefix가 버킷명과 동일하므로 `.../object/public/` 구간만 도메인으로 치환하면 된다.

```sql
-- ⚠️ 실행 전: 아래 두 값을 실제 값으로 교체
--   <SUPABASE_BASE> = https://<PROJECT_REF>.supabase.co/storage/v1/object/public
--   <R2_BASE>       = https://assets.도메인

-- works.thumbnail_url
UPDATE works
SET thumbnail_url = REPLACE(thumbnail_url, '<SUPABASE_BASE>', '<R2_BASE>')
WHERE thumbnail_url LIKE '<SUPABASE_BASE>/%';

-- 동일 패턴으로 다른 테이블/컬럼도 치환
-- (thumbnail_url / poster_url 등, 실제 스키마에 맞춰 추가)
UPDATE ncr SET thumbnail_url = REPLACE(thumbnail_url, '<SUPABASE_BASE>', '<R2_BASE>')
  WHERE thumbnail_url LIKE '<SUPABASE_BASE>/%';
UPDATE ninc SET thumbnail_url = REPLACE(thumbnail_url, '<SUPABASE_BASE>', '<R2_BASE>')
  WHERE thumbnail_url LIKE '<SUPABASE_BASE>/%';
UPDATE ninc SET poster_url   = REPLACE(poster_url, '<SUPABASE_BASE>', '<R2_BASE>')
  WHERE poster_url LIKE '<SUPABASE_BASE>/%';
```

> 정확한 테이블/컬럼명은 마이그레이션 SQL과 실제 스키마를 확인해 보강한다.
> 치환 대상 컬럼을 찾으려면: 이미지 URL을 저장하는 컬럼(`*_url`)을 전수 점검.

치환 결과 확인:

```sql
SELECT thumbnail_url FROM works WHERE thumbnail_url LIKE '%supabase.co%' LIMIT 5;
-- 결과가 0건이면 치환 완료
```

---

## 7. 검증 및 마무리

1. 관리자 페이지에서 **신규 이미지 업로드** → R2 도메인 URL로 저장되는지 확인
2. **기존 이미지** 정상 표시 확인 (치환된 R2 URL)
3. **업데이트 시 기존 파일 삭제** 동작 확인 (R2 콘솔에서 구 객체 삭제 여부)
4. 모든 이미지가 R2에서 정상 서빙되면:
   - `next.config.mjs`의 `**.supabase.co` remotePattern 제거 가능
   - Supabase Storage 버킷 비우기/삭제로 티어 사용량 회수

## 롤백

- 코드: R2 헬퍼 커밋을 revert하면 즉시 Supabase Storage로 복귀
- DB URL: 치환 SQL의 `<R2_BASE>` ↔ `<SUPABASE_BASE>`를 바꿔 역치환
- 이전 기간 동안 Supabase 원본을 **삭제하지 않고 유지**하면 안전하게 롤백 가능
