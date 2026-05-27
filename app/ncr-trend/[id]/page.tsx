/**
 * NCR Trend 아티클 세부 페이지: /ncr-trend/[id]
 * Server Component — Supabase에서 단일 리포트 fetch
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import SubPageLayout from '@/components/layout/SubPageLayout'
import Badge from '@/components/ui/Badge'
import { notFound } from 'next/navigation'
import { getNcrReportById, getRelatedNcrReports } from '@/lib/supabase/queries/ncr'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nwcn.kr'

const TYPE_LABELS_KO: Record<string, string> = {
  editorial: '에디토리얼',
  trend: '트렌드',
  card_news: '카드뉴스',
}

/** 동적 메타데이터 — 아티클 제목·설명·OG */
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = await getNcrReportById(params.id)
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

const TYPE_LABELS = TYPE_LABELS_KO

// 간단한 마크다운 → JSX 변환 (## 헤더, 단락)
function renderContent(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (const line of lines) {
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="font-body font-bold text-[20px] text-nwcn-text-default mt-10 mb-4">
          {line.replace('## ', '')}
        </h2>
      )
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-4" />)
    } else {
      elements.push(
        <p key={key++} className="font-body text-[15px] text-nwcn-text-muted leading-[1.85] mb-1">
          {line}
        </p>
      )
    }
  }

  return elements
}

interface PageProps {
  params: { id: string }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const article = await getNcrReportById(params.id)
  if (!article) notFound()

  const relatedArticles = await getRelatedNcrReports(article.related_ids ?? [])

  const formattedDate = new Date(article.published_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

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
      : { '@type': 'Organization', name: 'NWCN 뉴미디어콘텐츠과' },
    publisher: {
      '@type': 'Organization',
      name: 'NWCN — 동아방송예술대학교 뉴미디어콘텐츠과',
      url: SITE_URL,
    },
    url: `${SITE_URL}/ncr-trend/${article.id}`,
    ...(article.thumbnail_url ? { image: article.thumbnail_url } : {}),
    keywords: article.tags?.join(', ') ?? '',
    articleSection: TYPE_LABELS[article.type] ?? article.type,
    inLanguage: 'ko-KR',
  }

  return (
    <SubPageLayout>
      {/* JSON-LD 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── 아티클 히어로 ── */}
      <div className="bg-nwcn-dark pt-[80px] pb-0">
        <div className="page-container pt-12 pb-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-body text-white/30 mb-8">
            <Link href="/ncr-trend/latest" className="hover:text-white/60 transition-colors">
              NCR TREND
            </Link>
            <span>/</span>
            <Badge variant="green">{TYPE_LABELS[article.type]}</Badge>
          </nav>

          {/* 시즌 */}
          {article.season && (
            <p className="font-body text-xs text-nwcn-green/60 tracking-widest uppercase mb-4">
              {article.season}
            </p>
          )}

          {/* 제목 */}
          <h1 className="font-body font-bold text-[32px] md:text-[48px] lg:text-[56px] text-white leading-[1.15] mb-6 max-w-3xl">
            {article.title}
          </h1>

          {/* 설명 */}
          {article.description && (
            <p className="font-body text-[16px] text-white/50 leading-relaxed max-w-2xl mb-10">
              {article.description}
            </p>
          )}

          {/* 메타 정보 */}
          <div className="flex items-center gap-6 pb-10 border-b border-white/10">
            {/* 저자 */}
            {article.author && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-nwcn-green/20 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#09F593" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <p className="font-body text-xs text-white/30">작성자</p>
                  <p className="font-body text-sm text-white/80">{article.author}</p>
                </div>
              </div>
            )}

            {/* 날짜 */}
            <div>
              <p className="font-body text-xs text-white/30">발행일</p>
              <p className="font-body text-sm text-white/80">{formattedDate}</p>
            </div>

            {/* 읽기 시간 */}
            {article.read_time && (
              <div>
                <p className="font-body text-xs text-white/30">읽기 시간</p>
                <p className="font-body text-sm text-white/80">{article.read_time}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 아티클 본문 ── */}
      <div className="bg-white">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 py-16">

            {/* ── 메인 본문 ── */}
            <article className="lg:col-span-3">
              {/* 썸네일 이미지 영역 */}
              <div className="aspect-[16/7] bg-[#efefef] rounded-2xl mb-12 flex items-center justify-center overflow-hidden">
                <div className="flex flex-col items-center gap-3 opacity-20">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#323131" strokeWidth="1.2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span className="font-brand text-2xl text-nwcn-text-muted">NCR</span>
                </div>
              </div>

              {/* 본문 텍스트 */}
              <div className="max-w-[680px]">
                {article.content ? renderContent(article.content) : (
                  <p className="font-body text-[15px] text-nwcn-text-muted leading-relaxed">
                    {article.excerpt}
                  </p>
                )}
              </div>

              {/* 태그 */}
              {article.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-black/10">
                  <p className="font-body text-xs text-nwcn-text-sub mb-3">태그</p>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-body text-xs px-3 py-1.5 border border-nwcn-text-sub/30 text-nwcn-text-muted rounded-full hover:border-nwcn-text-default transition-colors cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* ── 사이드바 ── */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                {/* 이 아티클 정보 */}
                <div className="bg-[#f5f5f5] rounded-xl p-5">
                  <p className="font-body text-xs font-semibold text-nwcn-text-sub uppercase tracking-wider mb-4">
                    아티클 정보
                  </p>
                  <div className="space-y-3">
                    <div>
                      <p className="font-body text-[11px] text-nwcn-text-sub">유형</p>
                      <p className="font-body text-sm text-nwcn-text-muted">{TYPE_LABELS[article.type]}</p>
                    </div>
                    {article.season && (
                      <div>
                        <p className="font-body text-[11px] text-nwcn-text-sub">시즌</p>
                        <p className="font-body text-sm text-nwcn-text-muted">{article.season}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-body text-[11px] text-nwcn-text-sub">발행일</p>
                      <p className="font-body text-sm text-nwcn-text-muted">{formattedDate}</p>
                    </div>
                  </div>
                </div>

                {/* 관련 아티클 */}
                {relatedArticles.length > 0 && (
                  <div>
                    <p className="font-body text-xs font-semibold text-nwcn-text-sub uppercase tracking-wider mb-4">
                      관련 아티클
                    </p>
                    <div className="space-y-3">
                      {relatedArticles.map((rel) => (
                        <Link
                          key={rel.id}
                          href={`/ncr-trend/${rel.id}`}
                          className="block p-3 rounded-xl border border-black/8 hover:border-nwcn-text-sub/40 transition-colors group"
                        >
                          <p className="font-body text-[11px] text-nwcn-green mb-1">
                            {TYPE_LABELS[rel.type]}
                          </p>
                          <p className="font-body text-sm text-nwcn-text-muted group-hover:text-nwcn-text-default transition-colors leading-snug">
                            {rel.title}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* ── 하단 네비게이션 ── */}
      <div className="bg-white border-t border-black/10 py-8">
        <div className="page-container flex justify-between items-center">
          <Link
            href="/ncr-trend/latest"
            className="flex items-center gap-2 font-body text-sm text-nwcn-text-sub hover:text-nwcn-text-default transition-colors group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            리포트 목록으로
          </Link>
        </div>
      </div>
    </SubPageLayout>
  )
}
