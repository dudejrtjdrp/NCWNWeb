/**
 * FacultyProfile — 교수진 상세 (E4)
 * 큰 이름 + 사진 → 이력 정보표(이메일·학력·경력·논문/공연/전시…) → 인터뷰 Q&A → 이전/다음 교수.
 * 인터뷰 답변의 **굵게** 표시는 <strong> 으로 바꾼다.
 */

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { FacultyData } from '@/lib/faculty-data'
import { EditorialHeading } from '@/components/sections/about/Editorial'
import { facultyRole, type RoleLabels } from './faculty-role'

/** '**굵게**' 마커를 <strong> 으로 */
function RichText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-bold">
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-x-6 gap-y-1 border-t border-nwcn-dark py-3.5">
      <dt className="col-span-12 text-nwcn-neutral-600 sm:col-span-4 sm:text-nwcn-dark lg:col-span-3">{label}</dt>
      <dd className="col-span-12 sm:col-span-8 lg:col-span-9">{children}</dd>
    </div>
  )
}

function Lines({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export interface FacultyProfileProps {
  faculty: FacultyData
  prev?: FacultyData
  next?: FacultyData
}

export default function FacultyProfile({ faculty, prev, next }: FacultyProfileProps) {
  const t = useTranslations('about.faculty')
  const d = useTranslations('about.faculty.detail')
  const roles = t.raw('roles') as RoleLabels
  const sectionLabels = d.raw('sections') as Record<string, string>
  const interview = faculty.interview

  return (
    <div className="mx-auto max-w-page border-t border-nwcn-dark">
      <div className="editorial-container">
        {/* ── 이름 + 사진 ── */}
        <header className="grid grid-cols-12 gap-x-6 gap-y-8 pt-5">
          <div className="col-span-12 flex flex-col sm:col-span-7 lg:col-span-8">
            <Link href="/about/faculty" className="editorial-link self-start font-semibold text-body-sm">
              <span aria-hidden="true">← </span>
              {d('backToList')}
            </Link>
            <h1 className="m-0 mt-10 font-extrabold text-poster-ko lg:mt-16">{faculty.nameKo}</h1>
            <p className="mt-4 font-medium text-lead">{facultyRole(faculty, roles)}</p>
          </div>
          <div className="col-span-8 sm:col-span-5 lg:col-span-4">
            <div className="relative aspect-[4/5] overflow-hidden bg-nwcn-neutral-200">
              <Image
                src={faculty.photoUrl}
                alt={t('photoAlt', { name: faculty.nameKo })}
                fill
                priority
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 40vw, 66vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        </header>

        {/* ── 이력 ── */}
        <section id="profile" aria-labelledby="profile-title" className="scroll-mt-36 pt-chapter">
          <EditorialHeading id="profile-title">{d('profile')}</EditorialHeading>
          <dl className="border-b border-nwcn-dark text-list">
            {faculty.email && (
              <InfoRow label={d('email')}>
                <a href={`mailto:${faculty.email}`} className="break-all underline decoration-1 underline-offset-4 editorial-link">
                  {faculty.email}
                </a>
              </InfoRow>
            )}
            {faculty.education?.length ? (
              <InfoRow label={d('education')}>
                <Lines items={faculty.education} />
              </InfoRow>
            ) : null}
            {faculty.career?.length ? (
              <InfoRow label={d('career')}>
                <Lines items={faculty.career} />
              </InfoRow>
            ) : null}
            {faculty.extraSections?.map((section) => (
              <InfoRow key={section.label} label={sectionLabels[section.label] ?? section.label}>
                <Lines items={section.items} />
              </InfoRow>
            ))}
          </dl>
        </section>

        {/* ── 인터뷰 ── */}
        {interview && (
          <section id="interview" aria-labelledby="interview-title" className="scroll-mt-36 pt-chapter">
            <EditorialHeading id="interview-title">{d('interview')}</EditorialHeading>
            <ol className="border-b border-nwcn-dark">
              {interview.qa.map((qa) => (
                <li key={qa.question} className="grid grid-cols-12 gap-x-6 gap-y-4 border-t border-nwcn-dark pb-10 pt-5">
                  <h3 className="col-span-12 m-0 font-bold text-list lg:col-span-5">{qa.question}</h3>
                  <div className="col-span-12 flex flex-col gap-4 text-list lg:col-span-7">
                    {qa.answer.split(/\n{2,}/).map((para, i) => (
                      <p key={i} className="whitespace-pre-line">
                        <RichText text={para} />
                      </p>
                    ))}
                  </div>
                </li>
              ))}
              <li className="grid grid-cols-12 gap-x-6 gap-y-4 border-t border-nwcn-dark pb-12 pt-5">
                <h3 className="col-span-12 m-0 font-bold text-list lg:col-span-5">{interview.closingQuestion}</h3>
                <p className="col-span-12 whitespace-pre-line font-bold text-statement lg:col-span-7">
                  {interview.closingQuote}
                </p>
              </li>
            </ol>
          </section>
        )}

        {/* ── 이전 / 다음 ── */}
        <nav aria-label={d('others')} className="grid grid-cols-1 gap-x-6 pb-24 pt-chapter sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/about/faculty/${prev.id}`}
              className="group flex flex-col gap-1 border-t border-nwcn-dark pb-6 pt-5 transition-colors duration-fast ease-nwcn hover:text-nwcn-green-darker focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark"
            >
              <span className="text-body-sm text-nwcn-neutral-600">← {d('prev')}</span>
              <span className="font-semibold text-jump">{prev.nameKo}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/about/faculty/${next.id}`}
              className="group flex flex-col items-end gap-1 border-t border-nwcn-dark pb-6 pt-5 text-right transition-colors duration-fast ease-nwcn hover:text-nwcn-green-darker focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark"
            >
              <span className="text-body-sm text-nwcn-neutral-600">{d('next')} →</span>
              <span className="font-semibold text-jump">{next.nameKo}</span>
            </Link>
          )}
        </nav>
      </div>
    </div>
  )
}
