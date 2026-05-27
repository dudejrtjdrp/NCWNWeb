/**
 * Admin 페이지: /admin
 * Supabase Auth로 보호됨 (middleware에서 미인증 시 /admin/login으로 리다이렉트)
 *
 * 각 폼의 handleSubmit이 Server Action을 실제로 호출:
 * - WorkUploadForm    → saveWork    → showcase_works + work-thumbnails Storage
 * - ArticleUploadForm → saveArticle → ncr_reports + ncr-thumbnails Storage
 * - AwardsUploadForm  → saveAward   → awards + ninc-images/awards Storage
 * - ProjectUploadForm → saveProject → projects + ninc-images/projects Storage
 */

'use client'

import { useState, useRef, useTransition } from 'react'
import { saveWork, saveArticle, saveAward, saveProject, signOut, type ActionResult } from './actions'

// ── 타입 ──────────────────────────────────────────────────
type Tab = 'work' | 'article' | 'awards' | 'project'
type WorkType = 'design' | 'video' | '3d'
type ArticleType = 'editorial' | 'trend' | 'card_news'

// ── 간단 UI 컴포넌트 ───────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block font-body text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">{children}</label>
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

function Sel({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
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
  multiple = false,
  onFiles,
}: {
  accept: string
  label: string
  multiple?: boolean
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
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={handleChange} />
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
            <p className="font-body text-xs text-white/20">클릭하거나 파일을 드래그하세요</p>
          </>
        )}
      </div>
    </div>
  )
}

// 결과 피드백 컴포넌트
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

function SubmitButton({ loading }: { loading: boolean }) {
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
          저장하기
        </>
      )}
    </button>
  )
}

