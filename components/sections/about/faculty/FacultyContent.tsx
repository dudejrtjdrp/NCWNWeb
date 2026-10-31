/**
 * FacultyContent — 교수진 목록 (E4)
 * 교수 / 조교 두 묶음. 사진 아래 1px 선 + 이름(→ 상세), 직급, 이메일.
 */

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { FACULTY_LIST, type FacultyData } from '@/lib/faculty-data'
import { AboutMoreLinks, EditorialHeading } from '@/components/sections/about/Editorial'
import { facultyRole, type RoleLabels } from './faculty-role'

export const FACULTY_SECTIONS = ['professors', 'assistants'] as const

function Person({ person, roles, priority }: { person: FacultyData; roles: RoleLabels; priority?: boolean }) {
  const t = useTranslations('about.faculty')
  return (
    <li className="flex min-w-0 flex-col">
      <Link
        href={`/about/faculty/${person.id}`}
        className="group flex flex-col gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark focus-visible:ring-offset-4 focus-visible:ring-offset-nwcn-paper"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-nwcn-neutral-200">
          <Image
            src={person.photoUrl}
            alt={t('photoAlt', { name: person.nameKo })}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw"
            className="object-cover object-top"
          />
        </div>
        <span className="flex items-baseline justify-between gap-2 border-t border-nwcn-dark pt-3">
          <span className="font-bold text-list decoration-nwcn-green-darker decoration-2 underline-offset-4 group-hover:underline">
            {person.nameKo}
          </span>
          <span aria-hidden="true" className="transition-transform duration-fast ease-nwcn group-hover:translate-x-1">
            →
          </span>
          <span className="sr-only">{t('viewProfile')}</span>
        </span>
      </Link>
      <p className="mt-1 text-body-sm">{facultyRole(person, roles)}</p>
      {person.email && (
        <a
          href={`mailto:${person.email}`}
          className="mt-1 self-start break-all text-body-sm text-nwcn-neutral-600 underline decoration-1 underline-offset-4 editorial-link"
        >
          {person.email}
        </a>
      )}
    </li>
  )
}

export default function FacultyContent() {
  const t = useTranslations('about.faculty')
  const roles = t.raw('roles') as RoleLabels
  const professors = FACULTY_LIST.filter((f) => f.role === '교수')
  const assistants = FACULTY_LIST.filter((f) => f.role === '조교')
  const grid = 'grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4'

  return (
    <div className="editorial-container">
      <section id="professors" aria-labelledby="professors-title" className="scroll-mt-36 pt-chapter">
        <EditorialHeading id="professors-title">{t('professors')}</EditorialHeading>
        <div className="mb-12 border-t border-nwcn-dark pt-3.5">
          <p className="max-w-3xl text-intro">
            {t('intro', { professors: professors.length, assistants: assistants.length })}
          </p>
        </div>
        <ul className={grid}>
          {professors.map((person, i) => (
            <Person key={person.id} person={person} roles={roles} priority={i < 4} />
          ))}
        </ul>
      </section>

      <section id="assistants" aria-labelledby="assistants-title" className="scroll-mt-36 pt-chapter">
        <EditorialHeading id="assistants-title">{t('assistants')}</EditorialHeading>
        <ul className={`${grid} border-t border-nwcn-dark pt-6`}>
          {assistants.map((person) => (
            <Person key={person.id} person={person} roles={roles} />
          ))}
        </ul>
      </section>

      <AboutMoreLinks current="faculty" />
    </div>
  )
}
