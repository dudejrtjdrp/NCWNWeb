/**
 * ExhibitionList — 졸업전시 기록 (E4)
 * 해마다 한 줄: 왼쪽 포스터, 오른쪽 연도 · 전시 제목 · 소개 · 전시 사이트 링크. 1px 선으로 나눈다.
 * 소개 글의 **굵게** 표시는 <strong> 으로, 빈 줄은 문단으로 바꾼다.
 */

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { ExhibitionItem } from '@/lib/supabase/queries/exhibitions'

function RichText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return <>{parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part))}</>
}

export const exhibitionAnchor = (year: number) => `y${year}`

export default function ExhibitionList({ items }: { items: ExhibitionItem[] }) {
  const t = useTranslations('work.exhibition')

  if (items.length === 0) {
    return (
      <div className="editorial-container pb-24 pt-chapter">
        <p className="border-y border-nwcn-dark py-6 font-bold text-statement">{t('empty')}</p>
      </div>
    )
  }

  return (
    <div className="editorial-container pb-24">
      {items.map((ex, i) => {
        const body = (ex.description ?? ex.theme ?? '').replace(/\r\n/g, '\n').trim()
        return (
          <section
            key={ex.id}
            id={exhibitionAnchor(ex.year)}
            aria-labelledby={`${exhibitionAnchor(ex.year)}-title`}
            className="scroll-mt-36 pt-chapter"
          >
            <div className="grid grid-cols-12 gap-x-6 gap-y-8 border-t border-nwcn-dark pt-6">
              <div className="col-span-12 sm:col-span-5 lg:col-span-4">
                {ex.poster_url ? (
                  <Image
                    src={ex.poster_url}
                    alt={t('posterAlt', { year: ex.year, title: ex.title })}
                    width={800}
                    height={1120}
                    priority={i === 0}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 40vw, 100vw"
                    className="h-auto w-full bg-nwcn-neutral-200"
                  />
                ) : (
                  <div className="grid aspect-[5/7] place-items-center bg-nwcn-dark font-black text-headline text-nwcn-paper">
                    {ex.year}
                  </div>
                )}
              </div>
              <div className="col-span-12 flex min-w-0 flex-col sm:col-span-7 lg:col-span-7 lg:col-start-6">
                <p className="font-bold tabular-nums text-section text-nwcn-neutral-600">{t('yearLabel', { year: ex.year })}</p>
                <h2 id={`${exhibitionAnchor(ex.year)}-title`} className="m-0 mt-2 font-extrabold text-headline">
                  {ex.title}
                </h2>
                {body && (
                  <div className="mt-8 flex max-w-2xl flex-col gap-4 border-t border-nwcn-rule pt-5 text-list">
                    {body.split(/\n{2,}/).map((para, k) => (
                      <p key={k} className="whitespace-pre-line">
                        <RichText text={para.trim()} />
                      </p>
                    ))}
                  </div>
                )}
                {ex.link && (
                  <a
                    href={ex.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 self-start border border-nwcn-dark px-3 py-1.5 font-semibold text-body-sm transition-colors duration-fast ease-nwcn hover:bg-nwcn-dark hover:text-nwcn-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nwcn-dark focus-visible:ring-offset-2 focus-visible:ring-offset-nwcn-paper"
                  >
                    {t('site')} <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
