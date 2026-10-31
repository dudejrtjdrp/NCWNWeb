/**
 * PortfolioOriginal — 개인 페이지 '원본 포트폴리오' (E4)
 * 학생이 직접 디자인한 PDF 를 쪽 이미지로 바꿔 차례로 보여 준다(세로 쪽은 화면 높이에 맞춤). 학생이 허용했을 때만 PDF 내려받기.
 */

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { PortfolioItem } from '@/lib/supabase/queries/portfolios'

export default function PortfolioOriginal({ item }: { item: PortfolioItem }) {
  const t = useTranslations('work.portfolio.detail')
  return (
    <div className="pb-8 pt-10">
      {item.pdf_url && (
        <p className="mb-8 flex justify-end">
          <a
            href={item.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-nwcn-dark px-4 py-2.5 font-semibold text-body-sm transition-colors duration-fast ease-nwcn hover:bg-nwcn-dark hover:text-white"
          >
            {t('downloadPdf')}
            <span aria-hidden="true">↓</span>
          </a>
        </p>
      )}
      {item.pages.length ? (
        <ol className="mx-auto flex max-w-5xl flex-col gap-10">
          {item.pages.map((src, i) => (
            <li key={src}>
              <figure className="m-0">
                <Image
                  src={src}
                  alt={`${item.name} — ${t('page', { n: i + 1 })}`}
                  width={1600}
                  height={1000}
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  className="mx-auto bg-nwcn-dark"
                  style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '88vh' }}
                  priority={i === 0}
                />
                <figcaption className="mt-2 border-t border-nwcn-dark pt-2 font-semibold tabular-nums text-caption text-nwcn-neutral-600">
                  {t('page', { n: i + 1 })} / {item.pages.length}
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      ) : (
        <p className="border-y border-nwcn-dark py-5 text-list">{t('noPages')}</p>
      )}
    </div>
  )
}
