#!/usr/bin/env node
/**
 * 졸업생 포트폴리오 제출물 파서
 * ────────────────────────────────────────────────────────────
 * 학생이 docs/portfolio/NWCN_졸업생포트폴리오_양식.txt 를 AI 에 돌려 만든 txt 와
 * 원본 포트폴리오 PDF 를 받아, 사이트 레이아웃에 바로 넣을 JSON 으로 바꾸고 빠진 항목을 알려 준다.
 * DB·스토리지에는 아무것도 쓰지 않는다 (업로드는 별도 단계).
 *
 * 폴더 구조 (둘 다 허용)
 *   submissions/2026_홍길동.txt + submissions/2026_홍길동.pdf (+ 2026_홍길동_profile.jpg)
 *   submissions/2026_홍길동/ 안에 txt · pdf · 프로필 사진 · 1-01.jpg 같은 원본 이미지
 *
 * 실행
 *   node scripts/portfolio/parse-submissions.mjs [제출 폴더=submissions]
 *   → <제출 폴더>/_parsed/<id>.json, <제출 폴더>/_parsed/report.md
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'node:fs'
import { join, basename, extname } from 'node:path'

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
const PROJECT = {
  '제목': 'title', '영문 제목': 'titleEn', '연도': 'year', '분야': 'fields', '형태': 'format',
  '내 역할': 'role', '사용 툴': 'tools', '한 줄 요약': 'summary', '설명': 'description',
  '영문 설명': 'descriptionEn', '핵심 포인트': 'points', '결과·성과': 'outcome', '영상 링크': 'video',
  '이미지 쪽': 'imagePages', '대표 이미지 쪽': 'coverPage',
}
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

function parseTxt(text) {
  const src = clean(text)
  const START = '=== 출력 시작 ==='
  const start = src.indexOf(START)
  const end = src.indexOf('=== 출력 끝 ===')
  const body = start >= 0 ? src.slice(start + START.length, end > start ? end : undefined) : src

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
        if (key === 'points') p.points = (s.lists[k] ?? []).filter(Boolean)
        else if (key === 'fields' || key === 'tools') p[key] = list(v)
        else if (key === 'imagePages') p.imagePages = list(v).map(Number).filter(Number.isFinite)
        else if (key === 'coverPage') p.coverPage = Number(v) || null
        else p[key] = v || ''
      }
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
  if (!/^20\d{2}$/.test(b.year)) errors.push(`졸업 연도 형식 오류: "${b.year}"`)
  if (!b.fields.length) errors.push('분야 없음')
  if (!b.tagline) errors.push('한 줄 소개 없음')
  if (!b.bio) warns.push('자기소개 없음')
  if (d.visibility.consent !== true) errors.push('홈페이지 게시 동의가 "예"가 아님 — 게시 불가')
  if (!d.projects.length) errors.push('프로젝트가 하나도 없음')
  if (!files.pdf) errors.push('원본 포트폴리오 PDF 없음')

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
    const hasOwn = files.images.some((f) => f.startsWith(`${i + 1}-`))
    if (!p.imagePages.length && !hasOwn) warns.push(`${n} 이미지 없음 (이미지 쪽도, ${i + 1}-01.jpg 같은 파일도 없음)`)
    if (p.video && !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//.test(p.video)) warns.push(`${n} 영상 링크가 유튜브·비메오 주소가 아님`)
  })
  for (const [k, v] of Object.entries({ 웹사이트: b.website, 인스타그램: b.instagram })) {
    if (v && !/^https?:\/\//.test(v) && !(k === '인스타그램' && /^@?[\w.]+$/.test(v))) warns.push(`${k} 주소 형식 확인: ${v}`)
  }
  return { errors, warns }
}

/* ── 제출물 묶기 ── */
function collect(dir) {
  const groups = new Map()
  const add = (id, file) => { if (!groups.has(id)) groups.set(id, []); groups.get(id).push(file) }
  for (const name of readdirSync(dir)) {
    if (name.startsWith('_') || name.startsWith('.')) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      for (const f of readdirSync(full)) if (!f.startsWith('.')) add(name, join(full, f))
    } else {
      const id = basename(name, extname(name)).replace(/_(profile|프로필)$/i, '')
      add(id, full)
    }
  }
  return [...groups].map(([id, list]) => {
    const pick = (re) => list.filter((f) => re.test(f))
    return {
      id,
      txt: pick(/\.txt$/i)[0] ?? null,
      pdf: pick(/\.pdf$/i)[0] ?? null,
      profile: pick(/(profile|프로필)\.(jpe?g|png|webp)$/i)[0] ?? null,
      images: pick(/\/\d+-\d+\.(jpe?g|png|webp|gif)$/i).map((f) => basename(f)).sort(),
    }
  })
}

function slug(year, nameEn, fallback) {
  const s = (nameEn || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return s ? `${year}-${s}` : fallback
}

const dir = process.argv[2] || 'submissions'
if (!existsSync(dir)) { console.error(`제출 폴더가 없습니다: ${dir}`); process.exit(1) }
const outDir = join(dir, '_parsed')
mkdirSync(outDir, { recursive: true })

const rows = []
const used = new Set()
for (const sub of collect(dir)) {
  if (!sub.txt) { rows.push({ id: sub.id, status: '❌', errors: ['txt 없음'], warns: [] }); continue }
  const { data, missingStudent } = build(parseTxt(readFileSync(sub.txt, 'utf8')))
  const { errors, warns } = validate(data, sub)
  if (missingStudent.length) errors.unshift(`학생 직접 입력 누락: ${missingStudent.join(', ')}`)
  let id = slug(data.basic.year, data.basic.nameEn, sub.id)
  for (let n = 2; used.has(id); n++) id = `${slug(data.basic.year, data.basic.nameEn, sub.id)}-${n}` // 영문 이름이 같은 학생
  used.add(id)
  const record = {
    id, source: { txt: basename(sub.txt), pdf: sub.pdf && basename(sub.pdf), profile: sub.profile && basename(sub.profile), images: sub.images },
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
