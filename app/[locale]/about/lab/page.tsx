/**
 * About/Lab 실습실 페이지 — 학과 소개 E4 틀
 * 실습실 사진·장비 자료가 아직 없어 히어로는 어두운 판만, 본문은 준비 중 안내 + 연락처.
 */

import { getTranslations } from 'next-intl/server'
import SubPageLayout from '@/components/layout/SubPageLayout'
import AboutLocalBar from '@/components/sections/about/AboutLocalBar'
import PosterHero from '@/components/sections/about/PosterHero'
import AnchorBar from '@/components/sections/about/AnchorBar'
import LabContent, { LAB_SECTIONS } from '@/components/sections/about/lab/LabContent'

export const metadata = {
  title: 'LAB | ABOUT | NWCN',
  description: '뉴미디어콘텐츠과의 실습 시설 및 장비를 소개합니다.',
}

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function LabPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about.lab' })
  const hero = await getTranslations({ locale, namespace: 'about.hero' })
  const nav = await getTranslations({ locale, namespace: 'about.nav' })
  const dept = await getTranslations({ locale, namespace: 'about.department' })
  const anchors = LAB_SECTIONS.map((id) => ({ id, label: t(`anchors.${id}`) }))

  return (
    <SubPageLayout tone="paper">
      <AboutLocalBar />
      <PosterHero
        titleEn={t.raw('heroEn') as string[]}
        titleKo={t('heroKo')}
        lead={t('lead')}
        slides={[]}
        emptyCaption={t('emptyMedia')}
        emptyImage={{ src: '/images/home/crest.png', alt: '' }}
        labels={{ region: t('region'), prev: hero('prev'), next: hero('next'), pause: hero('pause'), play: hero('play') }}
      />
      <AnchorBar items={anchors} label={nav('toc')} cta={{ href: '/info/admission', label: dept('admission') }} />
      <LabContent />
    </SubPageLayout>
  )
}
