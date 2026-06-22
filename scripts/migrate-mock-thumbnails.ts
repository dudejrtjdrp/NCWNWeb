/**
 * 로컬 목(mock) 썸네일 백필 마이그레이션 (R2 불필요)
 * ─────────────────────────────────────────────────────────────
 * thumbnail_url 이 비어 있거나(NULL/'') 외부 placeholder(picsum 등)라
 * 회색으로만 보이던 awards · projects 행을, 저장소에 커밋된 로컬 목
 * 이미지(/public/images/ninc/mock/*) 경로로 채운다.
 *
 *  - 렌더 폴백(lib/mock-thumbnail.ts)과 "동일한 규칙"을 공유한다.
 *    (같은 행 id → 항상 같은 목 이미지) → 화면과 DB가 일치.
 *  - 외부 네트워크 의존이 없어 picsum 차단·지연으로 인한 회색 문제를
 *    근본적으로 제거한다.
 *
 * 실행:
 *   LIST=1   npx tsx scripts/migrate-mock-thumbnails.ts   # 진단(현재 상태만 출력)
 *   DRY_RUN=1 npx tsx scripts/migrate-mock-thumbnails.ts  # 미리보기(DB 변경 없음)
 *             npx tsx scripts/migrate-mock-thumbnails.ts   # 적용(빈값/placeholder만)
 *   FORCE=1  npx tsx scripts/migrate-mock-thumbnails.ts   # 모든 행 목 이미지로 덮어쓰기
 *   REPLACE_DEAD=1 npx tsx scripts/migrate-mock-thumbnails.ts  # 깨진 링크(HEAD 실패)도 교체
 *
 * 필요 환경변수 (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

// Node 18 WebSocket 폴리필 (supabase-js realtime 초기화 오류 방지)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof (globalThis as any).WebSocket === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).WebSocket = class { constructor() {} addEventListener() {} removeEventListener() {} close() {} }
}

import { createClient } from '@supabase/supabase-js'
import { isMissingThumbnail, mockThumbnail, MOCK_THUMBNAILS } from '../lib/mock-thumbnail'

const DRY_RUN = !!process.env.DRY_RUN
const FORCE = !!process.env.FORCE
const REPLACE_DEAD = !!process.env.REPLACE_DEAD

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 .env.local 에 필요합니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
  realtime: { timeout: 0 } as never,
})

/** 교체 대상 판정 — FORCE는 전부, 그 외엔 빈값/placeholder(+REPLACE_DEAD면 깨진 링크) */
async function shouldReplace(url: string | null): Promise<boolean> {
  if (FORCE) return true
  if (isMissingThumbnail(url)) return true
  if (REPLACE_DEAD && url) {
    try {
      const r = await fetch(url, { method: 'HEAD' })
      return !r.ok
    } catch {
      return true
    }
  }
  return false
}

type TableSpec = { table: 'awards' | 'projects'; labelField: string }

async function backfill({ table, labelField }: TableSpec) {
  const { data, error } = await supabase
    .from(table)
    .select(`id, ${labelField}, thumbnail_url`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(`  ❌ ${table} 조회 실패: ${error.message}`)
    return
  }

  const rows = (data ?? []) as unknown as Array<Record<string, string | null>>
  let targets = 0
  let done = 0

  console.log(`\n📦 ${table} (${rows.length}개)`)
  for (const row of rows) {
    const id = row.id as string
    const label = (row[labelField] ?? '').toString().slice(0, 30)
    if (!(await shouldReplace(row.thumbnail_url))) continue
    targets++

    const newUrl = mockThumbnail(id)
    if (DRY_RUN) {
      console.log(`  🔎 [DRY] ${label} → ${newUrl}  (기존: ${row.thumbnail_url ?? '(없음)'})`)
      continue
    }
    const { error: upErr } = await supabase.from(table).update({ thumbnail_url: newUrl }).eq('id', id)
    if (upErr) {
      console.error(`  ❌ ${label} 갱신 실패: ${upErr.message}`)
    } else {
      done++
      console.log(`  ✅ ${label} → ${newUrl}`)
    }
  }
  console.log(`  ─ 대상 ${targets}개${DRY_RUN ? ' (DRY_RUN: 변경 없음)' : ` · 갱신 ${done}개`}`)
}

/** 진단: 각 행의 thumbnail 상태 출력 (LIST=1) */
async function listAll() {
  const status = (url: string | null) => (isMissingThumbnail(url) ? (url ? 'PLACEHOLDER' : 'NULL') : 'OK')
  for (const [table, field] of [['awards', 'competition'], ['projects', 'title']] as const) {
    const { data } = await supabase.from(table).select(`id, ${field}, thumbnail_url`).order('created_at', { ascending: false })
    console.log(`\n📋 ${table} (${data?.length ?? 0})`)
    for (const r of (data ?? []) as unknown as Array<Record<string, string | null>>) {
      console.log(`  [${status(r.thumbnail_url)}] ${(r[field] ?? '').toString().slice(0, 34)}\n        ${r.thumbnail_url ?? '(없음)'}`)
    }
  }
  console.log('\n[OK]=실제 이미지, [PLACEHOLDER/NULL]=목 이미지로 백필 대상\n')
}

async function run() {
  console.log(`\n🎨 로컬 목 썸네일 백필 ${DRY_RUN ? '(DRY_RUN)' : ''}${FORCE ? ' (FORCE)' : ''}${REPLACE_DEAD ? ' (REPLACE_DEAD)' : ''}`)
  console.log(`   풀: ${MOCK_THUMBNAILS.length}종 · 대상 테이블: awards, projects`)

  if (process.env.LIST) {
    await listAll()
    return
  }

  await backfill({ table: 'awards', labelField: 'competition' })
  await backfill({ table: 'projects', labelField: 'title' })

  console.log(`\n✨ 완료${DRY_RUN ? ' — 적용하려면 DRY_RUN 없이 다시 실행' : ''}\n`)
}

run()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1) })
