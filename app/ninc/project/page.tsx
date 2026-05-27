/**
 * TARGET 페이지: NINC/Project
 * Server Component — Supabase에서 프로젝트 데이터를 가져와 ProjectClient에 전달
 */

import SubPageLayout from '@/components/layout/SubPageLayout'
import NincHeroBanner from '@/components/base/NincHeroBanner'
import { getProjects } from '@/lib/supabase/queries/projects'
import ProjectClient from './ProjectClient'

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
