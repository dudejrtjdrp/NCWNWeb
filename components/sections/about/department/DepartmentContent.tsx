/**
 * DepartmentContent — 학과 소개 본문 (E4 포스터형의 아래쪽)
 * ────────────────────────────────────────────────────────────
 * 소개(정보표) · 교육 목표 · 교육 방침 · 졸업 후 진로 · 자격증 · 다른 페이지 바로가기.
 * 원칙: 직각, 1px 검정 선, 12칸 그리드, 왼쪽 정렬, 실제 사진에만 캡션.
 * 자격증은 이미지 없이 번호 붙은 글 목록(가짜 자격증 그림 제거).
 */

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

interface Fact {
  label: string
  value: string
}

export const DEPARTMENT_SECTIONS = ['intro', 'goal', 'policy', 'career', 'certificate'] as const

const IMG = {
  emblem: '/images/home/crest.png',
  policy: '/images/department/photos/rmit-global-workshop.webp',
}

const CONTACT = {
  tel: '031-670-6680',
  mail: 'minyoopark@dima.ac.kr',
}

const pad2 = (n: number) => String(n).padStart(2, '0')

function Heading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="m-0 font-extrabold text-headline">
      {children}
    </h2>
  )
}

export default function DepartmentContent() {
  const t = useTranslations('about.department')
  const nav = useTranslations('about.nav')
  const facts = t.raw('facts') as Fact[]
  const goals = t.raw('goals') as string[]
  const policyItems = t.raw('policyItems') as string[]
  const careers = t.raw('careers') as string[]
  const certificates = t.raw('certificates') as string[]

  const more = [
    { href: '/about/faculty', label: nav('faculty') },
    { href: '/about/curriculum', label: nav('curriculum') },
    { href: '/about/lab', label: nav('lab') },
    { href: '/info/admission', label: t('admission') },
  ]

  return (
    <div className="editorial-container">
      {/* ── 소개 ── */}
      <section id="intro" aria-labelledby="intro-title" className="grid scroll-mt-36 grid-cols-12 gap-x-6 pt-chapter">
        <div className="col-span-9">
          <Heading id="intro-title">{t('anchors.intro')}</Heading>
        </div>
        <Image
          src={IMG.emblem}
          alt={t('emblemAlt')}
          width={96}
          height={85}
          className="col-span-3 h-auto w-16 justify-self-end opacity-90 invert lg:w-24"
        />
        <p className="col-span-12 mt-6 text-intro lg:col-span-7">{t('introBody')}</p>

        <dl className="col-span-12 mt-12 border-b border-nwcn-dark text-list lg:mt-14">
          {facts.map((fact) => (
            <div key={fact.label} className="grid grid-cols-12 gap-x-6 border-t border-nwcn-dark py-3.5">
              <dt className="col-span-12 text-nwcn-neutral-600 sm:col-span-4 sm:text-nwcn-dark lg:col-span-6">{fact.label}</dt>
              <dd className="col-span-12 sm:col-span-8 lg:col-span-6">{fact.value}</dd>
            </div>
          ))}
          <div className="grid grid-cols-12 gap-x-6 border-t border-nwcn-dark py-3.5">
            <dt className="col-span-12 text-nwcn-neutral-600 sm:col-span-4 sm:text-nwcn-dark lg:col-span-6">{t('contactLabel')}</dt>
            <dd className="col-span-12 flex flex-wrap gap-x-4 gap-y-1 sm:col-span-8 lg:col-span-6">
              <a href={`tel:${CONTACT.tel.replace(/-/g, '')}`} className="underline decoration-1 underline-offset-4 editorial-link">
                {CONTACT.tel}
              </a>
              <a href={`mailto:${CONTACT.mail}`} className="underline decoration-1 underline-offset-4 editorial-link">
                {CONTACT.mail}
              </a>
            </dd>
          </div>
        </dl>
      </section>

      {/* ── 교육 목표 ── */}
      <section id="goal" aria-labelledby="goal-title" className="scroll-mt-36 pt-chapter">
        <div className="mb-6">
          <Heading id="goal-title">{t('anchors.goal')}</Heading>
        </div>
        <ol className="border-b border-nwcn-dark">
          {goals.map((goal, i) => (
            <li key={goal} className="group grid grid-cols-12 items-baseline gap-x-6 border-t border-nwcn-dark pb-6 pt-5">
              <span className="col-span-2 font-bold tabular-nums text-body-sm transition-colors duration-fast ease-nwcn group-hover:text-nwcn-green-darker">
                {pad2(i + 1)}
              </span>
              <strong className="col-span-10 font-bold text-statement">{goal}</strong>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 교육 방침 ── */}
      <section id="policy" aria-labelledby="policy-title" className="scroll-mt-36 pt-chapter">
        <div className="mb-6">
          <Heading id="policy-title">{t('anchors.policy')}</Heading>
        </div>
        <div className="flex items-center justify-between border-t border-nwcn-dark py-3.5 font-bold text-section">
          <span>{t('policyLead')}</span>
          <span aria-hidden="true">—</span>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 pt-2 lg:grid-cols-12">
          <figure className="m-0 flex flex-col gap-1.5 lg:col-span-6">
            <div className="relative aspect-[3/2] overflow-hidden bg-nwcn-neutral-200">
              <Image
                src={IMG.policy}
                alt={t('policyPhotoAlt')}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="text-body-sm">{t('policyPhotoCaption')}</figcaption>
          </figure>
          <ul className="flex flex-col gap-4 text-list lg:col-span-6">
            {policyItems.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-nwcn-dark" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 졸업 후 진로 ── */}
      <section id="career" aria-labelledby="career-title" className="scroll-mt-36 pt-chapter">
        <div className="mb-6">
          <Heading id="career-title">{t('anchors.career')}</Heading>
        </div>
        <ul className="grid grid-cols-1 gap-x-6 border-t border-nwcn-dark text-list sm:grid-cols-2 lg:grid-cols-3">
          {careers.map((career) => (
            <li key={career} className="border-b border-nwcn-rule py-3.5">
              {career}
            </li>
          ))}
        </ul>
      </section>

      {/* ── 자격증 (글 목록) ── */}
      <section id="certificate" aria-labelledby="certificate-title" className="scroll-mt-36 pt-chapter">
        <div className="mb-6">
          <Heading id="certificate-title">{t('anchors.certificate')}</Heading>
        </div>
        <p className="border-t border-nwcn-dark py-3.5 text-list">{t('certificateNote')}</p>
        <ol className="grid grid-cols-1 gap-x-6 border-t border-nwcn-dark text-list sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert, i) => (
            <li key={cert} className="flex items-baseline gap-4 border-b border-nwcn-rule py-3.5">
              <span className="min-w-6 font-bold tabular-nums text-caption">{pad2(i + 1)}</span>
              <span>{cert}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 다른 페이지 바로가기 ── */}
      <nav aria-label={t('moreLabel')} className="grid grid-cols-1 gap-x-6 pb-24 pt-chapter sm:grid-cols-2 lg:grid-cols-4">
        {more.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-baseline justify-between gap-3 border-t border-nwcn-dark pb-6 pt-5 font-semibold text-jump transition-colors duration-fast ease-nwcn hover:text-nwcn-green-darker focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark"
          >
            {link.label}
            <span aria-hidden="true" className="transition-transform duration-fast ease-nwcn group-hover:translate-x-1">
              →
            </span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
