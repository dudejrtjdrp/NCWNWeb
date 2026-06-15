# Cloudflare R2 이미지 스토리지 이전 가이드

Supabase Storage → Cloudflare R2 전환 작업 문서.

**코드 측 전환은 완료**되었다(아래 "코드 변경 내역" 참고).
이제 남은 것은 **계정 권한이 필요한 인프라/데이터 작업**이다: R2 버킷 생성 → 커스텀
도메인 연결 → API 토큰 발급 → 환경변수 입력 → 기존 파일 복사(rclone) → DB URL 치환.

---

## 요약

| 항목 | 내용 |
| --- | --- |
| 전환 방식 | 단일 R2 버킷(`nwcn-assets`) + key prefix |
| prefix | 기존 Supabase 버킷명을 그대로 사용 (`work-thumbnails/`, `ncr-thumbnails/`, `ninc-images/` 등) |
| 공개 접근 | 커스텀 도메인 (예: `https://assets.도메인`) |
| 기존 이미지 | rclone 일괄 복사 후 DB URL 도메인 치환 |
| 핵심 원칙 | **prefix = 기존 버킷명**이라 URL 경로 구조가 동일 → DB는 "베이스 도메인"만 치환하면 됨 |

### 코드 변경 내역 (완료)

| 파일 | 변경 |
| --- | --- |
| `lib/r2/client.ts` | R2(S3 호환) 클라이언트 + `buildPublicUrl` / `extractKeyFromUrl` 헬퍼 |
| `app/admin/actions.ts` | `uploadToStorage` / `deleteFromStorage` → R2 구현으로 교체. **본문 인라인 이미지 업로드(`uploadArticleImage`)도 R2로 교체** |
| `next.config.mjs` | `R2_PUBLIC_URL` 호스트를 next/image 허용 목록에 추가 (Supabase 패턴은 이전 기간 동안 유지) |
| `.env.local.example` | R2 환경변수 템플릿 |

> 업로드/삭제는 `actions.ts`의 `uploadToStorage` / `deleteFromStorage` 두 헬퍼와
> 본문 인라인용 `uploadArticleImage` **세 경로**를 거친다. 셋 다 R2로 전환되었고,
> 각 CRUD 호출부(work/ncr/award/project/exhibition)는 시그니처 호환으로 수정 불필요.

---

## 1. Cloudflare R2 버킷 생성

1. Cloudflare 대시보드 → **R2 Object Storage** → **Create bucket**
   - (좌측 메뉴: Storage & databases → R2, 또는 홈의 "Build with Workers" 영역 아님 주의)
2. 이름: `nwcn-assets` (`.env`의 `R2_BUCKET_NAME`과 일치)
3. 위치: Automatic 권장 → **Create bucket**

## 2. 커스텀 도메인 연결 (공개 접근)

R2는 기본적으로 비공개다. 공개 서빙은 커스텀 도메인으로 한다.

1. 버킷 → **Settings** → **Public access** → **Custom Domains** → **Connect Domain**
2. 서브도메인 입력 (예: `assets.도메인`) — 해당 도메인이 **Cloudflare DNS로 관리**되고 있어야 함
3. Cloudflare가 자동으로 CNAME 레코드를 생성/프록시 처리
4. 발급된 도메인이 `R2_PUBLIC_URL` 값이 됨 (예: `https://assets.도메인`)

> r2.dev 개발 URL은 레이트 리밋이 있어 프로덕션 부적합. 커스텀 도메인을 사용한다.

## 3. R2 API 토큰 발급

1. R2 → **Manage R2 API Tokens** → **Create API Token**
2. 권한: **Object Read & Write**, 대상 버킷: `nwcn-assets` (특정 버킷으로 한정 권장)
3. 발급된 **Access Key ID / Secret Access Key**, 그리고 **계정 ID**(R2 개요 우측 또는 토큰 화면)를 환경변수에 입력

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
> 프로덕션(Vercel 등)에도 동일 5개 변수를 환경변수로 등록할 것.

