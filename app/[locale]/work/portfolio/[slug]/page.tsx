/**
 * 졸업생 상세: /work/portfolio/[slug] — E4 틀
 * 포트폴리오가 공개된 학생: 종이 바탕, WORK 위치·하위 메뉴 줄 → 이름·분야·한 줄 소개 + 프로필 사진(아래 '원본 보기')
 *   → '학과 정리본 / 원본 포트폴리오' 전환 줄 → (정리본) 소개·프로젝트·원본 미리보기·이력·연락·쇼케이스 작품
 *   (원본) PDF 쪽 이미지 → 다른 졸업생.
 * 아직 포트폴리오가 없는 졸업생(주소는 이름 로마자, 예: 2027-lee-seonghyo): 이름·졸업 연도 + 프로필 사진
 *   → 제작자로 연결된 쇼케이스 작품(있을 때만) → 다른 졸업생. 비어 있는 항목은 문구 없이 생략.
 */

import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import SubPageLayout from '@/components/layout/SubPageLayout'
import { Link } from '@/i18n/navigation'
import WorkLocalBar from '@/components/sections/work/WorkLocalBar'
import PortfolioTabs from '@/components/sections/work/portfolio/PortfolioTabs'
import PortfolioSummary from '@/components/sections/work/portfolio/PortfolioSummary'
import PortfolioOriginal from '@/components/sections/work/portfolio/PortfolioOriginal'
import PortfolioCard from '@/components/sections/work/portfolio/PortfolioCard'
import WorkCard from '@/components/sections/work/WorkCard'
import {
  getGraduateBySlug,
  getGraduates,
  getPortfolioBySlug,
  getPortfolioWorks,
  getStudentSlugs,
  otherGraduates,
  type GraduateCard,
} from '@/lib/supabase/queries/portfolios'
import type { WorkType } from '@/lib/supabase/queries/works'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.dima-nwcn.com'

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params
  const item = await getPortfolioBySlug(slug, locale)
  if (!item) {
    const g = await getGraduateBySlug(slug, locale)
    if (!g) return { title: '졸업생을 찾을 수 없습니다' }
    const url = `${SITE_URL}/work/portfolio/${g.slug}`
    const title = `${g.name} — 졸업생`
    const description = `${g.year}년 뉴미디어콘텐츠과 졸업생 ${g.name}`
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: { type: 'profile', url, title, description, siteName: 'NWCN', images: g.photo ? [{ url: g.photo, alt: g.name }] : undefined },
    }
  }
  const title = `${item.name} — 포트폴리오`
  const description = item.tagline ?? `${item.year}년 뉴미디어콘텐츠과 졸업생 ${item.name}의 포트폴리오입니다.`
  const url = `${SITE_URL}/work/portfolio/${item.slug}`
  const image = item.profile_url ?? item.cover_url
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'profile', url, title, description, siteName: 'NWCN', images: image ? [{ url: image, alt: item.name }] : undefined },
  }
}

