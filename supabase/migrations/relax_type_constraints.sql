-- ================================================================
-- 유형(type) CHECK 제약 제거
-- 사유: NCR 아티클 유형 / 프로젝트 유형을 "유형 관리"(settings 테이블)에서
--       동적으로 추가·수정·삭제하도록 변경했으므로, DB에 하드코딩된
--       CHECK 제약이 남아 있으면 새 유형 저장 시 거부된다.
--       (애플리케이션에서 드롭다운으로 유효 값만 입력받으므로 안전)
--
-- 실행: Supabase Dashboard → SQL Editor에서 이 파일 내용을 붙여넣고 실행
-- ================================================================

-- NCR 아티클 유형 제약 제거
ALTER TABLE ncr_reports DROP CONSTRAINT IF EXISTS ncr_reports_type_check;

-- 프로젝트 유형 제약 제거 (있는 경우)
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_type_check;
