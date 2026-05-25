/**
 * BASE 컴포넌트: HomeFooter
 * Figma node-id: 376:637 (Footer)
 *
 * 디자인 스펙:
 * - 배경: #151515, 높이 442px
 * - 로고 (좌상단): NewCon 심볼 이미지
 * - 주소: 경기도 안성시 삼죽면 동아예대길 47
 * - Copyright: Copyright ⓒ NWCN All Rights Reserved.
 * - 연락처 정보 (우측): 학교명, 학과 연락처, 학과명, 학과 이메일
 * - SNS (우하단): YouTube, Instagram 링크
 * - Divider: 구분선 이미지
 */

import Link from 'next/link'

/** Footer 심볼 로고 (인라인 SVG — 이미지 파일 없이 렌더링) */
function FooterLogo() {
  return (
    <svg
      width="129"
      height="114"
      viewBox="0 0 129 114"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="NWCN NewCon 로고"
    >
      {/* 사슴 뿔 심볼 */}
      <g opacity="0.9">
        {/* 왼쪽 뿔 */}
        <path d="M45 80 L35 55 L25 45 L20 30 L28 35 L32 50 L40 60 L50 72" stroke="#09F593" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M35 55 L22 50 L18 40" stroke="#09F593" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M32 50 L38 38 L42 28" stroke="#09F593" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* 오른쪽 뿔 */}
        <path d="M84 80 L94 55 L104 45 L109 30 L101 35 L97 50 L89 60 L79 72" stroke="#09F593" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M94 55 L107 50 L111 40" stroke="#09F593" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M97 50 L91 38 L87 28" stroke="#09F593" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* 머리 */}
        <ellipse cx="64.5" cy="78" rx="22" ry="18" stroke="#09F593" strokeWidth="2" fill="none"/>
        {/* 눈 */}
        <circle cx="56" cy="74" r="2.5" fill="#09F593"/>
        <circle cx="73" cy="74" r="2.5" fill="#09F593"/>
        {/* 코 */}
        <ellipse cx="64.5" cy="84" rx="5" ry="3" stroke="#09F593" strokeWidth="1.5" fill="none"/>
      </g>
      {/* NWCN 텍스트 */}
      <text
        x="64.5"
        y="108"
        textAnchor="middle"
        fontFamily="'A2z', 'Arial Black', sans-serif"
        fontWeight="900"
        fontSize="14"
        fill="#09F593"
        letterSpacing="2"
      >
        NWCN
      </text>
    </svg>
  )
}

/** SNS 아이콘 — 인라인 SVG */
const SNS_ICONS = {
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.8 15.5V8.5l6.3 3.5-6.3 3.5z"/>
    </svg>
  ),
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
}

// 실제 연락처 정보 (Figma에서 확인)
const CONTACT_INFO = [
  { label: '학교명', value: '동아방송예술대학교' },
  { label: '학과 연락처', value: '031-670-6680' },
  { label: '학과명', value: '뉴미디어콘텐츠과' },
  { label: '학과 이메일', value: '02-000-0000' },
]

const SNS_LINKS: Array<{
  label: string
  href: string
  iconKey: keyof typeof SNS_ICONS
}> = [
  {
    label: '유튜브 바로가기',
    href: 'https://www.youtube.com/channel/UCo9nQUcZ8W1yvUVxApWRMQw',
    iconKey: 'youtube',
  },
  {
    label: '인스타그램 바로가기',
    href: 'https://www.instagram.com/2026newcon/',
    iconKey: 'instagram',
  },
]

export interface HomeFooterProps {
  className?: string
}

export default function HomeFooter({ className = '' }: HomeFooterProps) {
  return (
    <footer
      className={`relative overflow-hidden ${className}`}
      style={{ background: '#151515', minHeight: '442px' }}
      data-node-id="376:637"
      aria-label="사이트 푸터"
    >
      <div className="max-w-[1440px] mx-auto px-[79px] py-[71px] relative h-full">

        {/* ── 상단 영역 ── */}
        <div className="flex justify-between items-start mb-0" style={{ height: '183px' }}>
          {/* 로고 */}
          <div
            style={{ width: '129px', height: '114px' }}
            data-node-id="376:652"
          >
            <FooterLogo />
          </div>

          {/* 연락처 정보 (우측) */}
          <div
            className="flex flex-wrap gap-x-[76px] gap-y-[23px] w-[242px]"
            data-node-id="376:903"
          >
            {CONTACT_INFO.map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col gap-[3px]"
                style={{ minWidth: '73px' }}
              >
                <p
                  className="font-body font-medium text-[#323131]"
                  style={{ fontSize: '14px', lineHeight: 'normal' }}
                >
                  {label}
                </p>
                <p
                  className="font-body font-normal text-white"
                  style={{ fontSize: '11.6px', lineHeight: '98.69%' }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Divider ── */}
        <div
          className="relative w-full my-0"
          style={{ height: '1px', marginTop: '183px', marginBottom: '0' }}
          data-node-id="376:650"
        >
          {/* Divider 이미지 대신 라인 */}
          <div className="absolute inset-0 border-t border-white/10" />
        </div>

        {/* ── 하단 영역 ── */}
        <div className="flex justify-between items-start pt-[32px]">
          {/* 주소 + Copyright */}
          <div
            className="flex flex-col gap-[16px] w-[213px]"
            data-node-id="376:1616"
          >
            <p
              className="font-body font-medium text-white"
              style={{ fontSize: '11.6px', lineHeight: '98.69%' }}
              data-node-id="376:905"
            >
              경기도 안성시 삼죽면 동아예대길 47
            </p>
            <p
              className="font-body font-medium text-white"
              style={{ fontSize: '11.6px', lineHeight: '98.69%' }}
              data-node-id="376:651"
            >
              Copyright ⓒ NWCN All Rights Reserved.
            </p>
          </div>

          {/* SNS 링크 */}
          <div
            className="flex flex-col gap-[12px] items-start"
            data-node-id="452:264"
          >
            {SNS_LINKS.map(({ label, href, iconKey }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-[9px] text-white hover:text-nwcn-green transition-colors"
              >
                <div className="w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center">
                  {SNS_ICONS[iconKey]}
                </div>
                <span
                  className="font-body font-medium whitespace-nowrap"
                  style={{ fontSize: '12.62px' }}
                >
                  {label}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* 개인정보처리방침 링크 */}
        <div className="absolute bottom-6 right-[79px]">
          <Link
            href="/info/privacy"
            className="font-body text-[11px] text-white/30 hover:text-white/60 transition-colors"
          >
            개인정보처리방침
          </Link>
        </div>
      </div>
    </footer>
  )
}
