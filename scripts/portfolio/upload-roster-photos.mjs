#!/usr/bin/env node
/**
 * 졸업생 명단 사진 올리기 — submissions/_roster 사진 → R2 → students.photo_url
 * ────────────────────────────────────────────────────────────
 * 명단(submissions/_roster/명단.csv "이름,학번,영문이름")의 학생마다 _roster 바로 아래 사진을 찾는다.
 *   사진 이름: 학번_이름.jpg · 학번.jpg · 이름.jpg (맥·드라이브 한글 이름은 NFC 로 맞춰 비교)
 * 4:5(1200×1500) webp 로 맞춰(위쪽 기준으로 잘라 머리 위 여백을 살림) R2 graduates/{졸업연도}/{학생 id}-{해시 8자}.webp 에 올리고
 * students.photo_url 을 채운다. 주소에 학번·이름을 넣지 않는다(공개 주소라서).
 * 학생은 먼저 DB 에 있어야 한다(import-roster.mjs 또는 관리자 '졸업생 > 명단').
 * students.photo_url 열이 필요하다(supabase/migrations/add_graduates.sql).
 *
 * 사용
 *   node scripts/portfolio/upload-roster-photos.mjs [CSV=submissions/_roster/명단.csv]          # 미리보기
 *   APPLY=1 node scripts/portfolio/upload-roster-photos.mjs [CSV]                                # 실제 업로드·저장
 *   FORCE=1 … 이미 사진이 있는 학생도 다시 올린다(기본은 같은 사진이면 건너뜀)
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import sharp from 'sharp'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.env.APPLY === '1'
const FORCE = process.env.FORCE === '1'
const csv = process.argv[2] || path.join('submissions', '_roster', '명단.csv')
const rosterDir = path.dirname(csv)

const envFile = process.env.ENV_FILE ?? path.resolve('.env.local')
for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
const need = (k) => {
  if (!process.env[k]) throw new Error(`.env.local 에 ${k} 가 없습니다`)
  return process.env[k]
}

const nfc = (s) => (s ?? '').normalize('NFC').trim()
const roster = []
for (const line of fs.readFileSync(csv, 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
  const t = line.trim()
  if (!t || /^이름\s*[,\t]/.test(t)) continue
  const [name = '', no = ''] = t.split(/\s*[,\t]\s*/)
  if (name && no) roster.push({ name: nfc(name), no: nfc(no) })
}

const photos = fs.readdirSync(rosterDir).filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f))
const stem = (f) => nfc(path.basename(f, path.extname(f)))
function findPhoto({ name, no }) {
  const hits = photos.filter((f) => {
    const s = stem(f)
    return s === no || s.startsWith(`${no}_`) || s === name || s.endsWith(`_${name}`)
  })
  return hits.length === 1 ? path.join(rosterDir, hits[0]) : hits.length > 1 ? 'MANY' : null
}

const supabase = createClient(need('NEXT_PUBLIC_SUPABASE_URL'), need('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } })
const nos = roster.map((r) => r.no)
let { data: students, error } = await supabase.from('students').select('id, name, student_no, graduation_year, photo_url').in('student_no', nos)
// photo_url 열이 아직 없으면(add_graduates.sql 실행 전) 사진만 R2 에 올리고 DB 저장은 건너뛴다 — SQL 실행 뒤 다시 돌리면 같은 주소로 채워짐
const noColumn = Boolean(error && /photo_url/.test(error.message))
if (noColumn) ({ data: students, error } = await supabase.from('students').select('id, name, student_no, graduation_year').in('student_no', nos))
if (error) {
  console.error(error.message)
  process.exit(1)
}
if (noColumn) console.log('  ! students.photo_url 열이 없어 R2 업로드만 합니다 (supabase/migrations/add_graduates.sql 실행 후 다시 실행)')
const byNo = new Map(students.map((s) => [s.student_no, s]))

const publicBase = need('R2_PUBLIC_URL').replace(/\/$/, '')
const r2 = APPLY
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${need('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: need('R2_ACCESS_KEY_ID'), secretAccessKey: need('R2_SECRET_ACCESS_KEY') },
    })
  : null

console.log(APPLY ? '▶ 적용' : '▶ 미리보기 (APPLY=1 로 실행하면 실제 업로드·저장)')
let done = 0
const missing = []
for (const r of roster) {
  const s = byNo.get(r.no)
  if (!s) { console.log(`  ✗ ${r.name} ${r.no} — DB 명단에 없음 (먼저 import-roster)`); continue }
  const file = findPhoto(r)
  if (file === 'MANY') { console.log(`  ✗ ${r.name} — 사진이 여러 장 (하나만 남기세요)`); continue }
  if (!file) { missing.push(r.name); continue }
  const body = await sharp(fs.readFileSync(file)).rotate().resize({ width: 1200, height: 1500, fit: 'cover', position: 'top' }).webp({ quality: 82 }).toBuffer()
  const hash = crypto.createHash('sha1').update(body).digest('hex').slice(0, 8)
  const key = `graduates/${s.graduation_year ?? 'unknown'}/${s.id}-${hash}.webp`
  const url = `${publicBase}/${key}`
  if (s.photo_url === url && !FORCE) { console.log(`  = ${r.name} — 같은 사진이 이미 올라가 있음`); continue }
  console.log(`  · ${r.name} ← ${path.basename(file)} (${Math.round(body.length / 1024)}KB)`)
  if (!APPLY) continue
  await r2.send(new PutObjectCommand({ Bucket: need('R2_BUCKET_NAME'), Key: key, Body: body, ContentType: 'image/webp', CacheControl: 'public, max-age=31536000, immutable' }))
  if (!noColumn) {
    const { error: upErr } = await supabase.from('students').update({ photo_url: url }).eq('id', s.id)
    if (upErr) { console.log(`  ✗ ${r.name} — ${upErr.message}`); continue }
  }
  done++
}
if (missing.length) console.log(`  사진 없음 ${missing.length}명: ${missing.join(', ')}`)
if (APPLY) console.log(`✓ 사진 ${done}명 R2 업로드${noColumn ? ' (DB 저장은 SQL 실행 후)' : ' · DB 저장 — 사이트 반영은 최대 5분(캐시)'}`)
