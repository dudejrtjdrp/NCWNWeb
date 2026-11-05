/**
 * showcase_works 쿼리
 *
 * unstable_cache로 래핑하여 Supabase API 요청을 캐싱합니다.
 * - 캐시 TTL: 5분 (revalidate: 300)
 * - 뮤테이션 시 revalidateTag('works')로 즉시 무효화
 * - locale='en'일 때 _en 컬럼 우선 반환, 비어있으면 한국어 원문 사용
 */

import { createDbClient as createClient } from '@/lib/supabase/db'
import { unstable_cache } from 'next/cache'
import { applyLocale, applyLocaleList } from './_locale'
import { getStudentSlugs } from './portfolios'
import { splitCreators, creatorRefs } from '@/lib/work-creators'

export { splitCreators, creatorRefs }

export type WorkType = 'video' | 'design' | '3d'

export interface RelatedLink { label: string; url: string }

/** 작품 제작자 한 명 (showcase_works.creators — 관리자에서 학생 DB 를 검색해 고르면 student_id 가 들어간다) */
export interface WorkCreatorRef { name: string; student_id: string | null; student_no?: string | null }

export interface WorkItem {
  id: string
  title: string
  author: string
  year: number
  description: string | null
  type: WorkType
  tech_stack: string[]
  thumbnail_url: string | null
  video_embed: string | null
  model_embed: string | null
  images: string[] | null
  related_links: RelatedLink[] | null
  /** 제작자 목록 — creators 컬럼(마이그레이션 후). 없으면 author 문자열을 쓴다 */
  creators?: WorkCreatorRef[] | null
  view_count: number
  created_at: string
  // 영어 원문 (admin 편집용)
  title_en?: string | null
  description_en?: string | null
}

/** 목록 조회용 타입 (images 컬럼 제외 — 목록에서 불필요) */
export type WorkListItem = Omit<WorkItem, 'images'>

/** 쇼케이스 전체 목록 — 최근 작품부터: 연도 → 작품 날짜(work_date) → 등록일 (캐시 5분) */
export async function getShowcaseWorks(locale: string = 'ko'): Promise<WorkListItem[]> {
  const fetcher = unstable_cache(
    async (): Promise<WorkListItem[]> => {
      try {
        const supabase = createClient()
        const cols =
          'id, title, title_en, author, year, description, description_en, type, tech_stack, thumbnail_url, video_embed, model_embed, view_count, created_at'
        const run = (select: string, dated = true) => {
          let q = supabase.from('showcase_works').select(select).order('year', { ascending: false })
          if (dated) q = q.order('work_date', { ascending: false, nullsFirst: false })
          return q.order('created_at', { ascending: false })
        }
        let { data, error } = await run(`${cols}, creators`)
        // 작품 날짜 열(work_date, add_portfolio_showcase.sql)이 아직 없으면 연도·등록일 순으로
        if (error && /work_date/.test(error.message)) ({ data, error } = await run(`${cols}, creators`, false))
        // creators 컬럼이 아직 없으면(마이그레이션 전) 빼고 다시
        if (error && /creators/.test(error.message)) ({ data, error } = await run(cols, false))

        if (error) {
          console.error('[getShowcaseWorks]', error.message)
          return []
        }
        return (data ?? []) as unknown as WorkListItem[]
      } catch (err) {
        console.error('[getShowcaseWorks] unexpected:', err)
        return []
      }
    },
    ['works-list'],
    { revalidate: 300, tags: ['works'] }
  )

  const items = await fetcher()
  return applyLocaleList(items, ['title', 'description'], locale)
}

const SHOWCASE_LIST_COLUMNS =
  'id, title, title_en, author, year, description, description_en, type, tech_stack, thumbnail_url, video_embed, model_embed, view_count, created_at'

export interface ShowcaseWorksPage {
  items: WorkListItem[]
  hasMore: boolean
  total: number
}

/**
 * 쇼케이스 목록 — 페이지네이션(무한 스크롤)용
 * - tag: '전체'/빈값이면 전체, 아니면 tech_stack 포함 필터
 * - q: 제목/작가 부분 검색(ilike)
 * - offset/limit: 범위 조회
 * - seed: 지정 시 시드 기반 랜덤 정렬 RPC 사용(같은 seed → 순서 고정 → 페이지네이션 안전) — 지금 쇼케이스는 쓰지 않음
 *         미지정 시 최근 작품부터: 연도 → 작품 날짜(work_date) → 등록일
 *         (졸업생 포트폴리오 프로젝트도 쇼케이스 작품으로 등록되어 기간순으로 자연스럽게 섞인다)
 * - hasMore: 반환 개수 === limit 이면 더 있다고 판단
 */
