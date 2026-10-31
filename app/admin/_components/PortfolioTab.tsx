'use client'

/**
 * 관리자 — 졸업생 (명단 · 포트폴리오)
 * ────────────────────────────────────────────────────────────
 * 명단: 졸업생 이름·학번·영문 이름·졸업 연도. 한 줄씩 붙여 넣어 한꺼번에 넣거나 한 명씩 고친다.
 *       여기 있는 학생을 작품 입력의 '제작자' 검색에서 고를 수 있다.
 * 포트폴리오: scripts/portfolio/register.mjs 로 올린 포트폴리오를 공개/비공개, 순서, 기본 정보 수정, 삭제.
 *       (프로젝트·원본 쪽은 등록 스크립트로 다시 올린다)
 */

import { useCallback, useEffect, useId, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  saveStudent,
  deleteStudent,
  importStudents,
  setPortfolioPublished,
  updatePortfolio,
  deletePortfolio,
} from '../actions'
import type { ActionResult } from '../actions'
import { Label, Input, Textarea, Feedback, SubmitButton, DeleteButton, LoadingSpinner, Modal } from './admin-ui'
import { useLoading } from '@/components/providers/LoadingProvider'
import { useLoadingTransition } from '@/components/hooks/useLoadingTransition'

interface StudentRow {
  id: string
  name: string
  student_no: string | null
  name_en: string | null
  graduation_year: number | null
}

interface PortfolioRow {
  id: string
  student_id: string | null
  slug: string
  year: number
  name: string
  name_en: string | null
  fields: string[]
  tagline: string | null
  tagline_en: string | null
  bio: string | null
  bio_en: string | null
  email: string | null
  website: string | null
  instagram: string | null
  profile_url: string | null
  pages: string[]
  projects: unknown[]
  is_published: boolean
  sort_order: number
}

const btn = 'px-3 py-1.5 bg-white/5 border border-white/10 text-white/50 rounded-lg font-body text-xs hover:text-white hover:border-white/20 transition-colors'
const thisYear = new Date().getFullYear()

/* ─────────────────────────── 명단 ─────────────────────────── */

function StudentForm({ student, onDone }: { student: StudentRow | null; onDone: () => void }) {
  const [result, setResult] = useState<ActionResult | null>(null)
  const [pending, start] = useLoadingTransition()
  return (
    <div className="bg-white/3 border border-white/10 rounded-2xl p-6 space-y-5">
      <h4 className="font-body font-semibold text-sm text-white">{student ? '졸업생 수정' : '졸업생 추가'}</h4>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          start(async () => {
            const res = await saveStudent(student?.id ?? null, fd)
            setResult(res)
            if ('success' in res) onDone()
          })
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>이름 *</Label><Input name="name" defaultValue={student?.name ?? ''} required maxLength={30} /></div>
          <div><Label>학번</Label><Input name="student_no" defaultValue={student?.student_no ?? ''} placeholder="예: 2024123456" maxLength={20} /></div>
          <div><Label>영문 이름</Label><Input name="name_en" defaultValue={student?.name_en ?? ''} placeholder="예: Hong Gildong" maxLength={60} /></div>
          <div><Label>졸업 연도</Label><Input name="graduation_year" type="number" defaultValue={student?.graduation_year ?? thisYear} /></div>
        </div>
        <Feedback result={result} />
        <div className="flex gap-3">
          <button type="button" onClick={onDone} className="flex-1 py-3 rounded-xl border border-white/10 font-body text-sm text-white/40 hover:text-white">취소</button>
          <div className="flex-1"><SubmitButton loading={pending} label={student ? '수정 저장' : '추가하기'} /></div>
        </div>
      </form>
    </div>
  )
}

