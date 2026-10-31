/**
 * AwardArticle — 수상 상세 본문 (E4)
 * 큰 제목(상 이름, 위에 대회명) + 정보표 → 사진 → 수상 소개 → 다른 수상 3개.
 */

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { DetailMedia, InfoTable } from '@/components/sections/editorial/DetailParts'
import type { AwardItem } from '@/lib/supabase/queries/awards'

export default function AwardArticle({ award, others }: { award: AwardItem; others: AwardItem[] }) {
  const t = useTranslations('ninc.awards.detail')
  const team = (award.team_members ?? []).filter((m) => m && m !== award.winner)

  const rows = [
    { label: t('competition'), value: award.competition },
    ...(award.winner ? [{ label: t('winner'), value: award.winner }] : []),
    ...(team.length ? [{ label: t('teamMembers'), value: team.join(', ') }] : []),
    { label: t('year'), value: <span className="tabular-nums">{award.year}</span> },
    ...(award.hosted_by ? [{ label: t('host'), value: award.hosted_by }] : []),
    ...(award.category ? [{ label: t('category'), value: award.category }] : []),
  ]

  return (
    <div className="mx-auto max-w-page border-t border-nwcn-dark">
      <div className="editorial-container pb-24">
        <header className="grid grid-cols-12 gap-x-6 gap-y-8 pt-5">
          <div className="col-span-12 flex min-w-0 flex-col lg:col-span-8">
            <Link href="/ninc/awards" className="editorial-link self-start font-semibold text-body-sm">
              <span aria-hidden="true">← </span>
              {t('backToList')}
            </Link>
            <p className="mt-10 font-semibold text-list text-nwcn-neutral-600 lg:mt-14">{award.competition}</p>
            <h1 className="m-0 mt-2 break-words font-extrabold text-headline">{award.award_name}</h1>
          </div>
          <div className="col-span-12 self-end lg:col-span-4">
            <InfoTable rows={rows} />
          </div>
        </header>

        {award.thumbnail_url && (
          <div className="mt-12">
            <DetailMedia src={award.thumbnail_url} alt={`${award.competition} ${award.award_name}`} />
          </div>
        )}

        <section aria-labelledby="award-intro" className="grid grid-cols-12 gap-x-6 pt-chapter">
          <div className="col-span-12 lg:col-span-7">
            <h2 id="award-intro" className="m-0 border-t border-nwcn-dark pt-3.5 font-bold text-section">
              {t('sectionIntro')}
            </h2>
            <p className="mt-5 whitespace-pre-line text-list">{award.description || t('noDescription')}</p>
          </div>
        </section>

        {others.length > 0 && (
          <section aria-labelledby="award-more" className="pt-chapter">
            <h2 id="award-more" className="m-0 mb-6 font-extrabold text-headline">{t('other')}</h2>
            <ul className="border-b border-nwcn-dark">
              {others.map((a) => (
                <li key={a.id} className="border-t border-nwcn-dark">
                  <Link href={`/ninc/awards/${a.id}`} className="group grid grid-cols-12 gap-x-6 gap-y-1 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark">
                    <span className="col-span-12 font-semibold tabular-nums text-body-sm text-nwcn-neutral-600 sm:col-span-2">{a.year}</span>
                    <span className="col-span-12 text-body-sm text-nwcn-neutral-600 sm:col-span-4">{a.competition}</span>
                    <span className="col-span-12 flex items-baseline justify-between gap-3 font-bold text-list sm:col-span-6">
                      <span className="decoration-nwcn-green-darker decoration-2 underline-offset-4 group-hover:underline">{a.award_name}</span>
                      <span aria-hidden="true" className="transition-transform duration-fast ease-nwcn group-hover:translate-x-1">→</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