export async function getShowcaseWorksPage(params: {
  locale?: string
  tag?: string
  q?: string
  offset?: number
  limit?: number
  seed?: string
}): Promise<ShowcaseWorksPage> {
  const { locale = 'ko', tag, q, offset = 0, limit = 15, seed } = params
  const cleaned = (q ?? '').replace(/[%,()]/g, ' ').trim()
  try {
    const supabase = createClient()

    // 시드 랜덤 정렬 (RPC) — 함수 미적용/오류 시 아래 기본 정렬로 폴백
    if (seed) {
      const { data, error } = await supabase.rpc('get_showcase_works_random', {
        p_seed: seed,
        p_tag: tag && tag !== '전체' ? tag : null,
        p_q: cleaned || null,
        p_offset: offset,
        p_limit: limit,
      })
      if (!error) {
        const rows = (data ?? []) as WorkListItem[]
        const items = applyLocaleList(rows, ['title', 'description'], locale)
        return { items, hasMore: items.length === limit, total: -1 }
      }
      // RPC 실패(예: 마이그레이션 미적용) → 기본 정렬로 폴백
      console.warn('[getShowcaseWorksPage:rpc] 폴백:', error.message)
    }

    // 기본: 최근 작품부터(연도 → 작품 날짜 → 등록일) + 정확한 count
    const build = (dated: boolean) => {
      let query = supabase.from('showcase_works').select(SHOWCASE_LIST_COLUMNS, { count: 'exact' })
      if (tag && tag !== '전체') query = query.contains('tech_stack', [tag])
      if (cleaned) query = query.or(`title.ilike.%${cleaned}%,author.ilike.%${cleaned}%`)
      query = query.order('year', { ascending: false })
      if (dated) query = query.order('work_date', { ascending: false, nullsFirst: false })
      return query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)
    }
    let { data, error, count } = await build(true)
    // 작품 날짜 열이 아직 없으면(마이그레이션 전) 연도·등록일 순으로
    if (error && /work_date/.test(error.message)) ({ data, error, count } = await build(false))

    if (error) {
      console.error('[getShowcaseWorksPage]', error.message)
      return { items: [], hasMore: false, total: 0 }
    }

    const total = count ?? 0
    const items = applyLocaleList((data ?? []) as WorkListItem[], ['title', 'description'], locale)
    return { items, hasMore: offset + items.length < total, total }
  } catch (err) {
    console.error('[getShowcaseWorksPage] unexpected:', err)
    return { items: [], hasMore: false, total: 0 }
  }
}

/** 단일 작품 조회 — 모든 컬럼 포함 (캐시 5분) */
export async function getWorkById(id: string, locale: string = 'ko'): Promise<WorkItem | null> {
  const fetcher = unstable_cache(
    async (): Promise<WorkItem | null> => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('showcase_works')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.error('[getWorkById]', error.message)
          return null
        }
        return data as WorkItem
      } catch (err) {
        console.error('[getWorkById] unexpected:', err)
        return null
      }
    },
    [`work-by-id-${id}`],
    { revalidate: 300, tags: ['works'] }
  )

  const item = await fetcher()
  if (!item) return null
  return applyLocale(item, ['title', 'description'], locale)
}

/**
 * 관련 작품 조회 — 현재 작품과 tech_stack/type 겹침 우선, 부족하면 최신으로 채움
 * (상세 페이지 하단 "관련 게시물" 마소너리용)
 */
export async function getRelatedWorks(
  id: string,
  locale: string = 'ko',
  limit = 8
): Promise<WorkListItem[]> {
  const [all, current] = await Promise.all([
    getShowcaseWorks(locale),
    getWorkById(id, locale),
  ])
  const pool = all.filter((w) => w.id !== id)
  if (!current) return pool.slice(0, limit)

  const curTags = new Set(current.tech_stack ?? [])
  const scored = pool
    .map((w) => {
      const tagOverlap = (w.tech_stack ?? []).filter((t) => curTags.has(t)).length
      const typeMatch = w.type === current.type ? 1 : 0
      return { w, score: tagOverlap * 2 + typeMatch }
    })
    // 점수 내림차순, 동점이면 기존 정렬(연도·조회수) 유지
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map((s) => s.w)
}

/* ── 제작자 · 학생(포트폴리오) 연동 ───────────────────────────
 * 제작자는 여러 명일 수 있다. 관리자 작품 입력에서 학생 DB(students)를 검색해 고르면
 * showcase_works.creators 에 student_id 가 저장되고, 그 학생에게 포트폴리오(slug)가 있으면
 * 작품 상세의 이름이 /portfolio/[slug] 로 연결된다.
 * creators 가 없는 예전 작품은 author("A, B")를 나눠 이름만 보여준다.
 */

