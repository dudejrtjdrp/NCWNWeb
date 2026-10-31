/**
 * NINC/Event 행사 — E4 틀
 * 포스터형 히어로(EVENT / 행사) — 오른쪽 판에 사진 대신 '다음 일정'을 크게.
 * 그 아래 종류 거르개 · 목록/달력 전환 줄 + 일정(다가오는 → 지난) + 아래 바로가기.
 * 내용은 events 테이블(관리자 등록)에서 온다.
 */

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import SubPageLayout from '@/components/layout/SubPageLayout'
import PosterHero from '@/components/sections/about/PosterHero'
import MoreLinks from '@/components/sections/editorial/MoreLinks'
import NincLocalBar from '@/components/sections/ninc/NincLocalBar'
import NextEventPanel from '@/components/sections/ninc/NextEventPanel'
import EventBoard from '@/components/sections/ninc/EventBoard'
import { seoulToday, type EventLite } from '@/components/sections/ninc/event-date'
import { getEvents } from '@/lib/supabase/queries/events'

export const metadata: Metadata = {
  title: 'EVENT — 행사',
  description: '동아방송예술대학교 뉴미디어콘텐츠과의 특강·워크숍·캠퍼스투어 등 학과 일정을 확인하세요.',
  keywords: ['뉴미디어콘텐츠과', '행사', '특강', '워크숍', '학사일정', 'Now In NewCon', 'NINC'],
  alternates: { canonical: '/ninc/event' },
  openGraph: {
    type: 'website',
    title: 'EVENT — 행사 | NWCN',
    description: '뉴미디어콘텐츠과의 특강·워크숍·학과 일정',
  },
}

/** 판 뒤에 흐리게 까는 학과 행사 사진 (2026 MT) */
const EVENT_PHOTO = 'https://assets.dima-nwcn.com/ncr-thumbnails/season-3/ae64ad1a-d9bc-4c9c-b13a-b3f92fa1f05f.jpg'

export default async function EventPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [events, t, nav, h] = await Promise.all([
    getEvents(locale),
    getTranslations({ locale, namespace: 'ninc.eventPage' }),
    getTranslations({ locale, namespace: 'ninc.nav' }),
    getTranslations({ locale, namespace: 'ninc.heroLabels' }),
  ])

  const lite: EventLite[] = events.map(({ id, title, type, start_date, end_date, location }) => ({
    id,
    title,
    type,
    start_date,
    end_date,
    location,
  }))
  const today = seoulToday()

  return (
    <SubPageLayout tone="paper">
      <NincLocalBar />
      <PosterHero
        titleEn={t.raw('heroEn') as string[]}
        titleKo={t('heroKo')}
        lead={t('lead')}
        slides={[]}
        media={<NextEventPanel events={lite} initialToday={today} photo={EVENT_PHOTO} />}
        labels={{ region: t('region'), prev: h('prev'), next: h('next'), pause: h('pause'), play: h('play') }}
      />
      <EventBoard events={lite} initialToday={today} />
      <div className="mx-auto max-w-page">
        <div className="editorial-container">
          <MoreLinks
            label={nav('more')}
            links={[
              { href: '/ninc/awards', label: nav('awards') },
              { href: '/ninc/project', label: nav('project') },
              { href: '/work/showcase', label: nav('showcase') },
              { href: '/info/admission', label: nav('admission') },
            ]}
          />
        </div>
      </div>
    </SubPageLayout>
  )
}
