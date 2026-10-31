/**
 * PortfolioCard — 졸업생 포트폴리오 카드 (E4)
 * 프로필 사진(4:5) → 마우스를 올리거나 키보드로 고르면 학생이 만든 원본 표지로 바뀜(어두운 판 위에 통째로)
 * → 1px 선 → 이름 / 분야 / 한 줄 소개. 개성은 원본 표지로, 정보는 같은 형식으로 보여 준다.
 */

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import type { PortfolioListItem } from '@/lib/supabase/queries/portfolios'

export default function PortfolioCard({
  item,
  labels,
  priority,
}: {
  item: PortfolioListItem
  labels: { profileAlt: string; coverHint: string }
  priority?: boolean
}) {
  return (
    <li className="min-w-0">
      <Link
        href={`/work/portfolio/${item.slug}`}
        className="group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark focus-visible:ring-offset-4 focus-visible:ring-offset-nwcn-paper"
      >
        <span className="relative block aspect-[4/5] overflow-hidden bg-nwcn-neutral-200">
          {item.profile_url && (
            <Image
              src={item.profile_url}
              alt={labels.profileAlt}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover"
            />
          )}
          {item.cover_url && (
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-nwcn-dark opacity-0 transition-opacity duration-slow ease-nwcn group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              <Image src={item.cover_url} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="poster-shadow object-contain p-[7%]" />
              <span className="absolute left-0 top-0 bg-nwcn-paper px-2 py-1 font-semibold text-caption text-nwcn-dark">{labels.coverHint}</span>
            </span>
          )}
        </span>
        <span className="mt-3 flex items-baseline justify-between gap-3 border-t border-nwcn-dark pt-3">
          <span className="min-w-0 font-bold text-statement decoration-nwcn-green-darker decoration-2 underline-offset-4 group-hover:underline">
            {item.name}
          </span>
          <span aria-hidden="true" className="shrink-0 transition-transform duration-fast ease-nwcn group-hover:translate-x-1">→</span>
        </span>
        {item.fields.length > 0 && <span className="mt-1 text-body-sm text-nwcn-neutral-600">{item.fields.join(' · ')}</span>}
        {item.tagline && <span className="mt-2 text-list">{item.tagline}</span>}
      </Link>
    </li>
  )
}
