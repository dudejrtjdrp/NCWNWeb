'use client'

import NincCardGrid from '@/components/base/NincCardGrid'
import Badge from '@/components/ui/Badge'
import { useFilter } from '@/hooks/useFilter'
import { usePagination } from '@/hooks/usePagination'
import type { AwardItem } from '@/lib/supabase/queries/awards'

const AWARD_BADGE_VARIANT: Record<string, 'new' | 'hot' | 'number'> = {
  '대상': 'new',
  '금상': 'new',
  '최우수상': 'hot',
  '우수상': 'hot',
  '장려상': 'number',
}

const PAGE_SIZE = 9

interface Props {
  initialAwards: AwardItem[]
}

export default function AwardsClient({ initialAwards }: Props) {
  const { query, setQuery, filtered } = useFilter(
    initialAwards,
    (a, q) =>
      a.competition.toLowerCase().includes(q) ||
      a.award_name.toLowerCase().includes(q) ||
      (a.winner ?? '').toLowerCase().includes(q) ||
      a.team_members.some((m) => m.toLowerCase().includes(q))
  )

  const { page, setPage, totalPages, paged, reset } = usePagination(filtered, PAGE_SIZE)

  const handleSearchChange = (value: string) => {
    setQuery(value)
    reset()
  }

  const pagedItems = paged.map((a) => ({
    id: a.id,
    caption: a.competition,
    subCaption: `${a.year}`,
    badge: (
      <Badge variant={AWARD_BADGE_VARIANT[a.award_name] ?? 'number'}>
        {a.award_name}
      </Badge>
    ),
  }))

  return (
    <NincCardGrid
      items={pagedItems}
      searchValue={query}
      onSearchChange={handleSearchChange}
      searchPlaceholder="대회명, 수상 등급, 수상자 검색"
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
      sectionTitle="AWARDS"
      emptyMessage="검색 결과가 없습니다"
      getHref={(id) => `/ninc/awards/${id}`}
    />
  )
}
