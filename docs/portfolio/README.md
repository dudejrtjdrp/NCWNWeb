# 졸업생 포트폴리오 수집·등록

관리자(학과)가 등록한다. 졸업 연도는 졸업식 연도로 쓴다(예: 2027년 2월 졸업 → 2027). 학생은 양식 txt + 원본 PDF + 프로필 사진(필수 3개)을 낸다.

## 학생에게 보낼 것
- `NWCN_졸업생포트폴리오_양식.txt` — 학생이 포트폴리오 PDF와 함께 AI에 첨부한다.
- `학생_안내문.txt` — 단톡·공지에 붙여 넣는 안내. `[날짜]`, `[제출처]`만 채워서 보낸다.
- `단톡_안내_2027.txt` — 2027 졸업생 단톡용(메시지 2개: 안내 + 통째로 복사하는 프롬프트). 양식 파일 첨부 대신 프롬프트를 붙여 넣는 방식이고, 졸업 연도 2027을 미리 채웠으며 프로필 사진은 학과 촬영본(_roster)을 기본으로 쓴다.

## 학과가 받은 명단·사진 (선택)
- `submissions/_roster/명단.csv` — 한 줄에 한 명 `이름,학번,영문이름`
- `submissions/_roster/<학번_이름 · 학번 · 이름>.jpg` — 학과가 받은 프로필 사진. 학생이 사진을 안 냈을 때 포트폴리오에도 대신 쓴다 (4:5로 자를 때 위쪽 기준)
- 명단 DB 반영: 관리자 페이지 `졸업생 > 명단 한꺼번에 넣기` 또는 `APPLY=1 node scripts/portfolio/import-roster.mjs <졸업연도>`
- 사진 올리기: `APPLY=1 node scripts/portfolio/upload-roster-photos.mjs` — R2 `graduates/{졸업연도}/{학생 id}-{해시}.webp`(주소에 학번·이름 없음) + `students.photo_url`
- 명단에 넣은 학생은 사이트 `WORK > 졸업생`(/work/portfolio)에 사진과 함께 나오고, 포트폴리오를 공개하면 카드가 개인 페이지로 이어진다(그 전엔 '포트폴리오 준비 중'). 학번은 공개하지 않는다(`get_graduates` 함수, `supabase/migrations/add_graduates.sql`).
- 관리자 작품 입력의 '제작자' 검색에도 나온다(이름 + 회색 학번)

## 받은 뒤
1. 제출물을 저장소 루트의 `submissions/`에 그대로 넣는다 (학생별 폴더 또는 `2027_이름.txt`·`2027_이름.pdf`·`2027_이름_사진.jpg`).
   `submissions/`는 개인정보가 있어 git에 올라가지 않는다(.gitignore).
2. 점검: `node scripts/portfolio/parse-submissions.mjs`
   - `submissions/_parsed/<id>.json` — 사이트에 넣을 데이터
   - `submissions/_parsed/report.md` — ✅ 바로 등록 / ⚠️ 확인 필요 / ❌ 학생에게 되묻기
3. ❌ 항목(이름·게시 동의 누락, PDF·프로필 사진 없음 등)은 학생에게 다시 받는다.
4. 등록: `node scripts/portfolio/register.mjs` 로 미리보기 → `APPLY=1 node scripts/portfolio/register.mjs` 로 업로드·저장
   - 필요: `brew install poppler`(PDF → 쪽 이미지), `.env.local` 의 Supabase 서비스 키·R2 키
   - 처음 한 번: Supabase SQL Editor 에서 `supabase/migrations/create_students.sql` → `create_portfolios.sql` 실행
   - 특정 학생만: `APPLY=1 node scripts/portfolio/register.mjs submissions 2027-hong-gildong`
   - 비공개로 저장: `APPLY=1 DRAFT=1 …` / 이메일·PDF 는 학생이 공개에 '예'로 답한 경우만 올라간다
5. 사이트: WORK > 졸업생 포트폴리오 (`/work/portfolio`, 개인 페이지 `/work/portfolio/<slug>`)
6. 공개/비공개·순서·기본 정보 수정·삭제: 관리자 페이지 `졸업생 > 포트폴리오`

## 화면 구성 (E4 틀, WORK 아래)
- 목록: 포스터형 히어로(졸업생 사진) + 졸업 연도 목차 + 분야 거르개, 졸업생 사진(4:5) 카드 — 마우스를 올리면 원본 표지로 바뀜 + 이름·분야·한 줄 소개
- 개인 페이지: `학과 정리본` / `원본 포트폴리오` 전환
  - 상단: 이름·분야·한 줄 소개 + 졸업생 사진, 사진 아래 원본 보기 버튼
  - 정리본: 소개 → 프로젝트 목차 → 프로젝트(최대 6) → 원본 쪽 미리보기 → 이력 → 연락 → 쇼케이스 작품(관리자 작품 입력에서 이 학생을 제작자로 고른 작품)
  - 원본: PDF를 쪽 이미지로 바꿔 넘겨 보기, 학생이 허용했을 때만 PDF 다운로드

## 쇼케이스 연동
- `register.mjs` 는 포트폴리오 프로젝트마다 쇼케이스 작품(showcase_works)도 만든다 — `portfolio_ref = slug#번호`, 다시 등록하면 덮어쓰고 빠진 프로젝트는 지운다(비공개 DRAFT 등록은 만들지 않음).
- 쇼케이스는 최근 작품부터(연도 → 작품 날짜 work_date → 등록일). 양식의 '기간'(예: 2025.03–2025.06)으로 연도·날짜를 정하고, 진행 중이면 등록한 날로 둔다.
- 포트폴리오 페이지의 '쇼케이스 작품' 칸에는 포트폴리오에서 만든 작품을 다시 보여 주지 않는다.
- 먼저 `supabase/migrations/add_portfolio_showcase.sql` 실행 필요(없으면 이 단계만 건너뜀).
- 원본 PDF 쪽은 '원본 포트폴리오' 탭에 그대로 공개된다 — 전화번호·생년월일·주소가 있으면 지운 PDF를 받는다.
  안전장치로 `register.mjs` 는 쪽 이미지에서 전화번호·생년월일(1950~2012년 연.월.일)을 찾아 바탕색으로 가린다(주소는 못 찾음, PDF 다운로드를 허용하면 PDF 자체는 그대로).
- 쇼케이스 태그는 양식 분야를 영문 필터 태그로 바꿔 넣는다(웹→Web, 영상→Video, 게임→Game, 기획→Planning …).
