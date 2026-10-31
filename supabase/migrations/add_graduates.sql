-- 졸업생 목록 공개 (WORK > 졸업생)
-- ─────────────────────────────────────────────────────────────
-- students 는 학번이 있어 관리자만 읽는다(create_students.sql). 사이트의 졸업생 목록은
-- 학번을 뺀 이름·영문 이름·졸업 연도·사진만 이 함수로 공개한다.
-- 포트폴리오가 공개된 학생은 목록 카드가 /work/portfolio/[slug] 로 이어진다(portfolios.student_id).
-- photo_url: 학과가 받은 프로필 사진(R2 graduates/{졸업연도}/{학생 id}-{해시}.webp)
--   scripts/portfolio/upload-roster-photos.mjs 가 올리고 채운다.
--
-- 적용: Supabase 대시보드 → SQL Editor 에 붙여 넣고 실행 (여러 번 실행해도 안전)

alter table public.students add column if not exists photo_url text;

create or replace function public.get_graduates()
returns table (id uuid, name text, name_en text, graduation_year integer, photo_url text)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.name, s.name_en, s.graduation_year, s.photo_url
  from public.students s
  where s.graduation_year is not null
  order by s.graduation_year desc, s.name
$$;

revoke all on function public.get_graduates() from public;
grant execute on function public.get_graduates() to anon, authenticated;
