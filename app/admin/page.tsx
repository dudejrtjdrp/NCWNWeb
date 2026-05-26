/**
 * Admin 페이지: /admin
 * 작업물(Work)과 아티클(NCR Trend) 업로드 관리 UI.
 * 서버 연결 전 UI Only — 실제 저장 로직은 서버 연결 후 구현.
 */

'use client'

import { useState, useRef } from 'react'

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

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
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

function SubmitButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-nwcn-green text-nwcn-text-default font-body font-semibold text-sm py-4 rounded-xl transition-all hover:bg-nwcn-green-dark disabled:opacity-50 disabled:cursor-not-allowed"
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
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    title: '',
    author: '',
    year: new Date().getFullYear().toString(),
    description: '',
    tech_stack: '',
    video_url: '',
    model_url: '',
  })

  const handleSubmit = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* 작업물 타입 선택 */}
      <div>
        <Label>작업물 타입 *</Label>
        <div className="grid grid-cols-3 gap-3">
          {(['design', 'video', '3d'] as WorkType[]).map((type) => (
            <button
              key={type}
              onClick={() => setWorkType(type)}
              className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${
                workType === type
                  ? 'border-nwcn-green bg-nwcn-green/10 text-nwcn-green'
                  : 'border-white/10 text-white/40 hover:border-white/20'
              }`}
            >
              {type === 'design' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              )}
              {type === 'video' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" />
                </svg>
              )}
              {type === '3d' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              )}
              <span className="font-body text-xs font-semibold uppercase">
                {type === 'design' ? '디자인' : type === 'video' ? '영상' : '3D'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 공통 필드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>작품명 *</Label>
          <Input placeholder="작품 제목을 입력하세요" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <Label>작가명 *</Label>
          <Input placeholder="작가/학생 이름" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>제작 연도 *</Label>
          <Input type="number" placeholder="2025" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
        </div>
        <div>
          <Label>기술 스택 (쉼표로 구분)</Label>
          <Input placeholder="예: Video, Motion, AI" value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} />
        </div>
      </div>

      <div>
        <Label>작품 설명</Label>
        <Textarea placeholder="작품에 대한 설명을 입력하세요..." rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      {/* 타입별 추가 필드 */}
      {workType === 'design' && (
        <div>
          <Label>이미지 파일 (여러 장 가능)</Label>
          <FileDropZone accept="image/*" label="JPG, PNG, GIF, WebP 파일" multiple />
        </div>
      )}

      {workType === 'video' && (
        <div className="space-y-4">
          <div>
            <Label>영상 파일 또는 임베드 URL</Label>
            <Input placeholder="YouTube/Vimeo 임베드 URL (예: https://www.youtube.com/embed/...)" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
          </div>
          <div>
            <Label>또는 영상 파일 업로드</Label>
            <FileDropZone accept="video/*" label="MP4, MOV, AVI 파일" />
          </div>
        </div>
      )}

      {workType === '3d' && (
        <div className="space-y-4">
          <div>
            <Label>3D 뷰어 임베드 URL</Label>
            <Input placeholder="Sketchfab 임베드 URL (예: https://sketchfab.com/models/...)" value={form.model_url} onChange={(e) => setForm({ ...form, model_url: e.target.value })} />
          </div>
          <div>
            <Label>또는 3D 파일 업로드</Label>
            <FileDropZone accept=".glb,.gltf,.obj,.fbx,.stl" label="GLB, GLTF, OBJ, FBX, STL 파일" />
          </div>
        </div>
      )}

      {/* 썸네일 */}
      <div>
        <Label>썸네일 이미지</Label>
        <FileDropZone accept="image/*" label="대표 썸네일 이미지 (권장: 4:3 비율)" />
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-nwcn-green/10 border border-nwcn-green/30 rounded-xl p-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#09F593" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <p className="font-body text-sm text-nwcn-green">저장이 완료되었습니다! (서버 연결 후 실제 저장됩니다)</p>
        </div>
      )}

      <SubmitButton loading={loading} onClick={handleSubmit} />
    </div>
  )
}

// ── Article 업로드 폼 ──────────────────────────────────────
function ArticleUploadForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    title: '',
    author: '',
    type: 'editorial' as ArticleType,
    season: '',
    published_at: '',
    description: '',
    content: '',
    tags: '',
  })

  const handleSubmit = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>제목 *</Label>
          <Input placeholder="아티클 제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <Label>작성자 *</Label>
          <Input placeholder="NCR 에디터팀" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>아티클 유형 *</Label>
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ArticleType })}>
            <option value="editorial">에디토리얼</option>
            <option value="trend">트렌드</option>
            <option value="card_news">카드뉴스</option>
          </Select>
        </div>
        <div>
          <Label>시즌</Label>
          <Input placeholder="예: Season 3" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} />
        </div>
        <div>
          <Label>발행일 *</Label>
          <Input type="date" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} />
        </div>
      </div>

      <div>
        <Label>요약 설명</Label>
        <Input placeholder="한 줄 요약 (목록에서 보여지는 설명)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      <div>
        <Label>본문 내용 (마크다운 지원: ## 헤더)</Label>
        <Textarea
          placeholder="## 소제목&#10;&#10;본문 내용을 입력하세요..."
          rows={12}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
      </div>

      <div>
        <Label>태그 (쉼표로 구분)</Label>
        <Input placeholder="예: AI, 미디어, 콘텐츠산업" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
      </div>

      <div>
        <Label>썸네일 이미지</Label>
        <FileDropZone accept="image/*" label="아티클 대표 이미지 (권장: 16:9 비율)" />
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-nwcn-green/10 border border-nwcn-green/30 rounded-xl p-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#09F593" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <p className="font-body text-sm text-nwcn-green">저장이 완료되었습니다! (서버 연결 후 실제 저장됩니다)</p>
        </div>
      )}

      <SubmitButton loading={loading} onClick={handleSubmit} />
    </div>
  )
}

// ── Awards 등록 폼 ─────────────────────────────────────────
function AwardsUploadForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    competition: '',
    award_name: '',
    winner: '',
    team_members: '',
    year: new Date().getFullYear().toString(),
    category: '',
    hosted_by: '',
    description: '',
  })

  const handleSubmit = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>대회명 *</Label>
          <Input placeholder="대한민국 광고대상" value={form.competition} onChange={(e) => setForm({ ...form, competition: e.target.value })} />
        </div>
        <div>
          <Label>수상 등급 *</Label>
          <Select value={form.award_name} onChange={(e) => setForm({ ...form, award_name: e.target.value })}>
            <option value="">선택하세요</option>
            <option value="대상">대상</option>
            <option value="금상">금상</option>
            <option value="최우수상">최우수상</option>
            <option value="우수상">우수상</option>
            <option value="장려상">장려상</option>
            <option value="특별상">특별상</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>대표 수상자 *</Label>
          <Input placeholder="홍길동" value={form.winner} onChange={(e) => setForm({ ...form, winner: e.target.value })} />
        </div>
        <div>
          <Label>팀원 (쉼표로 구분)</Label>
          <Input placeholder="홍길동, 이영희" value={form.team_members} onChange={(e) => setForm({ ...form, team_members: e.target.value })} />
        </div>
        <div>
          <Label>수상 연도 *</Label>
          <Input type="number" placeholder="2025" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>분야</Label>
          <Input placeholder="예: 광고, 영상, 미디어아트" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <div>
          <Label>주최 기관</Label>
          <Input placeholder="한국광고총연합회" value={form.hosted_by} onChange={(e) => setForm({ ...form, hosted_by: e.target.value })} />
        </div>
      </div>

      <div>
        <Label>수상 설명</Label>
        <Textarea placeholder="수상 배경 및 작품 소개..." rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      <div>
        <Label>수상 관련 이미지</Label>
        <FileDropZone accept="image/*" label="시상식 사진 또는 작품 이미지" multiple />
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-nwcn-green/10 border border-nwcn-green/30 rounded-xl p-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#09F593" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <p className="font-body text-sm text-nwcn-green">저장이 완료되었습니다! (서버 연결 후 실제 저장됩니다)</p>
        </div>
      )}

      <SubmitButton loading={loading} onClick={handleSubmit} />
    </div>
  )
}

// ── Project 등록 폼 ────────────────────────────────────────
function ProjectUploadForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    title: '',
    type: 'industry' as 'industry' | 'international',
    partner: '',
    year: new Date().getFullYear().toString(),
    duration: '',
    participants: '',
    skills: '',
    description: '',
    outcome: '',
  })

  const handleSubmit = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>프로젝트명 *</Label>
          <Input placeholder="○○ 기업 브랜드 영상 제작" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <Label>유형 *</Label>
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}>
            <option value="industry">산학협력</option>
            <option value="international">해외교류</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>파트너 기관 *</Label>
          <Input placeholder="○○ 주식회사" value={form.partner} onChange={(e) => setForm({ ...form, partner: e.target.value })} />
        </div>
        <div>
          <Label>연도 *</Label>
          <Input type="number" placeholder="2025" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
        </div>
        <div>
          <Label>기간</Label>
          <Input placeholder="2025.03 – 2025.06" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>참여 학생 (쉼표로 구분)</Label>
          <Input placeholder="홍길동, 이영희" value={form.participants} onChange={(e) => setForm({ ...form, participants: e.target.value })} />
        </div>
        <div>
          <Label>활용 기술/역량 (쉼표로 구분)</Label>
          <Input placeholder="영상 기획, 촬영, 편집" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        </div>
      </div>

      <div>
        <Label>프로젝트 설명 *</Label>
        <Textarea placeholder="프로젝트 배경 및 진행 내용..." rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      <div>
        <Label>결과물 / 성과</Label>
        <Input placeholder="기업 공식 유튜브 채널 업로드 및 사내 행사 활용" value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} />
      </div>

      <div>
        <Label>프로젝트 이미지</Label>
        <FileDropZone accept="image/*" label="프로젝트 관련 사진" multiple />
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-nwcn-green/10 border border-nwcn-green/30 rounded-xl p-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#09F593" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <p className="font-body text-sm text-nwcn-green">저장이 완료되었습니다! (서버 연결 후 실제 저장됩니다)</p>
        </div>
      )}

      <SubmitButton loading={loading} onClick={handleSubmit} />
    </div>
  )
}

// ── 메인 Admin 페이지 ──────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('work')

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'work',
      label: '작업물 등록',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
    },
    {
      key: 'article',
      label: 'NCR 아티클',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      key: 'awards',
      label: '수상 등록',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      ),
    },
    {
      key: 'project',
      label: '프로젝트 등록',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* ── 상단 헤더 ── */}
      <header className="border-b border-white/10 bg-[#0f0f0f]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px] h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-brand text-xl text-nwcn-green">NWCN</span>
            <span className="font-body text-xs text-white/20 px-2 py-0.5 border border-white/10 rounded-full">
              ADMIN
            </span>
          </div>
          <a
            href="/"
            className="flex items-center gap-2 font-body text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            사이트로 돌아가기
          </a>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px] py-12">
        {/* 페이지 타이틀 */}
        <div className="mb-10">
          <h1 className="font-body font-bold text-[28px] text-white mb-2">콘텐츠 관리</h1>
          <p className="font-body text-sm text-white/30">
            작업물, 아티클, 수상, 프로젝트 콘텐츠를 등록하고 관리합니다.
            <span className="ml-2 text-nwcn-green/60">서버 연결 전 UI 미리보기</span>
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
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div>
                  <p className="font-body text-xs text-white/40 leading-relaxed">
                    서버 연결 후 실제 데이터가 저장됩니다. 현재는 UI 미리보기 상태입니다.
                  </p>
                </div>
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
                    {TABS.find((t) => t.key === tab)?.icon}
                  </div>
                  <div>
                    <h2 className="font-body font-bold text-[18px] text-white">
                      {TABS.find((t) => t.key === tab)?.label}
                    </h2>
                    <p className="font-body text-xs text-white/30">
                      {tab === 'work' && '디자인, 영상, 3D 작업물을 업로드합니다'}
                      {tab === 'article' && 'NCR Trend 아티클을 작성하고 발행합니다'}
                      {tab === 'awards' && '수상 내역을 등록합니다'}
                      {tab === 'project' && '산학협력·해외교류 프로젝트를 등록합니다'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 폼 컨텐츠 */}
              {tab === 'work' && <WorkUploadForm />}
              {tab === 'article' && <ArticleUploadForm />}
              {tab === 'awards' && <AwardsUploadForm />}
              {tab === 'project' && <ProjectUploadForm />}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
