'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { saveArticleTypes, saveProjectTypes, saveWorkFilterTags, migrateWorkFilterTags } from '../actions'
import { Label, Input, Feedback, LoadingSpinner } from './admin-ui'
import { useLoadingTransition } from '@/components/hooks/useLoadingTransition'
import type { ActionResult } from '../actions'

const DEFAULT_WORK_FILTER_TAGS = ['Video', 'Graphic', 'Web', 'Motion', 'Photo', 'AI']
const DEFAULT_ARTICLE_TYPES = [
  { value: 'editorial', label: '에디토리얼' },
  { value: 'trend', label: '트렌드' },
  { value: 'card_news', label: '카드뉴스' },
]
const DEFAULT_PROJECT_TYPES = [
  { value: 'industry', label: '산학협력' },
  { value: 'international', label: '해외교류' },
]

async function loadSetting<T>(key: string): Promise<T | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('settings').select('value').eq('key', key).maybeSingle()
  if (error || !data) return null
  return data.value as T
}

// ── 쇼케이스 필터 태그 관리 ────────────────────────────────
function WorkFilterSection() {
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isPending, startTransition] = useLoadingTransition()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    loadSetting<string[]>('work_filter_tags').then(async (val) => {
      if (Array.isArray(val) && val.length > 0) {
        setTags(val)
      } else {
        setTags(DEFAULT_WORK_FILTER_TAGS)
        await migrateWorkFilterTags(DEFAULT_WORK_FILTER_TAGS)
      }
      setLoaded(true)
    })
  }, [])

  // 변경 후 즉시 저장하는 헬퍼
  const saveImmediate = (next: string[]) => {
    setTags(next)
    setResult(null)
    startTransition(async () => { setResult(await saveWorkFilterTags(next)) })
  }

  const addTag = () => {
    const t = newTag.trim()
    if (!t || tags.includes(t)) return
    setNewTag('')
    saveImmediate([...tags, t])
  }

  if (!loaded) return <LoadingSpinner />

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-body font-bold text-[15px] text-white">쇼케이스 필터 태그</h3>
        <span className="font-body text-[11px] text-white/30">작업물 등록 시 이 목록에서 선택합니다</span>
      </div>
      <div className="flex flex-wrap gap-2 min-h-[36px]">
        {tags.length === 0 ? (
          <span className="font-body text-xs text-white/20">태그 없음 — 아래에서 추가하세요</span>
        ) : (
          tags.map((t) => (
            <span key={t} className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full font-body text-xs text-white">
              {t}
              <button
                onClick={() => saveImmediate(tags.filter((x) => x !== t))}
                disabled={isPending}
                className="text-white/30 hover:text-red-400 disabled:opacity-30 transition-colors leading-none"
                aria-label={`${t} 삭제`}
              >×</button>
            </span>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <Input value={newTag} onChange={(e) => setNewTag(e.target.value)}
          placeholder="새 태그 입력 후 Enter 또는 추가 클릭"
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
          className="flex-1" />
        <button type="button" onClick={addTag}
          disabled={isPending || !newTag.trim() || tags.includes(newTag.trim())}
          className="px-4 py-2.5 border border-white/10 rounded-xl font-body text-sm text-white/50 hover:text-white hover:border-white/20 disabled:opacity-30 transition-colors whitespace-nowrap">
          {isPending ? '저장 중…' : '+ 추가'}
        </button>
      </div>
      {result && <Feedback result={result} />}
    </section>
  )
}

// ── 편집 가능한 유형 행 ────────────────────────────────────
function TypeRow({
  type,
  pending,
  onSaveLabel,
  onDelete,
}: {
  type: { value: string; label: string }
  pending: boolean
  onSaveLabel: (label: string) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(type.label)

  const commit = () => {
    const next = draft.trim()
    if (next && next !== type.label) onSaveLabel(next)
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl px-4 py-3">
      <code className="font-mono text-xs text-nwcn-green bg-nwcn-green/10 px-2 py-0.5 rounded">{type.value}</code>
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit() } if (e.key === 'Escape') { setDraft(type.label); setEditing(false) } }}
          onBlur={commit}
          disabled={pending}
          className="flex-1 bg-white/5 border border-nwcn-green/40 rounded-lg px-3 py-1.5 font-body text-sm text-white focus:outline-none"
        />
      ) : (
        <span className="font-body text-sm text-white flex-1">{type.label}</span>
      )}
      {editing ? (
        <button onClick={commit} disabled={pending}
          className="font-body text-xs text-nwcn-green hover:brightness-125 disabled:opacity-30 transition-colors">저장</button>
      ) : (
        <button onClick={() => { setDraft(type.label); setEditing(true) }} disabled={pending}
          className="font-body text-xs text-white/30 hover:text-white disabled:opacity-30 transition-colors">수정</button>
      )}
      <button onClick={onDelete} disabled={pending}
        className="font-body text-xs text-white/20 hover:text-red-400 disabled:opacity-30 transition-colors">삭제</button>
    </div>
  )
}

