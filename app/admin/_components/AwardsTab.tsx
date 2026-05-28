'use client'

import { useState, useRef, useTransition, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { saveAward, updateAward, deleteAward } from '../actions'
import { Label, Input, Textarea, Sel, FileDropZone, Feedback, SubmitButton, DeleteButton, LoadingSpinner } from './admin-ui'
import LangTab from './LangTab'
import type { ActionResult } from '../actions'

interface AwardItem {
  id: string
  competition: string
  competition_en: string | null
  award_name: string
  award_name_en: string | null
  hosted_by_en: string | null
  year: number
  winner: string | null
  team_members: string[]
  description: string | null
  description_en: string | null
  thumbnail_url: string | null
}

const AWARD_GRADES = ['대상','금상','은상','동상','장려상','우수상','본선 진출','Winner','Special Prize','기타']

function AwardForm({ award, onSuccess, onCancel }: { award: AwardItem | null; onSuccess: () => void; onCancel: () => void }) {
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const thumbnailRef = useRef<File | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (thumbnailRef.current) formData.set('thumbnail', thumbnailRef.current)
    setResult(null)
    startTransition(async () => {
      const res = award
        ? await updateAward(award.id, formData)
        : await saveAward(null, formData)
      setResult(res)
      if ('success' in res) onSuccess()
    })
  }

  const koFields = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>대회명 *</Label><Input name="competition" defaultValue={award?.competition ?? ''} placeholder="레드닷 디자인 어워드" required /></div>
        <div>
          <Label>수상 등급 *</Label>
          <Sel name="award_name" defaultValue={award?.award_name ?? ''} required>
            <option value="">선택하세요</option>
            {AWARD_GRADES.map((v) => <option key={v} value={v}>{v}</option>)}
          </Sel>
        </div>
      </div>
      <div><Label>수상 설명</Label><Textarea name="description" defaultValue={award?.description ?? ''} placeholder="수상 내용 및 작품 설명..." rows={4} /></div>
    </div>
  )

  const enFields = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>Competition Name</Label><Input name="competition_en" defaultValue={award?.competition_en ?? ''} placeholder="Red Dot Design Award" /></div>
        <div><Label>Award Grade</Label><Input name="award_name_en" defaultValue={award?.award_name_en ?? ''} placeholder="Gold Award" /></div>
      </div>
      <div><Label>Hosted By (English)</Label><Input name="hosted_by_en" defaultValue={award?.hosted_by_en ?? ''} placeholder="Design Zentrum Nordrhein Westfalen" /></div>
      <div><Label>Description (English)</Label><Textarea name="description_en" defaultValue={award?.description_en ?? ''} placeholder="Award description in English..." rows={4} /></div>
    </div>
  )

  return (
    <div className="bg-white/3 border border-white/10 rounded-2xl p-6 space-y-5">
      <h4 className="font-body font-semibold text-sm text-white">{award ? '수상 수정' : '새 수상 추가'}</h4>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>수상자</Label><Input name="winner" defaultValue={award?.winner ?? ''} placeholder="홍길동" /></div>
          <div><Label>팀원 (쉼표 구분)</Label><Input name="team_members" defaultValue={award?.team_members?.join(', ') ?? ''} placeholder="홍길동, 김철수" /></div>
          <div><Label>연도 *</Label><Input name="year" type="number" defaultValue={award?.year ?? new Date().getFullYear()} required /></div>
        </div>

        <LangTab koContent={koFields} enContent={enFields} />

        <div>
          <Label>수상 이미지{award ? ' (새 파일 선택 시 교체)' : ''}</Label>
          <FileDropZone accept="image/*" label="수상 관련 이미지" onFiles={(files) => { thumbnailRef.current = files[0] }} />
        </div>
        <Feedback result={result} />
        <div className="flex gap-3">
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-white/10 font-body text-sm text-white/40 hover:text-white hover:border-white/20 transition-colors">
            취소
          </button>
          <div className="flex-1"><SubmitButton loading={isPending} label={award ? '수정 저장' : '추가하기'} /></div>
        </div>
      </form>
    </div>
  )
}

export default function AwardsTab() {
  const [awards, setAwards] = useState<AwardItem[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchAwards = useCallback(async () => {
    setLoadingList(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('awards')
      .select('id, competition, competition_en, award_name, award_name_en, hosted_by_en, year, winner, team_members, description, description_en, thumbnail_url')
      .order('year', { ascending: false })
      .limit(30)
    setAwards((data ?? []) as AwardItem[])
    setLoadingList(false)
  }, [])

  useEffect(() => { fetchAwards() }, [fetchAwards])

  const editingAward = editingId ? awards.find((a) => a.id === editingId) ?? null : null
  const handleClose = () => { setShowForm(false); setEditingId(null) }
  const handleSuccess = () => { handleClose(); fetchAwards() }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-body font-bold text-[13px] text-white/40 uppercase tracking-wider">수상 관리</h3>
        <button
          onClick={() => { setEditingId(null); setShowForm((v) => !v) }}
          className="flex items-center gap-2 px-4 py-2 bg-nwcn-green text-nwcn-text-default font-body font-semibold text-xs rounded-xl hover:brightness-110 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          새 수상 추가
        </button>
      </div>

      {(showForm || editingId) && (
        <AwardForm award={editingAward} onSuccess={handleSuccess} onCancel={handleClose} />
      )}

      {loadingList ? <LoadingSpinner /> : awards.length === 0 ? (
        <p className="font-body text-sm text-white/20 text-center py-8">등록된 수상 내역이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {awards.map((a) => (
            <div key={a.id} className="flex items-center gap-4 bg-white/3 border border-white/8 rounded-xl px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-body text-sm font-semibold text-white truncate">{a.competition}</p>
                  {a.competition_en && (
                    <span className="flex-shrink-0 px-1.5 py-0.5 bg-blue-500/15 border border-blue-500/25 rounded text-[10px] font-body text-blue-400">EN</span>
                  )}
                </div>
                <p className="font-body text-xs text-white/30">{a.award_name} · {a.winner ?? '팀 수상'} · {a.year}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => { setShowForm(false); setEditingId(a.id) }}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/40 rounded-lg font-body text-xs hover:text-white hover:border-white/20 transition-colors"
                >
                  수정
                </button>
                <DeleteButton onDelete={async () => { await deleteAward(a.id); fetchAwards() }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
