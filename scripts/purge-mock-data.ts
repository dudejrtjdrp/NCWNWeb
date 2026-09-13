/**
 * 목데이터 일괄 제거 스크립트
 * ─────────────────────────────────────────────────────────────
 * scripts/seed.ts 와 supabase/migrations/seed_showcase_works_dummy.sql 로
 * 라이브 DB에 들어간 "가짜" 행을 정확히 지목해 삭제한다.
 * 어드민에서 직접 등록한 실데이터는 건드리지 않는다.
 *
 * 판정 기준 (보수적 — 아래 둘 중 하나라도 아니면 삭제하지 않음)
 *   A. 시드 스크립트의 고유키(제목+연도 / 제목+작가 / 대회+연도 ...)와 정확히 일치
 *   B. picsum.photos 플레이스홀더 이미지를 아직 달고 있음 (시드가 심은 흔적)
 *
 * 예외 — 삭제하지 않는 것
 *   · faculty        : 실제 교수진 정보 (사진/이력 어드민 편집 반영됨)
 *   · exhibitions    : 실제 졸업전시 연혁. 행은 남기고 picsum 포스터만 NULL 처리
 *
 * 실행 (Mac, 리포 루트에서 — 샌드박스는 Supabase 네트워크가 막혀 있음)
 *   npx tsx scripts/purge-mock-data.ts            # 미리보기 (기본, DB 변경 없음)
 *   APPLY=1 npx tsx scripts/purge-mock-data.ts    # 실제 삭제
 *
 * APPLY 실행 시 삭제 대상 행 전체를 지우기 전에
 * backups/purge-mock-<타임스탬프>.json 으로 먼저 덤프한다.
 * 잘못 지웠다면 그 파일의 rows 를 그대로 insert 하면 복구된다.
 *
 * 필요 환경변수 (.env.local)
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from 'dotenv'
import { mkdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 없습니다 (.env.local).')
  process.exit(1)
}

/** 기본은 미리보기. APPLY=1 일 때만 실제로 지운다. */
const APPLY = process.env.APPLY === '1'
const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

const PLACEHOLDER = 'picsum.photos'
const tag = APPLY ? '' : '[미리보기] '