// ── 메인 TypesTab ─────────────────────────────────────────
export default function TypesTab() {
  const [articleTypes, setArticleTypes] = useState(DEFAULT_ARTICLE_TYPES)
  const [projectTypes, setProjectTypes] = useState(DEFAULT_PROJECT_TYPES)
  const [loaded, setLoaded] = useState(false)
  const [newAV, setNewAV] = useState(''); const [newAL, setNewAL] = useState('')
  const [newPV, setNewPV] = useState(''); const [newPL, setNewPL] = useState('')
  const [articleResult, setArticleResult] = useState<ActionResult | null>(null)
  const [projectResult, setProjectResult] = useState<ActionResult | null>(null)
  const [articlePending, startArticleTransition] = useLoadingTransition()
  const [projectPending, startProjectTransition] = useLoadingTransition()

  useEffect(() => {
    Promise.all([
      loadSetting<{ value: string; label: string }[]>('article_types'),
      loadSetting<{ value: string; label: string }[]>('project_types'),
    ]).then(([at, pt]) => {
      if (Array.isArray(at) && at.length > 0) setArticleTypes(at)
      if (Array.isArray(pt) && pt.length > 0) setProjectTypes(pt)
      setLoaded(true)
    })
  }, [])

  // 즉시 저장 헬퍼
  const saveArticleImmediate = (next: typeof articleTypes) => {
    setArticleTypes(next)
    setArticleResult(null)
    startArticleTransition(async () => { setArticleResult(await saveArticleTypes(next)) })
  }
  const saveProjectImmediate = (next: typeof projectTypes) => {
    setProjectTypes(next)
    setProjectResult(null)
    startProjectTransition(async () => { setProjectResult(await saveProjectTypes(next)) })
  }

  const addArticleType = () => {
    if (!newAV.trim() || !newAL.trim()) return
    if (articleTypes.some((t) => t.value === newAV.trim())) return
    saveArticleImmediate([...articleTypes, { value: newAV.trim(), label: newAL.trim() }])
    setNewAV(''); setNewAL('')
  }
  const editArticleLabel = (value: string, label: string) =>
    saveArticleImmediate(articleTypes.map((t) => (t.value === value ? { ...t, label } : t)))

  const addProjectType = () => {
    if (!newPV.trim() || !newPL.trim()) return
    if (projectTypes.some((t) => t.value === newPV.trim())) return
    saveProjectImmediate([...projectTypes, { value: newPV.trim(), label: newPL.trim() }])
    setNewPV(''); setNewPL('')
  }
  const editProjectLabel = (value: string, label: string) =>
    saveProjectImmediate(projectTypes.map((t) => (t.value === value ? { ...t, label } : t)))

  return (
    <div className="space-y-10">
      <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" className="flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="font-body text-xs text-blue-400/80 leading-relaxed">
          추가·삭제 즉시 자동 저장됩니다.
        </p>
      </div>

      {/* 쇼케이스 필터 태그 */}
      <WorkFilterSection />

      <div className="h-px bg-white/8" />

      {/* 아티클 유형 */}
      <section className="space-y-4">
        <h3 className="font-body font-bold text-[15px] text-white">NCR 아티클 유형</h3>
        {!loaded ? <LoadingSpinner /> : (
          <>
            <div className="space-y-2">
              {articleTypes.map((t) => (
                <TypeRow
                  key={t.value}
                  type={t}
                  pending={articlePending}
                  onSaveLabel={(label) => editArticleLabel(t.value, label)}
                  onDelete={() => saveArticleImmediate(articleTypes.filter((x) => x.value !== t.value))}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>값 (영문, 언더스코어 허용)</Label><Input value={newAV} onChange={(e) => setNewAV(e.target.value)} placeholder="news" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addArticleType() } }} /></div>
              <div><Label>표시 이름</Label><Input value={newAL} onChange={(e) => setNewAL(e.target.value)} placeholder="뉴스" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addArticleType() } }} /></div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={addArticleType}
                disabled={articlePending || !newAV.trim() || !newAL.trim()}
                className="px-4 py-2.5 border border-white/10 rounded-xl font-body text-sm text-white/50 hover:text-white hover:border-white/20 disabled:opacity-30 transition-colors">
                {articlePending ? '저장 중...' : '+ 유형 추가'}
              </button>
            </div>
            {articleResult && <Feedback result={articleResult} />}
          </>
        )}
      </section>

      <div className="h-px bg-white/8" />

      {/* 프로젝트 유형 */}
      <section className="space-y-4">
        <h3 className="font-body font-bold text-[15px] text-white">프로젝트 유형</h3>
        {!loaded ? <LoadingSpinner /> : (
          <>
            <div className="space-y-2">
              {projectTypes.map((t) => (
                <TypeRow
                  key={t.value}
                  type={t}
                  pending={projectPending}
                  onSaveLabel={(label) => editProjectLabel(t.value, label)}
                  onDelete={() => saveProjectImmediate(projectTypes.filter((x) => x.value !== t.value))}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>값 (영문)</Label><Input value={newPV} onChange={(e) => setNewPV(e.target.value)} placeholder="overseas" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addProjectType() } }} /></div>
              <div><Label>표시 이름</Label><Input value={newPL} onChange={(e) => setNewPL(e.target.value)} placeholder="해외사업" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addProjectType() } }} /></div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={addProjectType}
                disabled={projectPending || !newPV.trim() || !newPL.trim()}
                className="px-4 py-2.5 border border-white/10 rounded-xl font-body text-sm text-white/50 hover:text-white hover:border-white/20 disabled:opacity-30 transition-colors">
                {projectPending ? '저장 중...' : '+ 유형 추가'}
              </button>
            </div>
            {projectResult && <Feedback result={projectResult} />}
          </>
        )}
      </section>
    </div>
  )
}
