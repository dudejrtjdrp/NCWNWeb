/**
 * PortfolioCard — 졸업생 카드 (E4)
 * 프로필 사진(4:5) → 1px 선 → 이름 / 분야 / 한 줄 소개.
 * 포트폴리오가 공개된 학생: 카드 전체가 개인 포트폴리오로 이어지고, 마우스를 올리거나 키보드로 고르면
 *   학생이 만든 원본 표지로 바뀜(어두운 판 위에 통째로).
 * 아직 없는 학생: 링크 없이 사진·이름만, 이름 아래 '포트폴리오 준비 중'.
 */

import Image from 'next/image'
import type { ReactNode } from 'react'
import { Link } from '@/i18n/navigation'
import type { GraduateCard } from '@/lib/supabase/queries/portfolios'

export default function PortfolioCard({
  item,
  labels,
  priority,
}: {
  item: GraduateCard
  labels: { profileAlt: string; coverHint: string; preparing: string }
  priority?: boolean
}) {
  const ready = Boolean(item.slug)
  const body: ReactNode = (
    <>
      <span className="relative block aspect-[4/5] overflow-hidden bg-nwcn-neutral-200">
        {item.photo && (
          <Image
            src={item.photo}
            alt={labels.profileAlt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        )}
        {ready && item.cover && (
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-nwcn-dark opacity-0 transition-opacity duration-slow ease-nwcn group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            <Image src={item.cover} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="poster-shadow object-contain p-[7%]" />
            <span className="absolute left-0 top-0 bg-nwcn-paper px-2 py-1 font-semibold text-caption text-nwcn-dark">{labels.coverHint}</span>
          </span>
        )}
      </span>
      <span className="mt-3 flex items-baseline justify-between gap-3 border-t border-nwcn-dark pt-3">
        <span
          className={
            ready
              ? 'min-w-0 font-bold text-statement decoration-nwcn-green-darker decoration-2 underline-offset-4 group-hover:underline'
              : 'min-w-0 font-bold text-statement'
          }
        >
          {item.name}
        </span>
        {ready && (
          <span aria-hidden="true" className="shrink-0 transition-transform duration-fast ease-nwcn group-hover:translate-x-1">→</span>
        )}
      </span>
      {!ready && <span className="mt-1 text-body-sm text-nwcn-neutral-600">{labels.preparing}</span>}
      {item.fields.length > 0 && <span className="mt-1 text-body-sm text-nwcn-neutral-600">{item.fields.join(' · ')}</span>}
      {item.tagline && <span className="mt-2 text-list">{item.tagline}</span>}
    </>
  )

  return (
    <li className="min-w-0">
      {ready ? (
        <Link
          href={`/work/portfolio/${item.slug}`}
          className="group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark focus-visible:ring-offset-4 focus-visible:ring-offset-nwcn-paper"
        >
          {body}
        </Link>
      ) : (
        <div className="flex flex-col">{body}</div>
      )}
    </li>
  )
}
