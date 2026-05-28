'use client'

import { useState, useRef, useTransition, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { saveProject, updateProject, deleteProject } from '../actions'
import { Label, Input, Textarea, Sel, FileDropZone, Feedback, SubmitButton, DeleteButton, LoadingSpinner } from './admin-ui'
import LangTab from './LangTab'
import type { ActionResult } from '../actions'

interface ProjectItem {
  id: string
  title: string
  title_en: string | null
  type: string
  partner: string | null
  year: number
  duration: string | null
  description: string | null
  description_en: string | null
  outcome_en: string | null
  thumbnail_url: string | null
}

const PROJECT_TYPE_LABEL: Record<string, string> = { industry: '산학협력', international: '해외교류' }

function ProjectForm({ project, onSuccess, onCancel }: { project: ProjectItem | null; onSuccess: () => void; onCancel: () => void }) {
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const thumbnailRef = useRef<File | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (thumbnailRef.current) formData.set('thumbnail', thumbnailRef.current)
    setResult(null)
    startTransition(async () => {
      const res = project
        ? await updateProject(project.id, formData)
        : await saveProject(null, formData)
      setResult(res)
      if ('success' in res) onSuccess()
    })
  }

  return (
    <div className="bg-white/3 border border-white/10 rounded-2xl p-6 space-y-5">
      <h4 className="font-body font-semibold text-sm text-white">{project ? '프로젝트 수정' : '새 프로젝트 추가'}</h4>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>유형 *</Label>
            <Sel name="type" defaultValue={project?.type ?? 'industry'} required>
              <option value="industry">산학협력</option>
              <option value="international">해외교류</option>
            </Sel>
          </div>
          <div><Label>파트너 기관</Label><Input name="partner" defaultValue={project?.partner ?? ''} placeholder="○○ 주식회사" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>연도 *</Label><Input name="year" type="number" defaultValue={project?.year ?? new Date().getFullYear()} required /></div>
            <div><Label>기간</Label><Input name="duration" defaultValue={project?.duration ?? ''} placeholder="2025.03–06" /></div>
          </div>
        </div>

        <LangTab
          koContent={
            <div className="space-y-4">
              <div><Label>프로젝트명 *</Label><Input name="title" defaultValue={project?.title ?? ''} placeholder="○○ 기업 브랜드 영상 제작" required /></div>
              <div><Label>프로젝트 설명</Label><Textarea name="description" defaultValue={project?.description ?? ''} placeholder="프로젝트 배경 및 진행 내용..." rows={5} /></div>
            </div>
          }
          enContent={
            <div className="space-y-4">
              <div><Label>Project Name (English)</Label><Input name="title_en" defaultValue={project?.title_en ?? ''} placeholder="Brand Video Production for ○○ Corp." /></div>
              <div><Label>Description (English)</Label><Textarea name="description_en" defaultValue={project?.description_en ?? ''} placeholder="Project background and details in English..." rows={5} /></div>
              <div><Label>Outcome (English)</Label><Textarea name="outcome_en" defaultValue={project?.outcome_en ?? ''} placeholder="Project outcomes and results in English..." rows={3} /></div>
            </div>
          }
        />

        <div>
          <Label>프로젝트 이미지{project ? ' (새 파일 선택 시 교체)' : ''}</Label>
          <FileDropZone accept="image/*" label="프로젝트 관련 사진" onFiles={(files) => { thumbnailRef.current = files[0] }} />
        </div>
        <Feedback result={result} />
        <div className="flex gap-3">
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-white/10 font-body text-sm text-white/40 hover:text-white hover:border-white/20 transition-colors">
            취소
          </button>
          <div className="flex-1"><SubmitButton loading={isPending} label={project ? '수정 저장' : '추가하기'} /></div>
        </div>
      </form>
    </div>
  )
}

export default function ProjectTab() {
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchProjects = useCallback(async () => {
    setLoadingList(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('projects')
      .select('id, title, title_en, type, partner, year, duration, description, description_en, outcome_en, thumbnail_url')
      .order('year', { ascending: false })
      .limit(30)
    setProjects((data ?? []) as ProjectItem[])
    setLoadingList(false)
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const editingProject = editingId ? projects.find((p) => p.id === editingId) ?? null : null
  const handleClose = () => { setShowForm(false); setEditingId(null) }
  const handleSuccess = () => { handleClose(); fetchProjects() }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-body font-bold text-[13px] text-white/40 uppercase tracking-wider">프로젝트 관리</h3>
        <button
          onClick={() => { setEditingId(null); setShowForm((v) => !v) }}
          className="flex items-center gap-2 px-4 py-2 bg-nwcn-green text-nwcn-text-default font-body font-semibold text-xs rounded-xl hover:brightness-110 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          새 프로젝트 추가
        </button>
      </div>

      {(showForm || editingId) && (
        <ProjectForm project={editingProject} onSuccess={handleSuccess} onCancel={handleClose} />
      )}

      {loadingList ? <LoadingSpinner /> : projects.length === 0 ? (
        <p className="font-body text-sm text-white/20 text-center py-8">등록된 프로젝트가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center gap-4 bg-white/3 border border-white/8 rounded-xl px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-body text-sm font-semibold text-white truncate">{p.title}</p>
                  {p.title_en && (
                    <span className="flex-shrink-0 px-1.5 py-0.5 bg-blue-500/15 border border-blue-500/25 rounded text-[10px] font-body text-blue-400">EN</span>
                  )}
                </div>
                <p className="font-body text-xs text-white/30">{PROJECT_TYPE_LABEL[p.type] ?? p.type} · {p.partner ?? '—'} · {p.year}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => { setShowForm(false); setEditingId(p.id) }}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/40 rounded-lg font-body text-xs hover:text-white hover:border-white/20 transition-colors"
                >
                  수정
                </button>
                <DeleteButton onDelete={async () => { await deleteProject(p.id); fetchProjects() }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
