-- 졸업생 목록: 비공개 학생도 자리는 남긴다 (이름·사진 없이 로고 카드)
-- ─────────────────────────────────────────────────────────────
-- add_student_consent.sql 다음에 실행. get_graduates 가 비공개 학생도 돌려주되
-- 이름·영문 이름·사진은 null 로 가린다(is_public=false). 사이트는 이 줄을 로고 카드로 그리고 개인 페이지로 잇지 않는다.
-- 반환 열이 바뀌어 drop 후 다시 만든다.
--
-- 적용: Supabase 대시보드 → SQL Editor 에 붙여 넣고 실행 (여러 번 실행해도 안전)

drop function if exists public.get_graduates();

create function public.get_graduates()
returns table (id uuid, name text, name_en text, graduation_year integer, photo_url text, is_public boolean)
language sql
stable
security definer
set search_path = public
as $$
  select s.id,
         case when s.is_public then s.name end,
         case when s.is_public then s.name_en end,
         s.graduation_year,
         case when s.is_public and coalesce((s.consent->>'photo')::boolean, false) then s.photo_url end,
         s.is_public
  from public.students s
  where s.graduation_year is not null
  order by s.graduation_year desc, s.is_public desc, s.name
$$;

revoke all on function public.get_graduates() from public;
grant execute on function public.get_graduates() to anon, authenticated;
