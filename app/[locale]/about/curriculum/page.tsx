/**
 * About/Curriculum 교육과정 페이지 — 학과 소개 E4 틀
 * 포스터형 히어로(CURRICULUM / 교육과정, 어두운 판 위에 역대 졸업전시 포스터) + 학년 목차 줄
 * + 학년 → 학기 → 과목 줄 목록. 데이터는 lib/curriculum-data.ts.
 */

import { getTranslations } from 'next-intl/server'
import SubPageLayout from '@/components/layout/SubPageLayout'
import AboutLocalBar from '@/components/sections/about/AboutLocalBar'
import PosterHero, { type PosterSlide } from '@/components/sections/about/PosterHero'
import AnchorBar from '@/components/sections/about/AnchorBar'
import CurriculumContent, { CURRICULUM_SECTIONS } from '@/components/sections/about/curriculum/CurriculumContent'

export const metadata = {
  title: 'CURRICULUM | ABOUT | NWCN',
  description: '뉴미디어콘텐츠과의 1~3학년 교육과정을 소개합니다.',
}

/** 역대 졸업전시 포스터 — 문구는 messages 의 about.curriculum.slides (순서 맞출 것) */
const POSTERS = [
  '/images/department/photos/connection-2025-poster.webp',
  '/images/department/exhibitions/poster-2024.webp',
  '/images/department/exhibitions/poster-2023.webp',
  '/images/department/exhibitions/poster-2022.webp',
]

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function CurriculumPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about.curriculum' })
  const hero = await getTranslations({ locale, namespace: 'about.hero' })
  const nav = await getTranslations({ locale, namespace: 'about.nav' })
  const dept = await getTranslations({ locale, namespace: 'about.department' })

  const copy = t.raw('slides') as { alt: string; caption: string }[]
  const slides: PosterSlide[] = POSTERS.map((src, i) => ({ src, fit: 'portrait', ...copy[i] }))
  const anchors = CURRICULUM_SECTIONS.map(({ id, grade }) => ({ id, label: t('grade', { grade }) }))

  return (
    <SubPageLayout tone="paper">
      <AboutLocalBar />
      <PosterHero
        titleEn={t.raw('heroEn') as string[]}
        titleEnEm={6.1}
        titleKo={t('heroKo')}
        lead={t('lead')}
        slides={slides}
        labels={{ region: t('region'), prev: hero('prev'), next: hero('next'), pause: hero('pause'), play: hero('play') }}
      />
      <AnchorBar items={anchors} label={nav('toc')} cta={{ href: '/info/admission', label: dept('admission') }} />
      <CurriculumContent />
    </SubPageLayout>
  )
}
