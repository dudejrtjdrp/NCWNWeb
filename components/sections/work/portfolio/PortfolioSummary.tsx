/**
 * PortfolioSummary — 개인 페이지 '학과 정리본' (E4)
 * 소개 → 프로젝트(최대 8, 왼쪽 정보 칸이 따라옴, 이미지는 눌러서 크게, 프로젝트 페이지로 연결) → 원본 미리보기 줄 → 이력(최신순, 날짜 열) → 연락 → 쇼케이스 작품.
 * 프로젝트 사이 이동은 탭 줄 오른쪽 번호(01 02 …)로 — 위에 따로 목차를 두면 아래 프로젝트와 겹쳐 보여서 뺐다.
 * 글 속 주소(결과·설명 등)는 링크로 바뀐다.
 * 모든 졸업생이 같은 형식이라 서로 비교해 보기 쉽고, 개성은 원본 쪽에서 본다.
 */

import Image from 'next/image'
import { Fragment } from 'react'
import { useTranslations } from 'next-intl'
import { InfoTable } from '@/components/sections/editorial/DetailParts'
import Linkify from './Linkify'
import ProjectGallery from './ProjectGallery'
import { contactLinks, splitDated, MAX_PORTFOLIO_PROJECTS } from './portfolio-utils'
import { Link } from '@/i18n/navigation'
import WorkCard from '@/components/sections/work/WorkCard'
import { normalizeVideoEmbed } from '@/lib/youtube'
import type { PortfolioItem, PortfolioProject } from '@/lib/supabase/queries/portfolios'
import type { WorkListItem, WorkType } from '@/lib/supabase/queries/works'

