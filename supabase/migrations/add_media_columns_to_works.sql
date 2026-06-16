-- ================================================================
-- showcase_works 미디어 컬럼 보강 (제작물 종류별 데이터)
--
-- 목적: 작업물 상세 페이지가 카테고리(type)별로 다른 템플릿을 렌더링한다.
--   - video : video_embed (유튜브 임베드 URL)
--   - design: images (디자인 이미지 URL 배열)
--   - 3d    : model_embed (3D 임베드 URL)
-- 이미 존재하면 건드리지 않으므로(IF NOT EXISTS) 중복 실행해도 안전하다.
--
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 실행
-- ================================================================

ALTER TABLE showcase_works
  ADD COLUMN IF NOT EXISTS type        TEXT NOT NULL DEFAULT 'design',
  ADD COLUMN IF NOT EXISTS video_embed TEXT,
  ADD COLUMN IF NOT EXISTS model_embed TEXT,
  ADD COLUMN IF NOT EXISTS images      TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN showcase_works.type        IS '제작물 종류 카테고리 (단일): video | design | 3d';
COMMENT ON COLUMN showcase_works.video_embed IS 'video 타입 메인 영상 임베드 URL (유튜브 등)';
COMMENT ON COLUMN showcase_works.model_embed IS '3d 타입 임베드 URL (sketchfab 등)';
COMMENT ON COLUMN showcase_works.images      IS 'design 타입 이미지 URL 배열';

-- 기존 type CHECK 제약이 남아 있으면 새 값 저장이 막힐 수 있어 제거한다.
ALTER TABLE showcase_works DROP CONSTRAINT IF EXISTS showcase_works_type_check;
