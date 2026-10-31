/**
 * 졸업전시 한 건 추가 — 관리자 페이지 '졸업전시' 저장과 같은 방식
 * ────────────────────────────────────────────────────────────
 *  1) 포스터: webp 변환(가로·세로 최대 2000px, 품질 80) → R2 `ninc-images/exhibitions/{year}/{uuid}.webp`
 *  2) exhibitions 테이블에 insert — 같은 연도·제목이 이미 있으면 아무것도 하지 않는다
 *  사이트에는 캐시(5분)가 지나면 /work/exhibition 에 나타난다.
 *
 * 사용:
 *   node scripts/add-exhibition.mjs <spec.json> <포스터 이미지>          # 미리보기 (아무것도 바꾸지 않음)
 *   APPLY=1 node scripts/add-exhibition.mjs <spec.json> <포스터 이미지>  # 실제 업로드·저장
 *   (.env.local 이 다른 곳에 있으면 ENV_FILE=경로)
 *
 * spec.json 예:
 *   { "year": 2026, "title": ".ZIP", "theme": "한 줄 소개", "description": "본문(빈 줄 = 문단, **굵게**)", "link": "https://…" }
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import sharp from 'sharp'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'

const [specPath, posterPath] = process.argv.slice(2)
if (!specPath || !posterPath) {
  console.error('사용: node scripts/add-exhibition.mjs <spec.json> <포스터 이미지>')
  process.exit(1)
}
const APPLY = process.env.APPLY === '1'

// .env.local 읽기 (값은 출력하지 않는다)
const envFile = process.env.ENV_FILE ?? path.resolve('.env.local')
for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
const need = (k) => {
  if (!process.env[k]) throw new Error(`.env.local 에 ${k} 가 없습니다`)
  return process.env[k]
}

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'))
const year = Number(spec.year)
if (!spec.title || !year) throw new Error('spec 에 year, title 이 필요합니다')

const supabase = createClient(need('NEXT_PUBLIC_SUPABASE_URL'), need('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { persistSession: false },
})

const { data: existing, error: findErr } = await supabase
  .from('exhibitions')
  .select('id, year, title')
  .eq('year', year)
  .eq('title', spec.title)
if (findErr) throw findErr
if (existing.length) {
  console.log(`이미 있음 — ${year} ${spec.title} (id ${existing[0].id}). 아무것도 하지 않습니다.`)
  process.exit(0)
}

const webp = await sharp(fs.readFileSync(posterPath))
  .rotate()
  .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 80 })
  .toBuffer()
const meta = await sharp(webp).metadata()
const key = `ninc-images/exhibitions/${year}/${crypto.randomUUID()}.webp`
const posterUrl = `${need('R2_PUBLIC_URL').replace(/\/$/, '')}/${key}`

const row = {
  year,
  title: spec.title,
  theme: spec.theme || null,
  description: spec.description || null,
  link: spec.link || null,
  poster_url: posterUrl,
}

console.log(APPLY ? '▶ 적용' : '▶ 미리보기 (APPLY=1 로 실행하면 실제 반영)')
console.log(`  포스터: ${meta.width}×${meta.height} webp ${(webp.length / 1024).toFixed(0)}KB → ${posterUrl}`)
console.log(`  행: ${JSON.stringify({ ...row, description: row.description ? `${row.description.slice(0, 60)}… (${row.description.length}자)` : null })}`)
if (!APPLY) process.exit(0)

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${need('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: need('R2_ACCESS_KEY_ID'), secretAccessKey: need('R2_SECRET_ACCESS_KEY') },
})
await r2.send(
  new PutObjectCommand({
    Bucket: need('R2_BUCKET_NAME'),
    Key: key,
    Body: webp,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000, immutable',
  })
)
const { data: inserted, error: insErr } = await supabase.from('exhibitions').insert(row).select('id').single()
if (insErr) throw insErr
console.log(`✓ 저장 완료 — id ${inserted.id}`)
