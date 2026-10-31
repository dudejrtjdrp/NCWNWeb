/**
 * 공개 데이터 스냅샷 만들기 — DB 없이 띄우는 미리보기·로컬 개발용
 * ────────────────────────────────────────────────────────────
 * 사이트에 공개되는 표(작품·졸업전시·NCR·프로젝트·수상·행사·홈 카드·설정)를
 * 공개 키(anon)로 읽어 lib/supabase/snapshot/public-data.json 에 저장한다.
 * 공개 키로 읽으므로 사이트에 이미 보이는 행만 담긴다(관리자 전용·개인정보 없음).
 *
 * 사용: node scripts/snapshot-public-data.mjs            (.env.local 사용)
 *       ENV_FILE=.env.production.local node scripts/...   (다른 env 파일)
 * DB 내용이 바뀌면 다시 돌려서 커밋하면 미리보기에도 반영된다.
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'

const ENV_FILE = process.env.ENV_FILE || '.env.local'
const env = Object.fromEntries(
  fs
    .readFileSync(ENV_FILE, 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]
    })
)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 가 없습니다.')
  process.exit(1)
}

const TABLES = ['showcase_works', 'exhibitions', 'ncr_reports', 'projects', 'awards', 'events', 'ninc_home_cards', 'settings', 'students']
const supabase = createClient(url, key, { auth: { persistSession: false } })

const tables = {}
for (const t of TABLES) {
  const { data, error } = await supabase.from(t).select('*')
  if (error) {
    console.warn(`- ${t}: 건너뜀 (${error.message})`)
    continue
  }
  tables[t] = data ?? []
  console.log(`- ${t}: ${tables[t].length}건`)
}

const out = path.join('lib', 'supabase', 'snapshot', 'public-data.json')
fs.writeFileSync(out, JSON.stringify({ takenAt: new Date().toISOString(), tables }, null, 2) + '\n')
console.log(`저장: ${out} (${(fs.statSync(out).size / 1024).toFixed(1)}KB)`)
