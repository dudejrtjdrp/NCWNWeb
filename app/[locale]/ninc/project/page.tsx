/**
 * TARGET 페이지: NINC/Project
 * Figma node-id: 280:520
 * - 메인 사진 확대 + 투명 네비바
 * - 기존 검색/카드 그리드 → 산학협력(가족회사 로고 + 해외교류/산학협력 쇼케이스)로 전면 교체
 * - 쇼케이스: 사진 가로 슬라이드 + 글자 아래→위 애니메이션
 */

import type { Metadata } from 'next'
import SubPageLayout from '@/components/layout/SubPageLayout'
import NincHeroBanner from '@/components/base/NincHeroBanner'
import SubNav from '@/components/common/SubNav'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'
import ProjectPartners from '@/components/sections/ninc/ProjectPartners'
import ProjectShowcase from '@/components/sections/ninc/ProjectShowcase'
import { NINC_NAV_ITEMS } from '@/constants/nav-items'
import { SHOWCASE_BLOCKS, buildShowcaseBlocks } from '@/constants/ninc-project'
import { getProjects } from '@/lib/supabase/queries/projects'

export const metadata: Metadata = {
  title: 'PROJECT — Now In NewCon',
  description:
    '동아방송예술대학교 뉴미디어콘텐츠과의 산학협력·가족회사·해외교류 프로젝트를 소개합니다.',
  keywords: ['뉴미디어콘텐츠과', '산학협력', '가족회사', '해외교류', 'Now In NewCon', 'NINC', '동아방송예술대학교'],
  alternates: { canonical: '/ninc/project' },
  openGraph: {
    type: 'website',
    title: 'PROJECT — Now In NewCon | NWCN',
    description: '뉴미디어콘텐츠과의 산학협력·해외교류 프로젝트를 만나보세요.',
  },
}

const HERO_IMAGE_URL = '/images/ninc/project-hero.png'

const ProjectTagline = (
  <>
    {'학과를 넘어 '}
    <span
      className="font-brand font-bold"
      style={{
        background: 'linear-gradient(to right, #E3E94D, #09F593)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      현장
    </span>
    {'과, '}
    <span
      className="font-brand font-bold"
      style={{
        background: 'linear-gradient(to right, #09F593 74.038%, #E3E94D)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      세계
    </span>
    {'로'}
  </>
)

export default async function ProjectPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  // 실제 DB 프로젝트를 유형별(해외교류/산학협력) 쇼케이스로 구성.
  // 데이터가 없으면 정적 SHOWCASE_BLOCKS로 폴백해 빈 화면을 방지한다.
  const projects = await getProjects(locale)
  const dbBlocks = buildShowcaseBlocks(projects)
  const showcaseBlocks = dbBlocks.length > 0 ? dbBlocks : SHOWCASE_BLOCKS

  return (
    <SubPageLayout headerVariant="transparent" overlapHeader>
      {/* 1. 히어로 배너 (확대 + 투명 네비바) */}
      <NincHeroBanner
        pageName="PROJECT"
        heroImageUrl={HERO_IMAGE_URL}
        tagline={ProjectTagline}
      />

      {/* 2. 서브 탭 */}
      <SubNav items={NINC_NAV_ITEMS} />

      {/* 3. 산학협력 / 가족회사 로고 */}
      <ProjectPartners />

      {/* 4. 산학협력 / 해외교류 쇼케이스 */}
      <section className="bg-white pt-20 sm:pt-24 lg:pt-[120px]">
        <AnimateOnScroll variant="fade-up" className="text-center pb-10 sm:pb-14 lg:pb-[70px]">
          <h2 className="font-body font-bold text-[22px] sm:text-[24px] lg:text-[25px] text-[#050505]">
            산학협력/해외교류
          </h2>
          <p className="mt-3 lg:mt-[14px] font-body text-[15px] sm:text-[17px] lg:text-[18px] leading-[27px] text-[#888]">
            뉴미디어콘텐츠과 학생들의 현장에서의 모습을 소개합니다
          </p>
        </AnimateOnScroll>

        <div className="flex flex-col gap-16 sm:gap-20 lg:gap-[80px] pb-20 sm:pb-24 lg:pb-[120px]">
          {showcaseBlocks.map((block, i) => (
            <ProjectShowcase key={`${block.label}-${i}`} block={block} />
          ))}
        </div>
      </section>
    </SubPageLayout>
  )
}
