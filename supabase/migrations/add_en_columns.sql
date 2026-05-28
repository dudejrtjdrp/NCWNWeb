-- ================================================================
-- 다국어 지원: 영어 버전 컬럼 추가
-- 실행: Supabase Dashboard → SQL Editor에서 이 파일 내용을 붙여넣고 실행
-- ================================================================

-- ── ncr_reports (NCR 아티클) ──────────────────────────────────
ALTER TABLE ncr_reports
  ADD COLUMN IF NOT EXISTS title_en       TEXT,
  ADD COLUMN IF NOT EXISTS excerpt_en     TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS content_en     TEXT;

COMMENT ON COLUMN ncr_reports.title_en       IS 'English title (optional, falls back to title if empty)';
COMMENT ON COLUMN ncr_reports.excerpt_en     IS 'English excerpt';
COMMENT ON COLUMN ncr_reports.description_en IS 'English description';
COMMENT ON COLUMN ncr_reports.content_en     IS 'English content (markdown)';

-- ── awards (수상 내역) ─────────────────────────────────────────
ALTER TABLE awards
  ADD COLUMN IF NOT EXISTS competition_en  TEXT,
  ADD COLUMN IF NOT EXISTS award_name_en   TEXT,
  ADD COLUMN IF NOT EXISTS hosted_by_en    TEXT,
  ADD COLUMN IF NOT EXISTS description_en  TEXT;

COMMENT ON COLUMN awards.competition_en  IS 'English competition name';
COMMENT ON COLUMN awards.award_name_en   IS 'English award grade/name';
COMMENT ON COLUMN awards.hosted_by_en    IS 'English organizer name';
COMMENT ON COLUMN awards.description_en  IS 'English description';

-- ── projects (산학/국제 프로젝트) ─────────────────────────────
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS title_en       TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS outcome_en     TEXT;

COMMENT ON COLUMN projects.title_en       IS 'English project title';
COMMENT ON COLUMN projects.description_en IS 'English description';
COMMENT ON COLUMN projects.outcome_en     IS 'English outcome';

-- ── events (이벤트) ───────────────────────────────────────────
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS title_en       TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT;

COMMENT ON COLUMN events.title_en       IS 'English event title';
COMMENT ON COLUMN events.description_en IS 'English description';

-- ── showcase_works (쇼케이스 작품) ───────────────────────────
ALTER TABLE showcase_works
  ADD COLUMN IF NOT EXISTS title_en       TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT;

COMMENT ON COLUMN showcase_works.title_en       IS 'English work title';
COMMENT ON COLUMN showcase_works.description_en IS 'English description';
