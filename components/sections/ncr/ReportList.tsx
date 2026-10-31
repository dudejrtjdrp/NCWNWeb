/**
 * NCR 리포트 목록 조각 (E4)
 * - ReportFeature: 가장 최근 리포트 한 편을 크게(사진 7칸 + 글 5칸)
 * - ReportRows: 사진 + 유형·시즌·날짜 / 제목 / 요약 한 줄씩
 * - SeasonList: 아카이브용 촘촘한 표 줄(날짜 · 유형 · 제목)
 */

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import type { NcrReportListItem } from '@/lib/supabase/queries/ncr'
import { reportDate } from './report-utils'

type Labels = { types: Record<string, string>; read: string; readTime: (t: string) => string }

const meta = (r: NcrReportListItem, types: Record<string, string>) =>
  [types[r.type] ?? r.type, r.season, reportDate(r.published_at)].filter(Boolean).join(' · ')

export function ReportFeature({ report, labels, badge }: { report: NcrReportListItem; labels: Labels; badge: string }) {
  return (
    <Link
      href={`/ncr-trend/${report.id}`}
      className="group grid grid-cols-12 gap-x-6 gap-y-6 border-t border-nwcn-dark pt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark"
    >
      <div className="relative col-span-12 aspect-[16/10] overflow-hidden bg-nwcn-dark lg:col-span-7">
        {report.thumbnail_url && (
          <Image
            src={report.thumbnail_url}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 56vw, 100vw"
            className="object-cover transition-transform duration-slow ease-nwcn group-hover:scale-[1.02]"
          />
        )}
        <span className="absolute left-0 top-0 bg-nwcn-dark px-3 py-1.5 font-bold text-body-sm text-white">{badge}</span>
      </div>
      <div className="col-span-12 flex min-w-0 flex-col lg:col-span-5">
        <p className="font-semibold tabular-nums text-body-sm text-nwcn-neutral-600">{meta(report, labels.types)}</p>
        <h3 className="m-0 mt-3 font-extrabold text-statement decoration-nwcn-green-darker decoration-2 underline-offset-4 group-hover:underline">
          {report.title}
        </h3>
        {report.excerpt && <p className="mt-5 text-list">{report.excerpt}</p>}
        <p className="mt-6 text-body-sm text-nwcn-neutral-600">
          {[report.author, report.read_time && labels.readTime(report.read_time)].filter(Boolean).join(' · ')}
        </p>
        <span className="mt-6 inline-flex items-center gap-2 self-start font-semibold text-body-sm lg:mt-auto lg:pt-8">
          {labels.read}
          <span aria-hidden="true" className="transition-transform duration-fast ease-nwcn group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  )
}

export function ReportRows({ reports, labels }: { reports: NcrReportListItem[]; labels: Labels }) {
  return (
    <ul className="border-b border-nwcn-dark">
      {reports.map((r) => (
        <li key={r.id} className="border-t border-nwcn-dark">
          <Link
            href={`/ncr-trend/${r.id}`}
            className="group grid grid-cols-12 gap-x-6 gap-y-4 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark"
          >
            <div className="relative col-span-12 aspect-[16/10] overflow-hidden bg-nwcn-dark sm:col-span-4 lg:col-span-3">
              {r.thumbnail_url && (
                <Image src={r.thumbnail_url} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw" className="object-cover transition-transform duration-slow ease-nwcn group-hover:scale-[1.02]" />
              )}
            </div>
            <div className="col-span-12 flex min-w-0 flex-col sm:col-span-8 lg:col-span-7">
              <p className="font-semibold tabular-nums text-body-sm text-nwcn-neutral-600">{meta(r, labels.types)}</p>
              <h3 className="m-0 mt-2 font-bold text-statement decoration-nwcn-green-darker decoration-2 underline-offset-4 group-hover:underline">
                {r.title}
              </h3>
              {r.excerpt && <p className="mt-3 line-clamp-2 text-list">{r.excerpt}</p>}
            </div>
            <p className="col-span-12 text-body-sm text-nwcn-neutral-600 lg:col-span-2 lg:text-right">
              {[r.author, r.read_time && labels.readTime(r.read_time)].filter(Boolean).join(' · ')}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function SeasonList({ reports, types }: { reports: NcrReportListItem[]; types: Record<string, string> }) {
  return (
    <ul className="border-b border-nwcn-dark">
      {reports.map((r) => (
        <li key={r.id} className="border-t border-nwcn-rule first:border-nwcn-dark">
          <Link
            href={`/ncr-trend/${r.id}`}
            className="group grid grid-cols-12 items-baseline gap-x-6 gap-y-1 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark"
          >
            <span className="col-span-6 font-semibold tabular-nums text-body-sm sm:col-span-2">{reportDate(r.published_at)}</span>
            <span className="col-span-6 text-body-sm text-nwcn-neutral-600 sm:col-span-2">{types[r.type] ?? r.type}</span>
            <span className="col-span-12 flex items-baseline justify-between gap-4 font-semibold text-list sm:col-span-8">
              <span className="min-w-0 decoration-nwcn-green-darker decoration-2 underline-offset-4 group-hover:underline">{r.title}</span>
              <span aria-hidden="true" className="shrink-0 transition-transform duration-fast ease-nwcn group-hover:translate-x-1">→</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
