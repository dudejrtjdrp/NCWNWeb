/**
 * 프로젝트 세부 페이지: /ninc/project/[id] — E4 틀
 * 종이 바탕, NINC 위치·하위 메뉴 줄 → 본문(ProjectArticle): 큰 제목 + 정보표 → 사진
 * → 프로젝트 소개 | 결과물·참여 학생·활용 기술 → 다른 프로젝트.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SubPageLayout from '@/components/layout/SubPageLayout'
import NincLocalBar from '@/components/sections/ninc/NincLocalBar'
import ProjectArticle from '@/components/sections/ninc/ProjectArticle'
import { getProjectById, getProjects } from '@/lib/supabase/queries/projects'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.dima-nwcn.com'

/** 동적 메타데이터 — 프로젝트 상세 */
export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }): Promise<Metadata> {
  const { id } = await params
  const project = await getProjectById(id)
  if (!project) return { title: '프로젝트를 찾을 수 없습니다' }

  const title = project.title
  const description =
    project.description?.replace(/\s+/g, ' ').slice(0, 160) ??
    `${project.year}년 뉴미디어콘텐츠과 ${project.type === 'international' ? '해외교류' : '산학협력'} 프로젝트 "${project.title}"입니다.`
  const url = `${SITE_URL}/ninc/project/${project.id}`

  return {
    title,
    description,
    keywords: ['뉴미디어콘텐츠과', '프로젝트', project.type === 'international' ? '해외교류' : '산학협력', project.partner ?? '', String(project.year)].filter(Boolean),
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      locale: 'ko_KR',
      siteName: 'NWCN',
      images: project.thumbnail_url ? [{ url: project.thumbnail_url, alt: title }] : undefined,
    },
  }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params
  const [project, all] = await Promise.all([getProjectById(id, locale), getProjects(locale)])
  if (!project) notFound()

  // 다른 프로젝트: 같은 유형 먼저, 그다음 최근 순으로 3개
  const others = all
    .filter((p) => p.id !== project.id)
    .sort((a, b) => Number(b.type === project.type) - Number(a.type === project.type) || b.year - a.year)
    .slice(0, 3)

  return (
    <SubPageLayout tone="paper">
      <NincLocalBar />
      <ProjectArticle project={project} others={others} />
    </SubPageLayout>
  )
}
