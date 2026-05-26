/**
 * Work 세부 페이지: /work/[id]
 * 작업물 타입에 따라 3가지 템플릿을 렌더링합니다.
 * - design: 이미지 갤러리 형식
 * - video: 비디오 플레이어 형식
 * - 3d: 3D 뷰어 형식 (iframe 임베드)
 *
 * 서버 연결 전까지 정적 mock 데이터 사용.
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import SubPageLayout from '@/components/layout/SubPageLayout'
import Badge from '@/components/ui/Badge'
import { useParams, notFound } from 'next/navigation'

// ── 작업물 타입 ────────────────────────────────────────────
type WorkType = 'design' | 'video' | '3d'

interface WorkItem {
  id: string
  title: string
  author: string
  year: number
  description: string
  type: WorkType
  tech_stack: string[]
  view_count: number
  thumbnail_url: string | null
  // design 전용
  images?: string[]
  // video 전용
  video_url?: string
  video_embed?: string  // iframe src (유튜브, 비메오 등)
  // 3d 전용
  model_embed?: string  // Sketchfab 등 iframe src
  model_url?: string
}

// ── Mock 데이터 ────────────────────────────────────────────
const WORKS: WorkItem[] = [
  {
    id: '1',
    title: '빛의 도시',
    author: '김민준',
    year: 2025,
    description: '도시의 빛과 그림자를 테마로 한 단편 영상 작품입니다. 어두운 도시 풍경 속에서 빛이 가진 희망의 메시지를 시각적으로 담아냈습니다. 드론 촬영과 타임랩스 기법을 결합하여 도시의 낮과 밤을 역동적으로 표현하였습니다.',
    type: 'video',
    tech_stack: ['Video', 'Motion'],
    view_count: 342,
    thumbnail_url: null,
    video_embed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '2',
    title: 'Digital Fragments',
    author: '이서연',
    year: 2025,
    description: '디지털 세계와 물리 세계의 경계를 탐구하는 그래픽 디자인 시리즈입니다. 픽셀과 기하학적 형태를 활용하여 현대인의 분절된 정체성을 표현하였습니다.',
    type: 'design',
    tech_stack: ['Graphic', 'AI'],
    view_count: 218,
    thumbnail_url: null,
    images: [null, null, null, null, null, null] as any,
  },
  {
    id: '3',
    title: '도시의 소리',
    author: '박태양',
    year: 2025,
    description: '도시 공간의 사운드스케이프를 시각화한 인터랙티브 웹 프로젝트입니다. 사용자가 소리를 통해 도시를 새롭게 경험할 수 있도록 설계되었습니다.',
    type: 'video',
    tech_stack: ['Web', 'Video'],
    view_count: 189,
    thumbnail_url: null,
    video_embed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '4',
    title: 'Metamorphosis',
    author: '최지우',
    year: 2024,
    description: '변태(Metamorphosis)를 주제로 한 3D 애니메이션 작품입니다. 블렌더를 활용하여 생명체의 변화 과정을 추상적으로 표현하였습니다. 유기적인 형태와 역동적인 움직임이 특징입니다.',
    type: '3d',
    tech_stack: ['Motion', 'Graphic'],
    view_count: 156,
    thumbnail_url: null,
    model_embed: 'https://sketchfab.com/models/dGtzXf5MhE54a8RgPi34Kw/embed',
  },
  {
    id: '5',
    title: '연결의 언어',
    author: '정하늘',
    year: 2024,
    description: '사람과 사람 사이의 연결을 시각 언어로 표현한 그래픽 포스터 시리즈입니다. 타이포그래피와 일러스트레이션을 결합하여 소통의 의미를 탐구합니다.',
    type: 'design',
    tech_stack: ['Web', 'AI'],
    view_count: 134,
    thumbnail_url: null,
    images: [null, null, null, null] as any,
  },
  {
    id: '6',
    title: 'Still Life 2024',
    author: '윤채원',
    year: 2024,
    description: '정물 사진 시리즈입니다. 일상적인 사물들을 새로운 시각으로 포착하여 평범한 것들의 아름다움을 발견합니다.',
    type: 'design',
    tech_stack: ['Photo'],
    view_count: 98,
    thumbnail_url: null,
    images: [null, null, null] as any,
  },
]

// ── 타입별 뷰어 컴포넌트 ───────────────────────────────────

function VideoViewer({ embed, title }: { embed?: string; title: string }) {
  return (
    <div className="w-full">
      {embed ? (
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
          <iframe
            src={embed}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="aspect-video w-full rounded-2xl bg-nwcn-dark flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 opacity-40">
            <div className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
            <span className="font-body text-sm text-white/50">영상을 준비 중입니다</span>
          </div>
        </div>
      )}
    </div>
  )
}

function DesignViewer({ images, title }: { images?: (string | null)[]; title: string }) {
  const [selected, setSelected] = useState(0)
  const imageList = images ?? []

  return (
    <div className="w-full space-y-4">
      {/* 메인 이미지 */}
      <div className="aspect-[4/3] w-full rounded-2xl bg-[#efefef] overflow-hidden flex items-center justify-center">
        {imageList[selected] ? (
          <Image src={imageList[selected]!} alt={`${title} ${selected + 1}`} fill className="object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-3 opacity-30">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#323131" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="font-body text-sm text-nwcn-text-sub">이미지 {selected + 1}</span>
          </div>
        )}
      </div>

      {/* 썸네일 그리드 */}
      {imageList.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {imageList.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`aspect-square rounded-lg overflow-hidden bg-[#efefef] border-2 transition-all ${
                selected === i ? 'border-nwcn-text-default' : 'border-transparent hover:border-nwcn-text-sub/40'
              }`}
            >
              {img ? (
                <Image src={img} alt={`thumb ${i + 1}`} width={80} height={80} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-body text-[10px] text-nwcn-text-sub">{i + 1}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ThreeDViewer({ embed, title }: { embed?: string; title: string }) {
  return (
    <div className="w-full">
      {embed ? (
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-nwcn-dark">
          <iframe
            title={title}
            src={embed}
            className="w-full h-full"
            allow="autoplay; fullscreen; xr-spatial-tracking"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="aspect-video w-full rounded-2xl bg-nwcn-dark flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 opacity-40">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span className="font-body text-sm text-white/50">3D 모델을 준비 중입니다</span>
          </div>
        </div>
      )}
      <p className="font-body text-xs text-nwcn-text-sub mt-3 text-center">
        마우스로 드래그하여 3D 모델을 회전할 수 있습니다
      </p>
    </div>
  )
}

const TYPE_LABEL: Record<WorkType, string> = {
  design: '디자인',
  video: '영상',
  '3d': '3D',
}

const TYPE_ICON: Record<WorkType, React.ReactNode> = {
  design: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  video: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  ),
  '3d': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
}

// ── 페이지 컴포넌트 ────────────────────────────────────────
export default function WorkDetailPage() {
  const params = useParams()
  const work = WORKS.find((w) => w.id === params.id)
  if (!work) notFound()

  return (
    <SubPageLayout>
      {/* ── 히어로 헤더 (다크) ── */}
      <div className="bg-nwcn-dark pt-[80px] pb-0">
        <div className="page-container pt-12 pb-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-body text-white/30 mb-8">
            <Link href="/work/showcase" className="hover:text-white/60 transition-colors">
              WORK
            </Link>
            <span>/</span>
            <span className="flex items-center gap-1.5 text-white/50">
              {TYPE_ICON[work.type]}
              {TYPE_LABEL[work.type]}
            </span>
          </nav>

          {/* 타입 배지 */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
              <span className="text-white/70">{TYPE_ICON[work.type]}</span>
              <span className="font-body text-sm text-white/70">{TYPE_LABEL[work.type]}</span>
            </div>
            {work.tech_stack.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>

          {/* 제목 */}
          <h1 className="font-body font-bold text-[32px] md:text-[48px] text-white leading-tight mb-3">
            {work.title}
          </h1>

          {/* 작가 · 연도 */}
          <p className="font-body text-[15px] text-white/40 mb-10">
            {work.author} · {work.year}
          </p>
        </div>
        <div className="border-b border-white/10" />
      </div>

      {/* ── 작업물 뷰어 + 정보 ── */}
      <div className="bg-nwcn-dark py-12">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── 뷰어 (좌) ── */}
            <div className="lg:col-span-2">
              {work.type === 'video' && (
                <VideoViewer embed={work.video_embed} title={work.title} />
              )}
              {work.type === 'design' && (
                <DesignViewer images={work.images} title={work.title} />
              )}
              {work.type === '3d' && (
                <ThreeDViewer embed={work.model_embed} title={work.title} />
              )}
            </div>

            {/* ── 정보 사이드바 (우) ── */}
            <aside className="lg:col-span-1">
              <div className="space-y-6 sticky top-24">
                {/* 작품 설명 */}
                <div>
                  <p className="font-body text-xs text-white/30 uppercase tracking-wider mb-3">작품 소개</p>
                  <p className="font-body text-[14px] text-white/60 leading-relaxed">
                    {work.description}
                  </p>
                </div>

                {/* 구분선 */}
                <div className="border-t border-white/10" />

                {/* 작가 정보 */}
                <div>
                  <p className="font-body text-xs text-white/30 uppercase tracking-wider mb-3">작가</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-nwcn-green/15 flex items-center justify-center flex-shrink-0">
                      <span className="font-body text-sm font-semibold text-nwcn-green">
                        {work.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-body text-sm text-white">{work.author}</p>
                      <p className="font-body text-xs text-white/30">{work.year}년 작품</p>
                    </div>
                  </div>
                </div>

                {/* 구분선 */}
                <div className="border-t border-white/10" />

                {/* 기술 스택 */}
                <div>
                  <p className="font-body text-xs text-white/30 uppercase tracking-wider mb-3">사용 도구 / 기술</p>
                  <div className="flex flex-wrap gap-2">
                    {work.tech_stack.map((tag) => (
                      <span key={tag} className="font-body text-xs px-3 py-1.5 border border-white/20 text-white/60 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 구분선 */}
                <div className="border-t border-white/10" />

                {/* 조회수 */}
                <div className="flex items-center gap-2 text-white/30">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span className="font-body text-xs">{work.view_count.toLocaleString()} 조회</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* ── 하단 네비게이션 ── */}
      <div className="bg-nwcn-dark border-t border-white/10 py-8">
        <div className="page-container flex justify-between items-center">
          <Link
            href="/work/showcase"
            className="flex items-center gap-2 font-body text-sm text-white/40 hover:text-white/70 transition-colors group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            작품 목록으로
          </Link>
        </div>
      </div>
    </SubPageLayout>
  )
}
