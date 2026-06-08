'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { saveEvent, updateEvent, deleteEvent } from '../actions'
import { Label, Input, Textarea, Sel, Feedback, SubmitButton, DeleteButton, LoadingSpinner } from './admin-ui'
import { useLoading } from '@/components/providers/LoadingProvider'
import { useLoadingTransition } from '@/components/hooks/useLoadingTransition'
import LangTab from './LangTab'
import type { ActionResult } from '../actions'

interface EventItem {
  id: string
  title: string
  title_en: string | null
  type: string
  start_date: string
  end_date: string | null
  location: string | null
  description: string | null
  description_en: string | null
}

function EventForm({
  event,
  onSuccess,
  onCancel,
}: {
  event: EventItem | null
  onSuccess: () => void
  onCancel: () => void
}) {
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isPending, startTransition] = useLoadingTransition()

  const toDateVal = (iso: string | null | undefined) =>
    iso ? iso.split('T')[0] : ''

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setResult(null)
    startTransition(async () => {
      const res = event
        ? await updateEvent(event.id, formData)
        : await saveEvent(null, formData)
      setResult(res)
      if ('success' in res) onSuccess()
    })
  }

  return (
    <div className="bg-white/3 border border-white/10 rounded-2xl p-6 space-y-5">
      <h4 className="font-body font-semibold text-sm text-white">{event ? '이벤트 수정' : '새 이벤트 추가'}</h4>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>유형 *</Label>
            <Sel name="type" defaultValue={event?.type ?? '특강'}>
              <option value="특강">특강</option>
              <option value="워크숍">워크숍</option>
              <option value="캠퍼스투어">캠퍼스투어</option>
              <option value="기타">기타</option>
            </Sel>
          </div>
          <div><Label>시작일 *</Label><Input name="start_date" type="date" defaultValue={toDateVal(event?.start_date)} required /></div>
          <div><Label>종료일</Label><Input name="end_date" type="date" defaultValue={toDateVal(event?.end_date)} /></div>
        </div>
        <div><Label>장소</Label><Input name="location" defaultValue={event?.location ?? ''} placeholder="R동 123호 강의실" /></div>

        <LangTab
          koContent={
            <div className="space-y-4">
              <div><Label>이벤트 제목 *</Label><Input name="title" defaultValue={event?.title ?? ''} placeholder="특강: 미디어 트렌드 2025" required /></div>
              <div><Label>이벤트 설명</Label><Textarea name="description" defaultValue={event?.description ?? ''} placeholder="이벤트 상세 내용..." rows={4} /></div>
            </div>
          }
          enContent={
            <div className="space-y-4">
              <div><Label>Event Title (English)</Label><Input name="title_en" defaultValue={event?.title_en ?? ''} placeholder="Special Lecture: Media Trends 2025" /></div>
              <div><Label>Description (English)</Label><Textarea name="description_en" defaultValue={event?.description_en ?? ''} placeholder="Event details in English..." rows={4} /></div>
            </div>
          }
        />

        <Feedback result={result} />
        <div className="flex gap-3">
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-white/10 font-body text-sm text-white/40 hover:text-white hover:border-white/20 transition-colors">
            취소
          </button>
          <div className="flex-1"><SubmitButton loading={isPending} label={event ? '수정 저장' : '추가하기'} /></div>
        </div>
      </form>
    </div>
  )
}

export default function EventTab() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const { showLoading, hideLoading } = useLoading()

  const fetchEvents = useCallback(async () => {
    showLoading()
    setLoadingList(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('events')
      .select('id, title, title_en, type, start_date, end_date, location, description, description_en')
      .order('start_date', { ascending: false })
      .limit(30)
    setEvents((data ?? []) as EventItem[])
    setLoadingList(false)
    hideLoading()
  }, [showLoading, hideLoading])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const editingEvent = editingId ? events.find((e) => e.id === editingId) ?? null : null
  const handleClose = () => { setShowForm(false); setEditingId(null) }
  const handleSuccess = () => { handleClose(); fetchEvents() }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-body font-bold text-[13px] text-white/40 uppercase tracking-wider">이벤트 관리</h3>
        <button
          onClick={() => { setEditingId(null); setShowForm((v) => !v) }}
          className="flex items-center gap-2 px-4 py-2 bg-nwcn-green text-nwcn-text-default font-body font-semibold text-xs rounded-xl hover:brightness-110 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          새 이벤트 추가
        </button>
      </div>

      {(showForm || editingId) && (
        <EventForm event={editingEvent} onSuccess={handleSuccess} onCancel={handleClose} />
      )}

      {loadingList ? <LoadingSpinner /> : events.length === 0 ? (
        <p className="font-body text-sm text-white/20 text-center py-8">등록된 이벤트가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {events.map((ev) => (
            <div key={ev.id} className="bg-white/3 border border-white/8 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-body text-sm font-semibold text-white truncate">{ev.title}</p>
                  {ev.title_en && (
                    <span className="flex-shrink-0 px-1.5 py-0.5 bg-blue-500/15 border border-blue-500/25 rounded text-[10px] font-body text-blue-400">EN</span>
                  )}
                </div>
                <p className="font-body text-xs text-white/30">
                  {ev.type} · {new Date(ev.start_date).toLocaleDateString('ko-KR')}
                  {ev.location ? ` · ${ev.location}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => { setShowForm(false); setEditingId(ev.id) }}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/40 rounded-lg font-body text-xs hover:text-white hover:border-white/20 transition-colors"
                >
                  수정
                </button>
                <DeleteButton onDelete={async () => { await deleteEvent(ev.id); fetchEvents() }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
