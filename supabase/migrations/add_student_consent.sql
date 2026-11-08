-- 졸업생 공개 동의 (WORK > 졸업생)
-- ─────────────────────────────────────────────────────────────
-- 학생마다 사이트 공개 여부와 공개 범위를 받는다. 답하지 않은 학생·항목은 비공개가 기본이다.
--   is_public : 졸업생 목록·개인 페이지에 나오는지 (false 면 get_graduates 에서 빠져 이름·사진·개인 페이지 모두 안 보임)
--   consent   : 공개 범위 (null = 받지 않음 → 전부 비공개)
--     { "projects": "all" | "some" | "none", "projectNums": [1, 3],   -- 프로젝트 공개 (some 이면 번호)
--       "email": bool, "photo": bool, "links": bool,                  -- 이메일 · 프로필 사진 · 인스타그램/웹사이트/기타 링크
--       "pdf": "download" | "pages" | "none",                         -- 원본 PDF: 쪽 보기+다운로드 / 쪽 보기만 / 비공개
--       "teamName": bool,                                             -- 다른 졸업생 팀 프로젝트에 이름 표시·연결
--       "showcase": bool }                                            -- 공개한 프로젝트를 학생 작품(쇼케이스)에도 노출
-- 값 넣기: submissions/_roster/공개동의.csv → scripts/portfolio/apply-consent.mjs
-- 포트폴리오 등록(scripts/portfolio/register.mjs)도 이 값을 따른다.
--
-- 적용: Supabase 대시보드 → SQL Editor 에 붙여 넣고 실행 (여러 번 실행해도 안전)
-- 실행 직후에는 모두 비공개가 된다(공개 포트폴리오는 그대로) → apply-consent.mjs 로 동의한 학생을 공개한다.

alter table public.students add column if not exists is_public boolean not null default false;
alter table public.students add column if not exists consent jsonb;

create or replace function public.get_graduates()
returns table (id uuid, name text, name_en text, graduation_year integer, photo_url text)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.name, s.name_en, s.graduation_year,
         case when coalesce((s.consent->>'photo')::boolean, false) then s.photo_url end
  from public.students s
  where s.graduation_year is not null
    and s.is_public
  order by s.graduation_year desc, s.name
$$;

revoke all on function public.get_graduates() from public;
grant execute on function public.get_graduates() to anon, authenticated;
