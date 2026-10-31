/**
 * 수상 세부 페이지: /ninc/awards/[id] — E4 틀
 * 종이 바탕, NINC 위치·하위 메뉴 줄 → 본문(AwardArticle): 큰 제목 + 정보표 → 사진 → 수상 소개 → 다른 수상.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SubPageLayout from '@/components/layout/SubPageLayout'
import NincLocalBar from '@/components/sections/ninc/NincLocalBar'
import AwardArticle from '@/components/sections/ninc/AwardArticle'
import { getAwardById, getAwards } from '@/lib/supabase/queries/awards'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.dima-nwcn.com'

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

export default async function AwardDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params
  const [award, all] = await Promise.all([getAwardById(id, locale), getAwards(locale)])
  if (!award) notFound()

  // 다른 수상: 같은 해 먼저, 그다음 최근 순으로 3개
  const others = all
    .filter((a) => a.id !== award.id)
    .sort((a, b) => Number(b.year === award.year) - Number(a.year === award.year) || b.year - a.year)
    .slice(0, 3)

  return (
    <SubPageLayout tone="paper">
      <NincLocalBar />
      <AwardArticle award={award} others={others} />
    </SubPageLayout>
  )
}
