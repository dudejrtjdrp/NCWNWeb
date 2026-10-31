'use client'

/**
 * AboutLocalBar — 학과 소개(ABOUT) 상단 줄. 공용 LocalBar 에 ABOUT 메뉴를 넣은 얇은 래퍼.
 */

import { useTranslations } from 'next-intl'
import LocalBar from '@/components/sections/editorial/LocalBar'

export default function AboutLocalBar() {
  const t = useTranslations('about.nav')
  return (
    <LocalBar
      section={{ href: '/about/department', label: t('section') }}
      items={[
        { href: '/about/department', label: t('department') },
        { href: '/about/faculty', label: t('faculty') },
        { href: '/about/curriculum', label: t('curriculum') },
        { href: '/about/lab', label: t('lab') },
      ]}
      labels={{ breadcrumb: t('breadcrumb'), menu: t('menu') }}
    />
  )
}