function ImportBox({ onDone }: { onDone: () => void }) {
  const [year, setYear] = useState(String(thisYear))
  const [text, setText] = useState('')
  const [msg, setMsg] = useState<ActionResult | null>(null)
  const [pending, start] = useLoadingTransition()
  return (
    <div className="bg-white/3 border border-white/10 rounded-2xl p-5 space-y-4">
      <div>
        <h4 className="font-body font-semibold text-sm text-white">명단 한꺼번에 넣기</h4>
        <p className="mt-1 font-body text-xs text-white/40">한 줄에 한 명 — <code className="text-white/60">이름, 학번, 영문 이름(선택)</code>. 엑셀에서 열을 복사해 붙여도 됩니다. 학번이 이미 있으면 고칩니다.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4">
        <div><Label>졸업 연도</Label><Input type="number" value={year} onChange={(e) => setYear(e.target.value)} /></div>
        <div><Label>명단</Label><Textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder={'홍길동, 2024123456, Hong Gildong\n김하늘, 2024123457'} /></div>
      </div>
      <Feedback result={msg} />
      <button
        type="button"
        disabled={pending || !text.trim()}
        onClick={() =>
          start(async () => {
            const res = await importStudents(year, text)
            if ('error' in res) return setMsg(res)
            setMsg({ success: true })
            showSummary(res.added, res.updated, res.skipped)
            setText('')
            onDone()
          })
        }
        className="px-4 py-2 bg-nwcn-green text-nwcn-text-default font-body font-semibold text-xs rounded-xl hover:brightness-110 disabled:opacity-40"
      >
        {pending ? '넣는 중…' : '명단 넣기'}
      </button>
    </div>
  )
}

/** 결과는 콘솔과 화면 위쪽 안내로 — 브라우저 알림창(alert)은 쓰지 않는다 */
function showSummary(added: number, updated: number, skipped: string[]) {
  const el = document.getElementById('roster-summary')
  if (el) el.textContent = `추가 ${added}명 · 수정 ${updated}명${skipped.length ? ` · 건너뜀 ${skipped.length}줄: ${skipped.join(' / ')}` : ''}`
}

