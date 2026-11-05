#!/usr/bin/env node
/**
 * 졸업생 포트폴리오 제출물 파서
 * ────────────────────────────────────────────────────────────
 * 학생이 docs/portfolio/NWCN_졸업생포트폴리오_양식.txt 를 AI 에 돌려 만든 txt 와
 * 원본 포트폴리오 PDF 를 받아, 사이트 레이아웃에 바로 넣을 JSON 으로 바꾸고 빠진 항목을 알려 준다.
 * DB·스토리지에는 아무것도 쓰지 않는다 (업로드는 별도 단계).
 *
 * 제출 폴더 (학생 안내: docs/portfolio/단톡_안내_2027.txt)
 *   submissions/2027_홍길동/            ← 학생이 낸 폴더 그대로 (zip 이면 같은 이름 폴더로 자동으로 풂)
 *     2027_홍길동.txt                   AI 로 정리한 양식
 *     2027_홍길동.pdf                   원본 포트폴리오
 *     2027_홍길동_사진.jpg               (선택) 프로필 사진 — 없으면 _roster 의 학과 사진
 *     1_프로젝트제목/                    [프로젝트 1] 이미지 — 폴더 앞 번호 = 양식의 프로젝트 번호
 *       썸네일.jpg                       목록·대표 이미지
 *       01.jpg 02.jpg …                  상세 이미지 (이름 순서대로)
 *     2_프로젝트제목/ …
 *   예전 방식도 받는다: submissions/2027_홍길동.txt + .pdf 낱장, 1-01.jpg 같은 이미지 파일
 *   프로젝트 폴더가 없으면 양식의 '이미지 쪽'(PDF 쪽)을 대신 쓴다.
 *
 * 학과가 받은 졸업생 사진·명단 (선택)
 *   submissions/_roster/명단.csv          이름,학번,영문이름 (한 줄에 한 명, 첫 줄 머리글 가능)
 *   submissions/_roster/<학번 또는 이름>.jpg  학생이 프로필 사진을 안 냈으면 이 사진을 쓴다
 *
 * 실행
 *   node scripts/portfolio/parse-submissions.mjs [제출 폴더=submissions]
 *   → <제출 폴더>/_parsed/<id>.json, <제출 폴더>/_parsed/report.md
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'node:fs'
import { join, basename, extname, relative } from 'node:path'
import { execFileSync } from 'node:child_process'

const FIELDS = ['영상', '모션', '그래픽', '웹', 'UX/UI', '사진', '3D', 'XR', '게임', 'AI', '사운드', '인터랙티브', '기획']

/* 양식 항목 → JSON 키 (콜론 앞 이름은 양식과 정확히 같아야 한다) */
const BASIC = {
  '이름': 'name', '영문 이름': 'nameEn', '졸업 연도': 'year', '분야': 'fields',
  '한 줄 소개': 'tagline', '영문 한 줄 소개': 'taglineEn', '자기소개': 'bio', '영문 자기소개': 'bioEn',
  '관심 분야': 'interests', '사용 툴': 'tools', '이메일': 'email', '웹사이트': 'website',
  '인스타그램': 'instagram', '비핸스·깃허브 등 기타 링크': 'otherLinks',
}
const VISIBILITY = {
  '이메일 공개': 'emailPublic', '원본 포트폴리오 PDF 다운로드 허용': 'pdfDownload', '홈페이지 게시 동의': 'consent',
}
// '기간'(예: 2025.03–2025.06, 진행 중이면 2026.03–)이 새 양식, '연도'는 예전 양식 — 둘 다 받는다
const PROJECT = {
  '제목': 'title', '영문 제목': 'titleEn', '기간': 'period', '연도': 'year', '분야': 'fields', '형태': 'format', '팀원': 'team',
  '내 역할': 'role', '사용 툴': 'tools', '한 줄 요약': 'summary', '설명': 'description',
  '영문 설명': 'descriptionEn', '영문 한 줄 요약': 'summaryEn', '영문 내 역할': 'roleEn',
  '핵심 포인트': 'points', '영문 핵심 포인트': 'pointsEn', '결과·성과': 'outcome', '영문 결과·성과': 'outcomeEn', '영상 링크': 'video',
  '관련 링크': 'links', '이미지 쪽': 'imagePages', '대표 이미지 쪽': 'coverPage',
}
/** 프로젝트 하나에 올리는 상세 이미지 최대 장수 (register.mjs 와 같게) */
const MAX_IMAGES = 10
const HISTORY = { '수상': 'awards', '전시·발표': 'exhibitions', '경력·대외활동': 'experience' }

