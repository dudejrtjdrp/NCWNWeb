/**
 * NCR TREND 기사 상세: /ncr-trend/[id] — E4 틀
 * 종이 바탕, NCR TREND 위치·하위 메뉴 줄 → 큰 제목(위에 유형·시즌, 아래 설명) + 정보표
 * → 대표 사진(블러 배경) → 본문 | 태그 → 다른 리포트 3개(관련 기사 먼저).
 */

import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import SubPageLayout from '@/components/layout/SubPageLayout'
import { Link } from '@/i18n/navigation'
import NcrLocalBar from '@/components/sections/ncr/NcrLocalBar'
import { DetailMedia, InfoTable } from '@/components/sections/editorial/DetailParts'
import { reportDate, typeLabelMap } from '@/components/sections/ncr/report-utils'
import { getNcrReportById, getNcrReports, getRelatedNcrReports, getArticleTypes } from '@/lib/supabase/queries/ncr'
import { sanitizeArticleHtml, isHtmlContent } from '@/lib/sanitize'
import { breadcrumbLd } from '@/lib/seo/structured-data'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.dima-nwcn.com'

const TYPE_LABELS_KO: Record<string, string> = {
  editorial: '에디토리얼',
  trend: '트렌드',
  card_news: '카드뉴스',
}

