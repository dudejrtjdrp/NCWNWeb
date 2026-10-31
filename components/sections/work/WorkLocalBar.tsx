'use client'

/** WorkLocalBar — WORK 상단 줄 (쇼케이스 · 졸업전시). 작품 상세(/work/[id])에서는 쇼케이스가 현재로 표시된다. */

import { useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import LocalBar from '@/components/sections/editorial/LocalBar'

export default function WorkLocalBar() {
  const t = useTranslations('work.nav')
  const pathname = usePathname()
  const isDetail = /^\/work\/(?!showcase|exhibition|archive)[^/]+/.test(pathname)
  return (
    <LocalBar
      section={{ href: '/work/showcase', label: t('section') }}
      items={[
        { href: '/work/showcase', label: t('showcase') },
        { href: '/work/exhibition', label: t('exhibition') },
      ]}
      labels={{ breadcrumb: t('breadcrumb'), menu: t('menu') }}
      currentHref={isDetail ? '/work/showcase' : undefined}
    />
  )
}
