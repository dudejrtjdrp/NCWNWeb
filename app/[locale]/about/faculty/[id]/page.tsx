/**
 * 교수진 상세 페이지
 * Route: /about/faculty/[id]
 *
 * ─ 리팩터링 이력 ─────────────────────────────────────
 * Before: 인라인 구현 (카드 이미지 + 이름 + 한마디 + 학력/경력 분리 레이아웃)
 * After : ProfessorDetailSection BASE 컴포넌트 통합
 *   - Figma node-id: 926:430 (ABOUT/Faculty/Detail/배윤경/Desktop)
 *   - 프로필 사진 + CAREER + 이름/이메일 + INTERVIEW Q&A + 인용 문구
 *   - 모든 교수진에게 동일한 템플릿 적용 (interview 데이터 없으면 기본 뷰)
 * ──────────────────────────────────────────────────────
 */

import { notFound } from 'next/navigation'
import SubPageLayout from '@/components/layout/SubPageLayout'
import ProfessorDetailSection from '@/components/base/ProfessorDetailSection'
import { FACULTY_LIST } from '@/lib/faculty-data'

// ──────────────────────────────────────────────────────
// Static Params (빌드 시 정적 생성)
// ──────────────────────────────────────────────────────
export function generateStaticParams() {
  return FACULTY_LIST.map((f) => ({ id: f.id }))
}

// ──────────────────────────────────────────────────────
// Metadata
// ──────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id } = await params
  const faculty = FACULTY_LIST.find((f) => f.id === id)
  if (!faculty) return { title: '교수진 — NWCN' }

  const displayName = faculty.roleLabel
    ? `${faculty.nameKo} (${faculty.roleLabel})`
    : faculty.nameKo

  return {
    title: `${displayName} — ABOUT | NWCN`,
    description: faculty.quote,
  }
}

// ──────────────────────────────────────────────────────
// Page Component
// ──────────────────────────────────────────────────────
export default async function FacultyDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id } = await params
  const faculty = FACULTY_LIST.find((f) => f.id === id)
  if (!faculty) notFound()

  return (
    <SubPageLayout>
      <ProfessorDetailSection faculty={faculty} />
    </SubPageLayout>
  )
}
