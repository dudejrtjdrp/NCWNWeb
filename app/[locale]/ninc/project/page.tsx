/**
 * TARGET 페이지: NINC/Project
 * Server Component — Supabase에서 프로젝트 데이터를 가져와 ProjectClient에 전달
 */

import type { Metadata } from 'next'
import SubPageLayout from '@/components/layout/SubPageLayout'
import NincHeroBanner from '@/components/base/NincHeroBanner'
import { getProjects } from '@/lib/supabase/queries/projects'
import ProjectClient from './ProjectClient'

export const metadata: Metadata = {
  title: 'PROJECT — Now In NewCon',
  description:
    '동아방송예술대학교 뉴미디어콘텐츠과 학생들의 프로젝트를 소개합니다.',
  keywords: ['뉴미디어콘텐츠과', '학생 프로젝트', 'Now In NewCon', 'NINC', '동아방송예술대학교'],
  alternates: { canonical: '/ninc/project' },
  openGraph: {
    type: 'website',
    title: 'PROJECT — Now In NewCon | NWCN',
    description: '뉴미디어콘텐츠과 학생들의 다양한 프로젝트를 만나보세요.',
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

export default async function ProjectPage() {
  const projects = await getProjects()

  return (
    <SubPageLayout>
      {/* 1. 히어로 배너 */}
      <NincHeroBanner
        pageName="PROJECT"
        heroImageUrl={HERO_IMAGE_URL}
        tagline={ProjectTagline}
      />

      {/* 2. 검색 + 그리드 + 페이지네이션 (Client Component) */}
      <ProjectClient initialProjects={projects} />
    </SubPageLayout>
  )
}
