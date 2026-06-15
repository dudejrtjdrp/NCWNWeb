-- ================================================================
-- 쇼케이스 시드 기반 랜덤 정렬 RPC
--
-- 목적: WORK > SHOWCASE 무한 스크롤에서 "데이터 순서 랜덤"을 안전하게 지원
--   - ORDER BY random() + OFFSET 은 페이지마다 순서가 바뀌어 중복/누락 발생
--   - 대신 클라이언트가 만든 seed 로 md5(id || seed) 정렬 → 같은 seed 면 순서가 항상 동일
--     → OFFSET 페이지네이션 안전(중복/누락 없음), seed 가 매번 달라 데이터 순서는 랜덤
--   - 필터: p_tag(tech_stack 포함), p_q(제목/작가 ILIKE)
--
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 실행
-- ================================================================

CREATE OR REPLACE FUNCTION get_showcase_works_random(
  p_seed   text,
  p_tag    text DEFAULT NULL,
  p_q      text DEFAULT NULL,
  p_offset int  DEFAULT 0,
  p_limit  int  DEFAULT 15
)
RETURNS SETOF showcase_works
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM showcase_works w
  WHERE (p_tag IS NULL OR p_tag = '' OR p_tag = '전체' OR w.tech_stack @> ARRAY[p_tag])
    AND (
      p_q IS NULL OR p_q = ''
      OR w.title  ILIKE '%' || p_q || '%'
      OR w.author ILIKE '%' || p_q || '%'
    )
  ORDER BY md5(w.id::text || COALESCE(p_seed, ''))
  OFFSET GREATEST(p_offset, 0)
  LIMIT  LEAST(GREATEST(p_limit, 1), 60)
$$;

-- 공개 읽기 클라이언트(anon)에서 호출 가능하도록 권한 부여
GRANT EXECUTE ON FUNCTION get_showcase_works_random(text, text, text, int, int) TO anon, authenticated;
