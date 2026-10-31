/**
 * Work 세부 페이지: /work/[id] — E4 틀
 * 종이 바탕, WORK 위치·하위 메뉴 줄 → 큰 제목 + 정보표(제작·연도·유형·분야·조회) → 작품(영상/이미지/3D)
 * → 작품 소개 · 관련 링크 → 다른 작품 카드.
 * 작업물 타입별 뷰어: design 이미지 갤러리 / video 영상 플레이어 / 3d iframe 임베드.
 */

import type { Metadata } from 'next'
import SubPageLayout from '@/components/layout/SubPageLayout'
import { Link } from '@/i18n/navigation'
import WorkLocalBar from '@/components/sections/work/WorkLocalBar'
import WorkCard from '@/components/sections/work/WorkCard'
import { notFound } from 'next/navigation'
import { getWorkById, getRelatedWorks, type WorkType } from '@/lib/supabase/queries/works'
import { getTranslations } from 'next-intl/server'
import DesignViewer from './DesignViewer'
import ViewCountTracker from './ViewCountTracker'
import { normalizeVideoEmbed } from '@/lib/youtube'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.dima-nwcn.com'

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

function EmptyViewer({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="grid aspect-video w-full place-items-center bg-nwcn-dark text-nwcn-paper">
      <div className="flex flex-col items-center gap-4 opacity-50">
        {icon}
        <span className="text-body-sm">{label}</span>
      </div>
    </div>
  )
}

function VideoViewer({ embed, title, placeholder }: { embed?: string | null; title: string; placeholder: string }) {
  if (!embed) {
    return (
      <EmptyViewer
        label={placeholder}
        icon={
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="6,4 20,12 6,20" />
          </svg>
        }
      />
    )
  }
  return (
    <div className="aspect-video w-full overflow-hidden bg-black">
      <iframe
        src={embed}
        title={title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

function ThreeDViewer({ embed, title, placeholder, hint }: { embed?: string | null; title: string; placeholder: string; hint: string }) {
  return (
    <div className="w-full">
      {embed ? (
        <div className="aspect-video w-full overflow-hidden bg-nwcn-dark">
          <iframe title={title} src={embed} className="h-full w-full" allow="autoplay; fullscreen; xr-spatial-tracking" allowFullScreen />
        </div>
      ) : (
        <EmptyViewer
          label={placeholder}
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          }
        />
      )}
      {embed && <p className="mt-2 text-body-sm text-nwcn-neutral-600">{hint}</p>}
    </div>
  )
}

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { id, locale } = await params
  const [work, related] = await Promise.all([getWorkById(id, locale), getRelatedWorks(id, locale, 6)])
  if (!work) notFound()

  const t = await getTranslations({ locale, namespace: 'work.detail' })
  const TYPE_LABEL: Record<WorkType, string> = { design: t('typeDesign'), video: t('typeVideo'), '3d': t('type3d') }
  const tags = (work.tech_stack ?? []).filter(Boolean)
  const links = (work.related_links ?? []).filter((l) => l.url)

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: t('sectionAuthor'), value: work.author },
    { label: t('sectionPeriod'), value: work.year },
    { label: t('sectionType'), value: TYPE_LABEL[work.type] },
    ...(tags.length ? [{ label: t('sectionTools'), value: tags.join(' · ') }] : []),
    { label: t('views'), value: <span className="tabular-nums">{work.view_count.toLocaleString()}</span> },
  ]

  return (
    <SubPageLayout tone="paper">
      {/* 조회수 증가 트래커 (Client Component, fire-and-forget) */}
      <ViewCountTracker workId={work.id} />
      <WorkLocalBar />

      <div className="mx-auto max-w-page border-t border-nwcn-dark">
        <div className="editorial-container pb-24">
          {/* ── 제목 + 정보표 ── */}
          <header className="grid grid-cols-12 gap-x-6 gap-y-8 pt-5">
            <div className="col-span-12 flex min-w-0 flex-col lg:col-span-8">
              <Link href="/work/showcase" className="editorial-link self-start font-semibold text-body-sm">
                <span aria-hidden="true">← </span>
                {t('backToList')}
              </Link>
              <h1 className="m-0 mt-10 break-words font-extrabold text-headline lg:mt-14">{work.title}</h1>
            </div>
            <dl className="col-span-12 self-end border-b border-nwcn-dark text-list lg:col-span-4">
              {rows.map((row) => (
                <div key={row.label} className="grid grid-cols-12 gap-x-4 border-t border-nwcn-dark py-2.5">
                  <dt className="col-span-4 text-nwcn-neutral-600">{row.label}</dt>
                  <dd className="col-span-8 min-w-0 break-words">{row.value}</dd>
                </div>
              ))}
            </dl>
          </header>

          {/* ── 작품 ── */}
          <div className="mt-12">
            {work.type === 'video' && (
              <VideoViewer embed={normalizeVideoEmbed(work.video_embed)} title={work.title} placeholder={t('videoPlaceholder')} />
            )}
            {work.type === 'design' && <DesignViewer images={work.images ?? []} title={work.title} />}
            {work.type === '3d' && (
              <ThreeDViewer embed={work.model_embed} title={work.title} placeholder={t('threeDPlaceholder')} hint={t('threeDHint')} />
            )}
          </div>

          {/* ── 작품 소개 · 관련 링크 ── */}
          {(work.description || links.length > 0) && (
            <div className="grid grid-cols-12 gap-x-6 gap-y-10 pt-chapter">
              {work.description && (
                <section aria-labelledby="work-intro" className="col-span-12 lg:col-span-7">
                  <h2 id="work-intro" className="m-0 border-t border-nwcn-dark pt-3.5 font-bold text-section">
                    {t('sectionIntro')}
                  </h2>
                  <p className="mt-5 whitespace-pre-line text-list">{work.description}</p>
                </section>
              )}
              {links.length > 0 && (
                <section aria-labelledby="work-links" className="col-span-12 lg:col-span-4 lg:col-start-9">
                  <h2 id="work-links" className="m-0 border-t border-nwcn-dark pt-3.5 font-bold text-section">
                    {t('sectionLinks')}
                  </h2>
                  <ul className="mt-3 border-b border-nwcn-dark">
                    {links.map((link, i) => (
                      <li key={i} className="border-t border-nwcn-rule first:border-t-0">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-baseline justify-between gap-3 py-3 text-list"
                        >
                          <span className="min-w-0 truncate decoration-nwcn-green-darker decoration-2 underline-offset-4 group-hover:underline">
                            {link.label || link.url}
                          </span>
                          <span aria-hidden="true">↗</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

          {/* ── 다른 작품 ── */}
          {related.length > 0 && (
            <section aria-labelledby="work-related" className="pt-chapter">
              <h2 id="work-related" className="m-0 mb-6 font-extrabold text-headline">
                {t('relatedTitle')}
              </h2>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-12 border-t border-nwcn-dark pt-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((w) => (
                  <WorkCard key={w.id} work={w} typeLabel={TYPE_LABEL} />
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </SubPageLayout>
  )
}
