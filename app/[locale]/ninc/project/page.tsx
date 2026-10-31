/**
 * NINC/Project 프로젝트 — E4 틀
 * 포스터형 히어로(PROJECT / 프로젝트, 프로젝트 사진) + 목차 줄(산학협력·해외교류·가족회사)
 * + 묶음별 프로젝트 목록 + 가족회사 + 아래 바로가기.
 * 내용은 projects 테이블(관리자 등록)에서 온다.
 */

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import SubPageLayout from '@/components/layout/SubPageLayout'
import PosterHero, { type PosterSlide } from '@/components/sections/about/PosterHero'
import AnchorBar from '@/components/sections/about/AnchorBar'
import MoreLinks from '@/components/sections/editorial/MoreLinks'
import NincLocalBar from '@/components/sections/ninc/NincLocalBar'
import ProjectList, { PROJECT_SECTIONS } from '@/components/sections/ninc/ProjectList'
import { getProjects } from '@/lib/supabase/queries/projects'

export const metadata: Metadata = {
  title: 'PROJECT — 프로젝트',
  description: '동아방송예술대학교 뉴미디어콘텐츠과의 산학협력·가족회사·해외교류 프로젝트를 소개합니다.',
  keywords: ['뉴미디어콘텐츠과', '산학협력', '가족회사', '해외교류', 'Now In NewCon', 'NINC', '동아방송예술대학교'],
  alternates: { canonical: '/ninc/project' },
  openGraph: {
    type: 'website',
    title: 'PROJECT — 프로젝트 | NWCN',
    description: '뉴미디어콘텐츠과의 산학협력·해외교류 프로젝트를 만나보세요.',
  },
}

/** 히어로 현장 사진 — 산학협력(보성 미디어파사드), 해외교류(RMIT 글로벌 워크숍) */
const HERO_PHOTOS = [
  { type: 'industry', src: '/images/department/photos/boseong-facade-workshop.webp', position: '50% 60%' },
  { type: 'international', src: '/images/department/photos/rmit-global-workshop.webp', position: '50% 55%' },
] as const

export default async function ProjectPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [projects, t, nav, h, dept] = await Promise.all([
    getProjects(locale),
    getTranslations({ locale, namespace: 'ninc.projectPage' }),
    getTranslations({ locale, namespace: 'ninc.nav' }),
    getTranslations({ locale, namespace: 'ninc.heroLabels' }),
    getTranslations({ locale, namespace: 'about.department' }),
  ])

  // 히어로는 현장 사진으로 (DB 썸네일은 제목 카드라 제목과 겹친다). 캡션은 그 유형의 최근 프로젝트 이름.
  const slides: PosterSlide[] = HERO_PHOTOS.map((ph) => {
    const p = projects.find((x) => x.type === ph.type)
    return { src: ph.src, alt: '', position: ph.position, caption: p ? (p.title.startsWith(String(p.year)) ? p.title : `${p.year} · ${p.title}`) : t(ph.type) }
  })

  const anchors = PROJECT_SECTIONS.map((id) => ({ id, label: t(id) }))

  return (
    <SubPageLayout tone="paper">
      <NincLocalBar />
      <PosterHero
        titleEn={t.raw('heroEn') as string[]}
        titleKo={t('heroKo')}
        lead={t('lead')}
        slides={slides}
        labels={{ region: t('region'), prev: h('prev'), next: h('next'), pause: h('pause'), play: h('play') }}
      />
      <AnchorBar items={anchors} label={nav('toc')} cta={{ href: '/info/admission', label: dept('admission') }} />
      <div className="mx-auto max-w-page">
        <div className="editorial-container">
          <ProjectList projects={projects} />
          <MoreLinks
            label={nav('more')}
            links={[
              { href: '/ninc/awards', label: nav('awards') },
              { href: '/ninc/event', label: nav('event') },
              { href: '/work/showcase', label: nav('showcase') },
              { href: '/info/admission', label: nav('admission') },
            ]}
          />
        </div>
      </div>
    </SubPageLayout>
  )
}
