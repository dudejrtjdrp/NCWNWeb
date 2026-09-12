'use client'

/**
 * BASE 컴포넌트: InfoHero
 * 공통 PageHero 를 INFO 섹션 용도로 구성한 래퍼.
 */

import { useTranslations } from 'next-intl'
import PageHero from '@/components/base/PageHero'

export default function InfoHero() {
  const t = useTranslations('info.hero')
  return (
    <PageHero
      label={t('label')}
      title={t('title')}
      description={t('description')}
      watermark="INFO"
      size="sm"
      decoration="bar"
    />
  )
}
