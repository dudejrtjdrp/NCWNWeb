'use client'

/**
 * NotFound404Page — 404 (E4 틀)
 * 종이 바탕, 위 1px 선 줄(로고 · 404) → 거대한 '404' + 한글 제목 + 설명 → 메인으로/이전으로
 * → 자주 찾는 곳 바로가기 4개. 루트 404(서버)에서는 onBack 이 없어 '이전으로'를 숨긴다.
 */

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import MoreLinks from '@/components/sections/editorial/MoreLinks'

export interface NotFound404PageProps {
  /** '이전으로' 버튼 (not-found.tsx 에서 router.back() 주입) */
  onBack?: () => void
  /** '메인으로' 주소 — 기본 '/' */
  homeHref?: string
}

export default function NotFound404Page({ onBack, homeHref = '/' }: NotFound404PageProps) {
  const t = useTranslations('notFound')

  return (
    <div className="flex min-h-screen flex-col break-keep bg-nwcn-paper text-nwcn-dark">
      <div className="border-b border-nwcn-dark">
        <div className="editorial-container flex h-16 items-center justify-between">
          <Link
            href={homeHref}
            aria-label={t('goHome')}
            className="font-brand font-black text-[22px] tracking-[-0.02em] text-nwcn-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark"
          >
            NWCN
          </Link>
          <span className="font-semibold tabular-nums text-body-sm">404</span>
        </div>
      </div>

      <main className="mx-auto w-full max-w-page flex-1">
        <div className="editorial-container">
          <div className="grid grid-cols-12 gap-x-6 gap-y-8 pt-8 lg:pt-12">
            <h1 className="col-span-12 m-0 lg:col-span-8">
              <span lang="en" aria-hidden="true" className="block font-black tabular-nums text-poster-en">404</span>
              <span className="mt-4 block font-extrabold text-headline">{t('headline')}</span>
            </h1>
            <div className="col-span-12 flex flex-col self-end lg:col-span-4">
              <p className="border-t border-nwcn-dark pt-4 text-list">
                {t('description1')} {t('description2')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={homeHref}
                  className="inline-flex items-center gap-2 bg-nwcn-dark px-5 py-3.5 font-semibold text-body-sm text-white transition-colors duration-fast ease-nwcn hover:bg-nwcn-green-darker focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark focus-visible:ring-offset-2"
                >
                  {t('goHome')}
                  <span aria-hidden="true">→</span>
                </Link>
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-2 border border-nwcn-dark px-5 py-3.5 font-semibold text-body-sm transition-colors duration-fast ease-nwcn hover:bg-nwcn-dark hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark focus-visible:ring-offset-2"
                  >
                    {t('goBack')}
                  </button>
                )}
              </div>
            </div>
          </div>

          <MoreLinks
            label={t('links')}
            links={[
              { href: '/about/department', label: t('department') },
              { href: '/work/showcase', label: t('showcase') },
              { href: '/ninc/event', label: t('event') },
              { href: '/info/admission', label: t('admission') },
            ]}
          />
        </div>
      </main>
    </div>
  )
}
