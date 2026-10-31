'use client'

/** InfoLocalBar — INFO 상단 줄 (입학 안내 · 문의 · 개인정보처리방침) */

import { useTranslations } from 'next-intl'
import LocalBar from '@/components/sections/editorial/LocalBar'

export default function InfoLocalBar() {
  const t = useTranslations('info.nav')
  return (
    <LocalBar
      section={{ href: '/info/admission', label: t('section') }}
      items={[
        { href: '/info/admission', label: t('admission') },
        { href: '/info/contact', label: t('contact') },
        { href: '/info/privacy', label: t('privacy') },
      ]}
      labels={{ breadcrumb: t('breadcrumb'), menu: t('menu') }}
    />
  )
}
