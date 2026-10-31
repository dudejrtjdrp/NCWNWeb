/**
 * 학과 소개(ABOUT) 에디토리얼 공용 조각 — 섹션 제목, 다른 페이지 바로가기
 * E4 원칙: 직각, 1px 검정 선, 12칸 그리드, 왼쪽 정렬.
 */

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export type AboutPage = 'department' | 'faculty' | 'curriculum' | 'lab'

const ABOUT_HREF: Record<AboutPage, string> = {
  department: '/about/department',
  faculty: '/about/faculty',
  curriculum: '/about/curriculum',
  lab: '/about/lab',
}

/** 섹션 제목 (h2, 1440 기준 56px) */
export function EditorialHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 id={id} className="m-0 font-extrabold text-headline">
        {children}
      </h2>
    </div>
  )
}

/** 페이지 맨 아래 — 학과 소개의 다른 페이지 3개 + 입학 안내 */
export function AboutMoreLinks({ current }: { current: AboutPage }) {
  const nav = useTranslations('about.nav')
  const dept = useTranslations('about.department')
  const links = (Object.keys(ABOUT_HREF) as AboutPage[])
    .filter((key) => key !== current)
    .map((key) => ({ href: ABOUT_HREF[key], label: nav(key) }))
  links.push({ href: '/info/admission', label: dept('admission') })

  return (
    <nav aria-label={dept('moreLabel')} className="grid grid-cols-1 gap-x-6 pb-24 pt-chapter sm:grid-cols-2 lg:grid-cols-4">
      {links.map((link) => (
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
  )
}
