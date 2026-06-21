/**
 * 글로벌 Footer 컴포넌트 (통합 + i18n)
 * Figma node-id: 376:637 (Footer)
 *
 * 디자인 스펙:
 * - 배경: #151515, 높이 442px
 * - 로고 (좌상단): NewCon 심볼 이미지
 * - 주소: 경기도 안성시 삼죽면 동아예대길 47
 * - Copyright: Copyright ⓒ NWCN All Rights Reserved.
 * - 연락처 정보 (우측): 학교명, 학과 연락처, 학과명, 학과 이메일
 * - SNS (우하단): YouTube, Instagram 링크
 */

'use client'

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { FOOTER_SNS_LINKS } from '@/constants/social-links'

export interface FooterProps {
  className?: string
}

export default function Footer({ className = '' }: FooterProps) {
  const t = useTranslations('footer')

  const CONTACT_INFO = [
    { labelKey: 'contact.schoolName', value: t('contact.schoolNameValue') },
    { labelKey: 'contact.deptContact', value: '031-670-6680' },
    { labelKey: 'contact.deptName', value: t('contact.deptNameValue') },
    { labelKey: 'contact.deptEmail', value: '02-000-0000' },
  ]

  return (
    <footer
      className={`relative overflow-hidden ${className}`}
      style={{ background: '#151515' }}
      data-node-id="376:637"
      aria-label="사이트 푸터"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px] py-12 lg:py-[71px] relative">

        {/* ── 상단 영역 ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8 pb-10 lg:pb-[60px]">
          {/* 로고 */}
          <div className="shrink-0" data-node-id="376:652">
            <Image
              src="/images/common/NewConLogo.svg"
              alt="NewCon 로고"
              width={129}
              height={114}
              unoptimized
              className="w-[80px] h-auto sm:w-[100px] lg:w-[129px]"
            />
          </div>

          {/* 연락처 정보 */}
          <div
            className="flex flex-wrap gap-x-8 gap-y-4 sm:gap-x-[76px] sm:gap-y-[23px]"
            data-node-id="376:903"
          >
            {CONTACT_INFO.map(({ labelKey, value }) => (
              <div key={labelKey} className="flex flex-col gap-1">
                <p className="font-body font-medium text-[#323131] text-[13px] sm:text-[14px]">
                  {t(labelKey as Parameters<typeof t>[0])}
                </p>
                <p className="font-body font-normal text-white text-[11px] sm:text-[11.6px] leading-tight">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="w-full border-t border-white/10" data-node-id="376:650" />

        {/* ── 하단 영역 ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-6 sm:pt-8 pb-6">
          {/* 주소 + Copyright */}
          <div className="flex flex-col gap-3" data-node-id="376:1616">
            <p className="font-body font-medium text-white text-[11px] sm:text-[11.6px] leading-tight">
              {t('address')}
            </p>
            <p className="font-body font-medium text-white text-[11px] sm:text-[11.6px] leading-tight">
              {t('copyright')}
            </p>
          </div>

          {/* SNS 링크 */}
          <div className="flex flex-row flex-wrap sm:flex-col gap-4 sm:gap-3 items-start" data-node-id="452:264">
            {FOOTER_SNS_LINKS.map(({ key, href, icon }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-[9px] text-white hover:opacity-70 transition-opacity"
              >
                <Image src={icon} alt="" width={19} height={19} unoptimized aria-hidden="true" />
                <span className="font-body font-medium whitespace-nowrap text-[12px] sm:text-[12.62px]">
                  {t(key as Parameters<typeof t>[0])}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* 검색 노출용 별칭·약칭 (fine print) — 동방예대/뉴콘/DIMA 등 변형 키워드 매칭용 */}
        <p className="pb-3 font-body text-[11px] leading-relaxed text-white/30">
          {t('alias')}
        </p>

        {/* 개인정보처리방침 링크 */}
        <div className="pb-2">
          <Link
            href="/info/privacy"
            className="font-body text-[11px] text-white/30 hover:text-white/60 transition-colors"
          >
            {t('privacy')}
          </Link>
        </div>
      </div>
    </footer>
  )
}
