import Link from 'next/link'

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.8 15.5V8.5l6.3 3.5-6.3 3.5z" />
      </svg>
    ),
  },
]

export default function Footer() {
  return (
    <footer className="bg-nwcn-dark border-t border-white/10">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 브랜드 */}
          <div>
            <p className="font-brand text-2xl text-white mb-3">NWCN</p>
            <p className="font-body text-sm text-white/40 leading-relaxed">
              동아방송예술대학교<br />
              뉴미디어콘텐츠과
            </p>
          </div>

          {/* 연락처 */}
          <div>
            <p className="font-body text-xs font-semibold tracking-widest text-nwcn-green mb-4">CONTACT</p>
            <div className="space-y-2">
              <p className="font-body text-sm text-white/60">
                Tel: 031-000-0000
              </p>
              <p className="font-body text-sm text-white/60">
                Email: nwcn@dba.ac.kr
              </p>
              <p className="font-body text-sm text-white/60">
                경기도 김포시 통진읍 서암리 산30
              </p>
            </div>
          </div>

          {/* 링크 & SNS */}
          <div>
            <p className="font-body text-xs font-semibold tracking-widest text-nwcn-green mb-4">FOLLOW US</p>
            <div className="flex gap-3 mb-6">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 text-white/60 hover:text-nwcn-green hover:border-nwcn-green/40 transition-all duration-200"
                >
                  {link.icon}
                </a>
              ))}
            </div>
            <Link
              href="/info/privacy"
              className="font-body text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              개인정보처리방침
            </Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5">
          <p className="font-body text-xs text-white/20 text-center">
            Copyright ⓒ NWCN All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