/** 동적 메타데이터 — 아티클 제목·설명·OG */
export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }): Promise<Metadata> {
  const { id } = await params
  const article = await getNcrReportById(id)
  if (!article) return { title: '아티클을 찾을 수 없습니다' }

  const title = article.title
  const description = article.description ?? article.excerpt ?? '뉴미디어콘텐츠과 NCR TREND 아티클'
  const url = `${SITE_URL}/ncr-trend/${article.id}`
  const imageUrl = article.thumbnail_url ?? undefined

  return {
    title,
    description,
    keywords: [
      '뉴미디어콘텐츠과',
      'NCR TREND',
      TYPE_LABELS_KO[article.type] ?? article.type,
      ...(article.tags ?? []),
      article.season ?? '',
    ].filter(Boolean),
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      locale: 'ko_KR',
      siteName: 'NWCN',
      publishedTime: article.published_at,
      authors: article.author ? [article.author] : undefined,
      tags: article.tags ?? undefined,
      images: imageUrl ? [{ url: imageUrl, alt: title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}

/** 옛 마크다운 본문(## 제목, 단락) → JSX */
function renderContent(content: string) {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('## ')) return <h2 key={i}>{line.replace('## ', '')}</h2>
    if (line.trim() === '') return null
    return <p key={i}>{line}</p>
  })
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params
  const article = await getNcrReportById(id, locale)
  if (!article) notFound()

  const [t, tl, related, all, articleTypes] = await Promise.all([
    getTranslations({ locale, namespace: 'ncr.detail' }),
    getTranslations({ locale, namespace: 'ncr.latestPage' }),
    getRelatedNcrReports(article.related_ids ?? [], locale),
    getNcrReports(locale),
    getArticleTypes(),
  ])
  const types = typeLabelMap(articleTypes, {
    editorial: t('typeEditorial'),
    trend: t('typeTrend'),
    card_news: t('typeCardNews'),
  })
  const typeLabel = types[article.type] ?? article.type

  // 다른 리포트: 관리자가 고른 관련 기사 먼저, 모자라면 최신 순으로 채워 3개
  const others = [...related, ...all.filter((r) => !related.some((x) => x.id === r.id))]
    .filter((r) => r.id !== article.id)
    .slice(0, 3)

  const rows = [
    ...(article.author ? [{ label: t('labelAuthor'), value: article.author }] : []),
    { label: t('labelPublishedAt'), value: <span className="tabular-nums">{reportDate(article.published_at)}</span> },
    ...(article.read_time ? [{ label: t('labelReadTime'), value: article.read_time }] : []),
    { label: t('sidebarType'), value: typeLabel },
    ...(article.season ? [{ label: t('season'), value: article.season }] : []),
  ]

  /** Article JSON-LD 구조화 데이터 */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description ?? article.excerpt ?? '',
    datePublished: article.published_at,
    dateModified: article.created_at,
    author: article.author
      ? { '@type': 'Person', name: article.author }
      : { '@type': 'Organization', name: '동아방송예술대학교 뉴미디어콘텐츠과' },
    publisher: {
      '@type': 'Organization',
      name: '동아방송예술대학교 뉴미디어콘텐츠과',
      url: SITE_URL,
    },
    url: `${SITE_URL}/ncr-trend/${article.id}`,
    ...(article.thumbnail_url ? { image: article.thumbnail_url } : {}),
    keywords: article.tags?.join(', ') ?? '',
    articleSection: typeLabel,
    inLanguage: locale === 'en' ? 'en-US' : 'ko-KR',
  }
  const breadcrumbJsonLd = breadcrumbLd([
    { name: 'NCR TREND', path: '/ncr-trend/latest' },
    { name: article.title, path: `/ncr-trend/${article.id}` },
  ])

  return (
    <SubPageLayout tone="paper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <NcrLocalBar />

      <div className="mx-auto max-w-page border-t border-nwcn-dark">
        <div className="editorial-container pb-24">
          {/* ── 제목 + 정보표 ── */}
          <header className="grid grid-cols-12 gap-x-6 gap-y-8 pt-5">
            <div className="col-span-12 flex min-w-0 flex-col lg:col-span-8">
              <Link href="/ncr-trend/latest" className="editorial-link self-start font-semibold text-body-sm">
                <span aria-hidden="true">← </span>
                {t('backToList')}
              </Link>
              <p className="mt-10 font-semibold text-list text-nwcn-neutral-600 lg:mt-14">
                {[typeLabel, article.season].filter(Boolean).join(' · ')}
              </p>
              <h1 className="m-0 mt-2 break-words font-extrabold text-headline">{article.title}</h1>
              {article.description && <p className="mt-6 max-w-2xl font-medium text-lead">{article.description}</p>}
            </div>
            <div className="col-span-12 self-end lg:col-span-4">
              <InfoTable rows={rows} />
            </div>
          </header>

          {article.thumbnail_url && (
            <div className="mt-12">
              <DetailMedia src={article.thumbnail_url} alt={article.title} />
            </div>
          )}

          {/* ── 본문 | 태그 ── */}
          <div className="grid grid-cols-12 gap-x-6 gap-y-10 pt-chapter">
            <article className="col-span-12 min-w-0 border-t border-nwcn-dark pt-8 lg:col-span-7">
              {article.content ? (
                isHtmlContent(article.content) ? (
                  <div className="article-body" dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.content) }} />
                ) : (
                  <div className="article-body">{renderContent(article.content)}</div>
                )
              ) : (
                <p className="text-list">{article.excerpt}</p>
              )}
            </article>
            {article.tags.length > 0 && (
              <aside aria-labelledby="ncr-tags" className="col-span-12 lg:col-span-3 lg:col-start-10">
                <div className="lg:sticky lg:top-24">
                  <h2 id="ncr-tags" className="m-0 border-t border-nwcn-dark pt-3.5 font-bold text-section">
                    {t('sectionTags')}
                  </h2>
                  <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 text-body-sm text-nwcn-neutral-600">
                    {article.tags.map((tag) => (
                      <li key={tag}>#{tag}</li>
                    ))}
                  </ul>
                </div>
              </aside>
            )}
          </div>

          {/* ── 다른 리포트 ── */}
          {others.length > 0 && (
            <section aria-labelledby="ncr-more" className="pt-chapter">
              <h2 id="ncr-more" className="m-0 mb-6 font-extrabold text-headline">{t('other')}</h2>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-8 border-t border-nwcn-dark pt-6 sm:grid-cols-2 lg:grid-cols-3">
                {others.map((r) => (
                  <li key={r.id}>
                    <Link href={`/ncr-trend/${r.id}`} className="group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark">
                      <span className="relative block aspect-[16/10] overflow-hidden bg-nwcn-dark">
                        {r.thumbnail_url && (
                          <Image src={r.thumbnail_url} alt="" fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover transition-transform duration-slow ease-nwcn group-hover:scale-[1.02]" />
                        )}
                      </span>
                      <span className="mt-3 font-semibold tabular-nums text-body-sm text-nwcn-neutral-600">
                        {[types[r.type] ?? r.type, reportDate(r.published_at)].join(' · ')}
                      </span>
                      <span className="mt-1 font-bold text-list decoration-nwcn-green-darker decoration-2 underline-offset-4 group-hover:underline">
                        {r.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/ncr-trend/archive" className="editorial-link mt-8 inline-block font-semibold text-body-sm">
                {tl('toArchive')} <span aria-hidden="true">→</span>
              </Link>
            </section>
          )}
        </div>
      </div>
    </SubPageLayout>
  )
}
