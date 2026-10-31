'use client'

/** NincLocalBar — NINC 상단 줄 (수상 · 프로젝트 · 행사). 상세 페이지에서도 소속 탭이 현재로 표시된다. */

import { useTranslations } from 'next-intl'
import LocalBar from '@/components/sections/editorial/LocalBar'

export default function NincLocalBar() {
  const t = useTranslations('ninc.nav')
  return (
    <LocalBar
      section={{ href: '/ninc/awards', label: t('section') }}
      items={[
        { href: '/ninc/awards', label: t('awards') },
        { href: '/ninc/project', label: t('project') },
        { href: '/ninc/event', label: t('event') },
      ]}
      labels={{ breadcrumb: t('breadcrumb'), menu: t('menu') }}
    />
  )
}
