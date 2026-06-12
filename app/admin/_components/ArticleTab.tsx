'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { saveArticle, updateArticle, deleteArticle, saveArticleFilterTags } from '../actions'
import { Label, Input, Textarea, Sel, FileDropZone, Feedback, SubmitButton, DeleteButton, LoadingSpinner } from './admin-ui'
import { useLoading } from '@/components/providers/LoadingProvider'
import { useLoadingTransition } from '@/components/hooks/useLoadingTransition'
import LangTab from './LangTab'
import type { ActionResult } from '../actions'

interface ArticleListItem {
  id: string
  title: string
  title_en: string | null
  type: string
  season: string | null
  published_at: string
  is_home_featured?: boolean
  author: string | null
  excerpt: string | null
  excerpt_en: string | null
  description_en: string | null
  content: string | null
  content_en: string | null
  tags: string[]
  related_ids: string[]
  thumbnail_url: string | null
}

interface ArticleType { value: string; label: string }

const DEFAULT_ARTICLE_TYPES: ArticleType[] = [
  { value: 'editorial', label: '에디토리얼' },
  { value: 'trend', label: '트렌드' },
  { value: 'card_news', label: '카드뉴스' },
]

/** 유형 목록 → { value: label } 맵 (설정에 없는 값은 value 그대로 표시) */
function buildTypeLabelMap(types: ArticleType[]): Record<string, string> {
  return Object.fromEntries(types.map((t) => [t.value, t.label]))
}