function Roster({ portfolios }: { portfolios: PortfolioRow[] }) {
  const [rows, setRows] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [editing, setEditing] = useState<StudentRow | null | 'new'>(null)
  const [q, setQ] = useState('')
  const [year, setYear] = useState<number | 'ALL'>('ALL')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await createClient()
      .from('students')
      .select('id, name, student_no, name_en, graduation_year')
      .order('graduation_year', { ascending: false })
      .order('name')
    setMissing(!!error && /students/.test(error.message))
    setRows((data ?? []) as StudentRow[])
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const years = [...new Set(rows.map((r) => r.graduation_year).filter((y): y is number => !!y))].sort((a, b) => b - a)
  const linked = new Set(portfolios.map((p) => p.student_id))
  const shown = rows.filter(
    (r) => (year === 'ALL' || r.graduation_year === year) && (!q || r.name.includes(q) || (r.student_no ?? '').includes(q))
  )

  if (missing) {
    return <p className="font-body text-sm text-white/50">students 표가 아직 없습니다. Supabase SQL Editor 에서 <code>supabase/migrations/create_students.sql</code> 을 먼저 실행해주세요.</p>
  }

  return (
    <div className="space-y-5">
      <ImportBox onDone={load} />
      <p id="roster-summary" role="status" className="font-body text-xs text-nwcn-green/80" />
      <div className="flex flex-wrap items-center gap-2">
        <button className={btn} onClick={() => setYear('ALL')} aria-pressed={year === 'ALL'}>전체 {rows.length}</button>
        {years.map((y) => (
          <button key={y} className={btn} onClick={() => setYear(y)} aria-pressed={year === y}>
            {y} · {rows.filter((r) => r.graduation_year === y).length}
          </button>
        ))}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름·학번 검색" className="ml-auto w-44 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 font-body text-xs text-white focus:outline-none focus:border-nwcn-green/50" />
        <button className={btn} onClick={() => setEditing('new')}>+ 한 명 추가</button>
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)}>
        <StudentForm key={editing === 'new' ? 'new' : editing?.id ?? 'x'} student={editing === 'new' ? null : editing} onDone={() => { setEditing(null); load() }} />
      </Modal>

      {loading ? <LoadingSpinner /> : shown.length === 0 ? (
        <p className="font-body text-sm text-white/20 text-center py-8">등록된 졸업생이 없습니다.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/8">
          <table className="w-full font-body text-sm text-white/80">
            <thead className="bg-white/3 text-left text-xs text-white/40">
              <tr><th className="px-4 py-2.5">이름</th><th className="px-4 py-2.5">학번</th><th className="px-4 py-2.5">영문 이름</th><th className="px-4 py-2.5">졸업</th><th className="px-4 py-2.5">포트폴리오</th><th /></tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className="border-t border-white/8">
                  <td className="px-4 py-2.5 font-semibold text-white">{r.name}</td>
                  <td className="px-4 py-2.5 tabular-nums">{r.student_no ?? '—'}</td>
                  <td className="px-4 py-2.5">{r.name_en ?? '—'}</td>
                  <td className="px-4 py-2.5 tabular-nums">{r.graduation_year ?? '—'}</td>
                  <td className="px-4 py-2.5">{linked.has(r.id) ? <span className="text-nwcn-green">연결됨</span> : <span className="text-white/30">없음</span>}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-2">
                      <button className={btn} onClick={() => setEditing(r)}>수정</button>
                      <DeleteButton onDelete={async () => { await deleteStudent(r.id); load() }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────── 포트폴리오 ─────────────────────────── */

function PortfolioForm({ item, students, onDone }: { item: PortfolioRow; students: StudentRow[]; onDone: () => void }) {
  const [result, setResult] = useState<ActionResult | null>(null)
  const [pending, start] = useLoadingTransition()
  return (
    <div className="bg-white/3 border border-white/10 rounded-2xl p-6 space-y-5">
      <h4 className="font-body font-semibold text-sm text-white">포트폴리오 기본 정보 — {item.name}</h4>
      <p className="font-body text-xs text-white/40">프로젝트·원본 쪽 이미지를 바꾸려면 제출물을 고쳐 등록 스크립트를 다시 실행하세요.</p>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          start(async () => {
            const res = await updatePortfolio(item.id, fd)
            setResult(res)
            if ('success' in res) onDone()
          })
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>이름 *</Label><Input name="name" defaultValue={item.name} required /></div>
          <div><Label>영문 이름</Label><Input name="name_en" defaultValue={item.name_en ?? ''} /></div>
          <div><Label>졸업 연도 *</Label><Input name="year" type="number" defaultValue={item.year} required /></div>
          <div className="md:col-span-2"><Label>주소(slug) *</Label><Input name="slug" defaultValue={item.slug} required /></div>
          <div><Label>정렬 순서</Label><Input name="sort_order" type="number" defaultValue={item.sort_order} /></div>
        </div>
        <div>
          <Label>학생 명단과 연결</Label>
          <select name="student_id" defaultValue={item.student_id ?? ''} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-body text-sm text-white">
            <option value="">연결 안 함</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name} {s.student_no ?? ''} {s.graduation_year ? `· ${s.graduation_year}` : ''}</option>
            ))}
          </select>
        </div>
        <div><Label>분야 (쉼표로)</Label><Input name="fields" defaultValue={item.fields.join(', ')} /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>한 줄 소개</Label><Input name="tagline" defaultValue={item.tagline ?? ''} /></div>
          <div><Label>영문 한 줄 소개</Label><Input name="tagline_en" defaultValue={item.tagline_en ?? ''} /></div>
          <div><Label>자기소개</Label><Textarea name="bio" rows={4} defaultValue={item.bio ?? ''} /></div>
          <div><Label>영문 자기소개</Label><Textarea name="bio_en" rows={4} defaultValue={item.bio_en ?? ''} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>이메일 (공개 동의한 경우만)</Label><Input name="email" type="email" defaultValue={item.email ?? ''} /></div>
          <div><Label>웹사이트</Label><Input name="website" defaultValue={item.website ?? ''} /></div>
          <div><Label>인스타그램</Label><Input name="instagram" defaultValue={item.instagram ?? ''} /></div>
        </div>
        <label className="flex items-center gap-2 font-body text-sm text-white/70">
          <input type="checkbox" name="is_published" defaultChecked={item.is_published} /> 사이트에 공개
        </label>
        <Feedback result={result} />
        <div className="flex gap-3">
          <button type="button" onClick={onDone} className="flex-1 py-3 rounded-xl border border-white/10 font-body text-sm text-white/40 hover:text-white">취소</button>
          <div className="flex-1"><SubmitButton loading={pending} label="수정 저장" /></div>
        </div>
      </form>
    </div>
  )
}

