/**
 * 관련 브랜드 썸네일 생성 · R2 업로드 마이그레이션
 * ─────────────────────────────────────────────────────────────
 * thumbnail_url 이 비어 있거나(placeholder 노출 상태) 비관련 임시 URL
 * (picsum.photos 등)인 projects · awards 행에 대해
 *   1) 제목·유형·연도가 들어간 온브랜드 썸네일 SVG 를 생성
 *   2) sharp 로 webp 래스터화
 *   3) Cloudflare R2(ninc-images 프리픽스)로 업로드
 *   4) thumbnail_url 을 R2 공개 URL 로 갱신
 * 하여 "실제 서버"의 빈 이미지를 관련 목이미지로 채운다.
 *
 * 실행:
 *   npx tsx scripts/migrate-related-thumbnails.ts            # 적용
 *   DRY_RUN=1 npx tsx scripts/migrate-related-thumbnails.ts  # 미리보기(업로드/DB변경 없음, 미리보기 PNG만 저장)
 *   FORCE=1   npx tsx scripts/migrate-related-thumbnails.ts  # 모든 행 재생성(기존 thumbnail도 덮어씀)
 *
 * 필요 환경변수 (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { mkdirSync, writeFileSync } from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

// Node 18 WebSocket 폴리필 (supabase-js realtime 초기화 오류 방지)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof (globalThis as any).WebSocket === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).WebSocket = class { constructor() {} addEventListener() {} removeEventListener() {} close() {} }
}

import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'

const DRY_RUN = !!process.env.DRY_RUN
const FORCE = !!process.env.FORCE

// 비관련 임시 이미지로 간주해 교체 대상에 포함할 URL 패턴
const PLACEHOLDER_PATTERNS = ['picsum.photos', 'placeholder', 'via.placeholder']

// ── env ───────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 .env.local 에 필요합니다.')
  process.exit(1)
}

const R2_BUCKET = process.env.R2_BUCKET_NAME ?? ''
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID ?? ''
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID ?? ''
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY ?? ''

if (!DRY_RUN && (!R2_BUCKET || !R2_PUBLIC_URL || !R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY)) {
  console.error('❌ R2_* 환경변수가 비어 있습니다. (DRY_RUN=1 로 미리보기만 실행할 수 있습니다)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
  realtime: { timeout: 0 } as never,
})

const r2 = DRY_RUN ? null : new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
})

// ── 테마 ───────────────────────────────────────────────────
type Theme = { bg0: string; bg1: string; accent: string; ink: string }
export const THEME = {
  green:  { bg0: '#04140D', bg1: '#0B2A1C', accent: '#09F593', ink: '#04140D' } as Theme,
  yellow: { bg0: '#16160A', bg1: '#2B2B12', accent: '#E3E94D', ink: '#1A1A05' } as Theme,
  violet: { bg0: '#0E0A18', bg1: '#1E1633', accent: '#9B8CFF', ink: '#0E0A18' } as Theme,
}

const FONT_STACK = "'Apple SD Gothic Neo','Pretendard','Noto Sans KR','Malgun Gothic','Spoqa Han Sans Neo',sans-serif"

// ── 아이콘 (accent 색, 192px 박스 내부 path) ─────────────────
function icon(kind: string, color: string): string {
  const s = (d: string, fill = false) =>
    `<path d="${d}" fill="${fill ? color : 'none'}" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`
  switch (kind) {
    case 'international': // 지구본
      return `<circle cx="96" cy="96" r="74" fill="none" stroke="${color}" stroke-width="7"/>
        <ellipse cx="96" cy="96" rx="34" ry="74" fill="none" stroke="${color}" stroke-width="7"/>
        ${s('M22 96 H170')}${s('M34 56 H158')}${s('M34 136 H158')}`
    case 'award': // 트로피
      return `${s('M62 34 H130 V70 a34 34 0 0 1 -68 0 Z')}
        ${s('M62 44 H40 a16 16 0 0 0 16 28')}${s('M130 44 H152 a16 16 0 0 1 -16 28')}
        ${s('M96 104 V134')}${s('M70 158 H122')}${s('M82 158 a14 24 0 0 1 28 0')}`
    default: // industry — 협업(연결된 노드)
      return `<circle cx="58" cy="64" r="24" fill="none" stroke="${color}" stroke-width="7"/>
        <circle cx="134" cy="64" r="24" fill="none" stroke="${color}" stroke-width="7"/>
        <circle cx="96" cy="138" r="24" fill="none" stroke="${color}" stroke-width="7"/>
        ${s('M78 78 L114 124')}${s('M114 78 L78 124')}${s('M82 64 H110')}`
  }
}

// ── XML escape ─────────────────────────────────────────────
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/** 제목을 maxChars 기준으로 줄바꿈(한글 1, 영문/숫자 0.55 가중). 최대 maxLines 줄, 넘치면 … */
function wrapTitle(title: string, maxChars = 12, maxLines = 3): string[] {
  const w = (ch: string) => (/[\x00-\x7F]/.test(ch) ? 0.56 : 1)
  const tokens = title.split(/(\s+)/) // 공백 보존
  const lines: string[] = []
  let cur = ''
  let curW = 0
  const lineW = (str: string) => [...str].reduce((a, c) => a + w(c), 0)
  for (const tok of tokens) {
    const tW = lineW(tok)
    if (curW + tW > maxChars && cur.trim()) {
      lines.push(cur.trim())
      cur = tok.trim() ? tok : ''
      curW = lineW(cur)
      if (lines.length === maxLines - 1) break
    } else {
      cur += tok
      curW += tW
    }
  }
  // 남은 글자 처리 — 길면 글자 단위로 강제 분할
  let rest = (cur + (tokens.join('').length ? '' : '')).trim()
  if (lines.length < maxLines && rest) { lines.push(rest); rest = '' }
  // 최종 줄이 너무 길면 자르고 …
  if (lines.length === maxLines) {
    let last = lines[maxLines - 1]
    while (lineW(last) > maxChars + 1 && last.length > 1) last = last.slice(0, -1)
    if (last !== lines[maxLines - 1]) last = last.replace(/\s+$/, '') + '…'
    lines[maxLines - 1] = last
  }
  return lines.length ? lines : [title]
}