const KNOWN = new Set([...Object.keys(BASIC), ...Object.keys(VISIBILITY), ...Object.keys(PROJECT), ...Object.keys(HISTORY)])

/* 글자 수 상한 (양식 괄호 안 숫자와 같게) */
const LIMITS = {
  tagline: 40, taglineEn: 80, bio: 250, bioEn: 500,
  'p.title': 30, 'p.titleEn': 60, 'p.role': 40, 'p.summary': 60, 'p.description': 300,
  'p.descriptionEn': 600, 'p.outcome': 100, 'p.point': 50,
}

/* ── 텍스트 정리: AI 가 섞어 넣는 마크다운·코드펜스·전각 콜론을 걷어낸다 ── */
function clean(raw) {
  return raw
    .replace(/^﻿/, '')
    .replace(/```[a-z]*\n?/gi, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/：/g, ':')
    .replace(/\r\n?/g, '\n')
}

/** 양식의 안내 문구·미입력 표시는 빈 값으로 본다 */
function valueOf(v) {
  const s = (v ?? '').trim()
  if (!s) return ''
  if (/^\(.*\)$/.test(s)) return '' // "(40)", "(주력 분야 1~3개)" 같은 안내만 남은 경우
  if (s.startsWith('[직접 입력]')) return null // 학생이 채워야 하는데 비어 있음
  return s.replace(/\s*\((?:\d+|예\s*\/\s*아니오|예)\)\s*$/, '').trim()
}

const list = (s) => (s ? s.split(/[,，、]/).map((x) => x.trim()).filter(Boolean) : [])
const yes = (s) => (s == null ? null : /^(예|네|yes|y|o|동의)$/i.test(s.trim()))

/* 관련 링크 — 한 줄에 하나씩 "이름 | 주소" (이름 없이 주소만 써도 됨, 한 줄에 여러 주소면 각각) */
const HOST_LABEL = [
  [/github\.com/, 'GitHub'], [/behance\.net/, 'Behance'], [/notion\.(site|so)/, 'Notion'], [/figma\.com/, 'Figma'],
  [/youtube\.com|youtu\.be/, 'YouTube'], [/vimeo\.com/, 'Vimeo'], [/instagram\.com/, 'Instagram'],
  [/play\.google\.com/, 'Google Play'], [/apps\.apple\.com/, 'App Store'], [/itch\.io/, 'itch.io'], [/vercel\.app/, '사이트'],
]
function hostLabel(url) {
  const host = (() => { try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url } })()
  return HOST_LABEL.find(([re]) => re.test(host))?.[1] ?? host
}
function parseLinks(parts) {
  const out = []
  for (const raw of parts) {
    const s = (raw ?? '').trim()
    if (!s || /^\([^)]*\)$/.test(s)) continue
    const found = [...s.matchAll(/https?:\/\/[^\s,，)）]+/g)].map((m) => m[0])
    if (!found.length) continue
    const urls = found.map((u) => u.replace(/[.。]+$/, ''))
    const label = found.length === 1 ? s.replace(found[0], '').replace(/\([^)]*\)/g, '').replace(/[|:：\-–—·.。]+/g, ' ').replace(/\s+/g, ' ').trim() : ''
    for (const url of urls) if (!out.some((l) => l.url === url)) out.push({ label: (label || hostLabel(url)).slice(0, 30), url })
  }
  return out
}

function parseTxt(text) {
  const src = clean(text)
  // 표시줄은 그 줄에 단독으로 있을 때만 인정한다 (양식 안내문 속 따옴표 문구와 구분)
  const startM = src.match(/^\s*=== 출력 시작 ===\s*$/m)
  const from = startM ? startM.index + startM[0].length : 0
  const endM = src.slice(from).match(/^\s*=== 출력 끝 ===\s*$/m)
  const body = src.slice(from, endM ? from + endM.index : undefined)

  const sections = []
  let cur = null
  let lastKey = null
  for (const line of body.split('\n')) {
    const t = line.trim()
    if (!t) continue
    const sec = t.match(/^\[(.+?)\]$/)
    if (sec) { cur = { name: sec[1].trim(), kv: {}, lists: {} }; sections.push(cur); lastKey = null; continue }
    if (!cur) continue
    const item = t.match(/^[-•·]\s*(.*)$/)
    if (item && lastKey) {
      const v = item[1].trim()
      if (v) (cur.lists[lastKey] ??= []).push(v)
      continue
    }
    const kv = t.match(/^([^:]{1,30}):\s*(.*)$/)
    // 양식에 있는 항목 이름일 때만 새 항목으로 본다 — 설명 안의 "목표: …", URL 의 "https:" 는 이어지는 글로 처리
    if (kv && KNOWN.has(kv[1].trim())) { lastKey = kv[1].trim(); cur.kv[lastKey] = kv[2]; continue }
    if (lastKey) cur.kv[lastKey] = `${cur.kv[lastKey] ?? ''} ${t}`.trim() // 여러 줄로 이어진 값
  }
  return sections
}

function build(sections) {
  const out = { basic: { fields: [], interests: [], tools: [] }, visibility: {}, projects: [], history: {}, aiNotes: [] }
  const missingStudent = []
  for (const s of sections) {
    if (s.name === '기본 정보') {
      for (const [k, key] of Object.entries(BASIC)) {
        const v = valueOf(s.kv[k])
        if (v === null) missingStudent.push(k)
        if (key === 'year') { out.basic.year = (v || '').match(/20\d{2}/)?.[0] ?? (v || ''); continue } // '2027 (졸업식 연도…)' 처럼 안내가 남아도 연도만
        out.basic[key] = ['fields', 'interests', 'tools'].includes(key) ? list(v) : (v || '')
      }
    } else if (s.name === '공개 설정') {
      for (const [k, key] of Object.entries(VISIBILITY)) {
        const v = valueOf(s.kv[k])
        if (v === null || v === '') missingStudent.push(k)
        out.visibility[key] = yes(v)
      }
    } else if (/^프로젝트\s*\d+$/.test(s.name)) {
      const p = {}
      for (const [k, key] of Object.entries(PROJECT)) {
        const v = valueOf(s.kv[k])
        if (key === 'points' || key === 'pointsEn') p[key] = (s.lists[k] ?? []).filter(Boolean)
        else if (key === 'fields' || key === 'tools') p[key] = list(v)
        // 팀원: 이름만 (괄호 속 역할·'본인'·'외 N명' 같은 말은 뺌)
        else if (key === 'team') p.team = list(v).map((x) => x.replace(/\(.*?\)|（.*?）/g, '').replace(/\s*외\s*\d+\s*명$/, '').trim()).filter((x) => x && !/^(본인|나|없음|-)$/.test(x))
        else if (key === 'links') p.links = parseLinks([s.kv[k], ...(s.lists[k] ?? [])])
        else if (key === 'imagePages') p.imagePages = list(v).map(Number).filter(Number.isFinite)
        else if (key === 'coverPage') p.coverPage = Number(v) || null
        else p[key] = v || ''
      }
      if (p.period && !p.year) p.year = p.period // 화면에는 기간을 그대로 보여 준다
      delete p.period
      if (p.title) out.projects.push(p)
    } else if (s.name === '이력') {
      for (const [k, key] of Object.entries(HISTORY)) out.history[key] = s.lists[k] ?? []
    } else if (s.name === 'AI 확인 메모') {
      out.aiNotes = Object.values(s.lists).flat()
    }
  }
  return { data: out, missingStudent }
}

function validate(d, files) {
  const errors = []
  const warns = []
  const b = d.basic
  if (!b.name) errors.push('이름 없음')
  if (!/^20\d{2}$/.test(b.year ?? '')) errors.push(`졸업 연도 형식 오류: "${b.year ?? ''}"`)
  if (!b.fields.length) errors.push('분야 없음')
  if (!b.tagline) errors.push('한 줄 소개 없음')
  if (!b.bio) warns.push('자기소개 없음')
  if (d.visibility.consent !== true) errors.push('홈페이지 게시 동의가 "예"가 아님 — 게시 불가')
  if (!d.projects.length) errors.push('프로젝트가 하나도 없음')
  if (!files.pdf) errors.push('원본 포트폴리오 PDF 없음')
  if (!files.profile) errors.push('프로필 사진 없음 (졸업연도_이름_사진.jpg 또는 submissions/_roster/ 의 학과 사진)')

  const bad = [...b.fields, ...b.interests, ...d.projects.flatMap((p) => p.fields)].filter((f) => !FIELDS.includes(f))
  if (bad.length) warns.push(`목록에 없는 분야: ${[...new Set(bad)].join(', ')}`)

  const over = (label, s, n) => { if (s && [...s].length > n) warns.push(`${label} ${[...s].length}자 (최대 ${n})`) }
  over('한 줄 소개', b.tagline, LIMITS.tagline)
  over('자기소개', b.bio, LIMITS.bio)
  d.projects.forEach((p, i) => {
    const n = `프로젝트${i + 1}`
    over(`${n} 제목`, p.title, LIMITS['p.title'])
    over(`${n} 한 줄 요약`, p.summary, LIMITS['p.summary'])
    over(`${n} 설명`, p.description, LIMITS['p.description'])
    p.points.forEach((pt, j) => over(`${n} 포인트${j + 1}`, pt, LIMITS['p.point']))
    if (!p.description) warns.push(`${n} 설명 없음`)
    const own = files.projects[i + 1]
    if (!own) {
      if (p.imagePages.length) warns.push(`${n} 이미지 폴더 없음 — PDF ${p.imagePages.join(', ')}쪽으로 대신함 ('${i + 1}_제목' 폴더로 받으면 더 좋음)`)
      else errors.push(`${n} 이미지 없음 — '${i + 1}_제목' 폴더에 썸네일·이미지를 넣어 달라고 하기`)
    } else {
      if (!own.thumb) warns.push(`${n} 썸네일 없음 — 첫 이미지를 대표로 씀`)
      if (own.images.length > MAX_IMAGES) warns.push(`${n} 이미지 ${own.images.length}장 — 앞 ${MAX_IMAGES}장만 올림`)
    }
    for (const l of p.links ?? []) if (!/^https?:\/\/[^/\s]+\.[^/\s]+/.test(l.url)) warns.push(`${n} 관련 링크 주소 확인: ${l.url}`)
    if (p.video && !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//.test(p.video)) warns.push(`${n} 영상 링크가 유튜브·비메오 주소가 아님`)
  })
  for (const [k, v] of Object.entries({ 웹사이트: b.website, 인스타그램: b.instagram })) {
    if (v && !/^https?:\/\//.test(v) && !(k === '인스타그램' && /^@?[\w.]+$/.test(v))) warns.push(`${k} 주소 형식 확인: ${v}`)
  }
  warns.push(...(files.folderNotes ?? []))
  return { errors, warns }
}

/* ── 제출물 묶기 ── */
const IMG = /\.(jpe?g|png|webp)$/i
const BAD_IMG = /\.(heic|heif|gif|tiff?|psd|ai|bmp|mp4|mov)$/i
const SKIP = (n) => n.startsWith('.') || n === '__MACOSX'
const nfc = (s) => s.normalize('NFC')
const isThumb = (f) => /^(썸네일|대표|thumbnail|thumb|cover)/i.test(nfc(basename(f)))
const natural = (a, b) => nfc(basename(a)).localeCompare(nfc(basename(b)), 'ko', { numeric: true })
const titleKey = (s) => nfc(String(s ?? '')).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
/** 프로젝트 폴더 이름 앞 번호 — '1_제목', '01. 제목', '1 제목', '프로젝트1' → 1 (양식의 [프로젝트 N]) */
function projectNo(folder) {
  const m = nfc(folder).match(/^\s*\[?\s*(?:프로젝트|project)?\s*0*(\d{1,2})(?=$|[\s._\-)\]])/i)
  return m ? Number(m[1]) : null
}
function listFiles(d) {
  const out = []
  for (const e of readdirSync(d, { withFileTypes: true })) {
    if (SKIP(e.name)) continue
    const f = join(d, e.name)
    if (e.isDirectory()) out.push(...listFiles(f))
    else out.push(f)
  }
  return out
}

/* zip 으로 낸 제출물은 같은 이름 폴더로 풀어 둔다 — 윈도우에서 만든 zip 의 한글 파일 이름(cp949)도 맞춰 풂.
   이미 풀린 폴더가 있으면 건너뛰고, 원본 zip 은 그대로 둔다 (python3 필요) */
const UNZIP_PY = `
import sys, os, zipfile
src, out = sys.argv[1], os.path.abspath(sys.argv[2])
with zipfile.ZipFile(src) as z:
    for i in z.infolist():
        n = i.filename
        if not (i.flag_bits & 0x800):
            raw = n.encode('cp437')
            for enc in ('utf-8', 'cp949'):
                try:
                    n = raw.decode(enc); break
                except UnicodeDecodeError:
                    pass
        parts = n.replace('\\\\', '/').split('/')
        if n.endswith('/') or any(p in ('__MACOSX', '..') for p in parts) or parts[-1].startswith('.'):
            continue
        dest = os.path.abspath(os.path.join(out, *parts))
        if not dest.startswith(out + os.sep):
            continue
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with z.open(i) as s, open(dest, 'wb') as d:
            d.write(s.read())
`
function unzipAll(dir) {
  for (const name of readdirSync(dir)) {
    if (!/\.zip$/i.test(name) || name.startsWith('.') || name.startsWith('_')) continue
    const out = join(dir, basename(name, extname(name)))
    if (existsSync(out)) continue
    try {
      execFileSync('python3', ['-c', UNZIP_PY, join(dir, name), out])
      console.log(`압축 풂: ${name} → ${basename(out)}/`)
    } catch {
      console.error(`압축을 못 풂: ${name} — 직접 풀어서 폴더째로 넣어 주세요`)
    }
  }
}

/* ── 제출물 묶기 ── */
function collect(dir) {
  const groups = new Map()
  const group = (id) => {
    if (!groups.has(id)) groups.set(id, { files: [], folders: [] })
    return groups.get(id)
  }
  for (const name of readdirSync(dir)) {
    if (name.startsWith('_') || SKIP(name) || /\.zip$/i.test(name)) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      // zip 을 풀면 폴더가 한 겹 더 생기기도 한다 (2027_홍길동/2027_홍길동/…) — 파일이 있는 곳까지 들어간다
      let root = full
      for (;;) {
        const ents = readdirSync(root, { withFileTypes: true }).filter((e) => !SKIP(e.name))
        const dirs = ents.filter((e) => e.isDirectory())
        if (ents.some((e) => e.isFile()) || dirs.length !== 1 || projectNo(dirs[0].name) != null) break
        root = join(root, dirs[0].name)
      }
      const g = group(name)
      for (const e of readdirSync(root, { withFileTypes: true })) {
        if (SKIP(e.name)) continue
        const f = join(root, e.name)
        if (e.isDirectory()) g.folders.push({ name: nfc(e.name), files: listFiles(f) })
        else g.files.push(f)
      }
    } else {
      const id = basename(name, extname(name)).replace(/_(profile|프로필|사진)$/i, '')
      group(id).files.push(full)
    }
  }
  return [...groups].map(([id, { files, folders }]) => {
    const pick = (re) => files.filter((f) => re.test(nfc(f)))
    return {
      id,
      txt: pick(/\.txt$/i)[0] ?? null,
      pdf: pick(/\.pdf$/i)[0] ?? null,
      profile: pick(/(profile|프로필|사진)\.(jpe?g|png|webp)$/i)[0] ?? null,
      images: pick(/\/\d+-\d+\.(jpe?g|png|webp)$/i).map((f) => basename(f)).sort(natural), // 예전 방식 1-01.jpg
      folders,
    }
  })
}

/** 프로젝트 폴더 → 양식의 프로젝트 번호. 번호가 없는 폴더는 제목으로 맞춰 본다. 경로는 제출 폴더 기준 */
function projectFiles(sub, projects, dir) {
  const map = {}
  const notes = []
  const rel = (f) => relative(dir, f)
  const byTitle = (name) => {
    const k = titleKey(name)
    return projects.findIndex((p) => {
      const t = titleKey(p.title)
      return k && (t === k || titleKey(p.titleEn) === k || (k.length >= 2 && t.length >= 2 && (t.includes(k) || k.includes(t))))
    })
  }
  for (const fo of sub.folders) {
    let n = projectNo(fo.name)
    const hit = byTitle(n == null ? fo.name : fo.name.replace(/^\s*\[?\s*(?:프로젝트|project)?\s*\d{1,2}[\s._\-)\]]*/i, ''))
    if (n == null && hit >= 0) n = hit + 1
    else if (n != null && hit >= 0 && hit + 1 !== n) notes.push(`폴더 '${fo.name}' — 번호는 ${n}번인데 이름은 ${hit + 1}번 프로젝트(${projects[hit].title}) 같음, 번호대로 넣었으니 확인`)
    if (n == null || n < 1 || n > projects.length) {
      notes.push(`폴더 '${fo.name}'가 몇 번 프로젝트인지 모름 — 폴더 이름 앞에 양식의 프로젝트 번호를 붙여 달라고 하기`)
      continue
    }
    const bad = fo.files.filter((f) => BAD_IMG.test(f))
    if (bad.length) notes.push(`'${fo.name}' 폴더의 못 쓰는 파일: ${bad.map((f) => nfc(basename(f))).join(', ')} — jpg·png 로 다시 받기 (움직이는 건 영상 링크로)`)
    const imgs = fo.files.filter((f) => IMG.test(f)).sort(natural)
    const thumb = imgs.find(isThumb) ?? null
    const e = (map[n] ??= { folder: fo.name, thumb: null, images: [] })
    if (thumb && !e.thumb) e.thumb = rel(thumb)
    e.images.push(...imgs.filter((f) => f !== thumb).map(rel))
  }
  // 예전 방식 낱장 이미지 (1-01.jpg) — 그 번호 폴더가 없을 때만
  for (const f of sub.images) {
    const n = Number(f.split('-')[0])
    if (!n || n > projects.length || (map[n] && map[n].folder)) continue
    ;(map[n] ??= { folder: null, thumb: null, images: [] }).images.push(f)
  }
  return { map, notes }
}

function slug(year, nameEn, fallback) {
  const s = (nameEn || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return s ? `${year}-${s}` : fallback
}

const dir = process.argv[2] || 'submissions'

/* ── 학과가 받은 명단·사진 (submissions/_roster) ── */
const rosterDir = join(dir, '_roster')
const roster = { byName: new Map(), photos: [] }
if (existsSync(rosterDir)) {
  for (const f of readdirSync(rosterDir)) {
    if (/\.(jpe?g|png|webp)$/i.test(f)) roster.photos.push(f)
    if (/\.csv$/i.test(f)) {
      for (const line of readFileSync(join(rosterDir, f), 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/)) {
        const [name, no, en] = line.split(/\s*[,\t]\s*/)
        if (!name || name === '이름') continue
        roster.byName.set(name.trim().normalize('NFC'), { no: (no ?? '').trim() || null, en: (en ?? '').trim() || null })
      }
    }
  }
}
/** 이름(→학번)으로 명단 사진 찾기 — 학번_이름.jpg / 학번.jpg / 이름.jpg. 같은 사람 사진이 여러 장이면 null
 *  (맥·드라이브에서 받은 파일 이름은 한글 자모가 풀려 있을 수 있어 NFC 로 맞춰 비교) */
function rosterPhoto(name) {
  if (!name) return null
  name = name.normalize('NFC')
  const no = roster.byName.get(name)?.no
  const stem = (f) => basename(f, extname(f)).normalize('NFC')
  const hits = roster.photos.filter((f) => stem(f) === name || (no && (stem(f) === no || stem(f).startsWith(`${no}_`))) || stem(f).endsWith(`_${name}`))
  return hits.length === 1 ? `_roster/${hits[0]}` : null
}
if (!existsSync(dir)) { console.error(`제출 폴더가 없습니다: ${dir}`); process.exit(1) }
const outDir = join(dir, '_parsed')
mkdirSync(outDir, { recursive: true })

unzipAll(dir)
const rows = []
const used = new Set()
for (const sub of collect(dir)) {
  if (!sub.txt) { rows.push({ id: sub.id, status: '❌', errors: ['txt 없음'], warns: [] }); continue }
  const { data, missingStudent } = build(parseTxt(readFileSync(sub.txt, 'utf8')))
  if (!sub.profile) {
    const fromRoster = rosterPhoto(data.basic.name)
    if (fromRoster) sub.profile = join(dir, fromRoster)
  }
  const rosterEn = data.basic.name && roster.byName.get(data.basic.name.normalize('NFC'))?.en
  if (!data.basic.nameEn && rosterEn) data.basic.nameEn = rosterEn
  const pf = projectFiles(sub, data.projects, dir)
  sub.projects = pf.map
  sub.folderNotes = pf.notes
  const { errors, warns } = validate(data, sub)
  if (missingStudent.length) errors.unshift(`학생 직접 입력 누락: ${missingStudent.join(', ')}`)
  let id = slug(data.basic.year, data.basic.nameEn, sub.id)
  for (let n = 2; used.has(id); n++) id = `${slug(data.basic.year, data.basic.nameEn, sub.id)}-${n}` // 영문 이름이 같은 학생
  used.add(id)
  const record = {
    id, source: { txt: basename(sub.txt), pdf: sub.pdf && basename(sub.pdf), profile: sub.profile && (sub.profile.includes('_roster') ? `_roster/${basename(sub.profile)}` : basename(sub.profile)), images: sub.images, projects: sub.projects },
    ...data,
  }
  writeFileSync(join(outDir, `${id}.json`), JSON.stringify(record, null, 2))
  rows.push({ id, name: data.basic.name, status: errors.length ? '❌' : warns.length ? '⚠️' : '✅', errors, warns, projects: data.projects.length })
}

const lines = ['# 포트폴리오 제출물 점검', '', `총 ${rows.length}건 · ✅ ${rows.filter((r) => r.status === '✅').length} · ⚠️ ${rows.filter((r) => r.status === '⚠️').length} · ❌ ${rows.filter((r) => r.status === '❌').length}`, '']
for (const r of rows) {
  lines.push(`## ${r.status} ${r.name ?? ''} (${r.id})${r.projects != null ? ` — 프로젝트 ${r.projects}개` : ''}`)
  for (const e of r.errors) lines.push(`- 오류: ${e}`)
  for (const w of r.warns) lines.push(`- 확인: ${w}`)
  lines.push('')
}
writeFileSync(join(outDir, 'report.md'), lines.join('\n'))
console.log(lines.join('\n'))
