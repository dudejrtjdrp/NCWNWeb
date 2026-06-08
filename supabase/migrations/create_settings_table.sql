-- ================================================================
-- settings 테이블 생성
-- 용도: 관리자 설정값을 key/value JSON으로 저장
--   - work_filter_tags  : 쇼케이스 필터 태그 목록 (string[])
--   - article_filter_tags : 아티클 태그 목록 (string[])
--   - article_types     : NCR 아티클 유형 목록 ({value, label}[])
--   - project_types     : 프로젝트 유형 목록 ({value, label}[])
--
-- 실행: Supabase Dashboard → SQL Editor에서 이 파일 내용을 붙여넣고 실행
-- ================================================================

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT        PRIMARY KEY,
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION settings_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_settings_updated_at ON settings;
CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION settings_updated_at();

-- ── 기본값 삽입 (이미 있으면 덮어쓰지 않음) ─────────────────
INSERT INTO settings (key, value) VALUES
  ('work_filter_tags',    '["Video","Graphic","Web","Motion","Photo","AI"]'),
  ('article_filter_tags', '[]'),
  ('article_types',       '[{"value":"editorial","label":"에디토리얼"},{"value":"trend","label":"트렌드"},{"value":"card_news","label":"카드뉴스"}]'),
  ('project_types',       '[{"value":"industry","label":"산학협력"},{"value":"international","label":"해외교류"}]')
ON CONFLICT (key) DO NOTHING;

-- RLS 활성화
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 읽기: 누구나 가능 (필터 태그 목록은 공개 데이터)
CREATE POLICY "settings_read_public"
  ON settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- 쓰기: 로그인한 관리자(authenticated)만 가능
-- actions.ts는 anon 키 + 세션 쿠키로 authenticated role로 동작
CREATE POLICY "settings_write_authenticated"
  ON settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