// ── 태그 피커 ────────────────────────────────────────────
function TagPicker({
  value,
  onChange,
}: {
  value: string[]
  onChange: (tags: string[]) => void
}) {
  const supabase = createClient()
  const [knownTags, setKnownTags] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)

  // 기존 아티클 태그 로드
  useEffect(() => {
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'article_filter_tags')
      .maybeSingle()
      .then(({ data }) => {
        const val = data?.value
        if (Array.isArray(val)) setKnownTags(val as string[])
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = (tag: string) => {
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag])
  }

  const addNew = async () => {
    const t = input.trim()
    if (!t) return
    setInput('')
    // 선택에 추가
    const nextSelected = value.includes(t) ? value : [...value, t]
    onChange(nextSelected)
    // 기존 태그 목록에도 추가 (중복 제외)
    if (!knownTags.includes(t)) {
      const nextKnown = [...knownTags, t]
      setKnownTags(nextKnown)
      setSaving(true)
      await saveArticleFilterTags(nextKnown)
      setSaving(false)
    }
  }

  const removeKnown = async (tag: string) => {
    const nextKnown = knownTags.filter((k) => k !== tag)
    setKnownTags(nextKnown)
    onChange(value.filter((v) => v !== tag))
    await saveArticleFilterTags(nextKnown)
  }

  return (
    <div className="space-y-2">
      {/* 기존 태그 토글 */}
      {knownTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {knownTags.map((tag) => {
            const on = value.includes(tag)
            return (
              <span key={tag} className="flex items-center gap-0.5 group">
                <button
                  type="button"
                  onClick={() => toggle(tag)}
                  className={[
                    'px-3 py-1.5 rounded-l-full font-body text-xs transition-all',
                    on
                      ? 'bg-nwcn-green text-nwcn-text-default font-semibold'
                      : 'border border-white/15 text-white/40 hover:border-white/30 hover:text-white/70',
                  ].join(' ')}
                >
                  {tag}
                </button>
                <button
                  type="button"
                  onClick={() => removeKnown(tag)}
                  title={`"${tag}" 태그 삭제`}
                  className={[
                    'px-1.5 py-1.5 rounded-r-full font-body text-[10px] transition-all opacity-0 group-hover:opacity-100',
                    on
                      ? 'bg-nwcn-green/70 text-nwcn-text-default hover:bg-red-500 hover:text-white'
                      : 'border border-white/15 border-l-0 text-white/20 hover:text-red-400 hover:border-red-500/30',
                  ].join(' ')}
                >
                  ×
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* 새 태그 입력 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNew() } }}
          placeholder="새 태그 입력 후 Enter 또는 추가 버튼"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-body text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-nwcn-green/50 transition-colors"
        />
        <button
          type="button"
          onClick={addNew}
          disabled={!input.trim() || saving}
          className="px-4 py-2.5 border border-white/10 rounded-xl font-body text-sm text-white/50 hover:text-white hover:border-white/20 disabled:opacity-30 transition-colors whitespace-nowrap"
        >
          {saving ? '저장 중…' : '+ 추가'}
        </button>
      </div>

      {/* 선택된 태그 표시 */}
      {value.length > 0 && (
        <p className="font-body text-[11px] text-white/30">
          선택됨: {value.join(', ')}
        </p>
      )}
    </div>
  )
}

function ArticleForm({
  article,
  allArticles,
  articleTypes,
  typeLabels,
  onSuccess,
  onCancel,
}: {
  article: ArticleListItem | null
  allArticles: ArticleListItem[]
  articleTypes: ArticleType[]
  typeLabels: Record<string, string>
  onSuccess: () => void
  onCancel: () => void
}) {
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isPending, startTransition] = useLoadingTransition()
  const [selectedRelated, setSelectedRelated] = useState<string[]>(article?.related_ids ?? [])
  const [selectedTags, setSelectedTags] = useState<string[]>(article?.tags ?? [])
  const [relatedSearch, setRelatedSearch] = useState('')
  const thumbnailRef = useRef<File | null>(null)

  const [isFeatured, setIsFeatured] = useState<boolean>(article?.is_home_featured ?? false)
  const [featuredPending, setFeaturedPending] = useState(false)
  const [featuredErr, setFeaturedErr] = useState<string | null>(null)

  const handleToggleFeatured = async () => {
    if (!article) return
    setFeaturedErr(null)
    setFeaturedPending(true)
    try {
      const supabase = createClient()
      const next = !isFeatured
      if (next) {
        const { data: current, error: countErr } = await supabase
          .from('ncr_reports')
          .select('id')
          .eq('is_home_featured', true)
          .neq('id', article.id)
        if (countErr) { setFeaturedErr(`조회 실패: ${countErr.message}`); return }
        if (current && current.length >= 2) {
          setFeaturedErr('홈에는 최대 2개의 아티클만 고정할 수 있습니다.')
          return
        }
      }
      const { error } = await supabase
        .from('ncr_reports')
        .update({ is_home_featured: next })
        .eq('id', article.id)
      if (error) { setFeaturedErr(`설정 실패: ${error.message}`); return }
      setIsFeatured(next)
    } finally {
      setFeaturedPending(false)
    }
  }

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
    formData.set('tags', selectedTags.join(','))
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
      <div className="flex items-center justify-between">
        <h4 className="font-body font-semibold text-sm text-white">{article ? '아티클 수정' : '새 아티클 추가'}</h4>
        {article && (
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={handleToggleFeatured}
              disabled={featuredPending}
              title={isFeatured ? '홈 고정 해제' : '홈에 고정 (최대 2개)'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-medium transition-all disabled:opacity-50 ${
                isFeatured
                  ? 'bg-nwcn-green/20 border border-nwcn-green/40 text-nwcn-green'
                  : 'bg-white/5 border border-white/10 text-white/40 hover:text-nwcn-green hover:border-nwcn-green/30'
              }`}
            >
              {featuredPending ? (
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill={isFeatured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              )}
              홈 고정
            </button>
            {featuredErr && <p className="font-body text-[10px] text-red-400 max-w-[180px] text-right">{featuredErr}</p>}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>아티클 유형 *</Label>
            <Sel name="type" defaultValue={article?.type ?? articleTypes[0]?.value ?? 'editorial'} required>
              {articleTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Sel>
          </div>
          <div><Label>시즌</Label><Input name="season" defaultValue={article?.season ?? ''} placeholder="Season 3" /></div>
          <div><Label>발행일 *</Label><Input name="published_at" type="date" defaultValue={toDateVal(article?.published_at)} required /></div>
        </div>
        <div><Label>작성자</Label><Input name="author" defaultValue={article?.author ?? ''} placeholder="NCR 에디터팀" /></div>

        <LangTab
          koContent={
            <div className="space-y-4">
              <div><Label>제목 *</Label><Input name="title" defaultValue={article?.title ?? ''} placeholder="아티클 제목" required /></div>
              <div><Label>요약 설명</Label><Input name="excerpt" defaultValue={article?.excerpt ?? ''} placeholder="한 줄 요약 (목록에 표시)" /></div>
              <div>
                <Label>본문 내용 (마크다운 지원)</Label>
                <Textarea name="content" defaultValue={article?.content ?? ''} placeholder={"## 소제목\n\n본문 내용을 입력하세요..."} rows={10} />
              </div>
            </div>
          }
          enContent={
            <div className="space-y-4">
              <div><Label>Title (English)</Label><Input name="title_en" defaultValue={article?.title_en ?? ''} placeholder="Article title in English" /></div>
              <div><Label>Excerpt (English)</Label><Input name="excerpt_en" defaultValue={article?.excerpt_en ?? ''} placeholder="One-line summary in English" /></div>
              <div><Label>Description (English)</Label><Input name="description_en" defaultValue={article?.description_en ?? ''} placeholder="Short description in English" /></div>
              <div>
                <Label>Content (English, Markdown)</Label>
                <Textarea name="content_en" defaultValue={article?.content_en ?? ''} placeholder={"## Heading\n\nContent in English..."} rows={10} />
              </div>
            </div>
          }
        />

        <div>
          <Label>태그</Label>
          <TagPicker value={selectedTags} onChange={setSelectedTags} />
        </div>

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
                          {typeLabels[a.type] ?? a.type} · {a.season ?? '시즌 없음'} · {new Date(a.published_at).toLocaleDateString('ko-KR')}
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

function ArticleRow({ article, typeLabels, onRefresh, onEdit }: { article: ArticleListItem; typeLabels: Record<string, string>; onRefresh: () => void; onEdit: () => void }) {
  const [featuredPending, setFeaturedPending] = useState(false)
  const [featuredErr, setFeaturedErr] = useState<string | null>(null)

  const handleToggleFeatured = async () => {
    setFeaturedErr(null)
    setFeaturedPending(true)
    try {
      const supabase = createClient()
      const next = !article.is_home_featured
      if (next) {
        const { data: current, error: countErr } = await supabase
          .from('ncr_reports')
          .select('id')
          .eq('is_home_featured', true)
          .neq('id', article.id)
        if (countErr) { setFeaturedErr(`조회 실패: ${countErr.message}`); return }
        if (current && current.length >= 2) {
          setFeaturedErr('홈에는 최대 2개의 아티클만 고정할 수 있습니다. 먼저 다른 아티클의 고정을 해제해주세요.')
          return
        }
      }
      const { error } = await supabase
        .from('ncr_reports')
        .update({ is_home_featured: next })
        .eq('id', article.id)
      if (error) { setFeaturedErr(`설정 실패: ${error.message}`); return }
      onRefresh()
    } finally {
      setFeaturedPending(false)
    }
  }

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-body text-sm font-semibold text-white truncate">{article.title}</p>
            {article.title_en && (
              <span className="flex-shrink-0 px-1.5 py-0.5 bg-blue-500/15 border border-blue-500/25 rounded text-[10px] font-body text-blue-400">EN</span>
            )}
          </div>
          <p className="font-body text-xs text-white/30">
            {typeLabels[article.type] ?? article.type} · {article.season ?? '—'} · {new Date(article.published_at).toLocaleDateString('ko-KR')}
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

export default function ArticleTab() {
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [articleTypes, setArticleTypes] = useState<ArticleType[]>(DEFAULT_ARTICLE_TYPES)

  const { showLoading, hideLoading } = useLoading()

  // 유형 관리(설정)에서 등록한 아티클 유형 로드
  useEffect(() => {
    const supabase = createClient()
    supabase.from('settings').select('value').eq('key', 'article_types').maybeSingle()
      .then(({ data }) => {
        const val = data?.value
        if (Array.isArray(val) && val.length > 0) setArticleTypes(val as ArticleType[])
      })
  }, [])

  const typeLabels = buildTypeLabelMap(articleTypes)

  const fetchArticles = useCallback(async () => {
    showLoading()
    setLoadingList(true)
    setFetchError(null)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ncr_reports')
      .select('id, title, title_en, type, season, published_at, is_home_featured, author, excerpt, excerpt_en, description_en, content, content_en, tags, related_ids, thumbnail_url')
      .order('published_at', { ascending: false })
      .limit(50)
    if (error) {
      console.error('[ArticleTab] fetch error:', error)
      setFetchError(`데이터 조회 오류: ${error.message}`)
    }
    setArticles((data ?? []) as ArticleListItem[])
    setLoadingList(false)
    hideLoading()
  }, [showLoading, hideLoading])

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
        <ArticleForm article={editingArticle} allArticles={articles} articleTypes={articleTypes} typeLabels={typeLabels} onSuccess={handleSuccess} onCancel={handleClose} />
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
              typeLabels={typeLabels}
              onRefresh={fetchArticles}
              onEdit={() => { setShowForm(false); setEditingId(a.id) }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
