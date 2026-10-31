#!/usr/bin/env node
/**
 * 졸업생 포트폴리오 등록 — parse-submissions.mjs 다음 단계
 * ────────────────────────────────────────────────────────────
 * submissions/_parsed/<id>.json(점검 통과분)과 원본 파일을 읽어
 *  1) 원본 PDF 를 쪽 이미지(webp, 긴 변 2000px)로 바꾸고(전화번호·생년월일은 자동으로 가림)  ← poppler 의 pdftoppm·pdftotext 필요 (맥: brew install poppler)
 *  2) 프로필 사진을 4:5(1200×1500) webp 로 맞추고
 *  3) 프로젝트 이미지는 학생이 따로 보낸 N-01.jpg 를 쓰고, 없으면 양식의 '이미지 쪽' PDF 쪽을 쓴다
 *  4) R2 `portfolios/{졸업연도}/{slug}/…` 에 올리고
 *  5) students(이름+졸업연도로 찾고 없으면 추가)와 portfolios(slug 기준 덮어쓰기)에 저장하고
 *  6) 프로젝트마다 쇼케이스 작품(showcase_works, portfolio_ref='slug#번호')도 만들어 학생 작품에 기간순으로 함께 보이게 한다.
 *     다시 등록하면 같은 작품을 덮어쓰고, 포트폴리오에서 빠진 프로젝트는 쇼케이스에서도 지운다. 비공개(DRAFT) 등록이면 만들지 않는다.
 *     (supabase/migrations/add_portfolio_showcase.sql 적용 필요 — 없으면 이 단계만 건너뜀)
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

/* 원본 쪽에 남은 개인정보 가리기 — 전화번호·생년월일(1950~2012년 연.월.일)을 PDF 글자 위치에서 찾아
   쪽 이미지에서 그 자리만 주변 바탕색으로 덮는다. 원본 쪽은 사이트에 그대로 보이므로 학생이 지우지 못한 경우의 안전장치.
   (PDF 파일 자체는 고치지 않는다 — 'PDF 다운로드 허용'이면 원본이 그대로 올라감) */
const PHONE = /(?:\+?82[\s-]?)?0\d{1,2}[\s.)-]*\d{3,4}[\s.-]*\d{4}/
const BIRTH = /(?:19[5-9]\d|200\d|201[0-2])\s*[.\-/년]\s*\d{1,2}\s*[.\-/월]\s*\d{1,2}/
const decode = (t) => t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")

