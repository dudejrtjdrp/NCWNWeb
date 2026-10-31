/**
 * ProjectArticle — 프로젝트 상세 본문 (E4)
 * 큰 제목(위에 유형·연도·함께한 곳) + 정보표 → 사진 → 프로젝트 소개 | 결과물·참여 학생·활용 기술 → 다른 프로젝트.
 */

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { DetailMedia, InfoTable } from '@/components/sections/editorial/DetailParts'
import type { ProjectItem } from '@/lib/supabase/queries/projects'

export default function ProjectArticle({ project, others }: { project: ProjectItem; others: ProjectItem[] }) {
  const t = useTranslations('ninc.project.detail')
  const typeLabel = { industry: t('typeIndustry'), international: t('typeInternational') }
  const participants = (project.participants ?? []).filter(Boolean)
  const skills = (project.skills ?? []).filter(Boolean)
  const safeUrl = project.project_url && /^https?:\/\//.test(project.project_url) ? project.project_url : null

  const rows = [
    { label: t('type'), value: typeLabel[project.type] },
    ...(project.partner ? [{ label: t('partner'), value: project.partner }] : []),
    { label: t('year'), value: <span className="tabular-nums">{project.year}</span> },
    ...(project.duration ? [{ label: t('duration'), value: project.duration }] : []),
    ...(project.category ? [{ label: t('category'), value: project.category }] : []),
    ...(participants.length ? [{ label: t('participants'), value: t('count', { n: participants.length }) }] : []),
  ]
  const side = project.outcome || safeUrl || participants.length > 0 || skills.length > 0

  return (
    <div className="mx-auto max-w-page border-t border-nwcn-dark">
      <div className="editorial-container pb-24">
        <header className="grid grid-cols-12 gap-x-6 gap-y-8 pt-5">
          <div className="col-span-12 flex min-w-0 flex-col lg:col-span-8">
            <Link href="/ninc/project" className="editorial-link self-start font-semibold text-body-sm">
              <span aria-hidden="true">← </span>
              {t('backToList')}
            </Link>
            <p className="mt-10 font-semibold tabular-nums text-list text-nwcn-neutral-600 lg:mt-14">
              {[typeLabel[project.type], project.year, project.partner].filter(Boolean).join(' · ')}
            </p>
            <h1 className="m-0 mt-2 break-words font-extrabold text-headline">{project.title}</h1>
          </div>
          <div className="col-span-12 self-end lg:col-span-4">
            <InfoTable rows={rows} />
          </div>
        </header>

        {project.thumbnail_url && (
          <div className="mt-12">
            <DetailMedia src={project.thumbnail_url} alt={project.title} />
          </div>
        )}

        <div className="grid grid-cols-12 gap-x-6 gap-y-10 pt-chapter">
          <section aria-labelledby="project-intro" className="col-span-12 lg:col-span-7">
            <h2 id="project-intro" className="m-0 border-t border-nwcn-dark pt-3.5 font-bold text-section">
              {t('sectionIntro')}
            </h2>
            {project.description && <p className="mt-5 whitespace-pre-line text-list">{project.description}</p>}
          </section>

          {side && (
            <div className="col-span-12 flex flex-col gap-10 lg:col-span-4 lg:col-start-9">
              {(project.outcome || safeUrl) && (
                <section aria-labelledby="project-outcome">
                  <h2 id="project-outcome" className="m-0 border-t border-nwcn-dark pt-3.5 font-bold text-section">
                    {t('sectionOutcome')}
                  </h2>
                  {project.outcome && <p className="mt-4 whitespace-pre-line text-list">{project.outcome}</p>}
                  {safeUrl && (
                    <a
                      href={safeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 border border-nwcn-dark px-4 py-2.5 font-semibold text-body-sm transition-colors duration-fast ease-nwcn hover:bg-nwcn-dark hover:text-white"
                    >
                      {t('viewProject')}
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </section>
              )}
              {participants.length > 0 && (
                <section aria-labelledby="project-people">
                  <h2 id="project-people" className="m-0 border-t border-nwcn-dark pt-3.5 font-bold text-section">
                    {t('sectionParticipants')}
                  </h2>
                  <p className="mt-4 text-list">{participants.join(', ')}</p>
                </section>
              )}
              {skills.length > 0 && (
                <section aria-labelledby="project-skills">
                  <h2 id="project-skills" className="m-0 border-t border-nwcn-dark pt-3.5 font-bold text-section">
                    {t('skills')}
                  </h2>
                  <p className="mt-4 text-list">{skills.join(' · ')}</p>
                </section>
              )}
            </div>
          )}
        </div>

        {others.length > 0 && (
          <section aria-labelledby="project-more" className="pt-chapter">
            <h2 id="project-more" className="m-0 mb-6 font-extrabold text-headline">{t('other')}</h2>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-8 border-t border-nwcn-dark pt-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <li key={p.id}>
                  <Link href={`/ninc/project/${p.id}`} className="group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark">
                    <span className="relative block aspect-[4/3] overflow-hidden bg-nwcn-neutral-200">
                      {p.thumbnail_url && (
                        <Image src={p.thumbnail_url} alt="" fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover transition-transform duration-slow ease-nwcn group-hover:scale-[1.02]" />
                      )}
                    </span>
                    <span className="mt-3 font-semibold tabular-nums text-body-sm text-nwcn-neutral-600">
                      {[typeLabel[p.type], p.year, p.partner].filter(Boolean).join(' · ')}
                    </span>
                    <span className="mt-1 font-bold text-list decoration-nwcn-green-darker decoration-2 underline-offset-4 group-hover:underline">
                      {p.title}
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
