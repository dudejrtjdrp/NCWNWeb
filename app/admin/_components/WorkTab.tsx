'use client'

import { useState, useRef, useTransition, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { saveWork, updateWork, deleteWork } from '../actions'
import { Label, Input, Textarea, FileDropZone, Feedback, SubmitButton, DeleteButton, LoadingSpinner } from './admin-ui'
import { useLoading } from '@/components/providers/LoadingProvider'
import LangTab from './LangTab'
import type { ActionResult } from '../actions'

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

function WorkForm({ work, onSuccess, onCancel }: { work: WorkItem | null; onSuccess: () => void; onCancel: () => void }) {
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const thumbnailRef = useRef<File | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>작가명 *</Label><Input name="author" defaultValue={work?.author ?? ''} placeholder="작가/학생 이름" required /></div>
          <div><Label>제작 연도 *</Label><Input name="year" type="number" defaultValue={work?.year ?? new Date().getFullYear()} required /></div>
          <div><Label>기술 스택 (쉼표 구분)</Label><Input name="tech_stack" defaultValue={work?.tech_stack?.join(', ') ?? ''} placeholder="Video, Motion, AI" /></div>
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
      .limit(30)
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
        <WorkForm work={editingWork} onSuccess={handleSuccess} onCancel={handleClose} />
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
