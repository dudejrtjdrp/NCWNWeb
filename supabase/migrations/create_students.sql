-- 학생(졸업생) 인원 DB
-- ─────────────────────────────────────────────────────────────
-- 졸업생 포트폴리오를 올릴 때 한 사람당 한 줄씩 들어가는 기준 테이블.
-- 쇼케이스 작품의 제작자(showcase_works.author, 여러 명이면 쉼표로 구분)와
-- 이름으로 연동된다 → 작품 상세의 제작자 이름이 그 학생의 포트폴리오(/portfolio/[slug])로 연결.
-- 동명이인이 생기면 이름만으로는 연결하지 않으므로(코드에서 1명 일치일 때만 링크),
-- 그때는 author 표기를 구분되게(예: '김민지(2026)') 맞추거나 연결 컬럼을 추가한다.
--
-- 적용: Supabase 대시보드 → SQL Editor 에 붙여 넣고 실행 (여러 번 실행해도 안전)

create table if not exists public.students (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,            -- 포트폴리오 주소 /portfolio/[slug]
  name             text not null,                   -- 작품 author 와 같은 표기의 이름 (연동 기준)
  name_en          text,
  graduation_year  integer,
  created_at       timestamptz not null default now()
);

create index if not exists students_name_idx on public.students (name);

alter table public.students enable row level security;

drop policy if exists "students are readable by everyone" on public.students;
create policy "students are readable by everyone"
  on public.students for select
  using (true);
