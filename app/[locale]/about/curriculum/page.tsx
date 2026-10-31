/**
 * About/Curriculum 교육과정 페이지 — 학과 소개 E4 틀
 * 포스터형 히어로(CURRICULUM / 교육과정) + 학년 목차 줄
 * + 학년 → 학기 → 과목 줄 목록. 데이터는 lib/curriculum-data.ts.
 */

import { getTranslations } from 'next-intl/server'
import SubPageLayout from '@/components/layout/SubPageLayout'
import AboutLocalBar from '@/components/sections/about/AboutLocalBar'
import PosterHero, { type PosterSlide } from '@/components/sections/about/PosterHero'
import AnchorBar from '@/components/sections/about/AnchorBar'
import CurriculumContent, { CURRICULUM_SECTIONS } from '@/components/sections/about/curriculum/CurriculumContent'
import CurriculumMedia from '@/components/sections/about/curriculum/CurriculumMedia'

export const metadata = {
  title: 'CURRICULUM | ABOUT | NWCN',
  description: '뉴미디어콘텐츠과의 1~3학년 교육과정을 소개합니다.',
}

/**
 * 히어로 수업 사진 — 받으면 여기에 넣는다(문구는 messages 의 about.curriculum.slides, 순서 맞출 것).
 * 비어 있으면 오른쪽 판에 학년별 전공 과목 이름을 글자로 보여준다(CurriculumMedia).
 * (예전에는 졸업전시 포스터를 썼으나 졸업전시 페이지와 겹쳐 뺌)
 */
const CLASS_PHOTOS: Pick<PosterSlide, 'src' | 'position'>[] = []

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
  const slides: PosterSlide[] = CLASS_PHOTOS.map((photo, i) => ({ ...photo, ...copy[i] }))
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
        media={slides.length ? undefined : <CurriculumMedia />}
        labels={{ region: t('region'), prev: hero('prev'), next: hero('next'), pause: hero('pause'), play: hero('play') }}
      />
      <AnchorBar items={anchors} label={nav('toc')} cta={{ href: '/info/admission', label: dept('admission') }} />
      <CurriculumContent />
    </SubPageLayout>
  )
}
