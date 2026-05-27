/**
 * Admin 대시보드 Client Component
 *
 * 탭 구성:
 *   work       — 작업물 등록 + 목록/삭제
 *   article    — NCR 아티클 등록 (관련 아티클 선택) + 목록/삭제/홈 고정
 *   awards     — 수상 등록 + 목록/삭제
 *   project    — 프로젝트 등록 + 목록/삭제
 *   event      — 이벤트 추가/수정/삭제
 *   exhibition — 졸업전시 추가/수정/삭제
 *   types      — 아티클·프로젝트 유형 관리
 */

'use client'

import { useState, useRef, useTransition, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  saveWork, updateWork, deleteWork,
  saveArticle, updateArticle, deleteArticle, setHomeFeaturedArticle,
  saveAward, updateAward, deleteAward,
  saveProject, updateProject, deleteProject,
  saveEvent, updateEvent, deleteEvent,
  saveExhibition, updateExhibition, deleteExhibition,
  saveArticleTypes, saveProjectTypes,
  signOut,
  type ActionResult,
} from '../actions'

// ── 탭 타입 ────────────────────────────────────────────────
type Tab = 'work' | 'article' | 'awards' | 'project' | 'event' | 'exhibition' | 'types'

// ══════════════════════════════════════════════════════════
// 공통 UI 컴포넌트
// ══════════════════════════════════════════════════════════

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-body text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
      {children}
    </label>
  )
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-body text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-nwcn-green/50 transition-colors"
    />
  )
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-body text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-nwcn-green/50 transition-colors resize-none"
    />
  )
}

function Sel({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...props}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-nwcn-green/50 transition-colors appearance-none cursor-pointer"
    >
      {children}
    </select>
  )
}

function FileDropZone({
  accept,
  label,
  onFiles,
}: {
  accept: string
  label: string
  onFiles?: (files: FileList) => void
}) {
  const [dragging, setDragging] = useState(false)
  const [fileNames, setFileNames] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const files = e.dataTransfer.files
    if (files.length) {
      setFileNames(Array.from(files).map((f) => f.name))
      onFiles?.(files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files?.length) {
      setFileNames(Array.from(files).map((f) => f.name))
      onFiles?.(files)
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
        dragging ? 'border-nwcn-green bg-nwcn-green/5' : 'border-white/15 hover:border-white/30'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        {fileNames.length > 0 ? (
          <div className="space-y-1">
            {fileNames.map((name) => (
              <p key={name} className="font-body text-sm text-nwcn-green">{name}</p>
            ))}
          </div>
        ) : (
          <>
            <p className="font-body text-sm text-white/40">{label}</p>
            <p className="font-body text-xs text-white/20">클릭하거나 드래그하세요</p>
          </>
        )}
      </div>
    </div>
  )
}

function Feedback({ result }: { result: ActionResult | null }) {
  if (!result) return null
  if ('success' in result) {
    return (
      <div className="flex items-center gap-3 bg-nwcn-green/10 border border-nwcn-green/30 rounded-xl p-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#09F593" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <p className="font-body text-sm text-nwcn-green">저장이 완료되었습니다!</p>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="font-body text-sm text-red-400">{result.error}</p>
    </div>
  )
}

function SubmitButton({ loading, label = '저장하기' }: { loading: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-nwcn-green text-nwcn-text-default font-body font-semibold text-sm py-4 rounded-xl transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          저장 중...
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {label}
        </>
      )}
    </button>
  )
}

function DeleteButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  if (confirming) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => {
            startTransition(async () => {
              await onDelete()
              setConfirming(false)
            })
          }}
          disabled={pending}
          className="px-3 py-1.5 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg font-body text-xs font-semibold hover:bg-red-500/30 disabled:opacity-50 transition-colors"
        >
          {pending ? '삭제 중...' : '확인'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/40 rounded-lg font-body text-xs hover:bg-white/10 transition-colors"
        >
          취소
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/30 rounded-lg font-body text-xs hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-colors"
    >
      삭제
    </button>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <svg className="animate-spin w-5 h-5 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// WORK 탭
// ══════════════════════════════════════════════════════════

interface WorkItem {
  id: string
  title: string
  author: string
  year: number
  tech_stack: string[]
  thumbnail_url: string | null
  description: string | null
  created_at: string
}

function WorkTab() {
  const [works, setWorks] = useState<WorkItem[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchWorks = useCallback(async () => {
    setLoadingList(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('showcase_works')
      .select('id, title, author, year, tech_stack, thumbnail_url, description, created_at')
      .order('created_at', { ascending: false })
      .limit(30)
    setWorks((data ?? []) as WorkItem[])
    setLoadingList(false)
  }, [])

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
                <p className="font-body text-sm font-semibold text-white truncate">{w.title}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>작품명 *</Label><Input name="title" defaultValue={work?.title ?? ''} placeholder="작품 제목을 입력하세요" required /></div>
          <div><Label>작가명 *</Label><Input name="author" defaultValue={work?.author ?? ''} placeholder="작가/학생 이름" required /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>제작 연도 *</Label><Input name="year" type="number" defaultValue={work?.year ?? new Date().getFullYear()} required /></div>
          <div><Label>기술 스택 (쉼표 구분)</Label><Input name="tech_stack" defaultValue={work?.tech_stack?.join(', ') ?? ''} placeholder="Video, Motion, AI" /></div>
        </div>
        <div><Label>작품 설명</Label><Textarea name="description" defaultValue={work?.description ?? ''} placeholder="작품에 대한 설명..." rows={4} /></div>
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

// ══════════════════════════════════════════════════════════
// ARTICLE 탭
// ══════════════════════════════════════════════════════════

interface ArticleListItem {
  id: string
  title: string
  type: string
  season: string | null
  published_at: string
  is_home_featured?: boolean
  author: string | null
  excerpt: string | null
  content: string | null
  tags: string[]
  related_ids: string[]
  thumbnail_url: string | null
}

const ARTICLE_TYPE_LABEL: Record<string, string> = {
  editorial: '에디토리얼',
  trend: '트렌드',
  card_news: '카드뉴스',
}

function ArticleTab() {
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchArticles = useCallback(async () => {
    setLoadingList(true)
    setFetchError(null)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ncr_reports')
      .select('id, title, type, season, published_at, is_home_featured, author, excerpt, content, tags, related_ids, thumbnail_url')
      .order('published_at', { ascending: false })
      .limit(50)
    if (error) {
      console.error('[ArticleTab] fetch error:', error)
      setFetchError(`데이터 조회 오류: ${error.message}`)
    }
    setArticles((data ?? []) as ArticleListItem[])
    setLoadingList(false)
  }, [])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  const editingArticle = editingId ? articles.find((a) => a.id === editingId) ?? null : null
  const handleClose = () => { setShowForm(false); setEditingId(null) }
  const handleSuccess = () => { handleClose(); fetchArticles() }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-body font-bold text-[13px] text-white/40 uppercase tracking-wider">
          NCR 아티클 관리
          <span className="ml-2 normal-case font-normal text-white/20">— 홈 고정 최대 2개</span>
        </h3>
        <button
          onClick={() => { setEditingId(null); setShowForm((v) => !v) }}
          className="flex items-center gap-2 px-4 py-2 bg-nwcn-green text-nwcn-text-default font-body font-semibold text-xs rounded-xl hover:brightness-110 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          새 아티클 추가
        </button>
      </div>

      {(showForm || editingId) && (
        <ArticleForm article={editingArticle} allArticles={articles} onSuccess={handleSuccess} onCancel={handleClose} />
      )}

      {fetchError && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="font-body text-sm text-red-400">{fetchError}</p>
        </div>
      )}

      {loadingList ? <LoadingSpinner /> : articles.length === 0 && !fetchError ? (
        <p className="font-body text-sm text-white/20 text-center py-8">등록된 아티클이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {articles.map((a) => (
            <ArticleRow
              key={a.id}
              article={a}
              onRefresh={fetchArticles}
              onEdit={() => { setShowForm(false); setEditingId(a.id) }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ArticleForm({
  article,
  allArticles,
  onSuccess,
  onCancel,
}: {
  article: ArticleListItem | null
  allArticles: ArticleListItem[]
  onSuccess: () => void
  onCancel: () => void
}) {
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selectedRelated, setSelectedRelated] = useState<string[]>(article?.related_ids ?? [])
  const [relatedSearch, setRelatedSearch] = useState('')
  const thumbnailRef = useRef<File | null>(null)

  const toggleRelated = (id: string) => {
    setSelectedRelated((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return prev
      return [...prev, id]
    })
  }

  const filteredForRelated = allArticles.filter(
    (a) => a.id !== article?.id && a.title.toLowerCase().includes(relatedSearch.toLowerCase())
  )

  const toDateVal = (iso: string | null | undefined) =>
    iso ? iso.split('T')[0] : ''

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (thumbnailRef.current) formData.set('thumbnail', thumbnailRef.current)
    formData.set('related_ids', selectedRelated.join(','))
    setResult(null)
    startTransition(async () => {
      const res = article
        ? await updateArticle(article.id, formData)
        : await saveArticle(null, formData)
      setResult(res)
      if ('success' in res) onSuccess()
    })
  }

  return (
    <div className="bg-white/3 border border-white/10 rounded-2xl p-6 space-y-5">
      <h4 className="font-body font-semibold text-sm text-white">{article ? '아티클 수정' : '새 아티클 추가'}</h4>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>제목 *</Label><Input name="title" defaultValue={article?.title ?? ''} placeholder="아티클 제목" required /></div>
          <div><Label>작성자</Label><Input name="author" defaultValue={article?.author ?? ''} placeholder="NCR 에디터팀" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>아티클 유형 *</Label>
            <Sel name="type" defaultValue={article?.type ?? 'editorial'} required>
              <option value="editorial">에디토리얼</option>
              <option value="trend">트렌드</option>
              <option value="card_news">카드뉴스</option>
            </Sel>
          </div>
          <div><Label>시즌</Label><Input name="season" defaultValue={article?.season ?? ''} placeholder="Season 3" /></div>
          <div><Label>발행일 *</Label><Input name="published_at" type="date" defaultValue={toDateVal(article?.published_at)} required /></div>
        </div>
        <div><Label>요약 설명</Label><Input name="excerpt" defaultValue={article?.excerpt ?? ''} placeholder="한 줄 요약 (목록에 표시)" /></div>
        <div>
          <Label>본문 내용 (마크다운 지원)</Label>
          <Textarea name="content" defaultValue={article?.content ?? ''} placeholder={"## 소제목\n\n본문 내용을 입력하세요..."} rows={10} />
        </div>
        <div><Label>태그 (쉼표 구분)</Label><Input name="tags" defaultValue={article?.tags?.join(', ') ?? ''} placeholder="AI, 미디어, 콘텐츠산업" /></div>

        {/* 관련 아티클 선택 */}
        <div>
          <Label>관련 아티클 (최대 2개 선택)</Label>
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 bg-white/3">
              <input
                type="text"
                value={relatedSearch}
                onChange={(e) => setRelatedSearch(e.target.value)}
                placeholder="아티클 제목으로 검색..."
                className="w-full bg-transparent font-body text-sm text-white placeholder:text-white/20 focus:outline-none"
              />
            </div>
            <div className="max-h-48 overflow-y-auto p-2 space-y-1">
              {filteredForRelated.length === 0 ? (
                <p className="font-body text-xs text-white/20 text-center py-4">
                  {allArticles.length === 0 ? '아직 아티클이 없습니다' : '검색 결과가 없습니다'}
                </p>
              ) : (
                filteredForRelated.map((a) => {
                  const isSelected = selectedRelated.includes(a.id)
                  const isDisabled = !isSelected && selectedRelated.length >= 2
                  return (
                    <button
                      type="button"
                      key={a.id}
                      onClick={() => toggleRelated(a.id)}
                      disabled={isDisabled}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'bg-nwcn-green/15 border border-nwcn-green/30'
                          : isDisabled
                          ? 'opacity-30 cursor-not-allowed'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-nwcn-green border-nwcn-green' : 'border-white/20'
                      }`}>
                        {isSelected && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#151515" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-xs font-medium text-white truncate">{a.title}</p>
                        <p className="font-body text-[10px] text-white/30">
                          {ARTICLE_TYPE_LABEL[a.type] ?? a.type} · {a.season ?? '시즌 없음'} · {new Date(a.published_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
          {selectedRelated.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {selectedRelated.map((id) => {
                const a = allArticles.find((x) => x.id === id)
                if (!a) return null
                return (
                  <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-nwcn-green/10 border border-nwcn-green/30 rounded-full font-body text-xs text-nwcn-green">
                    {a.title.length > 22 ? a.title.slice(0, 22) + '…' : a.title}
                    <button type="button" onClick={() => toggleRelated(id)} className="hover:text-white transition-colors leading-none">×</button>
                  </span>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <Label>썸네일 이미지{article ? ' (새 파일 선택 시 교체)' : ''}</Label>
          <FileDropZone accept="image/*" label="아티클 썸네일" onFiles={(files) => { thumbnailRef.current = files[0] }} />
        </div>
        <Feedback result={result} />
        <div className="flex gap-3">
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-white/10 font-body text-sm text-white/40 hover:text-white hover:border-white/20 transition-colors">
            취소
          </button>
          <div className="flex-1"><SubmitButton loading={isPending} label={article ? '수정 저장' : '추가하기'} /></div>
        </div>
      </form>
    </div>
  )
}

function ArticleRow({ article, onRefresh, onEdit }: { article: ArticleListItem; onRefresh: () => void; onEdit: () => void }) {
  const [featuredPending, startFeaturedTransition] = useTransition()
  const [featuredErr, setFeaturedErr] = useState<string | null>(null)

  const handleToggleFeatured = () => {
    setFeaturedErr(null)
    startFeaturedTransition(async () => {
      const res = await setHomeFeaturedArticle(article.id, !article.is_home_featured)
      if ('error' in res) setFeaturedErr(res.error)
      else onRefresh()
    })
  }

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm font-semibold text-white truncate">{article.title}</p>
          <p className="font-body text-xs text-white/30">
            {ARTICLE_TYPE_LABEL[article.type] ?? article.type} · {article.season ?? '—'} · {new Date(article.published_at).toLocaleDateString('ko-KR')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleToggleFeatured}
            disabled={featuredPending}
            title={article.is_home_featured ? '홈 고정 해제' : '홈에 고정 (최대 2개)'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-medium transition-all disabled:opacity-50 ${
              article.is_home_featured
                ? 'bg-nwcn-green/20 border border-nwcn-green/40 text-nwcn-green'
                : 'bg-white/5 border border-white/10 text-white/30 hover:text-nwcn-green hover:border-nwcn-green/30'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill={article.is_home_featured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            홈 고정
          </button>
          <button
            onClick={onEdit}
            className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/40 rounded-lg font-body text-xs hover:text-white hover:border-white/20 transition-colors"
          >
            수정
          </button>
          <DeleteButton onDelete={async () => { await deleteArticle(article.id); onRefresh() }} />
        </div>
      </div>
      {featuredErr && <p className="mt-1.5 font-body text-xs text-red-400">{featuredErr}</p>}
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// AWARDS 탭
// ══════════════════════════════════════════════════════════

interface AwardItem {
  id: string
  competition: string
  award_name: string
  year: number
  winner: string | null
  team_members: string[]
  description: string | null
  thumbnail_url: string | null
}

function AwardsTab() {
  const [awards, setAwards] = useState<AwardItem[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchAwards = useCallback(async () => {
    setLoadingList(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('awards')
      .select('id, competition, award_name, year, winner, team_members, description, thumbnail_url')
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
                <p className="font-body text-sm font-semibold text-white truncate">{a.competition}</p>
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

  const AWARD_GRADES = ['대상','금상','은상','동상','장려상','우수상','본선 진출','Winner','Special Prize','기타']

  return (
    <div className="bg-white/3 border border-white/10 rounded-2xl p-6 space-y-5">
      <h4 className="font-body font-semibold text-sm text-white">{award ? '수상 수정' : '새 수상 추가'}</h4>
      <form onSubmit={handleSubmit} className="space-y-5">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>수상자</Label><Input name="winner" defaultValue={award?.winner ?? ''} placeholder="홍길동" /></div>
          <div><Label>팀원 (쉼표 구분)</Label><Input name="team_members" defaultValue={award?.team_members?.join(', ') ?? ''} placeholder="홍길동, 김철수" /></div>
          <div><Label>연도 *</Label><Input name="year" type="number" defaultValue={award?.year ?? new Date().getFullYear()} required /></div>
        </div>
        <div><Label>수상 설명</Label><Textarea name="description" defaultValue={award?.description ?? ''} placeholder="수상 내용 및 작품 설명..." rows={4} /></div>
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

// ══════════════════════════════════════════════════════════
// PROJECT 탭
// ══════════════════════════════════════════════════════════

interface ProjectItem {
  id: string
  title: string
  type: string
  partner: string | null
  year: number
  duration: string | null
  description: string | null
  thumbnail_url: string | null
}

const PROJECT_TYPE_LABEL: Record<string, string> = { industry: '산학협력', international: '해외교류' }

function ProjectTab() {
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchProjects = useCallback(async () => {
    setLoadingList(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('projects')
      .select('id, title, type, partner, year, duration, description, thumbnail_url')
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
                <p className="font-body text-sm font-semibold text-white truncate">{p.title}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>프로젝트명 *</Label><Input name="title" defaultValue={project?.title ?? ''} placeholder="○○ 기업 브랜드 영상 제작" required /></div>
          <div>
            <Label>유형 *</Label>
            <Sel name="type" defaultValue={project?.type ?? 'industry'} required>
              <option value="industry">산학협력</option>
              <option value="international">해외교류</option>
            </Sel>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>파트너 기관</Label><Input name="partner" defaultValue={project?.partner ?? ''} placeholder="○○ 주식회사" /></div>
          <div><Label>연도 *</Label><Input name="year" type="number" defaultValue={project?.year ?? new Date().getFullYear()} required /></div>
          <div><Label>기간</Label><Input name="duration" defaultValue={project?.duration ?? ''} placeholder="2025.03 – 2025.06" /></div>
        </div>
        <div><Label>프로젝트 설명</Label><Textarea name="description" defaultValue={project?.description ?? ''} placeholder="프로젝트 배경 및 진행 내용..." rows={5} /></div>
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

// ══════════════════════════════════════════════════════════
// EVENT 탭
// ══════════════════════════════════════════════════════════

interface EventItem {
  id: string
  title: string
  type: string
  start_date: string
  end_date: string | null
  location: string | null
  description: string | null
}

function EventTab() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchEvents = useCallback(async () => {
    setLoadingList(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('events')
      .select('id, title, type, start_date, end_date, location, description')
      .order('start_date', { ascending: false })
      .limit(30)
    setEvents((data ?? []) as EventItem[])
    setLoadingList(false)
  }, [])

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
                <p className="font-body text-sm font-semibold text-white truncate">{ev.title}</p>
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
  const [isPending, startTransition] = useTransition()

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>이벤트 제목 *</Label><Input name="title" defaultValue={event?.title ?? ''} placeholder="특강: 미디어 트렌드 2025" required /></div>
          <div>
            <Label>유형 *</Label>
            <Sel name="type" defaultValue={event?.type ?? '특강'}>
              <option value="특강">특강</option>
              <option value="워크숍">워크숍</option>
              <option value="캠퍼스투어">캠퍼스투어</option>
              <option value="기타">기타</option>
            </Sel>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>시작일 *</Label><Input name="start_date" type="date" defaultValue={toDateVal(event?.start_date)} required /></div>
          <div><Label>종료일</Label><Input name="end_date" type="date" defaultValue={toDateVal(event?.end_date)} /></div>
        </div>
        <div><Label>장소</Label><Input name="location" defaultValue={event?.location ?? ''} placeholder="R동 123호 강의실" /></div>
        <div><Label>이벤트 설명</Label><Textarea name="description" defaultValue={event?.description ?? ''} placeholder="이벤트 상세 내용..." rows={4} /></div>
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

// ══════════════════════════════════════════════════════════
// EXHIBITION 탭
// ══════════════════════════════════════════════════════════

interface ExhibitionItem {
  id: string
  title: string
  year: number
  theme: string | null
  description: string | null
  poster_url: string | null
}

function ExhibitionTab() {
  const [exhibitions, setExhibitions] = useState<ExhibitionItem[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchExhibitions = useCallback(async () => {
    setLoadingList(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('exhibitions')
      .select('id, title, year, theme, description, poster_url')
      .order('year', { ascending: false })
      .limit(30)
    setExhibitions((data ?? []) as ExhibitionItem[])
    setLoadingList(false)
  }, [])

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
  const [isPending, startTransition] = useTransition()
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

// ══════════════════════════════════════════════════════════
// TYPES 탭 — 유형 관리
// ══════════════════════════════════════════════════════════

const DEFAULT_ARTICLE_TYPES = [
  { value: 'editorial', label: '에디토리얼' },
  { value: 'trend', label: '트렌드' },
  { value: 'card_news', label: '카드뉴스' },
]
const DEFAULT_PROJECT_TYPES = [
  { value: 'industry', label: '산학협력' },
  { value: 'international', label: '해외교류' },
]

function TypesTab() {
  const [articleTypes, setArticleTypes] = useState(DEFAULT_ARTICLE_TYPES)
  const [projectTypes, setProjectTypes] = useState(DEFAULT_PROJECT_TYPES)
  const [newAV, setNewAV] = useState(''); const [newAL, setNewAL] = useState('')
  const [newPV, setNewPV] = useState(''); const [newPL, setNewPL] = useState('')
  const [articleResult, setArticleResult] = useState<ActionResult | null>(null)
  const [projectResult, setProjectResult] = useState<ActionResult | null>(null)
  const [articlePending, startArticleTransition] = useTransition()
  const [projectPending, startProjectTransition] = useTransition()

  const addArticleType = () => {
    if (!newAV.trim() || !newAL.trim()) return
    if (articleTypes.some((t) => t.value === newAV.trim())) return
    setArticleTypes([...articleTypes, { value: newAV.trim(), label: newAL.trim() }])
    setNewAV(''); setNewAL('')
  }

  const addProjectType = () => {
    if (!newPV.trim() || !newPL.trim()) return
    if (projectTypes.some((t) => t.value === newPV.trim())) return
    setProjectTypes([...projectTypes, { value: newPV.trim(), label: newPL.trim() }])
    setNewPV(''); setNewPL('')
  }

  return (
    <div className="space-y-10">
      {/* 안내 */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" className="flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="font-body text-xs text-yellow-400/80 leading-relaxed">
          유형 추가·삭제 후 반드시 <strong>저장</strong>을 눌러야 적용됩니다.
          DB에 <code className="text-yellow-300 font-mono">settings</code> 테이블이 있어야 저장됩니다.
        </p>
      </div>

      {/* 아티클 유형 */}
      <section className="space-y-4">
        <h3 className="font-body font-bold text-[15px] text-white">NCR 아티클 유형</h3>
        <div className="space-y-2">
          {articleTypes.map((t) => (
            <div key={t.value} className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl px-4 py-3">
              <code className="font-mono text-xs text-nwcn-green bg-nwcn-green/10 px-2 py-0.5 rounded">{t.value}</code>
              <span className="font-body text-sm text-white flex-1">{t.label}</span>
              <button onClick={() => setArticleTypes(articleTypes.filter((x) => x.value !== t.value))}
                className="font-body text-xs text-white/20 hover:text-red-400 transition-colors">삭제</button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>값 (영문, 언더스코어 허용)</Label><Input value={newAV} onChange={(e) => setNewAV(e.target.value)} placeholder="news" /></div>
          <div><Label>표시 이름</Label><Input value={newAL} onChange={(e) => setNewAL(e.target.value)} placeholder="뉴스" /></div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={addArticleType}
            disabled={!newAV.trim() || !newAL.trim()}
            className="px-4 py-2.5 border border-white/10 rounded-xl font-body text-sm text-white/50 hover:text-white hover:border-white/20 disabled:opacity-30 transition-colors">
            + 유형 추가
          </button>
          <button type="button"
            onClick={() => { setArticleResult(null); startArticleTransition(async () => { setArticleResult(await saveArticleTypes(articleTypes)) }) }}
            disabled={articlePending}
            className="px-5 py-2.5 bg-nwcn-green text-nwcn-text-default font-body font-semibold text-sm rounded-xl hover:brightness-110 disabled:opacity-50 transition-all">
            {articlePending ? '저장 중...' : '저장'}
          </button>
        </div>
        {articleResult && <Feedback result={articleResult} />}
      </section>

      <div className="h-px bg-white/8" />

      {/* 프로젝트 유형 */}
      <section className="space-y-4">
        <h3 className="font-body font-bold text-[15px] text-white">프로젝트 유형</h3>
        <div className="space-y-2">
          {projectTypes.map((t) => (
            <div key={t.value} className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl px-4 py-3">
              <code className="font-mono text-xs text-nwcn-green bg-nwcn-green/10 px-2 py-0.5 rounded">{t.value}</code>
              <span className="font-body text-sm text-white flex-1">{t.label}</span>
              <button onClick={() => setProjectTypes(projectTypes.filter((x) => x.value !== t.value))}
                className="font-body text-xs text-white/20 hover:text-red-400 transition-colors">삭제</button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>값 (영문)</Label><Input value={newPV} onChange={(e) => setNewPV(e.target.value)} placeholder="overseas" /></div>
          <div><Label>표시 이름</Label><Input value={newPL} onChange={(e) => setNewPL(e.target.value)} placeholder="해외사업" /></div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={addProjectType}
            disabled={!newPV.trim() || !newPL.trim()}
            className="px-4 py-2.5 border border-white/10 rounded-xl font-body text-sm text-white/50 hover:text-white hover:border-white/20 disabled:opacity-30 transition-colors">
            + 유형 추가
          </button>
          <button type="button"
            onClick={() => { setProjectResult(null); startProjectTransition(async () => { setProjectResult(await saveProjectTypes(projectTypes)) }) }}
            disabled={projectPending}
            className="px-5 py-2.5 bg-nwcn-green text-nwcn-text-default font-body font-semibold text-sm rounded-xl hover:brightness-110 disabled:opacity-50 transition-all">
            {projectPending ? '저장 중...' : '저장'}
          </button>
        </div>
        {projectResult && <Feedback result={projectResult} />}
      </section>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// Admin 대시보드 루트
// ══════════════════════════════════════════════════════════

export default function AdminDashboard() {
  const [authReady, setAuthReady] = useState(false)
  const [tab, setTab] = useState<Tab>('work')
  const [signingOut, startSignOut] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/admin/login'
      } else {
        setAuthReady(true)
      }
    })
  }, [])

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <svg className="animate-spin w-8 h-8 text-nwcn-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
    )
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      key: 'work', label: '작업물', desc: '디자인·영상·3D 등록 및 삭제',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
    },
    {
      key: 'article', label: 'NCR 아티클', desc: '아티클 발행 · 홈 노출 고정',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /></svg>,
    },
    {
      key: 'awards', label: '수상', desc: '수상 내역 등록 및 삭제',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>,
    },
    {
      key: 'project', label: '프로젝트', desc: '산학협력·해외교류 관리',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>,
    },
    {
      key: 'event', label: '이벤트', desc: '특강·워크숍·캠퍼스투어 CRUD',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    },
    {
      key: 'exhibition', label: '졸업전시', desc: '쇼케이스·전시 CRUD',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>,
    },
    {
      key: 'types', label: '유형 관리', desc: '아티클·프로젝트 유형 추가/삭제',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
    },
  ]

  const activeTab = TABS.find((t) => t.key === tab)!

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* 상단 헤더 */}
      <header className="border-b border-white/10 bg-[#0f0f0f]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px] h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-brand text-xl text-nwcn-green">NWCN</span>
            <span className="font-body text-xs text-white/20 px-2 py-0.5 border border-white/10 rounded-full">ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 font-body text-xs text-white/30 hover:text-white/60 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              사이트 보기
            </a>
            <button
              onClick={() => startSignOut(async () => { await signOut() })}
              disabled={signingOut}
              className="flex items-center gap-1.5 font-body text-xs text-white/30 hover:text-red-400 transition-colors disabled:opacity-40"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {signingOut ? '로그아웃 중...' : '로그아웃'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px] py-12">
        <div className="mb-10">
          <h1 className="font-body font-bold text-[28px] text-white mb-2">콘텐츠 관리</h1>
          <p className="font-body text-sm text-white/30">
            작업물, 아티클, 수상, 프로젝트, 이벤트, 전시 콘텐츠를 등록하고 관리합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 사이드 탭 */}
          <aside className="lg:col-span-1">
            <nav className="space-y-1">
              {TABS.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    tab === key
                      ? 'bg-nwcn-green/10 text-nwcn-green border border-nwcn-green/20'
                      : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                  }`}
                >
                  {icon}
                  <span className="font-body text-sm font-medium">{label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-8 p-4 rounded-xl border border-white/8 bg-white/3">
              <div className="flex items-start gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#09F593" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="font-body text-xs text-white/40 leading-relaxed">
                  저장 후 해당 페이지에 즉시 반영됩니다.
                  NCR 아티클 홈 고정은 최대 2개 설정 가능합니다.
                </p>
              </div>
            </div>
          </aside>

          {/* 콘텐츠 영역 */}
          <div className="lg:col-span-3">
            <div className="bg-white/3 border border-white/8 rounded-2xl p-8">
              <div className="mb-8 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-nwcn-green/10 flex items-center justify-center text-nwcn-green">
                    {activeTab.icon}
                  </div>
                  <div>
                    <h2 className="font-body font-bold text-[18px] text-white">{activeTab.label}</h2>
                    <p className="font-body text-xs text-white/30">{activeTab.desc}</p>
                  </div>
                </div>
              </div>

              {tab === 'work'       && <WorkTab />}
              {tab === 'article'    && <ArticleTab />}
              {tab === 'awards'     && <AwardsTab />}
              {tab === 'project'    && <ProjectTab />}
              {tab === 'event'      && <EventTab />}
              {tab === 'exhibition' && <ExhibitionTab />}
              {tab === 'types'      && <TypesTab />}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
