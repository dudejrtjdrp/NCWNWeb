'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { saveWork, updateWork, deleteWork, saveWorkFilterTags } from '../actions'
import { Label, Input, Textarea, FileDropZone, Feedback, SubmitButton, DeleteButton, LoadingSpinner } from './admin-ui'
import { useLoading } from '@/components/providers/LoadingProvider'
import { useLoadingTransition } from '@/components/hooks/useLoadingTransition'
import LangTab from './LangTab'
import type { ActionResult } from '../actions'

const DEFAULT_WORK_FILTER_TAGS = ['Video', 'Graphic', 'Web', 'Motion', 'Photo', 'AI']

interface WorkItem {
  id: string
  title: string
  title_en: string | null
  author: string
  year: number
  tech_stack: string[]
  thumbnail_url: string | null
  description: string | null
  description_en: string | null
  created_at: string
}

// ── 작업물 폼 ─────────────────────────────────────────────
function WorkForm({
  work,
  onSuccess,
  onCancel,
}: {
  work: WorkItem | null
  onSuccess: () => void
  onCancel: () => void
}) {
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isPending, startTransition] = useLoadingTransition()
  const [selectedTags, setSelectedTags] = useState<string[]>(work?.tech_stack ?? [])
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [tagsLoaded, setTagsLoaded] = useState(false)
  const [newTag, setNewTag] = useState('')
  const thumbnailRef = useRef<File | null>(null)

  // settings에서 필터 태그 로드
  useEffect(() => {
    const supabase = createClient()
    supabase.from('settings').select('value').eq('key', 'work_filter_tags').maybeSingle()
      .then(({ data }) => {
        const val = data?.value
        setFilterTags(Array.isArray(val) && (val as string[]).length > 0 ? val as string[] : DEFAULT_WORK_FILTER_TAGS)
        setTagsLoaded(true)
      })
  }, [])

  // work 변경 시 selectedTags 초기화
  useEffect(() => {
    setSelectedTags(work?.tech_stack ?? [])
  }, [work?.id])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const addNewTag = async () => {
    const t = newTag.trim()
    if (!t || filterTags.includes(t)) return
    const updated = [...filterTags, t]
    setFilterTags(updated)
    setSelectedTags((prev) => [...prev, t])
    setNewTag('')
    // 마스터 목록(settings)에도 반영
    await saveWorkFilterTags(updated)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.delete('tech_stack')
    formData.set('tech_stack', selectedTags.join(', '))
    if (thumbnailRef.current) formData.set('thumbnail', thumbnailRef.current)
    setResult(null)
    startTransition(async () => {
      const res = work
        ? await updateWork(work.id, formData)
        : await saveWork(null, formData)
      setResult(res)
      if ('success' in res) onSuccess()
    })
  }

  return (
    <div className="bg-white/3 border border-white/10 rounded-2xl p-6 space-y-5">
      <h4 className="font-body font-semibold text-sm text-white">{work ? '작업물 수정' : '새 작업물 추가'}</h4>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>작가명 *</Label><Input name="author" defaultValue={work?.author ?? ''} placeholder="작가/학생 이름" required /></div>
          <div><Label>제작 연도 *</Label><Input name="year" type="number" defaultValue={work?.year ?? new Date().getFullYear()} required /></div>
        </div>

        {/* 카테고리 태그 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>카테고리 태그</Label>
            <span className="font-body text-[11px] text-white/25">유형관리 탭에서 마스터 목록 편집</span>
          </div>
          {!tagsLoaded ? (
            <div className="py-2"><LoadingSpinner /></div>
          ) : (
            <>
              {/* 기존 태그 토글 선택 */}
              <div className="flex flex-wrap gap-2">
                {filterTags.map((tag) => {
                  const checked = selectedTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={[
                        'px-3 py-1.5 rounded-full font-body text-xs transition-all',
                        checked
                          ? 'bg-nwcn-green text-nwcn-text-default font-semibold'
                          : 'border border-white/15 text-white/40 hover:border-white/30 hover:text-white/70',
                      ].join(' ')}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>

              {/* 새 태그 인라인 추가 */}
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="새 태그 추가 (Enter)"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void addNewTag() } }}
                  className="flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={() => void addNewTag()}
                  disabled={!newTag.trim() || filterTags.includes(newTag.trim())}
                  className="px-3 py-2 border border-white/10 rounded-xl font-body text-xs text-white/40 hover:text-white hover:border-white/20 disabled:opacity-30 transition-colors whitespace-nowrap"
                >
                  + 추가
                </button>
              </div>

              {selectedTags.length > 0 && (
                <p className="font-body text-[11px] text-white/30">
                  선택됨: {selectedTags.join(', ')}
                </p>
              )}
            </>
          )}
        </div>

        <LangTab
          koContent={
            <div className="space-y-4">
              <div><Label>작품명 *</Label><Input name="title" defaultValue={work?.title ?? ''} placeholder="작품 제목을 입력하세요" required /></div>
              <div><Label>작품 설명</Label><Textarea name="description" defaultValue={work?.description ?? ''} placeholder="작품에 대한 설명..." rows={4} /></div>
            </div>
          }
          enContent={
            <div className="space-y-4">
              <div><Label>Work Title (English)</Label><Input name="title_en" defaultValue={work?.title_en ?? ''} placeholder="Work title in English" /></div>
              <div><Label>Description (English)</Label><Textarea name="description_en" defaultValue={work?.description_en ?? ''} placeholder="Work description in English..." rows={4} /></div>
            </div>
          }
        />

        <div>
          <Label>썸네일 이미지{work ? ' (새 파일 선택 시 교체)' : ''}</Label>
          <FileDropZone accept="image/*" label="대표 썸네일 이미지 (권장: 4:3)" onFiles={(files) => { thumbnailRef.current = files[0] }} />
        </div>
        <Feedback result={result} />
        <div className="flex gap-3">
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-white/10 font-body text-sm text-white/40 hover:text-white hover:border-white/20 transition-colors">
            취소
          </button>
          <div className="flex-1"><SubmitButton loading={isPending} label={work ? '수정 저장' : '추가하기'} /></div>
        </div>
      </form>
    </div>
  )
}