export interface WorkCreator {
  name: string
  /** 공개 포트폴리오 주소용 slug — 관리자 작품 입력에서 학생 DB 로 고른 제작자가 포트폴리오를 올렸을 때 */
  studentSlug: string | null
}

/**
 * 작품 제작자 + 졸업생 상세 연결
 * 학생 DB(students)는 학번이 있어 관리자만 읽으므로, 공개 함수 get_graduates·portfolios 로 만든 졸업생 주소로 잇는다.
 */
export async function getWorkCreators(work: Pick<WorkListItem, 'author' | 'creators'>): Promise<WorkCreator[]> {
  const refs = creatorRefs(work)
  const slugs = await getStudentSlugs(refs.map((r) => r.student_id).filter((v): v is string => !!v))
  return refs.map((r) => ({ name: r.name, studentSlug: (r.student_id && slugs.get(r.student_id)) || null }))
}

/** 두 작품이 같은 제작자를 공유하는지 — 학생 DB 연결이 있으면 그것으로, 없으면 이름으로 */
function shareCreator(a: WorkCreatorRef[], b: WorkCreatorRef[]): boolean {
  return a.some((x) =>
    b.some((y) => (x.student_id && y.student_id ? x.student_id === y.student_id : x.name === y.name))
  )
}

/** 상세 페이지 하단 "다른 작품" 후보 한 개 — 실제로 몇 개를 고를지는 화면(MoreWorks)에서 방문자마다 정한다 */
export interface MoreWorkCandidate {
  work: WorkListItem
  /** 지금 작품과 제작자가 겹침 */
  sameCreator: boolean
  /** 제작자 이름 키 — 추천 안에서 같은 사람 작품이 겹치지 않게 */
  creators: string[]
  /** 지금 작품과 분야·유형이 비슷한 정도 (0~) — 뽑힐 확률을 조금 올린다 */
  score: number
}

const creatorKey = (name: string) => name.normalize('NFC').replace(/\s+/g, '').toLowerCase()

/**
 * 상세 페이지 하단 "다른 작품" 후보 — 같은 제작자 작품(최대 12) + 분야·유형이 비슷한 순으로 다른 작품(최대 poolSize).
 * 같은 제작자 작품은 하나만, 나머지는 제작자가 겹치지 않게 랜덤으로, 이미 본 작품은 덜 나오게 — 고르는 건 MoreWorks.
 */
export async function getMoreWorks(id: string, locale: string = 'ko', poolSize = 30): Promise<MoreWorkCandidate[]> {
  const [all, current] = await Promise.all([getShowcaseWorks(locale), getWorkById(id, locale)])
  const mine = current ? creatorRefs(current) : []
  const curTags = new Set(current?.tech_stack ?? [])
  const cands = all
    .filter((w) => w.id !== id)
    .map((w) => {
      const refs = creatorRefs(w)
      const overlap = (w.tech_stack ?? []).filter((t) => curTags.has(t)).length
      return {
        // 카드에 안 쓰는 긴 설명은 빼고 넘긴다 (화면으로 가는 데이터 줄이기)
        work: { ...w, description: null, description_en: null },
        sameCreator: current ? shareCreator(mine, refs) : false,
        creators: [...new Set(refs.map((r) => creatorKey(r.name)))],
        score: current ? overlap * 2 + (w.type === current.type ? 1 : 0) : 0,
      }
    })
  const same = cands.filter((c) => c.sameCreator).slice(0, 12)
  const others = cands
    .filter((c) => !c.sameCreator)
    .sort((a, b) => b.score - a.score)
    .slice(0, poolSize)
  return [...same, ...others]
}

/** 기존 하드코딩 필터값 — settings에 데이터 없을 때 fallback (마이그레이션 보호) */
export const DEFAULT_WORK_FILTER_TAGS = ['Video', 'Graphic', 'Web', 'Motion', 'Photo', 'AI']

/** 쇼케이스 필터 태그 목록 (settings 테이블 — 캐시 1분, 없으면 기본값 반환) */
export async function getWorkFilterTags(): Promise<string[]> {
  const fetcher = unstable_cache(
    async (): Promise<string[]> => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'work_filter_tags')
          .maybeSingle()
        const val = data?.value
        if (Array.isArray(val) && (val as string[]).length > 0) return val as string[]
        // settings에 데이터 없으면 기존 하드코딩 값 반환 (마이그레이션 fallback)
        return DEFAULT_WORK_FILTER_TAGS
      } catch {
        return DEFAULT_WORK_FILTER_TAGS
      }
    },
    ['work-filter-tags'],
    { revalidate: 60, tags: ['work-filter-tags'] }
  )
  return fetcher()
}
