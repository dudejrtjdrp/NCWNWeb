'use client'

/**
 * BASE 컴포넌트: NcrHero
 * 공통 PageHero 를 NCR TREND 섹션(다크 테마) 용도로 구성한 래퍼.
 */

import { useTranslations } from 'next-intl'
import PageHero from '@/components/base/PageHero'

export default function NcrHero() {
  const t = useTranslations('ncr.hero')
  return (
    <PageHero
      label={t('label')}
      title={t('title')}
      description={t('description')}
      watermark="NCR"
      theme="dark"
      size="md"
      decoration="grid"
      footer={
        <>
          <span className="h-[2px] w-12 bg-nwcn-green" />
          <span className="font-body text-caption tracking-widest text-white/35">{t('tags')}</span>
        </>
      }
    />
  )
}
