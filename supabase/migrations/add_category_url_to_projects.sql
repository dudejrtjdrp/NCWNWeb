-- ================================================================
-- projects 테이블: 분야(category) · 관련 링크(project_url) 컬럼 추가
-- 사유: 프로젝트 상세에서 보여줄 데이터 항목 확장
--       (Awards 의 category 패턴 참고 + 외부 결과물 링크)
--
-- 실행: Supabase Dashboard → SQL Editor에서 이 파일 내용을 붙여넣고 실행
-- 참고: participants(text[]) · skills(text[]) · outcome(text) · duration(text)
--       컬럼은 이미 존재하므로 여기서 추가하지 않는다(시드 데이터 기준).
-- ================================================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS category    TEXT,
  ADD COLUMN IF NOT EXISTS project_url TEXT;

COMMENT ON COLUMN projects.category    IS '프로젝트 분야 (예: 영상제작, 브랜딩, UX/UI, 전시) — 단일 텍스트';
COMMENT ON COLUMN projects.project_url IS '관련 결과물/외부 링크 (http(s) URL)';