function Portfolios({ rows, loading, missing, reload }: { rows: PortfolioRow[]; loading: boolean; missing: boolean; reload: () => void }) {
  const [editing, setEditing] = useState<PortfolioRow | null>(null)
  const [students, setStudents] = useState<StudentRow[]>([])
  const [pending, start] = useLoadingTransition()

  useEffect(() => {
    createClient()
      .from('students')
      .select('id, name, student_no, name_en, graduation_year')
      .order('graduation_year', { ascending: false })
      .order('name')
      .then(({ data }) => setStudents((data ?? []) as StudentRow[]))
  }, [])

  if (missing) {
    return <p className="font-body text-sm text-white/50">portfolios 표가 아직 없습니다. Supabase SQL Editor 에서 <code>create_students.sql</code> → <code>create_portfolios.sql</code> 순서로 실행해주세요.</p>
  }

  return (
    <div className="space-y-4">
      <p className="font-body text-xs text-white/40">
        새 포트폴리오는 학생 제출물을 <code className="text-white/60">submissions/</code> 에 넣고 <code className="text-white/60">node scripts/portfolio/register.mjs</code> 로 올립니다 (docs/portfolio/README.md).
      </p>
      <Modal open={!!editing} onClose={() => setEditing(null)}>
        {editing && <PortfolioForm key={editing.id} item={editing} students={students} onDone={() => { setEditing(null); reload() }} />}
      </Modal>
      {loading ? <LoadingSpinner /> : rows.length === 0 ? (
        <p className="font-body text-sm text-white/20 text-center py-8">등록된 포트폴리오가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((p) => (
            <div key={p.id} className="bg-white/3 border border-white/8 rounded-xl px-4 py-3 flex items-center gap-3">
              {p.profile_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.profile_url} alt="" className="w-10 h-12 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-semibold text-white truncate">
                  {p.name} <span className="font-normal text-white/30">· {p.year}년 졸업 · /{p.slug}</span>
                </p>
                <p className="font-body text-xs text-white/30">
                  {p.fields.join(' · ') || '분야 없음'} · 프로젝트 {p.projects.length}개 · 원본 {p.pages.length}쪽 · 순서 {p.sort_order}
                  {!p.student_id && <span className="ml-2 text-amber-300/70">명단 연결 안 됨</span>}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  className={p.is_published ? 'px-3 py-1.5 rounded-lg font-body text-xs bg-nwcn-green/15 border border-nwcn-green/40 text-nwcn-green' : btn}
                  disabled={pending}
                  onClick={() => start(async () => { await setPortfolioPublished(p.id, !p.is_published); reload() })}
                >
                  {p.is_published ? '공개 중' : '비공개'}
                </button>
                <a href={`/work/portfolio/${p.slug}`} target="_blank" rel="noopener noreferrer" className={btn}>보기</a>
                <button className={btn} onClick={() => setEditing(p)}>수정</button>
                <DeleteButton onDelete={async () => { await deletePortfolio(p.id); reload() }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────── 탭 ─────────────────────────── */

export default function PortfolioTab() {
  const [tab, setTab] = useState<'roster' | 'portfolios'>('roster')
  const [rows, setRows] = useState<PortfolioRow[]>([])
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const { showLoading, hideLoading } = useLoading()
  const key = useId()

  const load = useCallback(async () => {
    showLoading(key)
    setLoading(true)
    try {
      const { data, error } = await createClient()
        .from('portfolios')
        .select('id, student_id, slug, year, name, name_en, fields, tagline, tagline_en, bio, bio_en, email, website, instagram, profile_url, pages, projects, is_published, sort_order')
        .order('year', { ascending: false })
        .order('sort_order')
        .order('name')
      setMissing(!!error && /portfolios/.test(error.message))
      setRows((data ?? []) as PortfolioRow[])
    } finally {
      setLoading(false)
      hideLoading(key)
    }
  }, [showLoading, hideLoading, key])
  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {([['roster', '졸업생 명단'], ['portfolios', `포트폴리오 ${rows.length}`]] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={tab === k ? 'px-4 py-2 rounded-xl bg-white/10 font-body text-sm font-semibold text-white' : 'px-4 py-2 rounded-xl font-body text-sm text-white/40 hover:text-white'}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'roster' ? <Roster portfolios={rows} /> : <Portfolios rows={rows} loading={loading} missing={missing} reload={load} />}
    </div>
  )
}