// ── 썸네일 SVG ─────────────────────────────────────────────
export function buildSvg(opts: { label: string; title: string; subtitle: string; theme: Theme; kind: string }): string {
  const { label, title, subtitle, theme, kind } = opts
  const W = 1200, H = 900
  const titleLines = wrapTitle(title, 12, 3)
  const titleFont = titleLines.length >= 3 ? 78 : 92
  const titleStartY = 470 - (titleLines.length - 1) * (titleFont * 0.62)
  const titleTspans = titleLines
    .map((ln, i) => `<tspan x="96" dy="${i === 0 ? 0 : titleFont * 1.16}">${esc(ln)}</tspan>`)
    .join('')

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${theme.bg0}"/>
      <stop offset="1" stop-color="${theme.bg1}"/>
    </linearGradient>
    <linearGradient id="acc" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${theme.accent}"/>
      <stop offset="1" stop-color="${theme.accent}" stop-opacity="0.65"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <!-- 장식: 큰 원 + NWCN 워터마크 -->
  <circle cx="1040" cy="760" r="360" fill="${theme.accent}" opacity="0.08"/>
  <circle cx="150" cy="120" r="180" fill="${theme.accent}" opacity="0.05"/>
  <text x="1140" y="858" text-anchor="end" font-family="${FONT_STACK}" font-weight="800"
        font-size="150" fill="${theme.accent}" opacity="0.10" letter-spacing="6">NWCN</text>

  <!-- 상단 라벨 pill -->
  <g>
    <rect x="96" y="120" rx="26" ry="26" width="${68 + label.length * 30}" height="52" fill="url(#acc)"/>
    <text x="${96 + 34 + (label.length * 30) / 2}" y="155" text-anchor="middle"
          font-family="${FONT_STACK}" font-weight="800" font-size="26" fill="${theme.ink}">${esc(label)}</text>
  </g>

  <!-- 아이콘 -->
  <g transform="translate(912,112)">${icon(kind, theme.accent)}</g>

  <!-- 타이틀 -->
  <text x="96" y="${titleStartY}" font-family="${FONT_STACK}" font-weight="800"
        font-size="${titleFont}" fill="#FFFFFF" letter-spacing="-1">${titleTspans}</text>

  <!-- accent bar -->
  <rect x="98" y="${H - 232}" width="96" height="10" rx="5" fill="${theme.accent}"/>
  <!-- subtitle -->
  <text x="96" y="${H - 168}" font-family="${FONT_STACK}" font-weight="600" font-size="34"
        fill="#FFFFFF" opacity="0.82">${esc(subtitle)}</text>
  <text x="96" y="${H - 110}" font-family="${FONT_STACK}" font-weight="600" font-size="26"
        fill="${theme.accent}" letter-spacing="4">DIMA · NEW MEDIA CONTENTS</text>
</svg>`
}

async function renderWebp(svg: string): Promise<Buffer> {
  return sharp(Buffer.from(svg)).webp({ quality: 82 }).toBuffer()
}

async function uploadR2(key: string, body: Buffer): Promise<string> {
  await r2!.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000, immutable',
  }))
  return `${R2_PUBLIC_URL}/${key}`
}

function needsThumbnail(url: string | null): boolean {
  if (FORCE) return true
  if (!url || !url.trim()) return true
  return PLACEHOLDER_PATTERNS.some((p) => url.includes(p))
}

const previewDir = resolve(process.cwd(), 'scripts/.thumbnail-preview')

async function processRow(
  kind: 'projects' | 'awards',
  row: { id: string; title: string; label: string; subtitle: string; theme: Theme; iconKind: string },
) {
  const svg = buildSvg({ label: row.label, title: row.title, subtitle: row.subtitle, theme: row.theme, kind: row.iconKind })
  const webp = await renderWebp(svg)
  const key = `ninc-images/${kind}/auto-${row.id}.webp`

  if (DRY_RUN) {
    mkdirSync(previewDir, { recursive: true })
    const png = await sharp(Buffer.from(svg)).png().toBuffer()
    writeFileSync(resolve(previewDir, `${kind}-${row.id}.png`), png)
    console.log(`  🔎 [DRY] ${kind}/${row.id} 미리보기 저장 · "${row.title}"`)
    return
  }

  const url = await uploadR2(key, webp)
  const { error } = await supabase.from(kind).update({ thumbnail_url: url }).eq('id', row.id)
  if (error) console.error(`  ❌ ${kind}/${row.id} DB 갱신 실패: ${error.message}`)
  else console.log(`  ✅ ${kind}/${row.id} → ${url}`)
}

async function run() {
  console.log(`\n🎨 관련 썸네일 마이그레이션 시작 ${DRY_RUN ? '(DRY_RUN)' : ''}${FORCE ? ' (FORCE)' : ''}`)

  // ── projects ──
  const { data: projects, error: pErr } = await supabase
    .from('projects')
    .select('id, title, type, partner, year, category, thumbnail_url')
  if (pErr) { console.error('projects 조회 실패:', pErr.message); process.exit(1) }

  const projTargets = (projects ?? []).filter((p) => needsThumbnail(p.thumbnail_url))
  console.log(`\n📦 projects: ${projTargets.length}/${projects?.length ?? 0} 대상`)
  for (const p of projTargets) {
    const isIntl = p.type === 'international'
    await processRow('projects', {
      id: p.id,
      title: p.title ?? '프로젝트',
      label: p.category?.trim() || (isIntl ? '해외교류' : '산학협력'),
      subtitle: [p.partner?.trim(), p.year ? `${p.year}` : ''].filter(Boolean).join(' · ') || `${p.year ?? ''}`,
      theme: isIntl ? THEME.yellow : THEME.green,
      iconKind: isIntl ? 'international' : 'industry',
    })
  }

  // ── awards ──
  const { data: awards, error: aErr } = await supabase
    .from('awards')
    .select('id, competition, award_name, hosted_by, year, thumbnail_url')
  if (aErr) { console.error('awards 조회 실패:', aErr.message); process.exit(1) }

  const awardTargets = (awards ?? []).filter((a) => needsThumbnail(a.thumbnail_url))
  console.log(`\n🏆 awards: ${awardTargets.length}/${awards?.length ?? 0} 대상`)
  const TOP_GRADES = ['대상', '금상', '최우수상', 'Winner']
  for (const a of awardTargets) {
    const isTop = TOP_GRADES.includes(a.award_name)
    await processRow('awards', {
      id: a.id,
      title: a.competition ?? '수상',
      label: a.award_name?.trim() || '수상',
      subtitle: [a.hosted_by?.trim(), a.year ? `${a.year}` : ''].filter(Boolean).join(' · ') || `${a.year ?? ''}`,
      theme: isTop ? THEME.green : THEME.violet,
      iconKind: 'award',
    })
  }

  console.log(`\n✨ 완료${DRY_RUN ? ` — 미리보기: ${previewDir}` : ''}\n`)
  process.exit(0)
}

// 직접 실행될 때만 마이그레이션 수행 (import 시에는 buildSvg 등만 노출)
const isMain = process.argv[1]?.includes('migrate-related-thumbnails')
if (isMain) {
  run().catch((e) => { console.error(e); process.exit(1) })
}
