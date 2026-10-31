-- 학생(졸업생) 인원 DB + 작품 제작자 연결
-- ─────────────────────────────────────────────────────────────
-- students: 졸업생 포트폴리오를 올릴 때 한 사람당 한 줄. 학번으로 구분한다.
-- showcase_works.creators: 작품 제작자 목록 (여러 명). 관리자 작품 입력에서 학생을 검색해
--   고르면 student_id 로 연결되고, 학생 DB 에 없는 사람은 이름만 적는다.
--   [{ "name": "홍길동", "student_id": "uuid 또는 null", "student_no": "학번 또는 null" }]
-- showcase_works.author 는 이름을 쉼표로 이은 표시용 문자열로 계속 유지한다(검색·목록용).
--
-- 적용: Supabase 대시보드 → SQL Editor 에 붙여 넣고 실행 (여러 번 실행해도 안전)

create table if not exists public.students (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  student_no       text unique,                     -- 학번
  name_en          text,
  graduation_year  integer,
  slug             text unique,                     -- 포트폴리오 주소 /portfolio/[slug] (포트폴리오를 올리면 채움)
  created_at       timestamptz not null default now()
);

create index if not exists students_name_idx on public.students (name);

alter table public.students enable row level security;

drop policy if exists "students are readable by everyone" on public.students;
create policy "students are readable by everyone"
  on public.students for select
  using (true);

-- 작품 제작자 목록
alter table public.showcase_works
  add column if not exists creators jsonb not null default '[]'::jsonb;

-- 기존 작품: author("A, B") → creators [{name:A},{name:B}] (아직 비어 있는 작품만)
update public.showcase_works w
set creators = coalesce((
  select jsonb_agg(jsonb_build_object('name', trim(n), 'student_id', null, 'student_no', null))
  from regexp_split_to_table(w.author, '\s*[,，·&]\s*') as n
  where trim(n) <> ''
), '[]'::jsonb)
where w.creators = '[]'::jsonb;

-- 학생별 작품 찾기(포트폴리오 페이지)용
create index if not exists showcase_works_creators_idx on public.showcase_works using gin (creators jsonb_path_ops);