### 4-1. 신규 업로드 먼저 검증 (데이터 복사 전)

위 1~4까지만 끝내면 **신규 업로드는 이미 R2로 저장**된다. 기존 파일 복사 전에
관리자 페이지에서 이미지 한 장을 새로 업로드해 R2 도메인 URL로 저장·표시되는지
먼저 확인하면, 자격증명/도메인 설정 오류를 데이터 작업 전에 잡을 수 있다.

---

## 5. 기존 이미지 일괄 이전 (rclone)

### 5-1. rclone 설치

```bash
brew install rclone        # macOS
```

### 5-2. 복사할 실제 버킷 확인

코드가 직접 쓰는 prefix는 `work-thumbnails` / `ncr-thumbnails` / `ninc-images`
세 가지지만, 과거 시드/설계상 `exhibition-posters`, `ninc-home`, `faculty-photos`
버킷에 데이터가 있을 수 있다. **실제로 객체가 들어있는 버킷만 복사**하면 된다.

Supabase Dashboard → Storage에서 버킷 목록과 각 버킷 사용량(객체 수)을 확인하거나,
설정 후 `rclone lsd supabase:` 로 버킷 목록을 나열해 비어있지 않은 것만 복사한다.

### 5-3. rclone remote 설정

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

### 5-4. 버킷 → prefix 복사

각 Supabase 버킷을 R2 단일 버킷의 **동일 이름 prefix**로 복사한다
(이래야 URL 경로가 그대로 유지되어 DB는 도메인만 바꾸면 된다):

```bash
# 항상 쓰는 3개
rclone copy supabase:work-thumbnails  r2:nwcn-assets/work-thumbnails  --progress
rclone copy supabase:ncr-thumbnails   r2:nwcn-assets/ncr-thumbnails   --progress
rclone copy supabase:ninc-images      r2:nwcn-assets/ninc-images      --progress

# 데이터가 있을 경우에만 추가로
rclone copy supabase:exhibition-posters r2:nwcn-assets/exhibition-posters --progress
rclone copy supabase:ninc-home          r2:nwcn-assets/ninc-home          --progress
rclone copy supabase:faculty-photos     r2:nwcn-assets/faculty-photos     --progress
```

복사 검증 (개수·해시 비교):

```bash
rclone check supabase:work-thumbnails r2:nwcn-assets/work-thumbnails
rclone check supabase:ncr-thumbnails  r2:nwcn-assets/ncr-thumbnails
rclone check supabase:ninc-images     r2:nwcn-assets/ninc-images
# 복사한 다른 버킷도 동일하게 check
```

---

## 6. DB URL 일괄 치환

복사 완료 후, DB에 저장된 이미지 URL의 **베이스 도메인만** Supabase → R2로 치환한다.
prefix(=버킷명)와 그 뒤 경로가 동일하므로 `.../object/public` 구간까지를 R2 도메인으로
바꾸면 모든 버킷 URL이 한 번에 정리된다.

> ⚠️ **반드시 먼저 Supabase 백업/스냅샷**을 뜬 뒤 실행할 것.

치환 대상 (이미지 URL을 담는 모든 컬럼):

| 테이블 | 컬럼 | 비고 |
| --- | --- | --- |
| `showcase_works` | `thumbnail_url` | |
| `ncr_reports` | `thumbnail_url` | |
| `ncr_reports` | `content`, `content_en` | **본문 HTML 내 인라인 `<img src>`** — 누락 주의 |
| `awards` | `thumbnail_url` | |
| `projects` | `thumbnail_url` | |
| `exhibitions` | `poster_url` | |
| `ninc_home_cards` | `image_url` | 데이터가 있으면 |
| `faculty` | `photo_url` | 테이블/데이터가 있으면 |

