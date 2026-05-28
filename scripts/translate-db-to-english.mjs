/**
 * translate-db-to-english.mjs
 *
 * 현재 DB의 한국어 데이터를 영어로 번역하여 _en 컬럼에 저장합니다.
 *
 * 실행 방법:
 *   node scripts/translate-db-to-english.mjs
 *
 * 옵션 (환경 변수로 제어):
 *   TABLES=ncr_reports,awards   특정 테이블만 처리
 *   DRY_RUN=1                   DB 업데이트 없이 번역 결과만 출력
 *   DELAY_MS=1500               요청 간 딜레이 (기본 1200ms)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// ── Node.js 18 WebSocket 폴리필 (Supabase Realtime 초기화 오류 방지) ──
// 이 스크립트는 Realtime을 사용하지 않으므로 더미 구현으로 충분합니다.
if (!globalThis.WebSocket) {
  globalThis.WebSocket = class MockWebSocket extends EventTarget {
    static CONNECTING = 0; static OPEN = 1; static CLOSING = 2; static CLOSED = 3
    constructor() { super(); this.readyState = 3 /* CLOSED */ }
    close() {}
    send() {}
  }
}

// ── 환경 변수 로드 ────────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dir, '..', '.env.local')

try {
  const env = readFileSync(envPath, 'utf-8')
  for (const line of env.split('\n')) {
    const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/)
    if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
} catch { /* .env.local 없으면 기존 env 사용 */ }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다.')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
})

// ── 설정 ──────────────────────────────────────────────────────
const DRY_RUN  = process.env.DRY_RUN === '1'
const DELAY_MS = parseInt(process.env.DELAY_MS ?? '1200')

const TARGET_TABLES = process.env.TABLES
  ? process.env.TABLES.split(',').map(t => t.trim())
  : null

/** 테이블별 번역 대상 필드 정의 */
const TABLE_CONFIG = {
  ncr_reports: {
    fields: ['title', 'excerpt', 'description', 'content'],
    label:  'NCR 아티클',
    extra_select: 'id,is_published',  // content는 무거우니 직접 select
    full_select: true,
  },
  awards: {
    fields: ['competition', 'award_name', 'hosted_by', 'description'],
    label:  '수상 내역',
  },
  projects: {
    fields: ['title', 'description', 'outcome'],
    label:  '프로젝트',
  },
  events: {
    fields: ['title', 'description'],
    label:  '이벤트',
  },
  showcase_works: {
    fields: ['title', 'description'],
    label:  '쇼케이스 작품',
  },
}

// ── 번역 함수 (Google Translate 비공식 엔드포인트) ──────────────
let requestCount = 0

