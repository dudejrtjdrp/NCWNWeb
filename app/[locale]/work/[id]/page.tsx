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
import WorkMasonry from '@/components/sections/WorkMasonry'
import { notFound } from 'next/navigation'
import { getWorkById, getRelatedWorks, type WorkType } from '@/lib/supabase/queries/works'
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

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

const TYPE_BADGE_VARIANT: Record<WorkType, 'new' | 'hot' | 'number'> = {
  design: 'hot',
  video: 'new',
  '3d': 'number',
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { id, locale } = await params
  const [work, related] = await Promise.all([
    getWorkById(id, locale),
    getRelatedWorks(id, locale, 8),
  ])
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

      <div className="bg-white">
        <div className="page-container pt-10 pb-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[13px] font-body text-nwcn-gray-muted mb-7">
            <Link href="/work/showcase" className="hover:text-nwcn-text-default transition-colors">
              SHOWCASE
            </Link>
            <span>/</span>
            <span className="text-nwcn-text-muted">{work.title}</span>
          </nav>

          {/* 타입 배지 */}
          <Badge variant={TYPE_BADGE_VARIANT[work.type]}>{TYPE_LABEL[work.type]}</Badge>

          {/* 제목 + 조회수 */}
          <div className="mt-4 flex items-start justify-between gap-6">
            <h1 className="font-body font-bold text-[28px] md:text-[40px] text-nwcn-text-default leading-tight">
              {work.title}
            </h1>
            <div className="flex items-center gap-1.5 text-nwcn-gray-muted shrink-0 pt-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="font-body text-[14px]">{work.view_count.toLocaleString()} {t('views')}</span>
            </div>
          </div>

          {/* ── 뷰어(좌) + 정보(우) ── */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* 뷰어 */}
            <div className="lg:col-span-3">
              {work.type === 'video' && (
                <VideoViewer embed={work.video_embed} title={work.title} placeholder={t('videoPlaceholder')} />
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

            {/* 정보 사이드바 */}
            <aside className="lg:col-span-2">
              <div className="space-y-7 lg:sticky lg:top-24">
                {/* 제작자 */}
                <div>
                  <p className="font-body text-[13px] text-nwcn-gray-muted mb-1.5">{t('sectionAuthor')}</p>
                  <p className="font-body text-[16px] font-medium text-nwcn-text-default">{work.author}</p>
                </div>

                {/* 제작 기간 */}
                <div>
                  <p className="font-body text-[13px] text-nwcn-gray-muted mb-1.5">{t('sectionPeriod')}</p>
                  <p className="font-body text-[16px] font-medium text-nwcn-text-default">{work.year}</p>
                </div>

                {/* 사용 도구 / 기술 */}
                <div>
                  <p className="font-body text-[13px] text-nwcn-gray-muted mb-2">{t('sectionTools')}</p>
                  <div className="flex flex-wrap gap-2">
                    {work.tech_stack.map((tag) => (
                      <Badge key={tag} variant="number">{tag}</Badge>
                    ))}
                  </div>
                </div>

                {/* 작품 소개 */}
                {work.description && (
                  <div>
                    <p className="font-body text-[13px] text-nwcn-gray-muted mb-2">{t('sectionIntro')}</p>
                    <p className="font-body text-[14px] text-nwcn-gray-text leading-relaxed whitespace-pre-line">
                      {work.description}
                    </p>
                  </div>
                )}

                {/* 관련 링크 */}
                {work.related_links && work.related_links.length > 0 && (
                  <div>
                    <p className="font-body text-[13px] text-nwcn-gray-muted mb-2">{t('sectionLinks')}</p>
                    <div className="flex flex-col gap-2">
                      {work.related_links.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 font-body text-sm text-nwcn-gray-text hover:text-nwcn-green-dark transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                          <span className="truncate group-hover:underline">{link.label || link.url}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* ── 관련 게시물 (핀터레스트 마소너리) ── */}
          {related.length > 0 && (
            <section className="mt-20 pt-12 border-t border-nwcn-border-light">
              <h2 className="font-body font-bold text-[20px] text-nwcn-text-default mb-7">
                {t('relatedTitle')}
              </h2>
              <WorkMasonry works={related} />
            </section>
          )}

          {/* ── 하단 네비게이션 ── */}
          <div className="mt-16">
            <Link
              href="/work/showcase"
              className="inline-flex items-center gap-2 font-body text-sm text-nwcn-gray-muted hover:text-nwcn-text-default transition-colors group"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              SHOWCASE
            </Link>
          </div>
        </div>
      </div>
    </SubPageLayout>
  )
}
