'use client'

/** NcrLocalBar — NCR TREND 상단 줄 (최신 리포트 · 아카이브). 기사 상세(/ncr-trend/[id])에서는 최신 리포트가 현재로 표시된다. */

import { useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import LocalBar from '@/components/sections/editorial/LocalBar'

export default function NcrLocalBar() {
  const t = useTranslations('ncr.nav')
  const pathname = usePathname()
  const isDetail = /^\/ncr-trend\/(?!latest|archive)[^/]+/.test(pathname)
  return (
    <LocalBar
      section={{ href: '/ncr-trend/latest', label: t('section') }}
      items={[
        { href: '/ncr-trend/latest', label: t('latest') },
        { href: '/ncr-trend/archive', label: t('archive') },
      ]}
      labels={{ breadcrumb: t('breadcrumb'), menu: t('menu') }}
      currentHref={isDetail ? '/ncr-trend/latest' : undefined}
    />
  )
}