export default async function PortfolioDetailPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params
  const [item, all, t, list, w] = await Promise.all([
    getPortfolioBySlug(slug, locale),
    getGraduates(locale),
    getTranslations({ locale, namespace: 'work.portfolio.detail' }),
    getTranslations({ locale, namespace: 'work.portfolio' }),
    getTranslations({ locale, namespace: 'work.detail' }),
  ])
  const typeLabel: Record<WorkType, string> = { design: w('typeDesign'), video: w('typeVideo'), '3d': w('type3d') }
  const othersLabels = (p: GraduateCard) => ({ profileAlt: list('profileAlt', { name: p.name }), coverHint: list('coverHint') })

  // 포트폴리오가 아직 없는 졸업생
  if (!item) {
    const g = all.find((c) => c.slug === slug)
    if (!g) notFound()
    const gWorks = await getPortfolioWorks(g.studentId, locale)
    const gOthers = otherGraduates(all, g.slug)
    return (
      <SubPageLayout tone="paper">
        <WorkLocalBar />
        <div className="mx-auto max-w-page border-t border-nwcn-dark">
          <div className="editorial-container pb-24">
            <header className="grid grid-cols-12 gap-x-6 gap-y-8 pt-5">
              <div className="col-span-12 flex min-w-0 flex-col sm:col-span-7 lg:col-span-8">
                <Link href="/work/portfolio" className="editorial-link self-start font-semibold text-body-sm">
                  <span aria-hidden="true">← </span>
                  {t('backToList')}
                </Link>
                <p className="mt-10 font-semibold tabular-nums text-list text-nwcn-neutral-600 lg:mt-14">{t('graduate', { year: g.year })}</p>
                <h1 className="m-0 mt-2 break-keep font-extrabold text-poster-ko">{g.name}</h1>
                {g.nameEn && locale !== 'en' && <p lang="en" className="mt-2 font-semibold text-lead">{g.nameEn}</p>}
              </div>
              {g.photo && (
                <div className="col-span-12 self-end sm:col-span-5 lg:col-span-4">
                  <div className="relative aspect-[4/5] max-w-[320px] overflow-hidden bg-nwcn-neutral-200 sm:max-w-none">
                    <Image src={g.photo} alt={list('profileAlt', { name: g.name })} fill priority sizes="(min-width: 1024px) 30vw, (min-width: 640px) 40vw, 100vw" className="object-cover" />
                  </div>
                </div>
              )}
            </header>

            {gWorks.length > 0 && (
              <section aria-labelledby="works-t" className="pt-chapter">
                <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h2 id="works-t" className="m-0 font-extrabold text-headline">{t('works')}</h2>
                  <p className="text-body-sm text-nwcn-neutral-600">{t('worksHint')}</p>
                </div>
                <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                  {gWorks.map((wk) => (
                    <WorkCard key={wk.id} work={wk} typeLabel={typeLabel} />
                  ))}
                </ul>
              </section>
            )}

            {gOthers.length > 0 && (
              <section aria-labelledby="others-t" className="border-t border-nwcn-dark pt-chapter mt-chapter">
                <h2 id="others-t" className="m-0 mb-6 font-extrabold text-headline">{t('others')}</h2>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
                  {gOthers.map((p) => (
                    <PortfolioCard key={p.key} item={p} labels={othersLabels(p)} />
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </SubPageLayout>
    )
  }

  const teamIds = item.projects.flatMap((p) => (p.team ?? []).map((m) => m.student_id)).filter((v): v is string => !!v)
  const [works, teamSlugs] = await Promise.all([getPortfolioWorks(item.student_id, locale, item.slug), getStudentSlugs(teamIds)])
  // 다른 졸업생: 목록에서 이 사람 다음 사람부터 4명
  const others = otherGraduates(all, item.slug)

  return (
    <SubPageLayout tone="paper">
      <WorkLocalBar />
      <div className="mx-auto max-w-page border-t border-nwcn-dark">
        <div className="editorial-container pb-24">
          {/* ── 이름 + 프로필 사진 ── */}
          <header className="grid grid-cols-12 gap-x-6 gap-y-8 pt-5">
            <div className="col-span-12 flex min-w-0 flex-col sm:col-span-7 lg:col-span-8">
              <Link href="/work/portfolio" className="editorial-link self-start font-semibold text-body-sm">
                <span aria-hidden="true">← </span>
                {t('backToList')}
              </Link>
              <p className="mt-10 font-semibold tabular-nums text-list text-nwcn-neutral-600 lg:mt-14">
                {[t('graduate', { year: item.year }), item.fields.join(' · ')].filter(Boolean).join(' · ')}
              </p>
              <h1 className="m-0 mt-2 break-keep font-extrabold text-poster-ko">{item.name}</h1>
              {item.name_en && locale !== 'en' && <p lang="en" className="mt-2 font-semibold text-lead">{item.name_en}</p>}
              {item.tagline && <p className="mt-8 max-w-2xl font-bold text-statement">{item.tagline}</p>}
            </div>
            <div className="col-span-12 self-end sm:col-span-5 lg:col-span-4">
              <div className="relative aspect-[4/5] max-w-[320px] overflow-hidden bg-nwcn-neutral-200 sm:max-w-none">
                {item.profile_url && (
                  <Image src={item.profile_url} alt={list('profileAlt', { name: item.name })} fill priority sizes="(min-width: 1024px) 30vw, (min-width: 640px) 40vw, 100vw" className="object-cover" />
                )}
              </div>
              <a
                href="#original"
                className="mt-3 flex max-w-[320px] items-center justify-between gap-3 border border-nwcn-dark px-4 py-3 font-semibold text-body-sm transition-colors duration-fast ease-nwcn hover:bg-nwcn-dark hover:text-white sm:max-w-none"
              >
                {t('openOriginal')}
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </header>

          <PortfolioTabs
            labels={{ view: t('viewLabel'), summary: t('viewSummary'), original: t('viewOriginal') }}
            summary={<PortfolioSummary item={item} works={works} typeLabel={typeLabel} teamSlugs={Object.fromEntries(teamSlugs)} />}
            original={<PortfolioOriginal item={item} />}
          />

          {/* ── 다른 졸업생 ── */}
          {others.length > 0 && (
            <section aria-labelledby="others-t" className="pt-chapter">
              <h2 id="others-t" className="m-0 mb-6 font-extrabold text-headline">{t('others')}</h2>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
                {others.map((p) => (
                  <PortfolioCard key={p.key} item={p} labels={othersLabels(p)} />
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </SubPageLayout>
  )
}