function sensitiveBoxes(pdf) {
  let html = ''
  try {
    html = execFileSync('pdftotext', ['-bbox', pdf, '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  } catch {
    return []
  }
  const pages = []
  for (const pm of html.matchAll(/<page width="([\d.]+)" height="([\d.]+)">([\s\S]*?)<\/page>/g)) {
    const words = [...pm[3].matchAll(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)<\/word>/g)].map((m) => ({
      x0: +m[1], y0: +m[2], x1: +m[3], y1: +m[4], t: decode(m[5]),
    }))
    const hit = new Set()
    for (let i = 0; i < words.length; i++) {
      for (let n = 1; n <= 4 && i + n <= words.length; n++) {
        const group = words.slice(i, i + n)
        const joined = group.map((w) => w.t).join(' ')
        const m = joined.match(PHONE) || joined.match(BIRTH)
        // 묶음 글자 대부분이 번호·날짜일 때만 (앞뒤 다른 글자까지 덮지 않게)
        if (m && m[0].replace(/\s/g, '').length >= joined.replace(/[\s()]/g, '').length - 1) group.forEach((_, k) => hit.add(i + k))
      }
    }
    pages.push({ w: +pm[1], h: +pm[2], boxes: [...hit].map((k) => words[k]) })
  }
  return pages
}

async function redact(png, page) {
  if (!page || !page.boxes.length) return png
  const meta = await sharp(png).metadata()
  const s = meta.width / page.w
  const rects = []
  for (const b of page.boxes) {
    const x = Math.max(0, Math.floor(b.x0 * s) - 2)
    // 글자 상자 윗부분은 글꼴 여백이라 숫자보다 높다 — 위 12%는 덮지 않아 바로 위 이름표(예: '전화')를 건드리지 않는다
    const y = Math.max(0, Math.floor((b.y0 + (b.y1 - b.y0) * 0.12) * s))
    const w = Math.min(meta.width - x, Math.ceil((b.x1 - b.x0) * s) + 4)
    const h = Math.min(meta.height - y, Math.ceil(b.y1 * s) + 2 - y)
    // 바탕색: 상자 둘레(8px)에서 가장 많은 색 — 글자 색이 섞이지 않게 평균 대신 최빈값
    const rx = Math.max(0, x - 8)
    const ry = Math.max(0, y - 8)
    const rw = Math.min(meta.width - rx, w + 16)
    const rh = Math.min(meta.height - ry, h + 16)
    const { data, info } = await sharp(png).extract({ left: rx, top: ry, width: rw, height: rh }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    const bins = new Map()
    for (let i = 0; i < data.length; i += info.channels) {
      const key = ((data[i] >> 3) << 10) | ((data[i + 1] >> 3) << 5) | (data[i + 2] >> 3)
      const e = bins.get(key) ?? { n: 0, r: 0, g: 0, b: 0 }
      e.n++
      e.r += data[i]
      e.g += data[i + 1]
      e.b += data[i + 2]
      bins.set(key, e)
    }
    let best = { n: 0, r: 255, g: 255, b: 255 }
    for (const e of bins.values()) if (e.n > best.n) best = e
    const fill = best.n ? `rgb(${Math.round(best.r / best.n)},${Math.round(best.g / best.n)},${Math.round(best.b / best.n)})` : 'rgb(255,255,255)'
    rects.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`)
  }
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${meta.width}" height="${meta.height}">${rects.join('')}</svg>`)
  return sharp(png).composite([{ input: svg, top: 0, left: 0 }]).png().toBuffer()
}

/** PDF → 쪽 이미지(webp) 배열 (+ 가린 곳 수) */
async function pdfPages(pdf) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nwcn-pf-'))
  execFileSync('pdftoppm', ['-r', '110', '-png', pdf, path.join(tmp, 'p')])
  const files = fs.readdirSync(tmp).filter((f) => f.endsWith('.png')).sort()
  const boxes = sensitiveBoxes(pdf)
  const out = []
  const masked = []
  for (const [i, f] of files.entries()) {
    const n = boxes[i]?.boxes.length ?? 0
    if (n) masked.push(`${i + 1}쪽 ${n}곳`)
    const png = await redact(path.join(tmp, f), boxes[i])
    out.push(await toWebp(png, { width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }))
  }
  fs.rmSync(tmp, { recursive: true, force: true })
  out.masked = masked
  return out
}

const supabase = createClient(need('NEXT_PUBLIC_SUPABASE_URL'), need('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } })

/** 프로젝트 기간 → 쇼케이스 연도·정렬 날짜. '2021.12–2022.10' → 2022, 2022-10-01 / '2026.03–'(진행 중) → 올해·오늘 / '2021' → 2021, 날짜 없음 */
function workWhen(period, fallbackYear) {
  const s = String(period ?? '')
  const marks = [...s.matchAll(/(20\d{2})(?:[.\-/년\s]*(\d{1,2})(?!\d))?/g)].map((m) => ({ y: Number(m[1]), m: m[2] ? Number(m[2]) : null }))
  const ongoing = /(진행|운영|현재|now|present)/i.test(s) || /[–—~-]\s*$/.test(s.trim())
  if (ongoing && marks.length) {
    const now = new Date()
    return { year: now.getFullYear(), date: now.toISOString().slice(0, 10) }
  }
  const last = marks[marks.length - 1]
  if (!last) return { year: fallbackYear, date: null }
  const mm = last.m && last.m >= 1 && last.m <= 12 ? String(last.m).padStart(2, '0') : null
  return { year: last.y, date: mm ? `${last.y}-${mm}-01` : null }
}

/** 유튜브 주소 → embed 주소 (관리자 작품 입력과 같은 규칙), 그 밖의 http(s)는 그대로 */
function videoEmbed(raw) {
  const url = String(raw ?? '').trim()
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/)
  if (m) return `https://www.youtube.com/embed/${m[1]}`
  return /^https?:\/\//i.test(url) ? url : null
}

/** 양식 분야 → 쇼케이스 필터 태그(설정의 영문 태그와 같은 이름 — Video, Web …) */
const TAG = { 영상: 'Video', 모션: 'Motion', 그래픽: 'Graphic', 웹: 'Web', 사진: 'Photo', AI: 'AI', '3D': '3D', 게임: 'Game', XR: 'XR', 'UX/UI': 'UX/UI', 사운드: 'Sound', 인터랙티브: 'Interactive', 기획: 'Planning' }
const workTags = (fields) => [...new Set(fields.map((f) => TAG[f] ?? f))]

/** 분야 → 쇼케이스 유형(video/design/3d) */
const workType = (fields) =>
  fields.some((f) => ['영상', '모션'].includes(f)) ? 'video' : fields.some((f) => ['3D', 'XR', '게임'].includes(f)) ? '3d' : 'design'
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
    await toWebp(fs.readFileSync(profile), { width: 1200, height: 1500, fit: 'cover', position: 'top' }),
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
  if (pages.masked?.length) console.log(`  · 원본 쪽 개인정보 가림: ${pages.masked.join(', ')}`)
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

  // 쇼케이스 — 프로젝트마다 작품 하나 (기간순 정렬용 work_date, 다시 등록하면 portfolio_ref 로 덮어씀)
  if (DRAFT) continue
  const refs = []
  let made = 0
  for (const [i, p] of projects.entries()) {
    const when = workWhen(p.year, year)
    const ref = `${slug}#${i + 1}`
    refs.push(ref)
    const work = {
      portfolio_ref: ref,
      title: p.title,
      title_en: p.titleEn || null,
      author: b.name,
      creators: [{ name: b.name, student_id: studentId, student_no: null }],
      year: when.year ?? year,
      work_date: when.date,
      description: p.description || p.summary || null,
      description_en: p.descriptionEn || null,
      type: workType(p.fields ?? []),
      tech_stack: workTags(p.fields ?? []),
      thumbnail_url: p.cover ?? p.images[0] ?? null,
      images: p.images,
      video_embed: videoEmbed(p.video),
      model_embed: null,
      related_links: [],
    }
    const { error } = await supabase.from('showcase_works').upsert(work, { onConflict: 'portfolio_ref' })
    if (error) {
      if (/portfolio_ref|work_date/.test(error.message)) {
        console.log('  ! 쇼케이스 연동 건너뜀 — supabase/migrations/add_portfolio_showcase.sql 을 먼저 실행하세요')
        break
      }
      throw error
    }
    made++
  }
  if (made === projects.length) {
    const { data: olds, error } = await supabase.from('showcase_works').select('id, portfolio_ref').like('portfolio_ref', `${slug}#%`)
    if (error) throw error
    const gone = (olds ?? []).filter((w) => !refs.includes(w.portfolio_ref)).map((w) => w.id)
    if (gone.length) {
      const { error: delErr } = await supabase.from('showcase_works').delete().in('id', gone)
      if (delErr) throw delErr
    }
    console.log(`  ✓ 쇼케이스 작품 ${made}개${gone.length ? ` (빠진 프로젝트 ${gone.length}개 삭제)` : ''}`)
  }
}
