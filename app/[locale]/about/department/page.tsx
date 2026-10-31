/**
 * About/Department 학과 소개 페이지
 * route: /about/department
 *
 * 디자인: 학과 소개 E4 포스터형 (Claude Design 캔버스 '서브페이지 5차' E4)
 *  - 종이 바탕(paper) 헤더 + ABOUT 현재 위치·하위 메뉴 줄
 *  - 포스터형 히어로: 거대한 영문·한글 학과명이 오른쪽 학과 사진과 겹치고, 겹친 글자는 흰색
 *  - 페이지 목차 줄(스크롤하면 헤더 아래 고정) + 입학 안내 버튼
 *  - 본문: 소개 정보표 · 교육 목표 · 교육 방침 · 졸업 후 진로 · 자격증(글 목록)
 *
 * 변경 이력:
 * - Figma 291:76 기반 DepartmentSection(둥근 카드·글래스 태그·가짜 자격증 캐러셀) → E4 로 교체
 */

import { getTranslations } from 'next-intl/server'
import SubPageLayout from '@/components/layout/SubPageLayout'
import AboutLocalBar from '@/components/sections/about/AboutLocalBar'
import PosterHero, { type PosterSlide } from '@/components/sections/about/PosterHero'
import AnchorBar from '@/components/sections/about/AnchorBar'
import DepartmentContent, { DEPARTMENT_SECTIONS } from '@/components/sections/about/department/DepartmentContent'

export const metadata = {
  title: 'DEPARTMENT | ABOUT | NWCN',
  description: '뉴미디어콘텐츠과의 교육 목표, 교육방침, 졸업 후 진로, 취득 가능 자격증을 소개합니다.',
}

/**
 * 히어로 사진 — 흰 글자가 잘 읽히도록 어두운 이미지 위주. 문구(alt·캡션)는 messages 의 about.department.slides
 * (순서·개수를 맞출 것). 원본 해상도가 낮은 사진(가로 1244×323 띠 등)은 확대되면 깨지므로 넣지 않는다.
 * 학과 원본 사진(가로 1600px 이상)이 생기면 여기에 추가한다.
 */
const HERO_PHOTOS: Pick<PosterSlide, 'src' | 'position'>[] = [
  { src: '/images/department/photos/boseong-facade-workshop.webp', position: '50% 60%' },
  { src: '/images/department/photos/connection-2025-poster.webp', position: '50% 39%' },
]

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function DepartmentPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about.department' })
  const hero = await getTranslations({ locale, namespace: 'about.hero' })
  const nav = await getTranslations({ locale, namespace: 'about.nav' })

  const copy = t.raw('slides') as { alt: string; caption: string }[]
  const slides: PosterSlide[] = HERO_PHOTOS.map((photo, i) => ({ ...photo, ...copy[i] }))
  const anchors = DEPARTMENT_SECTIONS.map((id) => ({ id, label: t(`anchors.${id}`) }))

  return (
    <SubPageLayout tone="paper">
      <AboutLocalBar />
      <PosterHero
        titleEn={t.raw('heroEn') as string[]}
        titleKo={t('heroKo')}
        lead={t('lead')}
        slides={slides}
        labels={{
          region: hero('photos'),
          prev: hero('prev'),
          next: hero('next'),
          pause: hero('pause'),
          play: hero('play'),
        }}
      />
      <AnchorBar items={anchors} label={nav('toc')} cta={{ href: '/info/admission', label: t('admission') }} />
      <DepartmentContent />
    </SubPageLayout>
  )
}