// ── Work 업로드 폼 ─────────────────────────────────────────
function WorkUploadForm() {
  const [workType, setWorkType] = useState<WorkType>('design')
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const thumbnailRef = useRef<File | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (thumbnailRef.current) formData.set('thumbnail', thumbnailRef.current)

    setResult(null)
    startTransition(async () => {
      const res = await saveWork(null, formData)
      setResult(res)
      if ('success' in res) {
        (e.target as HTMLFormElement).reset()
        thumbnailRef.current = null
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 작업물 타입 선택 */}
      <div>
        <Label>작업물 타입 *</Label>
        <div className="grid grid-cols-3 gap-3">
          {(['design', 'video', '3d'] as WorkType[]).map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => setWorkType(type)}
              className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${
                workType === type
                  ? 'border-nwcn-green bg-nwcn-green/10 text-nwcn-green'
                  : 'border-white/10 text-white/40 hover:border-white/20'
              }`}
            >
              {type === 'design' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>}
              {type === 'video'  && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>}
              {type === '3d'     && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>}
              <span className="font-body text-xs font-semibold uppercase">
                {type === 'design' ? '디자인' : type === 'video' ? '영상' : '3D'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>작품명 *</Label><Input name="title" placeholder="작품 제목을 입력하세요" required /></div>
        <div><Label>작가명 *</Label><Input name="author" placeholder="작가/학생 이름" required /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>제작 연도 *</Label><Input name="year" type="number" placeholder="2025" defaultValue={new Date().getFullYear()} required /></div>
        <div><Label>기술 스택 (쉼표로 구분)</Label><Input name="tech_stack" placeholder="예: Video, Motion, AI" /></div>
      </div>
      <div><Label>작품 설명</Label><Textarea name="description" placeholder="작품에 대한 설명을 입력하세요..." rows={4} /></div>

      {workType === 'video' && (
        <div><Label>영상 임베드 URL</Label><Input name="video_url" placeholder="YouTube/Vimeo 임베드 URL" /></div>
      )}
      {workType === '3d' && (
        <div><Label>3D 뷰어 임베드 URL</Label><Input name="model_url" placeholder="Sketchfab 임베드 URL" /></div>
      )}

      <div>
        <Label>썸네일 이미지</Label>
        <FileDropZone
          accept="image/*"
          label="대표 썸네일 이미지 (권장: 4:3 비율)"
          onFiles={(files) => { thumbnailRef.current = files[0] }}
        />
      </div>

      <Feedback result={result} />
      <SubmitButton loading={isPending} />
    </form>
  )
}

// ── Article 업로드 폼 ──────────────────────────────────────
function ArticleUploadForm() {
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const thumbnailRef = useRef<File | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (thumbnailRef.current) formData.set('thumbnail', thumbnailRef.current)

    setResult(null)
    startTransition(async () => {
      const res = await saveArticle(null, formData)
      setResult(res)
      if ('success' in res) {
        (e.target as HTMLFormElement).reset()
        thumbnailRef.current = null
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>제목 *</Label><Input name="title" placeholder="아티클 제목" required /></div>
        <div><Label>작성자</Label><Input name="author" placeholder="NCR 에디터팀" /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>아티클 유형 *</Label>
          <Sel name="type" required>
            <option value="editorial">에디토리얼</option>
            <option value="trend">트렌드</option>
            <option value="card_news">카드뉴스</option>
          </Sel>
        </div>
        <div><Label>시즌</Label><Input name="season" placeholder="예: Season 3" /></div>
        <div><Label>발행일 *</Label><Input name="published_at" type="date" required /></div>
      </div>
      <div><Label>요약 설명</Label><Input name="excerpt" placeholder="한 줄 요약 (목록에서 보여지는 설명)" /></div>
      <div><Label>본문 내용 (마크다운 지원: ## 헤더)</Label><Textarea name="content" placeholder={"## 소제목\n\n본문 내용을 입력하세요..."} rows={12} /></div>
      <div><Label>태그 (쉼표로 구분)</Label><Input name="tags" placeholder="예: AI, 미디어, 콘텐츠산업" /></div>
      <div>
        <Label>썸네일 이미지</Label>
        <FileDropZone
          accept="image/*"
          label="아티클 대표 이미지 (권장: 16:9 비율)"
          onFiles={(files) => { thumbnailRef.current = files[0] }}
        />
      </div>
      <Feedback result={result} />
      <SubmitButton loading={isPending} />
    </form>
  )
}

// ── Awards 등록 폼 ─────────────────────────────────────────
function AwardsUploadForm() {
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const thumbnailRef = useRef<File | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (thumbnailRef.current) formData.set('thumbnail', thumbnailRef.current)

    setResult(null)
    startTransition(async () => {
      const res = await saveAward(null, formData)
      setResult(res)
      if ('success' in res) {
        (e.target as HTMLFormElement).reset()
        thumbnailRef.current = null
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>대회명 *</Label><Input name="competition" placeholder="대한민국 광고대상" required /></div>
        <div>
          <Label>수상 등급 *</Label>
          <Sel name="award_name" required>
            <option value="">선택하세요</option>
            <option value="대상">대상</option>
            <option value="금상">금상</option>
            <option value="최우수상">최우수상</option>
            <option value="우수상">우수상</option>
            <option value="장려상">장려상</option>
            <option value="특별상">특별상</option>
          </Sel>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><Label>대표 수상자</Label><Input name="winner" placeholder="홍길동" /></div>
        <div><Label>팀원 (쉼표로 구분)</Label><Input name="team_members" placeholder="홍길동, 이영희" /></div>
        <div><Label>수상 연도 *</Label><Input name="year" type="number" placeholder="2025" defaultValue={new Date().getFullYear()} required /></div>
      </div>
      <div><Label>수상 설명</Label><Textarea name="description" placeholder="수상 배경 및 작품 소개..." rows={5} /></div>
      <div>
        <Label>수상 관련 이미지</Label>
        <FileDropZone
          accept="image/*"
          label="시상식 사진 또는 작품 이미지"
          onFiles={(files) => { thumbnailRef.current = files[0] }}
        />
      </div>
      <Feedback result={result} />
      <SubmitButton loading={isPending} />
    </form>
  )
}

// ── Project 등록 폼 ────────────────────────────────────────
function ProjectUploadForm() {
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const thumbnailRef = useRef<File | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (thumbnailRef.current) formData.set('thumbnail', thumbnailRef.current)

    setResult(null)
    startTransition(async () => {
      const res = await saveProject(null, formData)
      setResult(res)
      if ('success' in res) {
        (e.target as HTMLFormElement).reset()
        thumbnailRef.current = null
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>프로젝트명 *</Label><Input name="title" placeholder="○○ 기업 브랜드 영상 제작" required /></div>
        <div>
          <Label>유형 *</Label>
          <Sel name="type" required>
            <option value="industry">산학협력</option>
            <option value="international">해외교류</option>
          </Sel>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><Label>파트너 기관</Label><Input name="partner" placeholder="○○ 주식회사" /></div>
        <div><Label>연도 *</Label><Input name="year" type="number" placeholder="2025" defaultValue={new Date().getFullYear()} required /></div>
        <div><Label>기간</Label><Input name="duration" placeholder="2025.03 – 2025.06" /></div>
      </div>
      <div><Label>프로젝트 설명</Label><Textarea name="description" placeholder="프로젝트 배경 및 진행 내용..." rows={5} /></div>
      <div>
        <Label>프로젝트 이미지</Label>
        <FileDropZone
          accept="image/*"
          label="프로젝트 관련 사진"
          onFiles={(files) => { thumbnailRef.current = files[0] }}
        />
      </div>
      <Feedback result={result} />
      <SubmitButton loading={isPending} />
    </form>
  )
}

// ── 메인 Admin 페이지 ──────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('work')
  const [signingOut, startSignOut] = useTransition()

  const handleSignOut = () => {
    startSignOut(async () => { await signOut() })
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      key: 'work', label: '작업물 등록', desc: '디자인, 영상, 3D 작업물을 업로드합니다',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
    },
    {
      key: 'article', label: 'NCR 아티클', desc: 'NCR Trend 아티클을 작성하고 발행합니다',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    },
    {
      key: 'awards', label: '수상 등록', desc: '수상 내역을 등록합니다',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>,
    },
    {
      key: 'project', label: '프로젝트 등록', desc: '산학협력·해외교류 프로젝트를 등록합니다',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>,
    },
  ]

  const activeTab = TABS.find((t) => t.key === tab)!

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* ── 상단 헤더 ── */}
      <header className="border-b border-white/10 bg-[#0f0f0f]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px] h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-brand text-xl text-nwcn-green">NWCN</span>
            <span className="font-body text-xs text-white/20 px-2 py-0.5 border border-white/10 rounded-full">ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 font-body text-xs text-white/30 hover:text-white/60 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              사이트 보기
            </a>
            {/* 로그아웃 */}
            <button
              onClick={handleSignOut}
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
        {/* 페이지 타이틀 */}
        <div className="mb-10">
          <h1 className="font-body font-bold text-[28px] text-white mb-2">콘텐츠 관리</h1>
          <p className="font-body text-sm text-white/30">
            작업물, 아티클, 수상, 프로젝트 콘텐츠를 등록하고 관리합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ── 사이드 탭 네비게이션 ── */}
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

            {/* 안내 박스 */}
            <div className="mt-8 p-4 rounded-xl border border-white/8 bg-white/3">
              <div className="flex items-start gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#09F593" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="font-body text-xs text-white/40 leading-relaxed">
                  저장 후 해당 페이지에 즉시 반영됩니다. NCR 아티클은 홈 화면에도 자동 업데이트됩니다.
                </p>
              </div>
            </div>
          </aside>

          {/* ── 폼 영역 ── */}
          <div className="lg:col-span-3">
            <div className="bg-white/3 border border-white/8 rounded-2xl p-8">
              {/* 섹션 헤더 */}
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

              {/* 폼 컨텐츠 */}
              {tab === 'work'    && <WorkUploadForm />}
              {tab === 'article' && <ArticleUploadForm />}
              {tab === 'awards'  && <AwardsUploadForm />}
              {tab === 'project' && <ProjectUploadForm />}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
