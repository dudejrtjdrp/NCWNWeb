#!/usr/bin/env node
/**
 * 졸업생 포트폴리오 등록 — parse-submissions.mjs 다음 단계
 * ────────────────────────────────────────────────────────────
 * submissions/_parsed/<id>.json(점검 통과분)과 원본 파일을 읽어
 *  1) 원본 PDF 를 쪽 이미지(webp, 긴 변 2000px)로 바꾸고  ← poppler 의 pdftoppm 필요 (맥: brew install poppler)
 *  2) 프로필 사진을 4:5(1200×1500) webp 로 맞추고
 *  3) 프로젝트 이미지는 학생이 따로 보낸 N-01.jpg 를 쓰고, 없으면 양식의 '이미지 쪽' PDF 쪽을 쓴다
 *  4) R2 `portfolios/{졸업연도}/{slug}/…` 에 올리고
 *  5) students(이름+졸업연도로 찾고 없으면 추가)와 portfolios(slug 기준 덮어쓰기)에 저장한다.
 *
 * 공개 원칙: '이메일 공개: 예'일 때만 이메일, 'PDF 다운로드 허용: 예'일 때만 PDF 를 올린다.
 * 게시 동의가 '예'가 아니거나 PDF·프로필 사진이 없으면 건너뛴다.
 *
 * 사용
 *   node scripts/portfolio/register.mjs [제출 폴더=submissions] [slug …]    # 미리보기 (아무것도 바꾸지 않음)
 *   APPLY=1 node scripts/portfolio/register.mjs                             # 실제 업로드·저장 (바로 공개)
 *   APPLY=1 DRAFT=1 node scripts/portfolio/register.mjs                     # 저장만 하고 비공개
 *   (.env.local 이 다른 곳에 있으면 ENV_FILE=경로)
 * 사이트에는 캐시(5분)가 지나면 /work/portfolio 에 나타난다.
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import sharp from 'sharp'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.env.APPLY === '1'
const DRAFT = process.env.DRAFT === '1'
const [dirArg, ...onlySlugs] = process.argv.slice(2)
const dir = dirArg || 'submissions'
const parsedDir = path.join(dir, '_parsed')
if (!fs.existsSync(parsedDir)) {
  console.error(`${parsedDir} 가 없습니다. 먼저 node scripts/portfolio/parse-submissions.mjs ${dir} 를 실행하세요.`)
  process.exit(1)
}

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

try {
  execFileSync('pdftoppm', ['-v'], { stdio: 'ignore' })
} catch {
  console.error('pdftoppm 이 없습니다. 맥에서 `brew install poppler` 로 설치한 뒤 다시 실행하세요.')
  process.exit(1)
}

/** 제출 폴더 안에서 파일 이름으로 찾기 (학생별 폴더 포함) */
function findFile(name) {
  if (!name) return null
  if (name.includes('/')) {
    const direct = path.join(dir, name) // 예: _roster/2024123456.jpg (학과가 받은 사진)
    return fs.existsSync(direct) ? direct : null
  }
  const stack = [dir]
  while (stack.length) {
    const d = stack.pop()
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith('_') || e.name.startsWith('.')) continue
      const full = path.join(d, e.name)
      if (e.isDirectory()) stack.push(full)
      else if (e.name === name) return full
    }
  }
  return null
}

const toWebp = (input, opts) => sharp(input).rotate().resize(opts).webp({ quality: 80 }).toBuffer()

/** PDF → 쪽 이미지(webp) 배열 */
async function pdfPages(pdf) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nwcn-pf-'))
  execFileSync('pdftoppm', ['-r', '110', '-png', pdf, path.join(tmp, 'p')])
  const files = fs.readdirSync(tmp).filter((f) => f.endsWith('.png')).sort()
  const out = []
  for (const f of files) out.push(await toWebp(path.join(tmp, f), { width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }))
  fs.rmSync(tmp, { recursive: true, force: true })
  return out
}

const supabase = createClient(need('NEXT_PUBLIC_SUPABASE_URL'), need('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } })
const publicBase = need('R2_PUBLIC_URL').replace(/\/$/, '')
const r2 = APPLY
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${need('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: need('R2_ACCESS_KEY_ID'), secretAccessKey: need('R2_SECRET_ACCESS_KEY') },
    })
  : null
/** 올릴 파일을 모아 두고 주소를 돌려준다 (실제 업로드는 flush 에서, APPLY 일 때만) */
const uploads = []
const putFile = (key, body, type) => {
  uploads.push({ key, body, type, bytes: body.length })
  return `${publicBase}/${key}`
}
async function flush() {
  for (const u of uploads.splice(0)) {
    await r2.send(new PutObjectCommand({ Bucket: need('R2_BUCKET_NAME'), Key: u.key, Body: u.body, ContentType: u.type, CacheControl: 'public, max-age=31536000, immutable' }))
  }
}

const records = fs
  .readdirSync(parsedDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(parsedDir, f), 'utf8')))
  .filter((r) => !onlySlugs.length || onlySlugs.includes(r.id))

