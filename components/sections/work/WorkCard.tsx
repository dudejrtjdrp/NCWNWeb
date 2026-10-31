/**
 * WorkCard — 학생 작품 카드 (E4)
 * 직각 썸네일 → 1px 선 → 제목 / 제작자 · 연도 / 분야. 서버·클라이언트 어디서나 쓸 수 있게 훅 없이 작성.
 *
 * variant
 *  - grid    : 목록용 (썸네일 4:3 위, 글 아래)
 *  - feature : 크게 한 장 (상세 하단 "다른 작품"의 큰 칸)
 *  - compact : 작게 가로로 (sm 이상에서 썸네일 왼쪽, 글 오른쪽)
 */

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import type { WorkListItem, WorkType } from '@/lib/supabase/queries/works'
import { creatorRefs } from '@/lib/work-creators'

export interface WorkCardProps {
  work: WorkListItem
  typeLabel: Record<WorkType, string>
  priority?: boolean
  variant?: 'grid' | 'feature' | 'compact'
  as?: 'li' | 'div'
  /** 제목 위 작은 검정 꼬리표 (예: '같은 제작자') */
  badge?: string
  className?: string
}

export default function WorkCard({ work, typeLabel, priority, variant = 'grid', as = 'li', badge, className }: WorkCardProps) {
  const Tag = as
  const tags = (work.tech_stack ?? []).filter(Boolean)
  const fields = [typeLabel[work.type], ...tags].filter((v, i, a) => a.indexOf(v) === i).join(' · ')
  const compact = variant === 'compact'
  const sizes =
    variant === 'feature'
      ? '(min-width: 1024px) 55vw, 100vw'
      : compact
        ? '(min-width: 640px) 20vw, 100vw'
        : '(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 100vw'

  return (
    <Tag className={cn('min-w-0', className)}>
      <Link
        href={`/work/${work.id}`}
        className={cn(
          'group flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark focus-visible:ring-offset-4 focus-visible:ring-offset-nwcn-paper',
          compact ? 'flex-col gap-3 sm:flex-row sm:gap-5' : 'flex-col'
        )}
      >
        <div className={cn('relative shrink-0 overflow-hidden bg-nwcn-neutral-200', compact ? 'aspect-[4/3] sm:w-[46%]' : 'aspect-[4/3]')}>
          {work.thumbnail_url ? (
            <Image
              src={work.thumbnail_url}
              alt={work.title}
              fill
              priority={priority}
              sizes={sizes}
              className="object-cover transition-transform duration-slow ease-nwcn group-hover:scale-[1.02]"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center font-black text-statement text-nwcn-neutral-400">NWCN</span>
          )}
        </div>
        <div className={cn('flex min-w-0 flex-1 flex-col', compact ? 'sm:border-t sm:border-nwcn-dark sm:pt-3' : '')}>
          {badge && <span className="mb-2 mt-3 self-start bg-nwcn-dark px-1.5 py-0.5 text-caption font-semibold text-nwcn-paper sm:mt-0">{badge}</span>}
          <div className={cn('flex items-baseline justify-between gap-3', compact ? 'border-t border-nwcn-dark pt-3 sm:border-0 sm:pt-0' : 'mt-3 border-t border-nwcn-dark pt-3', badge && !compact ? 'mt-0' : '')}>
            <h3
              className={cn(
                'm-0 line-clamp-2 font-bold decoration-nwcn-green-darker decoration-2 underline-offset-4 group-hover:underline',
                variant === 'feature' ? 'text-statement' : 'text-list'
              )}
            >
              {work.title}
            </h3>
            <span aria-hidden="true" className="shrink-0 transition-transform duration-fast ease-nwcn group-hover:translate-x-1">
              →
            </span>
          </div>
          <p className="mt-1 text-body-sm">
            {creatorRefs(work).map((c) => c.name).join(', ')} · {work.year}
          </p>
          {fields && <p className="mt-0.5 text-body-sm text-nwcn-neutral-600">{fields}</p>}
        </div>
      </Link>
    </Tag>
  )
}