const num = (n: number) => String(n).padStart(2, '0')
const safeUrl = (u?: string | null) => (u && /^https?:\/\//.test(u) ? u : null)

function Project({ p, n, teamSlugs, workId }: { p: PortfolioProject; n: number; teamSlugs: Record<string, string>; workId?: string }) {
  const t = useTranslations('work.portfolio.detail')
  const video = normalizeVideoEmbed(p.video)
  const cover = p.cover || p.images[0] || null
  const rest = p.images.filter((src) => src !== cover)
  const links = (p.links ?? []).filter((l) => safeUrl(l.url))
  const rows = [
    ...(p.year ? [{ label: t('year'), value: <span className="tabular-nums">{p.year}</span> }] : []),
    ...(p.fields.length ? [{ label: t('fields'), value: p.fields.join(' · ') }] : []),
    ...(p.format ? [{ label: t('format'), value: p.format }] : []),
    // 팀원 — 졸업생 DB 와 이어진 사람은 그 졸업생 페이지로
    ...(p.team?.length
      ? [
          {
            label: t('team'),
            value: (
              <span>
                {p.team.map((m, i) => {
                  const slug = m.student_id ? teamSlugs[m.student_id] : undefined
                  return (
                    <Fragment key={`${m.name}-${i}`}>
                      {i > 0 && ', '}
                      {slug ? (
                        <Link href={`/work/portfolio/${slug}`} className="editorial-link underline decoration-1 underline-offset-4">
                          {m.name}
                        </Link>
                      ) : (
                        m.name
                      )}
                    </Fragment>
                  )
                })}
              </span>
            ),
          },
        ]
      : []),
    ...(p.role ? [{ label: t('role'), value: p.role }] : []),
    ...(p.tools.length ? [{ label: t('tools'), value: p.tools.join(', ') }] : []),
  ]
  return (
    <section id={`p${n}`} aria-labelledby={`p${n}-t`} className="scroll-mt-36 pt-chapter">
      <div className="grid grid-cols-12 gap-x-6 gap-y-8 border-t border-nwcn-dark pt-5">
        {/* 왼쪽 정보 칸 — 데스크톱에서 오른쪽 긴 이미지·글을 따라 내려온다 (탭 줄 아래) */}
        <div className="col-span-12 flex flex-col lg:sticky lg:top-32 lg:col-span-4 lg:self-start">
          <p className="m-0 font-black tabular-nums leading-none text-headline">{num(n)}</p>
          <h3 id={`p${n}-t`} className="m-0 mt-4 break-words font-extrabold text-statement">{p.title}</h3>
          {rows.length > 0 && (
            <div className="mt-6">
              <InfoTable rows={rows} />
            </div>
          )}
          {/* 이 프로젝트의 작품 페이지(학생 작품) — 조회수·다른 작품 추천이 있는 곳 */}
          {workId && (
            <Link
              href={`/work/${workId}`}
              className="mt-4 flex items-center justify-between gap-3 border border-nwcn-dark px-4 py-3 font-semibold text-body-sm transition-colors duration-fast ease-nwcn hover:bg-nwcn-dark hover:text-white"
            >
              {t('projectPage')}
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
        <div className="col-span-12 min-w-0 lg:col-span-8">
          <ProjectGallery
            cover={cover}
            rest={rest}
            title={p.title}
            labels={{ open: t('zoom'), close: t('zoomClose'), prev: t('zoomPrev'), next: t('zoomNext') }}
          />
          {p.summary && <p className="mt-6 font-semibold text-lead">{p.summary}</p>}
          {p.description && (
            <p className="mt-4 whitespace-pre-line text-list">
              <Linkify text={p.description} />
            </p>
          )}
          {p.points.length > 0 && (
            <div className="mt-8">
              <p className="m-0 border-t border-nwcn-dark pt-3 font-bold text-body-sm">{t('points')}</p>
              <ul className="mt-2">
                {p.points.map((pt, i) => (
                  <li key={i} className="flex gap-4 border-b border-nwcn-rule py-2.5 text-list last:border-b-0">
                    <span aria-hidden="true" className="font-semibold tabular-nums text-nwcn-neutral-600">{num(i + 1)}</span>
                    <span className="min-w-0">
                      <Linkify text={pt} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {p.outcome && (
            <p className="mt-6 border-t border-nwcn-dark pt-3 text-list">
              <span className="mr-3 font-bold text-body-sm">{t('outcome')}</span>
              <Linkify text={p.outcome} />
            </p>
          )}
          {links.length > 0 && (
            <div className="mt-8">
              <p className="m-0 border-t border-nwcn-dark pt-3 font-bold text-body-sm">{t('projectLinks')}</p>
              <ul className="mt-1">
                {links.map((l, i) => (
                  <li key={`${l.url}-${i}`} className="border-b border-nwcn-rule last:border-b-0">
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-baseline justify-between gap-3 py-2.5 text-list"
                    >
                      <span className="min-w-0 truncate decoration-nwcn-green-darker decoration-2 underline-offset-4 group-hover:underline">
                        {l.label || l.url}
                      </span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {video && (
            <div className="mt-8 aspect-video w-full overflow-hidden bg-black">
              <iframe
                src={video}
                title={`${p.title} — ${t('video')}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default function PortfolioSummary({
  item,
  works,
  typeLabel,
  teamSlugs = {},
  projectWorkIds = {},
}: {
  item: PortfolioItem
  works: WorkListItem[]
  typeLabel: Record<WorkType, string>
  /** 팀원 student_id → 졸업생 상세 주소 */
  teamSlugs?: Record<string, string>
  /** 프로젝트 번호(1부터) → 그 프로젝트의 작품 페이지 id */
  projectWorkIds?: Record<number, string>
}) {
  const t = useTranslations('work.portfolio.detail')
  const projects = item.projects.slice(0, MAX_PORTFOLIO_PROJECTS)
  const history = [
    { key: 'awards', label: t('awards'), list: item.history.awards ?? [] },
    { key: 'exhibitions', label: t('exhibitions'), list: item.history.exhibitions ?? [] },
    { key: 'experience', label: t('experience'), list: item.history.experience ?? [] },
  ]
    .filter((h) => h.list.length > 0)
    // 이력은 앞의 날짜로 최신순 (날짜가 없는 줄은 뒤로, 같은 날짜끼리는 원래 순서)
    .map((h) => ({ ...h, rows: h.list.map(splitDated).sort((a, b) => b.sortKey - a.sortKey) }))
  const contactLabel = { email: t('email'), website: t('website'), instagram: t('instagram'), link: t('links') }
  const contacts = contactLinks(item).map((c) => ({ label: contactLabel[c.kind], href: c.href, text: c.text }))
  const infoRows = [
    ...(item.fields.length ? [{ label: t('fields'), value: item.fields.join(' · ') }] : []),
    ...(item.interests.length ? [{ label: t('interests'), value: item.interests.join(' · ') }] : []),
    ...(item.tools.length ? [{ label: t('tools'), value: item.tools.join(', ') }] : []),
  ]

  return (
    <div className="pb-8">
      {/* ── 소개 ── */}
      <section id="intro" aria-labelledby="intro-t" className="scroll-mt-36 pt-chapter">
        <div className="grid grid-cols-12 gap-x-6 gap-y-8">
          <div className="col-span-12 lg:col-span-7">
            <h2 id="intro-t" className="m-0 border-t border-nwcn-dark pt-3.5 font-bold text-section">{t('intro')}</h2>
            {item.bio && <p className="mt-5 whitespace-pre-line font-medium text-lead">{item.bio}</p>}
          </div>
          {infoRows.length > 0 && (
            <div className="col-span-12 self-end lg:col-span-4 lg:col-start-9">
              <InfoTable rows={infoRows} />
            </div>
          )}
        </div>
      </section>

      {projects.map((p, i) => (
        <Project key={i} p={p} n={i + 1} teamSlugs={teamSlugs} workId={projectWorkIds[i + 1]} />
      ))}

      {/* ── 원본 미리보기 ── */}
      {item.pages.length > 0 && (
        <section aria-labelledby="orig-t" className="pt-chapter">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 id="orig-t" className="m-0 font-extrabold text-headline">{t('originalPreview')}</h2>
            <a href="#original" className="editorial-link font-semibold text-body-sm">
              {t('originalAll', { n: item.pages.length })} <span aria-hidden="true">→</span>
            </a>
          </div>
          <ul className="-mx-4 flex gap-3 overflow-x-auto border-t border-nwcn-dark px-4 pb-2 pt-4 sm:mx-0 sm:px-0">
            {item.pages.slice(0, 10).map((src, i) => (
              <li key={src} className="shrink-0">
                <a href="#original" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark">
                  <span className="relative block aspect-[16/10] w-56 overflow-hidden bg-nwcn-dark sm:w-64">
                    <Image src={src} alt="" fill sizes="256px" className="object-contain" />
                  </span>
                  <span className="mt-1.5 block font-semibold tabular-nums text-caption text-nwcn-neutral-600">{t('page', { n: i + 1 })}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── 이력 ── */}
      {history.length > 0 && (
        <section aria-labelledby="hist-t" className="pt-chapter">
          <h2 id="hist-t" className="m-0 mb-6 font-extrabold text-headline">{t('history')}</h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3">
            {history.map((h) => (
              <div key={h.key}>
                <h3 className="m-0 border-t border-nwcn-dark pt-3 font-bold text-body-sm">{h.label}</h3>
                <ul className="mt-2">
                  {h.rows.map((x, i) => (
                    <li key={i} className="border-b border-nwcn-rule py-2.5 last:border-b-0">
                      {x.date && <span className="block font-semibold tabular-nums text-caption text-nwcn-neutral-600">{x.date}</span>}
                      <span className="block text-list">
                        <Linkify text={x.text} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 연락 ── */}
      {contacts.length > 0 && (
        <section aria-labelledby="contact-t" className="pt-chapter">
          <h2 id="contact-t" className="m-0 mb-6 font-extrabold text-headline">{t('contact')}</h2>
          <ul className="border-b border-nwcn-dark">
            {contacts.map((c) => (
              <li key={c.href} className="border-t border-nwcn-dark">
                <a href={c.href} target={c.href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer" className="group grid grid-cols-12 items-baseline gap-x-6 py-4">
                  <span className="col-span-12 text-body-sm text-nwcn-neutral-600 sm:col-span-3">{c.label}</span>
                  <span className="col-span-12 flex min-w-0 items-baseline justify-between gap-4 font-semibold text-statement sm:col-span-9">
                    <span className="min-w-0 break-all decoration-nwcn-green-darker decoration-2 underline-offset-4 group-hover:underline">{c.text}</span>
                    <span aria-hidden="true">↗</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── 쇼케이스 작품 ── */}
      {works.length > 0 && (
        <section aria-labelledby="works-t" className="pt-chapter">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 id="works-t" className="m-0 font-extrabold text-headline">{t('works')}</h2>
            <p className="text-body-sm text-nwcn-neutral-600">{t('worksHint')}</p>
          </div>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((w) => (
              <WorkCard key={w.id} work={w} typeLabel={typeLabel} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
