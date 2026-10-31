/**
 * AwardsList — 수상 목록 (E4)
 * 연도마다 한 덩어리: 연도 제목 + 건수, 그 아래 한 줄씩(썸네일 · 대회와 상 · 수상자 · 주최/분야 · 자세히).
 */

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { AwardItem } from '@/lib/supabase/queries/awards'

export const awardYearAnchor = (year: number) => `y${year}`

export default function AwardsList({ awards }: { awards: AwardItem[] }) {
  const t = useTranslations('ninc.awardsPage')

  if (awards.length === 0) {
    return <p className="mt-chapter border-y border-nwcn-dark py-6 font-bold text-statement">{t('empty')}</p>
  }

  const years = [...new Set(awards.map((a) => a.year))].sort((a, b) => b - a)

  return (
    <>
      {years.map((year) => {
        const list = awards.filter((a) => a.year === year)
        return (
          <section key={year} id={awardYearAnchor(year)} aria-labelledby={`${awardYearAnchor(year)}-t`} className="scroll-mt-36 pt-chapter">
            <div className="mb-6 flex items-baseline justify-between gap-6">
              <h2 id={`${awardYearAnchor(year)}-t`} className="m-0 font-extrabold tabular-nums text-headline">
                {t('yearTitle', { year })}
              </h2>
              <p className="font-semibold tabular-nums text-body-sm">{t('count', { n: list.length })}</p>
            </div>
            <ul className="border-b border-nwcn-dark">
              {list.map((a) => {
                const people = [a.winner, ...(a.team_members ?? [])].filter((v, i, arr): v is string => !!v && arr.indexOf(v) === i)
                return (
                  <li key={a.id} className="border-t border-nwcn-dark">
                    <Link
                      href={`/ninc/awards/${a.id}`}
                      className="group grid grid-cols-12 gap-x-6 gap-y-3 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark"
                    >
                      <div className="relative col-span-4 aspect-[4/3] overflow-hidden bg-nwcn-neutral-200 sm:col-span-3 lg:col-span-2">
                        {a.thumbnail_url && (
                          <Image src={a.thumbnail_url} alt="" fill sizes="(min-width: 1024px) 15vw, 30vw" className="object-cover" />
                        )}
                      </div>
                      <div className="col-span-8 flex min-w-0 flex-col sm:col-span-9 lg:col-span-6">
                        <p className="text-body-sm text-nwcn-neutral-600">{a.competition}</p>
                        <h3 className="m-0 mt-1 font-bold text-statement decoration-nwcn-green-darker decoration-2 underline-offset-4 group-hover:underline">
                          {a.award_name}
                        </h3>
                      </div>
                      <dl className="col-span-12 grid grid-cols-12 content-start gap-x-6 gap-y-1 text-body-sm lg:col-span-4">
                        {people.length > 0 && (
                          <>
                            <dt className="col-span-4 text-nwcn-neutral-600">{t('winners')}</dt>
                            <dd className="col-span-8">{people.join(', ')}</dd>
                          </>
                        )}
                        {a.hosted_by && (
                          <>
                            <dt className="col-span-4 text-nwcn-neutral-600">{t('host')}</dt>
                            <dd className="col-span-8">{a.hosted_by}</dd>
                          </>
                        )}
                        {a.category && (
                          <>
                            <dt className="col-span-4 text-nwcn-neutral-600">{t('category')}</dt>
                            <dd className="col-span-8">{a.category}</dd>
                          </>
                        )}
                      </dl>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </>
  )
}
