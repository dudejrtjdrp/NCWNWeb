'use client'

/**
 * BASE 컴포넌트: WorkHero
 * 공통 PageHero 를 WORK 섹션 용도로 구성한 래퍼.
 */

import { useTranslations } from 'next-intl'
import PageHero from '@/components/base/PageHero'

export default function WorkHero() {
  const t = useTranslations('work.hero')
  return (
    <PageHero
      label={t('label')}
      title={t('title')}
      description={t('description')}
      watermark="WORK"
      size="md"
      decoration="dots"
    />
  )
}
