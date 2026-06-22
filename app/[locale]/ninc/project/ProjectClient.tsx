'use client'

import NincCardGrid from '@/components/base/NincCardGrid'
import Tag from '@/components/base/Tag'
import { useFilter } from '@/hooks/useFilter'
import { usePagination } from '@/hooks/usePagination'
import { resolveThumbnail } from '@/lib/mock-thumbnail'
import type { ProjectItem } from '@/lib/supabase/queries/projects'

const PROJECT_TAG: Record<'industry' | 'international', 'primary' | 'secondary'> = {
  industry: 'primary',
  international: 'secondary',
}

const PROJECT_LABEL: Record<'industry' | 'international', string> = {
  industry: '산학협력',
  international: '해외교류',
}

const PAGE_SIZE = 9

interface Props {
  initialProjects: ProjectItem[]
}

export default function ProjectClient({ initialProjects }: Props) {
  const { query, setQuery, filtered } = useFilter(
    initialProjects,
    (p, q) =>
      p.title.toLowerCase().includes(q) ||
      (p.partner ?? '').toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q) ||
      PROJECT_LABEL[p.type].includes(q)
  )

  const { page, setPage, totalPages, paged, reset } = usePagination(filtered, PAGE_SIZE)

  const handleSearchChange = (value: string) => {
    setQuery(value)
    reset()
  }

  const pagedItems = paged.map((p) => ({
    id: p.id,
    thumbnail: resolveThumbnail(p.thumbnail_url, p.id),
    caption: p.title,
    subCaption: `${p.partner ?? ''} · ${p.year}`,
    badge: (
      <Tag type={PROJECT_TAG[p.type]}>
        {PROJECT_LABEL[p.type]}
      </Tag>
    ),
  }))

  return (
    <NincCardGrid
      items={pagedItems}
      searchValue={query}
      onSearchChange={handleSearchChange}
      searchPlaceholder="프로젝트명, 파트너, 유형 검색"
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
      sectionTitle="PROJECT"
      emptyMessage="검색 결과가 없습니다"
      getHref={(id) => `/ninc/project/${id}`}
    />
  )
}
