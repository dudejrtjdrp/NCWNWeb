/**
 * Work 세부 페이지: /work/[id]
 * 작업물 타입에 따라 3가지 템플릿을 렌더링합니다.
 * - design: 이미지 갤러리 형식
 * - video: 비디오 플레이어 형식
 * - 3d: 3D 뷰어 형식 (iframe 임베드)
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import SubPageLayout from '@/components/layout/SubPageLayout'
import Badge from '@/components/ui/Badge'
import { notFound } from 'next/navigation'
import { getWorkById, type WorkType } from '@/lib/supabase/queries/works'
import { getTranslations } from 'next-intl/server'
import DesignViewer from './DesignViewer'
import ViewCountTracker from './ViewCountTracker'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ncwn-web.vercel.app'

/** 동적 메타데이터 — 쇼케이스 작품 상세 */
export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }): Promise<Metadata> {
  const { id } = await params
  const work = await getWorkById(id)
  if (!work) return { title: '작품을 찾을 수 없습니다' }

  const title = work.title
  const description =
    work.description ??
    `${work.year}년 뉴미디어콘텐츠과 학생 ${work.author}의 작품 "${work.title}"입니다.`
  const url = `${SITE_URL}/work/${work.id}`

  return {
    title,
    description,
    keywords: [
      '뉴미디어콘텐츠과',
      '쇼케이스',
      work.author,
      String(work.year),
      ...(work.tech_stack ?? []),
    ].filter(Boolean),
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      locale: 'ko_KR',
      siteName: 'NWCN',
      images: work.thumbnail_url ? [{ url: work.thumbnail_url, alt: title }] : undefined,
    },
  }
}

// ── 뷰어 컴포넌트 ─────────────────────────────────────────

function VideoViewer({ embed, title, placeholder }: { embed?: string | null; title: string; placeholder: string }) {
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
            <span className="font-body text-sm text-white/50">{placeholder}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function ThreeDViewer({ embed, title, placeholder, hint }: { embed?: string | null; title: string; placeholder: string; hint: string }) {
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
            <span className="font-body text-sm text-white/50">{placeholder}</span>
          </div>
        </div>
      )}
      <p className="font-body text-xs text-nwcn-text-sub mt-3 text-center">
        {hint}
      </p>
    </div>
  )
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

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { id, locale } = await params
  const work = await getWorkById(id, locale)
  if (!work) notFound()

  const t = await getTranslations({ locale, namespace: 'work.detail' })

  const TYPE_LABEL: Record<WorkType, string> = {
    design: t('typeDesign'),
    video: t('typeVideo'),
    '3d': t('type3d'),
  }

  return (
    <SubPageLayout>
      {/* 조회수 증가 트래커 (Client Component, fire-and-forget) */}
      <ViewCountTracker workId={work.id} />

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
                <VideoViewer
                  embed={work.video_embed}
                  title={work.title}
                  placeholder={t('videoPlaceholder')}
                />
              )}
              {work.type === 'design' && (
                <DesignViewer images={work.images ?? []} title={work.title} />
              )}
              {work.type === '3d' && (
                <ThreeDViewer
                  embed={work.model_embed}
                  title={work.title}
                  placeholder={t('threeDPlaceholder')}
                  hint={t('threeDHint')}
                />
              )}
            </div>

            {/* ── 정보 사이드바 (우) ── */}
            <aside className="lg:col-span-1">
              <div className="space-y-6 sticky top-24">
                {/* 작품 설명 */}
                <div>
                  <p className="font-body text-xs text-white/30 uppercase tracking-wider mb-3">{t('sectionIntro')}</p>
                  <p className="font-body text-[14px] text-white/60 leading-relaxed">
                    {work.description}
                  </p>
                </div>

                <div className="border-t border-white/10" />

                {/* 작가 정보 */}
                <div>
                  <p className="font-body text-xs text-white/30 uppercase tracking-wider mb-3">{t('sectionAuthor')}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-nwcn-green/15 flex items-center justify-center flex-shrink-0">
                      <span className="font-body text-sm font-semibold text-nwcn-green">
                        {work.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-body text-sm text-white">{work.author}</p>
                      <p className="font-body text-xs text-white/30">{t('yearWork', { year: work.year })}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10" />

                {/* 기술 스택 */}
                <div>
                  <p className="font-body text-xs text-white/30 uppercase tracking-wider mb-3">{t('sectionTools')}</p>
                  <div className="flex flex-wrap gap-2">
                    {work.tech_stack.map((tag) => (
                      <span key={tag} className="font-body text-xs px-3 py-1.5 border border-white/20 text-white/60 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10" />

                {/* 조회수 */}
                <div className="flex items-center gap-2 text-white/30">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span className="font-body text-xs">{work.view_count.toLocaleString()} {t('views')}</span>
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
            {t('backToList')}
          </Link>
        </div>
      </div>
    </SubPageLayout>
  )
}
