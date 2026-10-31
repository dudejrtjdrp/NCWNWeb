/**
 * LabContent — 실습실 (E4)
 * 실습실·장비 정보가 정리되기 전까지: 준비 중 안내 + 학과 사무실 연락처.
 * (없는 시설 정보를 지어내지 않는다 — 자료가 오면 이 파일에 섹션을 추가)
 */

import { useTranslations } from 'next-intl'
import { AboutMoreLinks, EditorialHeading } from '@/components/sections/about/Editorial'

export const LAB_SECTIONS = ['status', 'contact'] as const

const CONTACT = { tel: '031-670-6680', mail: 'minyoopark@dima.ac.kr' }

export default function LabContent() {
  const t = useTranslations('about.lab')
  const rows = [
    {
      label: t('contactRows.tel'),
      value: (
        <a href={`tel:${CONTACT.tel.replace(/-/g, '')}`} className="underline decoration-1 underline-offset-4 editorial-link">
          {CONTACT.tel}
        </a>
      ),
    },
    {
      label: t('contactRows.email'),
      value: (
        <a href={`mailto:${CONTACT.mail}`} className="break-all underline decoration-1 underline-offset-4 editorial-link">
          {CONTACT.mail}
        </a>
      ),
    },
    { label: t('contactRows.address'), value: t('address') },
  ]

  return (
    <div className="editorial-container">
      <section id="status" aria-labelledby="status-title" className="scroll-mt-36 pt-chapter">
        <EditorialHeading id="status-title">{t('anchors.status')}</EditorialHeading>
        <div className="grid grid-cols-12 gap-x-6 gap-y-4 border-y border-nwcn-dark py-6">
          <p className="col-span-12 font-bold text-statement lg:col-span-6">{t('preparing')}</p>
          <p className="col-span-12 text-intro lg:col-span-6">{t('preparingBody')}</p>
        </div>
      </section>

      <section id="contact" aria-labelledby="contact-title" className="scroll-mt-36 pt-chapter">
        <EditorialHeading id="contact-title">{t('anchors.contact')}</EditorialHeading>
        <dl className="border-b border-nwcn-dark text-list">
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-12 gap-x-6 border-t border-nwcn-dark py-3.5">
              <dt className="col-span-12 text-nwcn-neutral-600 sm:col-span-4 sm:text-nwcn-dark lg:col-span-6">{row.label}</dt>
              <dd className="col-span-12 sm:col-span-8 lg:col-span-6">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <AboutMoreLinks current="lab" />
    </div>
  )
}