console.log(APPLY ? `▶ 적용${DRAFT ? ' (비공개로 저장)' : ''}` : '▶ 미리보기 (APPLY=1 로 실행하면 실제 반영)')

for (const rec of records) {
  const b = rec.basic
  const v = rec.visibility ?? {}
  const pdf = findFile(rec.source?.pdf)
  const profile = findFile(rec.source?.profile)
  const skip = [
    v.consent !== true && '게시 동의 없음',
    !pdf && 'PDF 없음',
    !profile && '프로필 사진 없음',
    !/^20\d{2}$/.test(b.year ?? '') && '졸업 연도 오류',
  ].filter(Boolean)
  if (skip.length) {
    console.log(`✗ 건너뜀 ${b.name ?? rec.id} (${rec.id}) — ${skip.join(', ')}`)
    continue
  }
  const year = Number(b.year)
  const slug = rec.id
  const base = `portfolios/${year}/${slug}`

  const pages = await pdfPages(pdf)
  const pageUrls = pages.map((buf, i) => putFile(`${base}/pages/${String(i + 1).padStart(3, '0')}.webp`, buf, 'image/webp'))
  const profileUrl = putFile(
    `${base}/profile.webp`,
    await toWebp(fs.readFileSync(profile), { width: 1200, height: 1500, fit: 'cover', position: 'attention' }),
    'image/webp'
  )
  const pdfUrl = v.pdfDownload === true ? putFile(`${base}/portfolio.pdf`, fs.readFileSync(pdf), 'application/pdf') : null

  const projects = []
  for (const [i, p] of (rec.projects ?? []).slice(0, 6).entries()) {
    const own = (rec.source?.images ?? []).filter((f) => f.startsWith(`${i + 1}-`))
    let images
    if (own.length) {
      images = []
      for (const f of own) {
        const file = findFile(f)
        if (!file) continue
        images.push(putFile(`${base}/projects/${path.basename(f, path.extname(f))}.webp`, await toWebp(fs.readFileSync(file), { width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }), 'image/webp'))
      }
    } else {
      images = (p.imagePages ?? []).map((n) => pageUrls[n - 1]).filter(Boolean)
    }
    const cover = (p.coverPage && pageUrls[p.coverPage - 1] && !own.length ? pageUrls[p.coverPage - 1] : images[0]) ?? null
    projects.push({
      title: p.title, titleEn: p.titleEn, year: p.year, fields: p.fields ?? [], format: p.format, role: p.role,
      tools: p.tools ?? [], summary: p.summary, description: p.description, descriptionEn: p.descriptionEn,
      points: p.points ?? [], outcome: p.outcome, video: p.video, images, cover,
    })
  }

  const row = {
    slug, year, name: b.name, name_en: b.nameEn || null, fields: b.fields ?? [],
    tagline: b.tagline || null, tagline_en: b.taglineEn || null, bio: b.bio || null, bio_en: b.bioEn || null,
    interests: b.interests ?? [], tools: b.tools ?? [],
    email: v.emailPublic === true ? b.email || null : null,
    website: b.website || null, instagram: b.instagram || null,
    other_links: (b.otherLinks || '').split(/[,\s]+/).filter((u) => /^https?:\/\//.test(u)),
    profile_url: profileUrl, cover_url: pageUrls[0] ?? null, pages: pageUrls, pdf_url: pdfUrl,
    projects, history: rec.history ?? {}, is_published: !DRAFT, updated_at: new Date().toISOString(),
  }

  const total = uploads.reduce((n, u) => n + u.bytes, 0)
  console.log(`• ${b.name} (${slug}) — 원본 ${pages.length}쪽 · 프로젝트 ${projects.length}개 · 올릴 파일 ${uploads.length}개 ${(total / 1024 / 1024).toFixed(1)}MB${row.email ? ' · 이메일 공개' : ''}${pdfUrl ? ' · PDF 공개' : ''}`)
  if (!APPLY) {
    uploads.length = 0
    continue
  }

  await flush()
  // students: 이름 + 졸업 연도로 찾고, 없으면 추가 (학번은 관리자 페이지에서 채운다)
  const { data: found, error: findErr } = await supabase.from('students').select('id').eq('name', b.name).eq('graduation_year', year)
  if (findErr) throw findErr
  let studentId = found?.[0]?.id
  if (found && found.length > 1) console.log(`  ! 같은 이름·연도 학생이 ${found.length}명 — 첫 번째와 연결함, 관리자 페이지에서 확인`)
  if (!studentId) {
    const { data: ins, error } = await supabase.from('students').insert({ name: b.name, name_en: b.nameEn || null, graduation_year: year, slug }).select('id').single()
    if (error) throw error
    studentId = ins.id
  } else {
    const { error } = await supabase.from('students').update({ slug, name_en: b.nameEn || null }).eq('id', studentId)
    if (error) throw error
  }
  const { error: upErr } = await supabase.from('portfolios').upsert({ ...row, student_id: studentId }, { onConflict: 'slug' })
  if (upErr) throw upErr
  console.log(`  ✓ 저장 — /work/portfolio/${slug}${DRAFT ? ' (비공개)' : ''}`)
}
