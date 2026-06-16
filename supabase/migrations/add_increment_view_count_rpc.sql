-- ════════════════════════════════════════════════
-- 조회수 증가 RPC (atomic, SECURITY DEFINER)
-- ════════════════════════════════════════════════
-- showcase_works 는 RLS 상 UPDATE 가 authenticated 에게만 허용된다.
-- 조회수 증가는 비로그인(anon) 방문자도 수행해야 하므로,
-- SECURITY DEFINER 함수로 RLS 를 우회하여 안전하게 증가시킨다.
--
-- - search_path 를 고정하여 함수 하이재킹(권한 상승) 방지
-- - anon / authenticated 모두 EXECUTE 가능하도록 GRANT
-- - 함수 내부 UPDATE 만 노출되므로 임의 컬럼 변조 불가

CREATE OR REPLACE FUNCTION increment_view_count(work_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE showcase_works
  SET view_count = view_count + 1
  WHERE id = work_id;
$$;

-- 기본 PUBLIC 실행 권한 회수 후 필요한 롤에만 부여
REVOKE ALL ON FUNCTION increment_view_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_view_count(uuid) TO anon, authenticated;
