/**
 * 글로벌 Footer 컴포넌트 (통합)
 * Figma node-id: 376:637 (Footer)
 *
 * 디자인 스펙:
 * - 배경: #151515, 높이 442px
 * - 로고 (좌상단): NewCon 심볼 이미지
 * - 주소: 경기도 안성시 삼죽면 동아예대길 47
 * - Copyright: Copyright ⓒ NWCN All Rights Reserved.
 * - 연락처 정보 (우측): 학교명, 학과 연락처, 학과명, 학과 이메일
 * - SNS (우하단): YouTube, Instagram 링크
 *
 * 기존 HomeFooter와 Footer를 통합 — 이 파일이 단일 소스
 */

import Image from 'next/image'
import Link from 'next/link'

const CONTACT_INFO = [
  { label: '학교명', value: '동아방송예술대학교' },
  { label: '학과 연락처', value: '031-670-6680' },
  { label: '학과명', value: '뉴미디어콘텐츠과' },
  { label: '학과 이메일', value: '02-000-0000' },
]

const SNS_LINKS = [
  {
    label: '유튜브 바로가기',
    href: 'https://www.youtube.com/channel/UCo9nQUcZ8W1yvUVxApWRMQw',
    icon: '/images/common/youtube.svg',
  },
  {
    label: '인스타그램 바로가기',
    href: 'https://www.instagram.com/2026newcon/',
    icon: '/images/common/instagram.svg',
  },
]

export interface FooterProps {
  className?: string
}

export default function Footer({ className = '' }: FooterProps) {
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
          <div style={{ width: '129px', height: '114px' }} data-node-id="376:652">
            <Image
              src="/images/common/NewConLogo.svg"
              alt="NewCon 로고"
              width={129}
              height={114}
              unoptimized
            />
          </div>

          {/* 연락처 정보 (우측) */}
          <div
            className="flex flex-wrap gap-x-[76px] gap-y-[23px] w-[242px]"
            data-node-id="376:903"
          >
            {CONTACT_INFO.map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-[3px]" style={{ minWidth: '73px' }}>
                <p className="font-body font-medium text-[#323131]" style={{ fontSize: '14px' }}>
                  {label}
                </p>
                <p className="font-body font-normal text-white" style={{ fontSize: '11.6px', lineHeight: '98.69%' }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="relative w-full" style={{ height: '1px', marginTop: '183px' }} data-node-id="376:650">
          <div className="absolute inset-0 border-t border-white/10" />
        </div>

        {/* ── 하단 영역 ── */}
        <div className="flex justify-between items-start pt-[32px]">
          {/* 주소 + Copyright */}
          <div className="flex flex-col gap-[16px] w-[213px]" data-node-id="376:1616">
            <p className="font-body font-medium text-white" style={{ fontSize: '11.6px', lineHeight: '98.69%' }}>
              경기도 안성시 삼죽면 동아예대길 47
            </p>
            <p className="font-body font-medium text-white" style={{ fontSize: '11.6px', lineHeight: '98.69%' }}>
              Copyright ⓒ NWCN All Rights Reserved.
            </p>
          </div>

          {/* SNS 링크 */}
          <div className="flex flex-col gap-[12px] items-start" data-node-id="452:264">
            {SNS_LINKS.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-[9px] text-white hover:opacity-70 transition-opacity"
              >
                <Image src={icon} alt="" width={19} height={19} unoptimized aria-hidden="true" />
                <span className="font-body font-medium whitespace-nowrap" style={{ fontSize: '12.62px' }}>
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

