/**
 * Awards 세부 페이지: /ninc/awards/[id]
 * Server Component — Supabase에서 단일 수상 데이터 fetch
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import SubPageLayout from '@/components/layout/SubPageLayout'
import { notFound } from 'next/navigation'
import { getAwardById } from '@/lib/supabase/queries/awards'
import { getTranslations } from 'next-intl/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ncwn-web.vercel.app'

/** 동적 메타데이터 — 수상 상세 */
export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }): Promise<Metadata> {
  const { id } = await params
  const award = await getAwardById(id)
  if (!award) return { title: '수상 정보를 찾을 수 없습니다' }

  const title = `${award.competition} ${award.award_name}`
  const description =
    award.description ??
    `${award.year}년 ${award.competition}에서 뉴미디어콘텐츠과 학생이 ${award.award_name}을(를) 수상했습니다.`
  const url = `${SITE_URL}/ninc/awards/${award.id}`

  return {
    title,
    description,
    keywords: [
      '뉴미디어콘텐츠과',
      '수상',
      award.competition,
      award.award_name,
      String(award.year),
      award.category ?? '',
    ].filter(Boolean),
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      locale: 'ko_KR',
      siteName: 'NWCN',
      images: award.thumbnail_url ? [{ url: award.thumbnail_url, alt: title }] : undefined,
    },
  }
}

const AWARD_GRADE_COLOR: Record<string, string> = {
  '대상': 'bg-nwcn-green text-nwcn-text-default',
  '금상': 'bg-nwcn-green text-nwcn-text-default',
  '최우수상': 'bg-nwcn-yellow text-nwcn-text-default',
  '우수상': 'bg-nwcn-yellow text-nwcn-text-default',
  '장려상': 'bg-white/10 text-white',
}

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function AwardDetailPage({ params }: PageProps) {
  const { id, locale } = await params
  const award = await getAwardById(id, locale)
  if (!award) notFound()

  const t = await getTranslations({ locale, namespace: 'ninc.awards.detail' })

  // 연도 표시: 한국어면 "2024년", 영어면 "2024"
  const yearLabel = t('yearFormat', { year: award.year })
  const yearAndAward = t('yearAndAward', { year: award.year, awardName: award.award_name })

  return (
    <SubPageLayout>
      {/* ── 상단 배너 (흰 배경) ── */}
      <div className="bg-white pt-[80px] pb-0">
        <div className="page-container">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-body text-nwcn-text-sub mb-8">
            <Link href="/ninc/awards" className="hover:text-nwcn-text-muted transition-colors">
              AWARDS
            </Link>
            <span>/</span>
            <span className="text-nwcn-text-muted truncate max-w-[200px]">{award.competition}</span>
          </nav>

          {/* 수상명 + 배지 */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className={`font-body text-sm font-semibold px-4 py-1.5 rounded-full ${AWARD_GRADE_COLOR[award.award_name] ?? 'bg-white/10 text-white'}`}>
              {award.award_name}
            </span>
            {award.category && (
              <span className="font-body text-sm text-nwcn-text-sub">{award.category}</span>
            )}
          </div>

          {/* 대회명 */}
          <h1 className="font-body font-bold text-[32px] md:text-[44px] text-nwcn-text-default leading-tight mb-3">
            {award.competition}
          </h1>

          {/* 연도 + 주최 */}
          <p className="font-body text-sm text-nwcn-text-sub mb-10">
            {yearLabel}{award.hosted_by ? ` · ${award.hosted_by}` : ''}
          </p>
        </div>

        {/* 구분선 */}
        <div className="border-b border-black/10" />
      </div>

      {/* ── 본문 ── */}
      <div className="bg-white py-16">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* ── 왼쪽: 주요 정보 카드 ── */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="border border-black/10 rounded-2xl overflow-hidden sticky top-24">
                {/* 썸네일 */}
                <div className="aspect-[4/3] bg-[#efefef] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 opacity-30">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#323131" strokeWidth="1.5">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                    <span className="font-body text-xs text-nwcn-text-sub">{t('noImage')}</span>
                  </div>
                </div>

                {/* 정보 목록 */}
                <div className="p-6 space-y-4">
                  {award.winner && (
                    <div>
                      <p className="font-body text-xs text-nwcn-text-sub mb-1">{t('winner')}</p>
                      <p className="font-body text-sm font-semibold text-nwcn-text-default">{award.winner}</p>
                    </div>
                  )}
                  {award.team_members.length > 1 && (
                    <div>
                      <p className="font-body text-xs text-nwcn-text-sub mb-1">{t('teamMembers')}</p>
                      <p className="font-body text-sm text-nwcn-text-muted">
                        {award.team_members.join(', ')}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="font-body text-xs text-nwcn-text-sub mb-1">{t('awardYear')}</p>
                    <p className="font-body text-sm text-nwcn-text-muted">{yearLabel}</p>
                  </div>
                  {award.hosted_by && (
                    <div>
                      <p className="font-body text-xs text-nwcn-text-sub mb-1">{t('host')}</p>
                      <p className="font-body text-sm text-nwcn-text-muted">{award.hosted_by}</p>
                    </div>
                  )}
                  {award.category && (
                    <div>
                      <p className="font-body text-xs text-nwcn-text-sub mb-1">{t('category')}</p>
                      <p className="font-body text-sm text-nwcn-text-muted">{award.category}</p>
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* ── 오른쪽: 상세 설명 ── */}
            <main className="lg:col-span-2 order-1 lg:order-2">
              {/* 섹션: 수상 소개 */}
              <section className="mb-12">
                <h2 className="font-body font-semibold text-[18px] text-nwcn-text-default mb-4 pb-2 border-b border-black/10">
                  {t('sectionIntro')}
                </h2>
                <p className="font-body text-[15px] text-nwcn-text-muted leading-relaxed">
                  {award.description ?? t('noDescription')}
                </p>
              </section>

              {/* 섹션: 수상자 정보 */}
              <section className="mb-12">
                <h2 className="font-body font-semibold text-[18px] text-nwcn-text-default mb-4 pb-2 border-b border-black/10">
                  {t('sectionWinners')}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {award.team_members.map((member) => (
                    <div
                      key={member}
                      className="flex items-center gap-3 bg-[#f5f5f5] px-4 py-3 rounded-xl"
                    >
                      <div className="w-9 h-9 rounded-full bg-nwcn-text-sub/20 flex items-center justify-center flex-shrink-0">
                        <span className="font-body text-sm font-semibold text-nwcn-text-muted">
                          {member.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-body text-sm font-medium text-nwcn-text-default">{member}</p>
                        {member === award.winner && (
                          <p className="font-body text-[11px] text-nwcn-text-sub">{t('representative')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 수상 정보 카드 */}
              <div className="bg-[#f9f9f9] rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-nwcn-text-sub/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B9B8B6" strokeWidth="1.5">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
                <div>
                  <p className="font-body text-sm font-medium text-nwcn-text-default">
                    {award.competition}
                  </p>
                  <p className="font-body text-xs text-nwcn-text-sub">
                    {yearAndAward}
                  </p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* ── 하단 네비게이션 ── */}
      <div className="bg-white border-t border-black/10 py-8">
        <div className="page-container flex justify-between items-center">
          <Link
            href="/ninc/awards"
            className="flex items-center gap-2 font-body text-sm text-nwcn-text-sub hover:text-nwcn-text-default transition-colors group"
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
