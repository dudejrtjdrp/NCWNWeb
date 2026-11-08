#!/usr/bin/env node
/**
 * 졸업생 공개 동의 반영 — submissions/_roster/공개동의.csv → students.is_public·consent
 * ────────────────────────────────────────────────────────────
 * csv 한 줄에 한 명: 이름,졸업연도,프로젝트,이메일,사진,링크,PDF,팀이름,학생작품
 *   프로젝트: 전체 / 일부:1/3 / 비공개 · PDF: 다운로드 / 쪽보기 / 비공개 · 나머지: 예 / 아니오 (빈칸 = 아니오)
 * csv 에 나온 졸업 연도의 학생 중 csv 에 없는 학생은 비공개(is_public=false, consent=null)로 둔다 — 답하지 않으면 비공개.
 *
 * 이미 올라간 데이터도 동의에 맞게 줄인다(되살리지는 않는다 — 공개 범위를 넓혔으면 register.mjs 로 다시 등록):
 *  · 포트폴리오: 비공개 학생이면 내리고, 동의하지 않은 이메일·사진·링크·PDF·원본 쪽을 지운다
 *  · 팀원: 비공개이거나 '팀이름: 아니오'인 학생은 다른 졸업생 포트폴리오의 팀원·쇼케이스 제작자에서 이름을 뺀다
 *  · 쇼케이스: 비공개 학생이거나 '학생작품: 아니오'면 그 포트폴리오로 만든 작품(portfolio_ref)을 지운다
 * 먼저 supabase/migrations/add_student_consent.sql 실행 필요.
 *
 * 사용
 *   node scripts/portfolio/apply-consent.mjs [csv=submissions/_roster/공개동의.csv]   # 미리보기
 *   APPLY=1 node scripts/portfolio/apply-consent.mjs                                  # 실제 반영
 * 사이트에는 캐시(5분)가 지나면 반영된다.
 */

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.env.APPLY === '1'
const csvPath = process.argv[2] || 'submissions/_roster/공개동의.csv'