```sql
-- ⚠️ 실행 전: 아래 두 값을 실제 값으로 교체
--   <SUPABASE_BASE> = https://<PROJECT_REF>.supabase.co/storage/v1/object/public
--   <R2_BASE>       = https://assets.도메인

-- 단순 URL 컬럼
UPDATE showcase_works SET thumbnail_url = REPLACE(thumbnail_url, '<SUPABASE_BASE>', '<R2_BASE>')
  WHERE thumbnail_url LIKE '<SUPABASE_BASE>/%';

UPDATE ncr_reports SET thumbnail_url = REPLACE(thumbnail_url, '<SUPABASE_BASE>', '<R2_BASE>')
  WHERE thumbnail_url LIKE '<SUPABASE_BASE>/%';

UPDATE awards SET thumbnail_url = REPLACE(thumbnail_url, '<SUPABASE_BASE>', '<R2_BASE>')
  WHERE thumbnail_url LIKE '<SUPABASE_BASE>/%';

UPDATE projects SET thumbnail_url = REPLACE(thumbnail_url, '<SUPABASE_BASE>', '<R2_BASE>')
  WHERE thumbnail_url LIKE '<SUPABASE_BASE>/%';

UPDATE exhibitions SET poster_url = REPLACE(poster_url, '<SUPABASE_BASE>', '<R2_BASE>')
  WHERE poster_url LIKE '<SUPABASE_BASE>/%';

-- 데이터가 있으면
UPDATE ninc_home_cards SET image_url = REPLACE(image_url, '<SUPABASE_BASE>', '<R2_BASE>')
  WHERE image_url LIKE '<SUPABASE_BASE>/%';
UPDATE faculty SET photo_url = REPLACE(photo_url, '<SUPABASE_BASE>', '<R2_BASE>')
  WHERE photo_url LIKE '<SUPABASE_BASE>/%';

-- 본문 HTML 내 인라인 이미지 (전체 본문에 대해 REPLACE — URL이 여러 개여도 모두 치환됨)
UPDATE ncr_reports SET content = REPLACE(content, '<SUPABASE_BASE>', '<R2_BASE>')
  WHERE content LIKE '%<SUPABASE_BASE>%';
UPDATE ncr_reports SET content_en = REPLACE(content_en, '<SUPABASE_BASE>', '<R2_BASE>')
  WHERE content_en LIKE '%<SUPABASE_BASE>%';
```

치환 결과 확인 (모두 0건이면 완료):

```sql
SELECT count(*) FROM showcase_works WHERE thumbnail_url LIKE '%supabase.co%';
SELECT count(*) FROM ncr_reports    WHERE thumbnail_url LIKE '%supabase.co%'
                                       OR content        LIKE '%supabase.co%'
                                       OR content_en     LIKE '%supabase.co%';
SELECT count(*) FROM awards         WHERE thumbnail_url LIKE '%supabase.co%';
SELECT count(*) FROM projects       WHERE thumbnail_url LIKE '%supabase.co%';
SELECT count(*) FROM exhibitions    WHERE poster_url    LIKE '%supabase.co%';
```

---

## 7. 검증 및 마무리

1. 관리자 페이지에서 **신규 이미지 업로드** → R2 도메인 URL로 저장되는지 확인
2. **본문(content) 에디터에 이미지 삽입** → R2 URL로 저장되는지 확인 (인라인 경로 검증)
3. **기존 이미지** 정상 표시 확인 (치환된 R2 URL)
4. **수정/삭제 시 기존 파일 삭제** 동작 확인 (R2 콘솔에서 구 객체가 사라지는지)
5. 모든 이미지가 R2에서 정상 서빙되면:
   - `next.config.mjs`의 `**.supabase.co` remotePattern 제거 가능
   - Supabase Storage 버킷 비우기/삭제로 사용량 회수

## 롤백

- **코드**: R2 전환 커밋을 revert하면 Supabase Storage 구현으로 즉시 복귀
- **DB URL**: 치환 SQL의 `<R2_BASE>` ↔ `<SUPABASE_BASE>`를 바꿔 역치환
- **안전 장치**: 이전 기간 동안 Supabase 원본을 **삭제하지 않고 유지**하면 언제든 롤백 가능
