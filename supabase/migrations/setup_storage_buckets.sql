-- ================================================================
-- Supabase Storage 버킷 + 정책 설정
-- 용도: 이미지 업로드용 public 버킷 생성 및 업로드 권한(RLS) 부여
--   - ncr-thumbnails  : NCR 아티클 썸네일 + 본문 인라인 이미지(content/ prefix)
--   - work-thumbnails : 쇼케이스 작품 썸네일
--   - ninc-images     : NINC 프로젝트/수상 이미지
--
-- 실행: Supabase Dashboard → SQL Editor에서 이 파일 내용을 붙여넣고 실행
-- (R2로 이전하기 전까지 사용. 이미 버킷이 있으면 public 설정만 갱신됨)
-- ================================================================

-- ── 버킷 생성 (public 읽기) ────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('ncr-thumbnails',  'ncr-thumbnails',  true),
  ('work-thumbnails', 'work-thumbnails', true),
  ('ninc-images',     'ninc-images',     true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ── 공개 읽기 정책 ─────────────────────────────────────────
DROP POLICY IF EXISTS "nwcn_public_read" ON storage.objects;
CREATE POLICY "nwcn_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id IN ('ncr-thumbnails', 'work-thumbnails', 'ninc-images'));

-- ── 인증 관리자 업로드(INSERT) 정책 ───────────────────────
DROP POLICY IF EXISTS "nwcn_auth_insert" ON storage.objects;
CREATE POLICY "nwcn_auth_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('ncr-thumbnails', 'work-thumbnails', 'ninc-images'));

-- ── 인증 관리자 수정(UPDATE) 정책 ─────────────────────────
DROP POLICY IF EXISTS "nwcn_auth_update" ON storage.objects;
CREATE POLICY "nwcn_auth_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id IN ('ncr-thumbnails', 'work-thumbnails', 'ninc-images'))
  WITH CHECK (bucket_id IN ('ncr-thumbnails', 'work-thumbnails', 'ninc-images'));

-- ── 인증 관리자 삭제(DELETE) 정책 ─────────────────────────
DROP POLICY IF EXISTS "nwcn_auth_delete" ON storage.objects;
CREATE POLICY "nwcn_auth_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id IN ('ncr-thumbnails', 'work-thumbnails', 'ninc-images'));