async function translateText(text, retries = 3) {
  if (!text || !text.trim()) return null

  // 짧은 영어 텍스트(이미 영어)는 번역 스킵
  const koreanRatio = (text.match(/[가-힯]/g) || []).length / text.length
  if (koreanRatio < 0.05) return text  // 5% 미만이면 이미 영어/혼합

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      requestCount++
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=en&dt=t&q=${encodeURIComponent(text)}`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(15000),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      // Google Translate 응답: [[["translated", "original", ...], ...], ...]
      const translated = data?.[0]?.map(seg => seg?.[0]).filter(Boolean).join('')
      if (!translated) throw new Error('빈 번역 결과')

      return translated
    } catch (err) {
      if (attempt < retries - 1) {
        const wait = (attempt + 1) * 2000
        console.log(`    ⏳ 재시도 ${attempt + 1}/${retries - 1} (${wait}ms 후)...`)
        await sleep(wait)
      } else {
        console.warn(`    ⚠️  번역 실패: "${text.slice(0, 30)}..." → ${err.message}`)
        return null  // 실패해도 원문 유지
      }
    }
  }
  return null
}

// ── 유틸 ─────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms))

function truncate(str, n = 60) {
  if (!str) return '(없음)'
  return str.length > n ? str.slice(0, n) + '…' : str
}

// ── 단일 테이블 처리 ─────────────────────────────────────────
async function processTable(tableName, config) {
  const { fields, label } = config
  const enFields = fields.map(f => `${f}_en`)

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`📋  ${label} (${tableName})`)
  console.log(`${'═'.repeat(60)}`)

  // _en 컬럼이 모두 NULL인 행만 가져옴 (이미 번역된 건 스킵)
  const selectCols = ['id', ...fields, ...enFields].join(',')
  const { data: rows, error } = await sb
    .from(tableName)
    .select(selectCols)
    .order('created_at', { ascending: true })

  if (error) {
    // 컬럼이 없으면 마이그레이션 먼저 실행 필요
    if (error.message?.includes('does not exist') || error.code === '42703') {
      console.error(`❌  '_en' 컬럼이 없습니다!`)
      console.error(`   Supabase SQL Editor에서 먼저 실행해주세요:`)
      console.error(`   → supabase/migrations/add_en_columns.sql`)
      return { total: 0, translated: 0, skipped: 0, failed: 0 }
    }
    console.error(`❌  조회 오류: ${error.message}`)
    return { total: 0, translated: 0, skipped: 0, failed: 0 }
  }

  const total = rows.length
  let translated = 0, skipped = 0, failed = 0

  console.log(`   총 ${total}개 행`)

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = `[${i + 1}/${total}]`

    // 이미 번역된 행 스킵 (첫 번째 _en 필드가 있으면)
    const alreadyDone = enFields.some(ef => row[ef] && String(row[ef]).trim())
    if (alreadyDone) {
      process.stdout.write(`   ${rowNum} ⏭  이미 번역됨 (id: ${row.id?.slice(0,8)})\n`)
      skipped++
      continue
    }

    const titleField = fields.find(f => f === 'title') ?? fields[0]
    const titleVal = row[titleField]
    console.log(`\n   ${rowNum} 번역 중: "${truncate(titleVal, 50)}"`)

    const updates = {}
    let rowFailed = false

    for (const field of fields) {
      const val = row[field]
      if (!val || !String(val).trim()) continue

      process.stdout.write(`      ${field}: `)

      // content 필드는 길 수 있으니 500자씩 분할 번역
      let translatedVal
      if (field === 'content' && val.length > 800) {
        translatedVal = await translateLongText(val)
      } else {
        translatedVal = await translateText(val)
      }

      if (translatedVal) {
        updates[`${field}_en`] = translatedVal
        console.log(`✅  "${truncate(translatedVal, 50)}"`)
      } else {
        console.log(`❌  실패 (원문 유지)`)
        rowFailed = true
      }

      await sleep(DELAY_MS)
    }

    if (Object.keys(updates).length === 0) {
      skipped++
      continue
    }

    if (DRY_RUN) {
      console.log(`   [DRY_RUN] 업데이트 생략`)
      translated++
      continue
    }

    const { error: updateErr } = await sb
      .from(tableName)
      .update(updates)
      .eq('id', row.id)

    if (updateErr) {
      console.error(`   ❌  DB 업데이트 실패: ${updateErr.message}`)
      failed++
    } else {
      translated++
      if (rowFailed) failed++
    }
  }

  console.log(`\n   ✅  완료: ${translated}개 번역, ${skipped}개 스킵, ${failed}개 실패`)
  return { total, translated, skipped, failed }
}

// ── 긴 텍스트 분할 번역 (마크다운 단락 기준) ───────────────────
async function translateLongText(text, chunkSize = 1000) {
  // 단락(\n\n) 기준으로 분리
  const paragraphs = text.split(/\n\n+/)
  const chunks = []
  let current = ''

  for (const para of paragraphs) {
    if ((current + '\n\n' + para).length > chunkSize && current) {
      chunks.push(current)
      current = para
    } else {
      current = current ? current + '\n\n' + para : para
    }
  }
  if (current) chunks.push(current)

  console.log(`      (${chunks.length}개 청크로 분할 번역)`)

  const results = []
  for (const chunk of chunks) {
    const t = await translateText(chunk)
    results.push(t ?? chunk)  // 실패 시 원문 사용
    await sleep(DELAY_MS)
  }

  return results.join('\n\n')
}

// ── 메인 ─────────────────────────────────────────────────────
async function main() {
  console.log('🌐  NWCN DB 영어 번역 스크립트')
  console.log(`   Supabase: ${SUPABASE_URL}`)
  console.log(`   DRY_RUN: ${DRY_RUN ? '✅ (DB 업데이트 안함)' : '❌ (실제 업데이트)'}`)
  console.log(`   딜레이: ${DELAY_MS}ms`)
  if (TARGET_TABLES) console.log(`   대상 테이블: ${TARGET_TABLES.join(', ')}`)

  const summary = {}
  const startTime = Date.now()

  for (const [tableName, config] of Object.entries(TABLE_CONFIG)) {
    if (TARGET_TABLES && !TARGET_TABLES.includes(tableName)) continue

    const result = await processTable(tableName, config)
    summary[tableName] = result
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

  console.log(`\n${'═'.repeat(60)}`)
  console.log('📊  전체 요약')
  console.log(`${'═'.repeat(60)}`)
  for (const [table, r] of Object.entries(summary)) {
    console.log(`  ${table}: ${r.translated}번역 / ${r.skipped}스킵 / ${r.failed}실패 (총${r.total})`)
  }
  console.log(`  총 API 요청: ${requestCount}회`)
  console.log(`  소요 시간: ${elapsed}초`)

  if (DRY_RUN) {
    console.log('\n⚠️  DRY_RUN 모드입니다. 실제 적용하려면 DRY_RUN 없이 실행하세요.')
  } else {
    console.log('\n✅  번역 완료! 영어 페이지(/en)에서 확인하세요.')
  }
}

main().catch(err => {
  console.error('예기치 못한 오류:', err)
  process.exit(1)
})
