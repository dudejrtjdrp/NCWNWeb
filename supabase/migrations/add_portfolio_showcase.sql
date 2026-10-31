-- 포트폴리오 프로젝트 → 쇼케이스(학생 작품) 연동 + 기간순 정렬
-- ─────────────────────────────────────────────────────────────
-- work_date     : 작품(프로젝트)을 마친 날짜 — 쇼케이스는 연도 → 이 날짜 → 등록일 순(최근 먼저)으로 보인다.
--                 진행 중이면 등록한 날. 월을 모르면 비워 두고 연도로만 정렬된다.
-- portfolio_ref : 졸업생 포트폴리오에서 만든 작품이면 '포트폴리오 slug#프로젝트 번호' (예: 2027-seonghyo-lee#2)
--                 scripts/portfolio/register.mjs 가 다시 등록할 때 같은 작품을 덮어쓰는 기준.
--                 포트폴리오 페이지의 '쇼케이스 작품' 칸에서는 이미 프로젝트로 보이므로 뺀다.
--
-- 적용: Supabase 대시보드 → SQL Editor 에 붙여 넣고 실행 (여러 번 실행해도 안전)

alter table public.showcase_works add column if not exists work_date date;
alter table public.showcase_works add column if not exists portfolio_ref text;

create unique index if not exists showcase_works_portfolio_ref_key on public.showcase_works (portfolio_ref);
create index if not exists showcase_works_recent_idx on public.showcase_works (year desc, work_date desc nulls last, created_at desc);
