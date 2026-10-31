/** MoreLinks — 페이지 맨 아래 바로가기 줄 (E4). 1px 선 위에 큰 글자 + 화살표. */

import { Link } from '@/i18n/navigation'

export default function MoreLinks({ links, label }: { links: { href: string; label: string }[]; label: string }) {
  return (
    <nav aria-label={label} className="grid grid-cols-1 gap-x-6 pb-24 pt-chapter sm:grid-cols-2 lg:grid-cols-4">
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
