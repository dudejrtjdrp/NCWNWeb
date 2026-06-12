-- ================================================================
-- showcase_works.related_links 컬럼 추가
-- 용도: 작품 상세페이지에 표시할 외부 관련 링크 목록
--   형식: JSONB 배열 [{ "label": "유튜브", "url": "https://..." }, ...]
--
-- 실행: Supabase Dashboard → SQL Editor에서 이 파일 내용을 붙여넣고 실행
-- ================================================================

ALTER TABLE showcase_works
  ADD COLUMN IF NOT EXISTS related_links JSONB NOT NULL DEFAULT '[]'::jsonb;
