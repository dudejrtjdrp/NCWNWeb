/**
 * ProjectList — 프로젝트 목록 (E4)
 * 산학협력 / 해외교류 두 묶음. 한 줄에 썸네일(왼쪽) + 연도·함께한 곳·기간 / 제목 / 소개 / 분야(오른쪽).
 * 맨 아래 가족회사 4곳.
 */

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { ProjectItem } from '@/lib/supabase/queries/projects'
import { PARTNER_LOGOS } from '@/constants/ninc-project'

export const PROJECT_SECTIONS = ['industry', 'international', 'partners'] as const

function ProjectRow({ p, labels }: { p: ProjectItem; labels: { partner: string; duration: string; detail: string } }) {
  const meta = [String(p.year), p.partner, p.duration].filter(Boolean).join(' · ')
  const tags = [p.category, ...(p.skills ?? [])].filter((v, i, a): v is string => !!v && a.indexOf(v) === i)
  return (
    <li className="border-t border-nwcn-dark">
      <Link
        href={`/ninc/project/${p.id}`}
        className="group grid grid-cols-12 gap-x-6 gap-y-5 py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark"
      >
        <div className="relative col-span-12 aspect-[4/3] overflow-hidden bg-nwcn-neutral-200 sm:col-span-5">
          {p.thumbnail_url && (
            <Image src={p.thumbnail_url} alt="" fill sizes="(min-width: 640px) 40vw, 100vw" className="object-cover transition-transform duration-slow ease-nwcn group-hover:scale-[1.02]" />
          )}
        </div>
        <div className="col-span-12 flex min-w-0 flex-col sm:col-span-7 lg:col-span-6 lg:col-start-7">
          <p className="font-semibold tabular-nums text-body-sm text-nwcn-neutral-600">{meta}</p>
          <h3 className="m-0 mt-2 font-bold text-statement decoration-nwcn-green-darker decoration-2 underline-offset-4 group-hover:underline">
            {p.title}
          </h3>
          {p.description && <p className="mt-4 line-clamp-4 text-list">{p.description}</p>}
          {tags.length > 0 && <p className="mt-4 text-body-sm text-nwcn-neutral-600">{tags.join(' · ')}</p>}
          <span className="mt-6 inline-flex items-center gap-2 self-start font-semibold text-body-sm">
            {labels.detail}
            <span aria-hidden="true" className="transition-transform duration-fast ease-nwcn group-hover:translate-x-1">→</span>
          </span>
        </div>
      </Link>
    </li>
  )
}

export default function ProjectList({ projects }: { projects: ProjectItem[] }) {
  const t = useTranslations('ninc.projectPage')
  const labels = { partner: t('partner'), duration: t('duration'), detail: t('detail') }
  const groups = [
    { id: 'industry', title: t('industry'), items: projects.filter((p) => p.type === 'industry') },
    { id: 'international', title: t('international'), items: projects.filter((p) => p.type === 'international') },
  ]

  return (
    <>
      {groups.map((g) => (
        <section key={g.id} id={g.id} aria-labelledby={`${g.id}-t`} className="scroll-mt-36 pt-chapter">
          <div className="mb-6 flex items-baseline justify-between gap-6">
            <h2 id={`${g.id}-t`} className="m-0 font-extrabold text-headline">{g.title}</h2>
            <p className="font-semibold tabular-nums text-body-sm">{g.items.length}</p>
          </div>
          {g.items.length ? (
            <ul className="border-b border-nwcn-dark">
              {g.items.map((p) => (
                <ProjectRow key={p.id} p={p} labels={labels} />
              ))}
            </ul>
          ) : (
            <p className="border-y border-nwcn-dark py-5 text-list">{t('empty')}</p>
          )}
        </section>
      ))}

      <section id="partners" aria-labelledby="partners-t" className="scroll-mt-36 pt-chapter">
        <div className="mb-6">
          <h2 id="partners-t" className="m-0 font-extrabold text-headline">{t('partners')}</h2>
        </div>
        <p className="border-t border-nwcn-dark py-3.5 text-list">{t('partnersIntro')}</p>
        <ul className="grid grid-cols-2 border-l border-t border-nwcn-dark lg:grid-cols-4">
          {PARTNER_LOGOS.map((p) => (
            <li key={p.name} className="border-b border-r border-nwcn-dark">
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col gap-4 p-5 transition-colors duration-fast ease-nwcn hover:bg-nwcn-dark/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-nwcn-dark"
              >
                <span className="relative block h-16">
                  <Image src={p.logoSrc} alt="" fill sizes="200px" className="object-contain object-left" />
                </span>
                <span className="flex items-baseline justify-between gap-2 font-semibold text-list">
                  {p.name}
                  <span aria-hidden="true">↗</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