const envFile = process.env.ENV_FILE ?? path.resolve('.env.local')
for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
const need = (k) => {
  if (!process.env[k]) throw new Error(`.env.local 에 ${k} 가 없습니다`)
  return process.env[k]
}
const supabase = createClient(need('NEXT_PUBLIC_SUPABASE_URL'), need('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } })

const nameKey = (v) => String(v ?? '').normalize('NFC').replace(/\s+/g, '').toLowerCase()
const yes = (v) => /^(예|네|o|y|yes|true|공개|동의)$/i.test(String(v ?? '').trim())

/** csv 한 줄 → consent */
function toConsent(cols, line) {
  const [projectsRaw, email, photo, links, pdfRaw, teamName, showcase] = cols
  const pr = String(projectsRaw ?? '').trim()
  let projects = 'none'
  let projectNums = []
  if (/^(전체|모두|예)$/.test(pr)) projects = 'all'
  else if (/^일부/.test(pr)) {
    projects = 'some'
    projectNums = [...pr.matchAll(/\d+/g)].map((m) => Number(m[0]))
    if (!projectNums.length) throw new Error(`${line}: '일부'면 번호를 적어 주세요 (예: 일부:1/3)`)
  } else if (pr && !/^(비공개|아니오|없음)$/.test(pr)) throw new Error(`${line}: 프로젝트 '${pr}' 를 모르겠습니다`)
  const pd = String(pdfRaw ?? '').trim()
  const pdf = /다운로드/.test(pd) ? 'download' : /쪽|보기/.test(pd) ? 'pages' : 'none'
  return { projects, projectNums, email: yes(email), photo: yes(photo), links: yes(links), pdf, teamName: yes(teamName), showcase: yes(showcase) }
}

const rows = fs
  .readFileSync(csvPath, 'utf8')
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#') && !l.startsWith('이름,'))
  .map((l) => {
    const [name, year, ...rest] = l.split(',').map((s) => s.trim())
    if (!name || !/^20\d{2}$/.test(year)) throw new Error(`'${l}': 이름, 졸업연도를 확인해 주세요`)
    return { name, year: Number(year), consent: toConsent(rest, name) }
  })
const years = [...new Set(rows.map((r) => r.year))]

const { data: students, error } = await supabase.from('students').select('id, name, graduation_year, is_public, consent').in('graduation_year', years)
if (error) {
  if (/is_public|consent/.test(error.message)) console.error('students.is_public 열이 없습니다. supabase/migrations/add_student_consent.sql 을 먼저 실행하세요.')
  throw error
}

console.log(APPLY ? '▶ 적용' : '▶ 미리보기 (APPLY=1 로 실행하면 실제 반영)')

/* 1) 학생 공개 여부·동의 */
const want = new Map() // student id → { is_public, consent }
for (const r of rows) {
  const hits = students.filter((s) => s.graduation_year === r.year && nameKey(s.name) === nameKey(r.name))
  if (hits.length !== 1) throw new Error(`${r.name}(${r.year}) — 명단에서 ${hits.length ? `${hits.length}명(동명이인)` : '찾지 못함'}`)
  want.set(hits[0].id, { is_public: true, consent: r.consent })
}
for (const s of students) if (!want.has(s.id)) want.set(s.id, { is_public: false, consent: null })

const label = (c) =>
  c
    ? [
        `프로젝트 ${c.projects === 'all' ? '전체' : c.projects === 'some' ? `일부(${c.projectNums.join('·')})` : '비공개'}`,
        `이메일 ${c.email ? 'O' : 'X'}`, `사진 ${c.photo ? 'O' : 'X'}`, `링크 ${c.links ? 'O' : 'X'}`,
        `PDF ${{ download: '다운로드', pages: '쪽 보기만', none: '비공개' }[c.pdf]}`,
        `팀 이름 ${c.teamName ? 'O' : 'X'}`, `학생 작품 ${c.showcase ? 'O' : 'X'}`,
      ].join(' · ')
    : ''
const byId = new Map(students.map((s) => [s.id, s]))
const pub = [...want].filter(([, w]) => w.is_public)
const priv = [...want].filter(([, w]) => !w.is_public)
console.log(`\n■ 공개 ${pub.length}명`)
for (const [id, w] of pub) console.log(`  ✓ ${byId.get(id).name} — ${label(w.consent)}`)
console.log(`■ 비공개 ${priv.length}명: ${priv.map(([id]) => byId.get(id).name).join(', ')}`)

if (APPLY) {
  for (const [id, w] of want) {
    const { error: e } = await supabase.from('students').update(w).eq('id', id)
    if (e) throw e
  }
}

/* 이름을 숨길 학생 — 이번 연도 비공개 학생 + 팀 이름 표시에 동의하지 않은 학생 (다른 연도는 DB 값으로) */
const { data: everyone, error: allErr } = await supabase.from('students').select('id, name, is_public, consent')
if (allErr) throw allErr
const hidden = new Set()
for (const s of everyone) {
  const w = want.get(s.id) ?? { is_public: s.is_public, consent: s.consent }
  if (!w.is_public || w.consent?.teamName !== true) hidden.add(s.id)
}

/* 2) 포트폴리오 */
console.log('\n■ 포트폴리오')
const { data: portfolios, error: pErr } = await supabase.from('portfolios').select('id, slug, name, student_id, is_published, email, website, instagram, other_links, profile_url, cover_url, pages, pdf_url, projects')
if (pErr) throw pErr
const notShowcase = new Set() // 쇼케이스 작품을 지울 포트폴리오 slug
for (const p of portfolios) {
  const other = everyone.find((s) => s.id === p.student_id) // csv 에 없는 졸업 연도 학생은 DB 값 그대로
  const w = p.student_id ? want.get(p.student_id) ?? (other ? { is_public: other.is_public, consent: other.consent } : null) : null
  const c = w?.consent
  const patch = {}
  const notes = []
  if (!p.student_id) {
    console.log(`  • ${p.name} (${p.slug}) — 명단과 연결 안 됨, 건너뜀 (관리자 페이지에서 학생 연결)`)
    continue
  }
  if (!w || !w.is_public) {
    if (p.is_published) { patch.is_published = false; notes.push('비공개로 내림') }
    notShowcase.add(p.slug)
  } else {
    if (!c.email && p.email) { patch.email = null; notes.push('이메일 지움') }
    if (!c.links && (p.website || p.instagram || p.other_links?.length)) { Object.assign(patch, { website: null, instagram: null, other_links: [] }); notes.push('링크 지움') }
    if (!c.photo && p.profile_url) { patch.profile_url = null; notes.push('프로필 사진 지움') }
    if (c.pdf !== 'download' && p.pdf_url) { patch.pdf_url = null; notes.push('PDF 다운로드 지움') }
    if (c.pdf === 'none' && (p.pages?.length || p.cover_url)) { Object.assign(patch, { pages: [], cover_url: null }); notes.push('원본 쪽 지움') }
    if (c.projects !== 'all') notes.push(`⚠ 프로젝트 ${c.projects === 'some' ? '일부' : '비공개'} — register.mjs 로 다시 등록해야 반영됨`)
    if (!c.showcase || c.projects === 'none') notShowcase.add(p.slug)
  }
  // 팀원 이름 숨김
  let removed = []
  const projects = (p.projects ?? []).map((pr) => {
    const team = pr.team ?? []
    const keep = team.filter((m) => !(m.student_id && hidden.has(m.student_id)))
    removed.push(...team.filter((m) => !keep.includes(m)).map((m) => m.name))
    return keep.length === team.length ? pr : { ...pr, team: keep }
  })
  removed = [...new Set(removed)]
  if (removed.length) { patch.projects = projects; notes.push(`팀원 이름 뺌: ${removed.join(', ')}`) }
  console.log(`  • ${p.name} (${p.slug}) — ${notes.length ? notes.join(' · ') : '바꿀 것 없음'}`)
  if (APPLY && Object.keys(patch).length) {
    const { error: e } = await supabase.from('portfolios').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', p.id)
    if (e) throw e
  }
}

/* 3) 쇼케이스 작품 */
console.log('\n■ 학생 작품(쇼케이스)')
const { data: works, error: wErr } = await supabase.from('showcase_works').select('id, title, author, creators, portfolio_ref')
if (wErr) throw wErr
let changed = 0
for (const w of works) {
  const owner = w.portfolio_ref?.split('#')[0]
  if (owner && notShowcase.has(owner)) {
    console.log(`  ✗ '${w.title}' 지움 — ${owner} 가 학생 작품 노출에 동의하지 않음`)
    changed++
    if (APPLY) {
      const { error: e } = await supabase.from('showcase_works').delete().eq('id', w.id)
      if (e) throw e
    }
    continue
  }
  const creators = w.creators ?? []
  const keep = creators.filter((c) => !(c.student_id && hidden.has(c.student_id)))
  if (keep.length === creators.length) continue
  const gone = creators.filter((c) => !keep.includes(c)).map((c) => c.name)
  console.log(`  • '${w.title}' 제작자에서 뺌: ${gone.join(', ')}`)
  changed++
  if (APPLY) {
    const { error: e } = await supabase.from('showcase_works').update({ creators: keep, author: keep.map((c) => c.name).join(', ') }).eq('id', w.id)
    if (e) throw e
  }
}
if (!changed) console.log('  바꿀 것 없음')
console.log(APPLY ? '\n✓ 반영 완료 — 사이트에는 5분 안에 보입니다' : '\n미리보기 끝 — APPLY=1 로 다시 실행하면 반영됩니다')
