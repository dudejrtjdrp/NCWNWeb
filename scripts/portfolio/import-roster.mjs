#!/usr/bin/env node
/**
 * 졸업생 명단 넣기 — submissions/_roster/명단.csv → students 표
 * ────────────────────────────────────────────────────────────
 * CSV: 한 줄에 한 명 "이름,학번,영문이름(선택)" (첫 줄 머리글 '이름,…' 은 건너뜀)
 * 학번이 이미 있으면 이름·영문 이름·졸업 연도를 고치고, 없으면 추가한다.
 * 관리자 페이지 '졸업생 > 명단 한꺼번에 넣기'와 같은 일을 서비스 키로 한다.
 * submissions/ 는 개인정보라 git 에 올라가지 않는다.
 *
 * 사용
 *   node scripts/portfolio/import-roster.mjs <졸업연도> [CSV=submissions/_roster/명단.csv]   # 미리보기
 *   APPLY=1 node scripts/portfolio/import-roster.mjs <졸업연도> [CSV]                       # 실제 저장
 */

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const [yearArg, csvArg] = process.argv.slice(2)
const year = Number(yearArg)
if (!Number.isInteger(year) || year < 2000 || year > 2100) {
  console.error('사용: node scripts/portfolio/import-roster.mjs <졸업연도> [CSV 경로]')
  process.exit(1)
}
const csv = csvArg || path.join('submissions', '_roster', '명단.csv')
const APPLY = process.env.APPLY === '1'

const envFile = process.env.ENV_FILE ?? path.resolve('.env.local')
for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
const need = (k) => {
  if (!process.env[k]) throw new Error(`.env.local 에 ${k} 가 없습니다`)
  return process.env[k]
}

const rows = []
const bad = []
for (const line of fs.readFileSync(csv, 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
  const t = line.trim()
  if (!t || /^이름\s*[,\t]/.test(t)) continue
  const [name = '', no = '', en = ''] = t.split(/\s*[,\t]\s*/)
  if (!name || name.length > 30 || (no && !/^[0-9A-Za-z-]{4,20}$/.test(no))) { bad.push(t); continue }
  rows.push({ name, student_no: no || null, name_en: en || null, graduation_year: year })
}

console.log(APPLY ? '▶ 적용' : '▶ 미리보기 (APPLY=1 로 실행하면 실제 저장)')
console.log(`  ${year}년 졸업 ${rows.length}명${bad.length ? ` · 형식 오류 ${bad.length}줄` : ''}`)
for (const b of bad) console.log(`  ✗ ${b}`)
if (!APPLY) {
  for (const r of rows) console.log(`  · ${r.name} ${r.student_no ?? '(학번 없음)'}${r.name_en ? ` · ${r.name_en}` : ''}`)
  process.exit(0)
}

const supabase = createClient(need('NEXT_PUBLIC_SUPABASE_URL'), need('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } })
let added = 0
let updated = 0
for (const r of rows) {
  let id = null
  if (r.student_no) {
    const { data, error } = await supabase.from('students').select('id').eq('student_no', r.student_no).maybeSingle()
    if (error) throw error
    id = data?.id ?? null
  }
  const { error } = id ? await supabase.from('students').update(r).eq('id', id) : await supabase.from('students').insert(r)
  if (error) { console.log(`  ✗ ${r.name} — ${error.message}`); continue }
  id ? updated++ : added++
}
console.log(`✓ 추가 ${added}명 · 수정 ${updated}명`)
