# Supabase 연결 가이드

## 1. Supabase 프로젝트 생성

1. [https://supabase.com](https://supabase.com) 접속 → **New project** 생성
2. Project name, Database password 설정 (비밀번호 메모 필수)
3. Region: **Northeast Asia (Seoul)** 선택

---

## 2. 환경변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 시딩/서버 전용 (Service Role Key - 절대 클라이언트에 노출 금지)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

값 확인 위치: Supabase Dashboard → **Settings → API**
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

---

## 3. SQL 스키마 실행

Supabase Dashboard → **SQL Editor** → 아래 SQL 전체 복사 후 실행

```sql
-- =============================================
-- NWCN Database Schema
-- =============================================

-- 교수진
CREATE TABLE IF NOT EXISTS faculty (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('교수', '조교')),
  photo_url TEXT,
  color_variant TEXT NOT NULL DEFAULT 'green-solid',
  quote TEXT,
  email TEXT,
  education TEXT[] DEFAULT '{}',
  career TEXT[] DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 교육과정
CREATE TABLE IF NOT EXISTS curriculum (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade INT NOT NULL CHECK (grade BETWEEN 1 AND 4),
  semester INT CHECK (semester IN (1, 2)),
  course_name TEXT NOT NULL,
  description TEXT,
  credits INT,
  sort_order INT NOT NULL DEFAULT 0
);

-- 쇼케이스 작품
CREATE TABLE IF NOT EXISTS showcase_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  year INT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'video' CHECK (type IN ('video', 'design', '3d')),
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  video_embed TEXT,
  model_embed TEXT,
  images TEXT[] DEFAULT '{}',
  view_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 졸업전시
CREATE TABLE IF NOT EXISTS exhibitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT,
  poster_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 수상
CREATE TABLE IF NOT EXISTS awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition TEXT NOT NULL,
  award_name TEXT NOT NULL,
  winner TEXT,
  team_members TEXT[] DEFAULT '{}',
  year INT NOT NULL,
  category TEXT,
  hosted_by TEXT,
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 프로젝트
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('industry', 'international')),
  partner TEXT,
  year INT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 이벤트
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '기타',
  start_date DATE NOT NULL,
  end_date DATE,
  location TEXT,
  description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 홈 NINC 슬라이드 카드
CREATE TABLE IF NOT EXISTS ninc_home_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  link_href TEXT,
  card_width INT NOT NULL DEFAULT 360,
  card_height INT NOT NULL DEFAULT 480,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NCR 리포트 (아티클)
CREATE TABLE IF NOT EXISTS ncr_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT,
  type TEXT NOT NULL CHECK (type IN ('editorial', 'trend', 'card_news')),
  season TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  excerpt TEXT,
  description TEXT,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  related_ids UUID[] DEFAULT '{}',
  thumbnail_url TEXT,
  read_time TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- RLS (Row Level Security)
-- =============================================

ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ninc_home_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE ncr_reports ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (모든 테이블)
CREATE POLICY "public_read_faculty"         ON faculty           FOR SELECT USING (true);
CREATE POLICY "public_read_curriculum"      ON curriculum        FOR SELECT USING (true);
CREATE POLICY "public_read_showcase_works"  ON showcase_works    FOR SELECT USING (true);
CREATE POLICY "public_read_exhibitions"     ON exhibitions       FOR SELECT USING (true);
CREATE POLICY "public_read_awards"          ON awards            FOR SELECT USING (true);
CREATE POLICY "public_read_projects"        ON projects          FOR SELECT USING (true);
CREATE POLICY "public_read_events"          ON events            FOR SELECT USING (true);
CREATE POLICY "public_read_ninc_home_cards" ON ninc_home_cards   FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_ncr_reports"     ON ncr_reports       FOR SELECT USING (is_published = true);

-- 인증된 사용자만 쓰기 가능
CREATE POLICY "auth_write_faculty"         ON faculty           FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_curriculum"      ON curriculum        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_showcase_works"  ON showcase_works    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_exhibitions"     ON exhibitions       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_awards"          ON awards            FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_projects"        ON projects          FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_events"          ON events            FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_ninc_home_cards" ON ninc_home_cards   FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_ncr_reports"     ON ncr_reports       FOR ALL USING (auth.role() = 'authenticated');

-- view_count 익명 증가 허용 (showcase_works)
CREATE POLICY "anon_increment_view_count" ON showcase_works
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- =============================================
-- 인덱스
-- =============================================

CREATE INDEX IF NOT EXISTS idx_showcase_works_year ON showcase_works (year DESC);
CREATE INDEX IF NOT EXISTS idx_showcase_works_type ON showcase_works (type);
CREATE INDEX IF NOT EXISTS idx_awards_year ON awards (year DESC);
CREATE INDEX IF NOT EXISTS idx_projects_year ON projects (year DESC);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events (start_date ASC);
CREATE INDEX IF NOT EXISTS idx_ncr_reports_published_at ON ncr_reports (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_ncr_reports_type ON ncr_reports (type);
CREATE INDEX IF NOT EXISTS idx_ninc_home_cards_sort ON ninc_home_cards (sort_order ASC);
```

---

## 4. Storage 버킷 생성

Supabase Dashboard → **Storage** → **New bucket**

| 버킷 이름 | Public | 용도 |
|---|---|---|
| `work-thumbnails` | ✅ | 쇼케이스 작품 썸네일 |
| `ncr-thumbnails` | ✅ | NCR 리포트 썸네일 |
| `ninc-images` | ✅ | 수상/프로젝트 이미지 |
| `ninc-home` | ✅ | 홈 NINC 섹션 슬라이드 이미지 |
| `faculty-photos` | ✅ | 교수진 사진 |
| `exhibition-posters` | ✅ | 졸업전시 포스터 |

버킷 생성 시 **Public bucket** 체크박스 활성화 필수.

---

## 5. Admin 계정 생성

Supabase Dashboard → **Authentication → Users → Add user (Invite user)**

- Email: 관리자 이메일 입력
- Password: 강력한 비밀번호 입력
- **"Auto Confirm User"** 체크 후 저장

이후 `/admin/login`에서 해당 이메일/비밀번호로 로그인.

---

## 6. 목데이터 시딩

```bash
# 의존성 설치
npm install -D tsx dotenv

# 시딩 실행
npx tsx scripts/seed.ts
```

> ⚠️ 시딩은 `SUPABASE_SERVICE_ROLE_KEY`를 사용하므로 `.env.local`에 반드시 설정.
> 중복 실행 시 기존 데이터가 있으면 SKIP됩니다.

---

## 7. 개발 서버 재시작

```bash
npm run dev
```

환경변수 변경 후에는 반드시 개발 서버를 재시작해야 합니다.
