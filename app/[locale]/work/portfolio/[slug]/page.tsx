/**
 * 졸업생 포트폴리오 개인 페이지: /work/portfolio/[slug] — E4 틀
 * 종이 바탕, WORK 위치·하위 메뉴 줄 → 이름·분야·한 줄 소개 + 프로필 사진(아래 '원본 보기')
 * → '학과 정리본 / 원본 포트폴리오' 전환 줄 → (정리본) 소개·프로젝트·원본 미리보기·이력·연락·쇼케이스 작품
 *   (원본) PDF 쪽 이미지 → 다른 졸업생.
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
import { getPortfolioBySlug, getPortfolios, getPortfolioWorks } from '@/lib/supabase/queries/portfolios'
import type { WorkType } from '@/lib/supabase/queries/works'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.dima-nwcn.com'

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params
  const item = await getPortfolioBySlug(slug, locale)
  if (!item) return { title: '포트폴리오를 찾을 수 없습니다' }
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
    getPortfolios(locale),
    getTranslations({ locale, namespace: 'work.portfolio.detail' }),
    getTranslations({ locale, namespace: 'work.portfolio' }),
    getTranslations({ locale, namespace: 'work.detail' }),
  ])
  if (!item) notFound()

  const works = await getPortfolioWorks(item.student_id, locale)
  const typeLabel: Record<WorkType, string> = { design: w('typeDesign'), video: w('typeVideo'), '3d': w('type3d') }
  // 다른 졸업생: 같은 해 먼저, 그다음 최근 순으로 4명
  const others = all
    .filter((p) => p.slug !== item.slug)
    .sort((a, b) => Number(b.year === item.year) - Number(a.year === item.year) || b.year - a.year)
    .slice(0, 4)

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
            summary={<PortfolioSummary item={item} works={works} typeLabel={typeLabel} />}
            original={<PortfolioOriginal item={item} />}
          />

          {/* ── 다른 졸업생 ── */}
          {others.length > 0 && (
            <section aria-labelledby="others-t" className="pt-chapter">
              <h2 id="others-t" className="m-0 mb-6 font-extrabold text-headline">{t('others')}</h2>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
                {others.map((p) => (
                  <PortfolioCard key={p.id} item={p} labels={{ profileAlt: list('profileAlt', { name: p.name }), coverHint: list('coverHint') }} />
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </SubPageLayout>
  )
}