// ── 메인 WorkTab ───────────────────────────────────────────
export default function WorkTab() {
  const [works, setWorks] = useState<WorkItem[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const { showLoading, hideLoading } = useLoading()

  const fetchWorks = useCallback(async () => {
    showLoading()
    setLoadingList(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('showcase_works')
      .select('id, title, title_en, author, year, tech_stack, thumbnail_url, description, description_en, created_at')
      .order('created_at', { ascending: false })
      .limit(50)
    setWorks((data ?? []) as WorkItem[])
    setLoadingList(false)
    hideLoading()
  }, [showLoading, hideLoading])

  useEffect(() => { fetchWorks() }, [fetchWorks])

  const editingWork = editingId ? works.find((w) => w.id === editingId) ?? null : null
  const handleClose = () => { setShowForm(false); setEditingId(null) }
  const handleSuccess = () => { handleClose(); fetchWorks() }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-body font-bold text-[13px] text-white/40 uppercase tracking-wider">작업물 관리</h3>
        <button
          onClick={() => { setEditingId(null); setShowForm((v) => !v) }}
          className="flex items-center gap-2 px-4 py-2 bg-nwcn-green text-nwcn-text-default font-body font-semibold text-xs rounded-xl hover:brightness-110 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          새 작업물 추가
        </button>
      </div>

      {(showForm || editingId) && (
        <WorkForm
          work={editingWork}
          onSuccess={handleSuccess}
          onCancel={handleClose}
        />
      )}

      {loadingList ? <LoadingSpinner /> : works.length === 0 ? (
        <p className="font-body text-sm text-white/20 text-center py-8">등록된 작업물이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {works.map((w) => (
            <div key={w.id} className="flex items-center gap-4 bg-white/3 border border-white/8 rounded-xl px-4 py-3">
              {w.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={w.thumbnail_url} alt={w.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-body text-sm font-semibold text-white truncate">{w.title}</p>
                  {w.title_en && (
                    <span className="flex-shrink-0 px-1.5 py-0.5 bg-blue-500/15 border border-blue-500/25 rounded text-[10px] font-body text-blue-400">EN</span>
                  )}
                </div>
                <p className="font-body text-xs text-white/30">{w.author} · {w.year} · {w.tech_stack.join(', ')}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => { setShowForm(false); setEditingId(w.id) }}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/40 rounded-lg font-body text-xs hover:text-white hover:border-white/20 transition-colors"
                >
                  수정
                </button>
                <DeleteButton onDelete={async () => { await deleteWork(w.id); fetchWorks() }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
