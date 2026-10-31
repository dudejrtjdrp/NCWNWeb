-- 졸업생 포트폴리오 (WORK > 졸업생 포트폴리오, /work/portfolio)
-- ─────────────────────────────────────────────────────────────
-- 한 졸업생당 한 줄. 학과(관리자)가 등록한다 — 학생이 낸 양식 txt·원본 PDF·프로필 사진을
-- scripts/portfolio/parse-submissions.mjs 로 점검한 뒤 scripts/portfolio/register.mjs 로 올린다.
--
-- 공개 원칙 (이 표는 공개 읽기라 아래 값은 등록할 때 걸러서 넣는다)
--   · email      : 학생이 '이메일 공개: 예'일 때만 넣는다. 아니면 null
--   · pdf_url    : 'PDF 다운로드 허용: 예'일 때만 넣는다. 원본 보기는 쪽 이미지(pages)로만
--   · 학번은 넣지 않는다(학번은 students 표, 관리자만 읽음)
--
-- projects (jsonb, 최대 6개)
--   [{ "title", "titleEn", "year", "fields":[], "format", "role", "tools":[], "summary",
--      "description", "descriptionEn", "points":[], "outcome", "video", "images":[url], "cover": url }]
-- history (jsonb) { "awards":[], "exhibitions":[], "experience":[] }
--
-- 적용: create_students.sql 다음에 Supabase 대시보드 → SQL Editor 에서 실행 (여러 번 실행해도 안전)

create table if not exists public.portfolios (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid references public.students(id) on delete set null,
  slug          text not null unique,               -- 주소 /work/portfolio/[slug] (예: 2027-hong-gildong)
  year          integer not null,                   -- 졸업 연도 (졸업식 연도, 예: 2027년 2월 졸업 → 2027)
  name          text not null,
  name_en       text,
  fields        text[] not null default '{}',       -- 주력 분야 1~3개
  tagline       text,
  tagline_en    text,
  bio           text,
  bio_en        text,
  interests     text[] not null default '{}',
  tools         text[] not null default '{}',
  email         text,                               -- 공개 동의한 경우만
  website       text,
  instagram     text,
  other_links   text[] not null default '{}',
  profile_url   text,                               -- 프로필 사진 (세로 4:5)
  cover_url     text,                               -- 원본 포트폴리오 표지 (보통 1쪽)
  pages         text[] not null default '{}',       -- 원본 PDF 쪽 이미지 (순서대로)
  pdf_url       text,                               -- 다운로드 허용한 경우만
  projects      jsonb not null default '[]'::jsonb,
  history       jsonb not null default '{}'::jsonb,
  is_published  boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists portfolios_year_idx on public.portfolios (year desc, sort_order, name);
create index if not exists portfolios_student_idx on public.portfolios (student_id);

alter table public.portfolios enable row level security;

drop policy if exists "published portfolios are readable by everyone" on public.portfolios;
create policy "published portfolios are readable by everyone"
  on public.portfolios for select
  using (is_published = true);

drop policy if exists "signed-in users read all portfolios" on public.portfolios;
create policy "signed-in users read all portfolios"
  on public.portfolios for select
  to authenticated
  using (true);
