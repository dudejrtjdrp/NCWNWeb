/**
 * About/Faculty 교수진 페이지 — 학과 소개 E4 틀
 * 포스터형 히어로(FACULTY / 교수진, 학과 활동 사진 자동 넘김) + 목차 줄 + 교수·조교 목록.
 * (교수 사진을 히어로에 하나씩 띄우던 안은 어색하다는 피드백으로 학과 활동 사진으로 교체)
 * 카드를 누르면 /about/faculty/[id] 상세로 이동.
 */

import { getTranslations } from 'next-intl/server'
import SubPageLayout from '@/components/layout/SubPageLayout'
import AboutLocalBar from '@/components/sections/about/AboutLocalBar'
import PosterHero, { type PosterSlide } from '@/components/sections/about/PosterHero'
import AnchorBar from '@/components/sections/about/AnchorBar'
import FacultyContent, { FACULTY_SECTIONS } from '@/components/sections/about/faculty/FacultyContent'

export const metadata = {
  title: 'FACULTY | ABOUT | NWCN',
  description: '뉴미디어콘텐츠과를 이끄는 교수진을 소개합니다.',
}

/** 히어로 사진 — 문구(alt·캡션)는 messages 의 about.faculty.slides (순서 맞출 것) */
const HERO_PHOTOS: Pick<PosterSlide, 'src' | 'position'>[] = [
  { src: '/images/department/photos/rmit-global-workshop.webp', position: '50% 55%' },
  { src: '/images/department/photos/boseong-facade-workshop.webp', position: '50% 60%' },
]

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function FacultyPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about.faculty' })
  const hero = await getTranslations({ locale, namespace: 'about.hero' })
  const nav = await getTranslations({ locale, namespace: 'about.nav' })
  const dept = await getTranslations({ locale, namespace: 'about.department' })
  const copy = t.raw('slides') as { alt: string; caption: string }[]
  const slides: PosterSlide[] = HERO_PHOTOS.map((photo, i) => ({ ...photo, ...copy[i] }))
  const anchors = FACULTY_SECTIONS.map((id) => ({ id, label: t(id) }))

  return (
    <SubPageLayout tone="paper">
      <AboutLocalBar />
      <PosterHero
        titleEn={t.raw('heroEn') as string[]}
        titleKo={t('heroKo')}
        lead={t('lead')}
        slides={slides}
        labels={{ region: t('region'), prev: hero('prev'), next: hero('next'), pause: hero('pause'), play: hero('play') }}
      />
      <AnchorBar items={anchors} label={nav('toc')} cta={{ href: '/info/admission', label: dept('admission') }} />
      <FacultyContent />
    </SubPageLayout>
  )
}
