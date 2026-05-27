-- ============================================================
-- Migration: ncr_reports 테이블에 is_home_featured 컬럼 추가
-- 설명: 홈 페이지에 노출할 아티클을 최대 2개까지 고정하는 기능
--
-- Supabase 대시보드 → SQL Editor에 붙여넣고 실행하세요.
-- ============================================================

-- 1. 컬럼 추가 (이미 있으면 오류가 나므로 조건부로 실행)
ALTER TABLE ncr_reports
  ADD COLUMN IF NOT EXISTS is_home_featured BOOLEAN NOT NULL DEFAULT false;

-- 2. 최대 2개 제한을 위한 인덱스 (조회 성능)
CREATE INDEX IF NOT EXISTS idx_ncr_reports_home_featured
  ON ncr_reports (is_home_featured)
  WHERE is_home_featured = true;

-- 3. (선택) 고정 아티클이 2개를 초과하지 않도록 DB 레벨 제약 추가
--    트리거 방식 — 필요하지 않으면 생략 가능
CREATE OR REPLACE FUNCTION check_home_featured_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_home_featured = true THEN
    IF (SELECT COUNT(*) FROM ncr_reports WHERE is_home_featured = true AND id <> NEW.id) >= 2 THEN
      RAISE EXCEPTION '홈 고정 아티클은 최대 2개까지만 설정할 수 있습니다.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_home_featured_limit ON ncr_reports;
CREATE TRIGGER trg_home_featured_limit
  BEFORE INSERT OR UPDATE ON ncr_reports
  FOR EACH ROW EXECUTE FUNCTION check_home_featured_limit();
