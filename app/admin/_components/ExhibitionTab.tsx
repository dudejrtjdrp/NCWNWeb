'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { saveExhibition, updateExhibition, deleteExhibition } from '../actions'
import { Label, Input, Textarea, FileDropZone, Feedback, SubmitButton, DeleteButton, LoadingSpinner } from './admin-ui'
import { useLoading } from '@/components/providers/LoadingProvider'
import { useLoadingTransition } from '@/components/hooks/useLoadingTransition'
import type { ActionResult } from '../actions'

interface ExhibitionItem {
  id: string
  title: string
  year: number
  theme: string | null
  description: string | null
  poster_url: string | null
}

function ExhibitionForm({
  exhibition,
  onSuccess,
  onCancel,
}: {
  exhibition: ExhibitionItem | null
  onSuccess: () => void
  onCancel: () => void
}) {
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isPending, startTransition] = useLoadingTransition()
  const posterRef = useRef<File | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (posterRef.current) formData.set('poster', posterRef.current)
    setResult(null)
    startTransition(async () => {
      const res = exhibition
        ? await updateExhibition(exhibition.id, formData)
        : await saveExhibition(null, formData)
      setResult(res)
      if ('success' in res) onSuccess()
    })
  }

  return (
    <div className="bg-white/3 border border-white/10 rounded-2xl p-6 space-y-5">
      <h4 className="font-body font-semibold text-sm text-white">{exhibition ? '전시 수정' : '새 전시 추가'}</h4>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>전시 제목 *</Label>
            <Input name="title" defaultValue={exhibition?.title ?? ''} placeholder="2025 뉴미디어콘텐츠과 졸업전시" required />
          </div>
          <div>
            <Label>연도 *</Label>
            <Input name="year" type="number" defaultValue={exhibition?.year ?? new Date().getFullYear()} required />
          </div>
        </div>
        <div><Label>테마 / 슬로건</Label><Input name="theme" defaultValue={exhibition?.theme ?? ''} placeholder="전시 테마나 슬로건" /></div>
        <div><Label>전시 설명</Label><Textarea name="description" defaultValue={exhibition?.description ?? ''} placeholder="전시 소개 및 내용..." rows={4} /></div>
        <div>
          <Label>포스터 이미지{exhibition ? ' (새 파일 선택 시 교체)' : ''}</Label>
          <FileDropZone accept="image/*" label="전시 포스터 이미지" onFiles={(files) => { posterRef.current = files[0] }} />
        </div>
        <Feedback result={result} />
        <div className="flex gap-3">
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-white/10 font-body text-sm text-white/40 hover:text-white hover:border-white/20 transition-colors">
            취소
          </button>
          <div className="flex-1"><SubmitButton loading={isPending} label={exhibition ? '수정 저장' : '추가하기'} /></div>
        </div>
      </form>
    </div>
  )
}

export default function ExhibitionTab() {
  const [exhibitions, setExhibitions] = useState<ExhibitionItem[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const { showLoading, hideLoading } = useLoading()

  const fetchExhibitions = useCallback(async () => {
    showLoading()
    setLoadingList(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('exhibitions')
      .select('id, title, year, theme, description, poster_url')
      .order('year', { ascending: false })
      .limit(30)
    setExhibitions((data ?? []) as ExhibitionItem[])
    setLoadingList(false)
    hideLoading()
  }, [showLoading, hideLoading])

  useEffect(() => { fetchExhibitions() }, [fetchExhibitions])

  const editingExhibition = editingId ? exhibitions.find((e) => e.id === editingId) ?? null : null
  const handleClose = () => { setShowForm(false); setEditingId(null) }
  const handleSuccess = () => { handleClose(); fetchExhibitions() }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-body font-bold text-[13px] text-white/40 uppercase tracking-wider">졸업전시 관리</h3>
        <button
          onClick={() => { setEditingId(null); setShowForm((v) => !v) }}
          className="flex items-center gap-2 px-4 py-2 bg-nwcn-green text-nwcn-text-default font-body font-semibold text-xs rounded-xl hover:brightness-110 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          새 전시 추가
        </button>
      </div>

      {(showForm || editingId) && (
        <ExhibitionForm exhibition={editingExhibition} onSuccess={handleSuccess} onCancel={handleClose} />
      )}

      {loadingList ? <LoadingSpinner /> : exhibitions.length === 0 ? (
        <p className="font-body text-sm text-white/20 text-center py-8">등록된 전시가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {exhibitions.map((ex) => (
            <div key={ex.id} className="bg-white/3 border border-white/8 rounded-xl px-4 py-3 flex items-center gap-3">
              {ex.poster_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ex.poster_url} alt={ex.title} className="w-9 h-12 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-semibold text-white truncate">{ex.title}</p>
                <p className="font-body text-xs text-white/30">{ex.year}년{ex.theme ? ` · ${ex.theme}` : ''}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => { setShowForm(false); setEditingId(ex.id) }}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/40 rounded-lg font-body text-xs hover:text-white hover:border-white/20 transition-colors"
                >
                  수정
                </button>
                <DeleteButton onDelete={async () => { await deleteExhibition(ex.id); fetchExhibitions() }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