/** 삭제 직전 스냅샷 — 되돌릴 수 있게 원본 행을 통째로 보관한다 */
const backup: Record<string, Row[]> = {}
const BACKUP_DIR = resolve(process.cwd(), 'backups')
const BACKUP_FILE = resolve(
  BACKUP_DIR,
  `purge-mock-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
)

type Row = Record<string, unknown>

function label(row: Row, fields: string[]) {
  return fields.map((f) => row[f]).filter(Boolean).join(' · ')
}

/** 공통 처리기 — match 를 만족하는 행만 골라 보여주고, APPLY 일 때 삭제 */
async function purge(
  table: string,
  labelFields: string[],
  isMock: (row: Row) => boolean
) {
  console.log(`\n📦 ${table}`)
  const { data, error } = await supabase.from(table).select('*')
  if (error) {
    console.error(`  ❌ 조회 실패: ${error.message}`)
    return { removed: 0, kept: 0 }
  }
  const rows = (data ?? []) as Row[]
  const targets = rows.filter(isMock)
  const kept = rows.length - targets.length

  if (targets.length === 0) {
    console.log(`  ✔ 목데이터 없음 (전체 ${rows.length}건 유지)`)
    return { removed: 0, kept }
  }

  for (const row of targets) {
    console.log(`  ${tag}🗑  ${label(row, labelFields)}`)
  }
  console.log(`  → 삭제 ${targets.length}건 / 유지 ${kept}건`)

  backup[table] = targets

  if (APPLY) {
    const ids = targets.map((r) => r.id as string)
    const { error: delErr } = await supabase.from(table).delete().in('id', ids)
    if (delErr) console.error(`  ❌ 삭제 실패: ${delErr.message}`)
    else console.log(`  ✅ ${targets.length}건 삭제 완료`)
  }
  return { removed: targets.length, kept }
}

const hasPlaceholder = (v: unknown) => typeof v === 'string' && v.includes(PLACEHOLDER)

/* ── 시드 고유키 목록 ───────────────────────────────────── */

/** scripts/seed.ts seedShowcaseWorks + seed_showcase_works_dummy.sql */
const MOCK_WORKS = new Set([
  '빛의 도시|김민준', 'Digital Fragments|이서연', '도시의 소리|박태양',
  'Metamorphosis|최지우', '연결의 언어|정하늘', 'Still Life 2024|윤채원',
  'Still Life 2025|윤채원', 'Frame by Frame|한지수', '픽셀 사이로|오세준',
  'Neon Dreams|신예림', '흐르는 풍경|오세준', 'Type & Space|강민서',
  'Echoes|임도윤', '도시 산책|배수아', 'Liquid Motion|노지훈',
  '기억의 단면|황예진', 'Pulse|서지호', '새벽 다섯시|문가람',
  'Grid System|천우진', 'Bloom|구민채', '침묵의 색|하준영',
  'Loop|양서윤', 'Paper Cut|조하린', '도시의 밤|권시우',
  'Synthesis|남도현', 'Origin|백채은',
])

/** seedAwards — 대회명 기준 (수상자명이 전부 플레이스홀더 인명) */
const MOCK_AWARDS = new Set([
  '대한민국 광고대상|2025', 'K-콘텐츠 공모전|2025', '방송영상 콘텐츠 경진대회|2024',
  '전국 대학생 미디어 공모전|2024', '한국광고학회 공모전|2024',
  '디지털 콘텐츠 창작 경진대회|2024', '대학생 영상 페스티벌|2023',
  'NCR 트렌드 리포트 공모전|2023', '스마트 미디어 어워드|2023',
  '전국 방송 콘텐츠 공모전|2023', '대한민국 학생 창작 공모전|2022',
])

/** seedProjects */
const MOCK_PROJECTS = new Set([
  '티슈오피스 브랜드 필름 제작|2025', '해외 미디어아트 교류전|2024',
  '안성시 문화관광 콘텐츠 제작 지원|2024', '베트남 RMIT 글로벌 워크숍|2024',
  '보성 미디어파사드 워크숍|2025', '안성시시설관리공단 홍보영상 제작|2023',
])

/** seedEvents */
const MOCK_EVENTS = new Set([
  'OTT 시대의 콘텐츠 전략 특강|2025-06-15', '영상 편집 심화 워크숍|2025-06-22',
  '오픈 캠퍼스 Day|2025-07-05', '생성형 AI 콘텐츠 제작 세미나|2025-07-18',
  '졸업전시 기획 워크숍|2025-08-02',
])

/** seedNcrReports */
const MOCK_NCR = new Set([
  'AI가 바꾸는 미디어 콘텐츠 산업의 미래',
  '쇼츠 시대의 스토리텔링 전략',
  '메타버스 콘텐츠 창작자가 되는 법',
  'K-콘텐츠, 글로벌 플랫폼을 공략하라',
])

/* ── 전시 포스터: 행은 실데이터라 유지, picsum 포스터만 비움 ── */
async function cleanExhibitionPosters() {
  console.log('\n📦 exhibitions (행 유지 · 플레이스홀더 포스터만 정리)')
  const { data, error } = await supabase.from('exhibitions').select('id, year, title, poster_url')
  if (error) {
    console.error(`  ❌ 조회 실패: ${error.message}`)
    return
  }
  const targets = (data ?? []).filter((r) => hasPlaceholder(r.poster_url))
  if (targets.length === 0) {
    console.log('  ✔ 플레이스홀더 포스터 없음')
    return
  }
  for (const r of targets) console.log(`  ${tag}🧹 ${r.year} ${r.title} — 포스터 NULL 처리`)
  if (APPLY) {
    const { error: upErr } = await supabase
      .from('exhibitions')
      .update({ poster_url: null })
      .in('id', targets.map((r) => r.id))
    if (upErr) console.error(`  ❌ 갱신 실패: ${upErr.message}`)
    else console.log(`  ✅ ${targets.length}건 정리 완료`)
  }
}

async function main() {
  console.log(
    APPLY
      ? '⚠️  APPLY=1 — 실제로 DB에서 삭제합니다.'
      : 'ℹ️  미리보기 모드입니다. 실제 삭제는 APPLY=1 로 다시 실행하세요.'
  )

  const results = [
    await purge('showcase_works', ['title', 'author', 'year'], (r) =>
      MOCK_WORKS.has(`${r.title}|${r.author}`) || hasPlaceholder(r.thumbnail_url)
    ),
    await purge('awards', ['competition', 'award_name', 'winner', 'year'], (r) =>
      MOCK_AWARDS.has(`${r.competition}|${r.year}`) || hasPlaceholder(r.thumbnail_url)
    ),
    await purge('projects', ['title', 'partner', 'year'], (r) =>
      MOCK_PROJECTS.has(`${r.title}|${r.year}`) || hasPlaceholder(r.thumbnail_url)
    ),
    await purge('events', ['title', 'start_date'], (r) =>
      MOCK_EVENTS.has(`${r.title}|${String(r.start_date).slice(0, 10)}`)
    ),
    await purge('ncr_reports', ['title', 'author', 'season'], (r) =>
      MOCK_NCR.has(String(r.title))
    ),
  ]

  await cleanExhibitionPosters()

  // 백업 파일 기록 (미리보기에서도 남겨 두면 검토가 쉬움)
  const total = Object.values(backup).reduce((a, b) => a + b.length, 0)
  if (total > 0) {
    mkdirSync(BACKUP_DIR, { recursive: true })
    writeFileSync(BACKUP_FILE, JSON.stringify(backup, null, 2), 'utf-8')
    console.log(`\n💾 삭제 대상 원본을 백업했습니다 → ${BACKUP_FILE}`)
  }

  const removed = results.reduce((a, b) => a + b.removed, 0)
  const kept = results.reduce((a, b) => a + b.kept, 0)
  console.log(
    `\n${APPLY ? '✅ 완료' : '📋 요약'} — 삭제 대상 ${removed}건 / 유지 ${kept}건 (faculty · exhibitions 행은 보존)`
  )
  if (!APPLY && removed > 0) {
    console.log('   실제로 지우려면: APPLY=1 npx tsx scripts/purge-mock-data.ts')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
