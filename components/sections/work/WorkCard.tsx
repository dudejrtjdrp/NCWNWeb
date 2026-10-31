/**
 * WorkCard — 학생 작품 카드 (E4)
 * 직각 썸네일(4:3) → 1px 선 → 제목 / 이름 · 연도 / 분야. 서버·클라이언트 어디서나 쓸 수 있게 훅 없이 작성.
 */

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import type { WorkListItem, WorkType } from '@/lib/supabase/queries/works'

export interface WorkCardProps {
  work: WorkListItem
  typeLabel: Record<WorkType, string>
  priority?: boolean
}

export default function WorkCard({ work, typeLabel, priority }: WorkCardProps) {
  const tags = (work.tech_stack ?? []).filter(Boolean)
  return (
    <li className="min-w-0">
      <Link
        href={`/work/${work.id}`}
        className="group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark focus-visible:ring-offset-4 focus-visible:ring-offset-nwcn-paper"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-nwcn-neutral-200">
          {work.thumbnail_url ? (
            <Image
              src={work.thumbnail_url}
              alt={work.title}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 100vw"
              className="object-cover transition-transform duration-slow ease-nwcn group-hover:scale-[1.02]"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center font-black text-statement text-nwcn-neutral-400">
              NWCN
            </span>
          )}
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-nwcn-dark pt-3">
          <h3 className="m-0 line-clamp-2 font-bold text-list decoration-nwcn-green-darker decoration-2 underline-offset-4 group-hover:underline">
            {work.title}
          </h3>
          <span aria-hidden="true" className="shrink-0 transition-transform duration-fast ease-nwcn group-hover:translate-x-1">
            →
          </span>
        </div>
        <p className="mt-1 text-body-sm">
          {work.author} · {work.year}
        </p>
        <p className="mt-0.5 text-body-sm text-nwcn-neutral-600">
          {[typeLabel[work.type], ...tags].filter((v, i, a) => a.indexOf(v) === i).join(' · ')}
        </p>
      </Link>
    </li>
  )
}
