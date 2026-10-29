/**
 * HomeColumn — 홈 3차(3-2B) 오른쪽 정보 열 (Server Component)
 *
 * 왼쪽 유체 패널 옆에 학과 공식 정보를 섹션 단위로 둔다.
 * 각 섹션의 data-fluid-section 번호를 FluidHome이 읽어 패널에 '지금 보는 섹션'을 표시한다.
 * 데이터가 없으면 목데이터 대신 빈 상태 문구를 보여 준다.
 */

import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import CrestCloud from './CrestCloud'
import type { WorkListItem } from '@/lib/supabase/queries/works'
import type { HomeNincCard, HomeNcrReport } from '@/lib/supabase/queries/home'

interface HomeColumnProps {
  locale: string
  works: WorkListItem[]
  ninc: HomeNincCard[]
  ncr: HomeNcrReport[]
}

const SEC = 'flex flex-col gap-7 py-section-md border-t border-nwcn-border-light first:border-t-0 first:pt-0 scroll-mt-24'
const KICKER = 'text-label font-bold text-nwcn-green-darker'
const H2 = 'm-0 text-page-1 font-black text-nwcn-neutral-900'
const BTN = 'focus-ring inline-flex items-center min-h-12 px-5 rounded-full border border-nwcn-neutral-900 text-body-sm font-bold transition-colors duration-fast ease-nwcn'
const BTN_SOLID = `${BTN} bg-nwcn-neutral-900 text-white hover:text-nwcn-green`
const BTN_LINE = `${BTN} bg-transparent text-nwcn-neutral-900 hover:bg-nwcn-neutral-900 hover:text-white`
const THUMB = 'relative block aspect-[4/3] overflow-hidden rounded-card bg-nwcn-neutral-100'
const IMG = 'object-cover transition-transform duration-slow ease-nwcn group-hover:scale-105'

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-US' : 'ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export default async function HomeColumn({ locale, works, ninc, ncr }: HomeColumnProps) {
  const t = await getTranslations({ locale, namespace: 'home.fluid' })

  const workItems = works.filter((w) => w.thumbnail_url).slice(0, 4)
  const nincItems = ninc.slice(0, 4)
  const ncrItems = ncr.slice(0, 3)

  return (
    <>
      {/* 01 학과 소개 */}
      <section id="about" data-fluid-section="0" className={SEC}>
        <p className={KICKER}>01 · ABOUT</p>
        <h2 className={H2}>{t('about.title')}</h2>
        <p className="m-0 max-w-prose text-body text-nwcn-neutral-600">{t('about.body')}</p>
        <CrestCloud label={t('about.crest')} />
        <div className="grid gap-4 sm:grid-cols-3">
          {(['plan', 'design', 'dev'] as const).map((k) => (
            <div key={k} className="flex flex-col gap-2 p-6 rounded-card bg-white border border-nwcn-border-light">
              <strong className="text-card text-nwcn-neutral-900">{t(`about.${k}`)}</strong>
              <span className="text-body-sm text-nwcn-neutral-600">{t(`about.${k}Desc`)}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/about/department" className={BTN_SOLID}>{t('about.dept')}</Link>
          <Link href="/about/faculty" className={BTN_LINE}>{t('about.faculty')}</Link>
          <Link href="/about/curriculum" className={BTN_LINE}>{t('about.curriculum')}</Link>
          <Link href="/about/lab" className={BTN_LINE}>{t('about.lab')}</Link>
        </div>
      </section>

      {/* 02 학생 작품 */}
      <section id="work" data-fluid-section="1" className={SEC}>
        <p className={KICKER}>02 · WORK</p>
        <h2 className={H2}>{t('work.title')}</h2>
        {workItems.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {workItems.map((w) => (
              <Link key={w.id} href={`/work/${w.id}`} className="group flex flex-col gap-2">
                <span className={THUMB}>
                  <Image src={w.thumbnail_url as string} alt={w.title} fill sizes="(min-width: 768px) 420px, 100vw" className={IMG} />
                </span>
                <span className="text-card font-bold text-nwcn-neutral-900">{w.title}</span>
                <span className="text-body-sm text-nwcn-neutral-500">{w.author}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="m-0 text-body text-nwcn-neutral-500">{t('work.empty')}</p>
        )}
        <div className="flex flex-wrap gap-2.5">
          <Link href="/work/showcase" className={BTN_SOLID}>{t('work.all')}</Link>
          <Link href="/work/exhibition" className={BTN_LINE}>{t('work.exhibition')}</Link>
          <Link href="/work/archive" className={BTN_LINE}>{t('work.archive')}</Link>
        </div>
      </section>

      {/* 03 NINC */}
      <section id="ninc" data-fluid-section="2" className={SEC}>
        <p className={KICKER}>03 · NINC</p>
        <h2 className={H2}>{t('ninc.title')}</h2>
        {nincItems.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {nincItems.map((n) => {
              const inner = (
                <>
                  <span className={THUMB}>
                    <Image src={n.image_url} alt={n.alt_text ?? 'NINC'} fill sizes="(min-width: 768px) 420px, 100vw" className={IMG} />
                  </span>
                  {n.alt_text && <span className="text-card font-bold text-nwcn-neutral-900">{n.alt_text}</span>}
                </>
              )
              if (!n.link_href) return <div key={n.id} className="group flex flex-col gap-2">{inner}</div>
              if (/^https?:\/\//.test(n.link_href)) {
                return <a key={n.id} href={n.link_href} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-2">{inner}</a>
              }
              return <Link key={n.id} href={n.link_href} className="group flex flex-col gap-2">{inner}</Link>
            })}
          </div>
        ) : (
          <p className="m-0 text-body text-nwcn-neutral-500">{t('ninc.empty')}</p>
        )}
        <div className="flex flex-wrap gap-2.5">
          <Link href="/ninc/project" className={BTN_SOLID}>{t('ninc.project')}</Link>
          <Link href="/ninc/awards" className={BTN_LINE}>{t('ninc.awards')}</Link>
          <Link href="/ninc/event" className={BTN_LINE}>{t('ninc.event')}</Link>
        </div>
      </section>

      {/* 04 NCR 트렌드 */}
      <section id="ncr" data-fluid-section="3" className={SEC}>
        <p className={KICKER}>04 · NCR TREND</p>
        <h2 className={H2}>{t('ncr.title')}</h2>
        {ncrItems.length ? (
          <div className="flex flex-col divide-y divide-nwcn-border-light">
            {ncrItems.map((a) => (
              <Link key={a.id} href={`/ncr-trend/${a.id}`} className="group flex items-center gap-4 py-4">
                <span className={`${THUMB} w-28 shrink-0`}>
                  {a.thumbnail_url && <Image src={a.thumbnail_url} alt="" fill sizes="112px" className={IMG} />}
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <strong className="text-card text-nwcn-neutral-900 transition-colors duration-fast ease-nwcn group-hover:text-nwcn-green-darker">{a.title}</strong>
                  <span className="text-caption text-nwcn-neutral-500">{formatDate(a.published_at, locale)}{a.season ? ` · ${a.season}` : ''}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="m-0 text-body text-nwcn-neutral-500">{t('ncr.empty')}</p>
        )}
        <div className="flex flex-wrap gap-2.5">
          <Link href="/ncr-trend/latest" className={BTN_SOLID}>{t('ncr.all')}</Link>
        </div>
      </section>

      {/* 05 입학 안내 */}
      <section id="admission" data-fluid-section="4" className={SEC}>
        <p className={KICKER}>05 · ADMISSION</p>
        <h2 className={H2}>{t('admission.title')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/info/admission" className="focus-ring flex flex-col gap-1.5 p-6 rounded-card border border-nwcn-neutral-900 bg-white transition-colors duration-fast ease-nwcn hover:bg-nwcn-neutral-100">
            <strong className="text-card text-nwcn-neutral-900">{t('admission.guide')} →</strong>
            <span className="text-body-sm text-nwcn-neutral-600">{t('admission.guideDesc')}</span>
          </Link>
          <Link href="/info/contact" className="focus-ring flex flex-col gap-1.5 p-6 rounded-card border border-nwcn-neutral-900 bg-white transition-colors duration-fast ease-nwcn hover:bg-nwcn-neutral-100">
            <strong className="text-card text-nwcn-neutral-900">{t('admission.contact')} →</strong>
            <span className="text-body-sm text-nwcn-neutral-600">{t('admission.contactDesc')}</span>
          </Link>
        </div>
      </section>
    </>
  )
}
