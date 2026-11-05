/**
 * 졸업생 포트폴리오 쿼리 (캐시 5분, tag: 'portfolios')
 * - 공개된(is_published) 것만 읽는다. 표가 아직 없으면(마이그레이션 전) 빈 목록.
 * - locale='en' 이면 name·tagline·bio 와 프로젝트 제목·설명을 영문 값으로 (비어 있으면 한국어 그대로)
 * - 조회가 실패하면 캐시 안에서 에러를 던져 빈 결과가 캐시에 남지 않게 한다.
 */

import { createDbClient as createClient } from '@/lib/supabase/db'
import { unstable_cache } from 'next/cache'
import { applyLocale } from './_locale'
import type { WorkListItem } from './works'
import { nameSlug } from '@/lib/romanize'

/** 프로젝트 팀원 — 졸업생 DB 이름과 한 명만 같으면 등록 스크립트가 student_id 로 잇는다 */
export interface PortfolioTeamMember {
  name: string
  student_id: string | null
}

export interface PortfolioProject {
  team?: PortfolioTeamMember[]
  title: string
  titleEn?: string
  year?: string
  fields: string[]
  format?: string
  role?: string
  tools: string[]
  summary?: string
  description?: string
  descriptionEn?: string
  points: string[]
  outcome?: string
  video?: string
  /** 프로젝트 관련 사이트 (여러 개) — 제출 양식 '관련 링크' */
  links?: { label: string; url: string }[]
  images: string[]
  cover?: string | null
}

export interface PortfolioHistory {
  awards?: string[]
  exhibitions?: string[]
  experience?: string[]
}

export interface PortfolioItem {
  id: string
  student_id: string | null
  slug: string
  year: number
  name: string
  name_en: string | null
  fields: string[]
  tagline: string | null
  tagline_en: string | null
  bio: string | null
  bio_en: string | null
  interests: string[]
  tools: string[]
  email: string | null
  website: string | null
  instagram: string | null
  other_links: string[]
  profile_url: string | null
  cover_url: string | null
  pages: string[]
  pdf_url: string | null
  projects: PortfolioProject[]
  history: PortfolioHistory
  sort_order: number
  created_at: string
}

export type PortfolioListItem = Pick<
  PortfolioItem,
  'id' | 'student_id' | 'slug' | 'year' | 'name' | 'name_en' | 'fields' | 'tagline' | 'tagline_en' | 'profile_url' | 'cover_url' | 'sort_order'
>

const LIST_COLUMNS = 'id, student_id, slug, year, name, name_en, fields, tagline, tagline_en, profile_url, cover_url, sort_order'

const isMissingTable = (msg: string) => /portfolios/.test(msg) && /(does not exist|schema cache|Could not find)/i.test(msg)

/** 공개된 포트폴리오 목록 — 졸업 연도 최신순 → 정렬 순서 → 이름 */
export async function getPortfolios(locale: string = 'ko'): Promise<PortfolioListItem[]> {
  const fetcher = unstable_cache(
    async (): Promise<PortfolioListItem[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('portfolios')
        .select(LIST_COLUMNS)
        .eq('is_published', true)
        .order('year', { ascending: false })
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })
      if (error) {
        if (isMissingTable(error.message)) return []
        throw new Error(error.message)
      }
      return (data ?? []) as unknown as PortfolioListItem[]
    },
    ['portfolios-list'],
    { revalidate: 300, tags: ['portfolios'] }
  )
  try {
    const items = await fetcher()
    return items.map((p) => applyLocale(p, ['name', 'tagline'], locale))
  } catch (err) {
    console.error('[getPortfolios]', err)
    return []
  }
}

function localizeProject(p: PortfolioProject, locale: string): PortfolioProject {
  if (locale === 'ko') return p
  return { ...p, title: p.titleEn?.trim() || p.title, description: p.descriptionEn?.trim() || p.description }
}

/** 포트폴리오 한 명 (slug) */
export async function getPortfolioBySlug(slug: string, locale: string = 'ko'): Promise<PortfolioItem | null> {
  const fetcher = unstable_cache(
    async (): Promise<PortfolioItem | null> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle()
      if (error) {
        if (isMissingTable(error.message)) return null
        throw new Error(error.message)
      }
      return (data as PortfolioItem | null) ?? null
    },
    ['portfolio-by-slug', slug],
    { revalidate: 300, tags: ['portfolios'] }
  )
  try {
    const item = await fetcher()
    if (!item) return null
    const p = applyLocale(item, ['name', 'tagline', 'bio'], locale)
    return {
      ...p,
      projects: (p.projects ?? []).map((pr) => localizeProject(pr, locale)),
      history: p.history ?? {},
    }
  } catch (err) {
    console.error('[getPortfolioBySlug]', err)
    return null
  }
}

/** 이 학생이 제작자로 연결된 쇼케이스 작품 (관리자 작품 입력에서 학생 DB 로 고른 경우)
 *  이 학생 포트폴리오에서 만든 작품(portfolio_ref 가 'ownSlug#…')은 프로젝트로 이미 보이므로 뺀다.
 *  팀원 포트폴리오에서 만들어져 이 학생이 제작자로 이어진 작품은 그대로 보여 준다. */
export async function getPortfolioWorks(studentId: string | null, locale: string = 'ko', ownSlug?: string): Promise<WorkListItem[]> {
  if (!studentId) return []
  const fetcher = unstable_cache(
    async (): Promise<WorkListItem[]> => {
      const supabase = createClient()
      const cols = 'id, title, title_en, author, creators, year, description, description_en, type, tech_stack, thumbnail_url, video_embed, model_embed, view_count, created_at'
      const run = (select: string) =>
        supabase
          .from('showcase_works')
          .select(select)
          .filter('creators', 'cs', JSON.stringify([{ student_id: studentId }]))
          .order('year', { ascending: false })
      let { data, error } = await run(`${cols}, portfolio_ref`)
      // portfolio_ref 열이 아직 없으면(add_portfolio_showcase.sql 전) 빼고 다시
      if (error && /portfolio_ref/.test(error.message)) ({ data, error } = await run(cols))
      if (error) {
        if (/creators/.test(error.message)) return []
        throw new Error(error.message)
      }
      const rows = (data ?? []) as unknown as (WorkListItem & { portfolio_ref?: string | null })[]
      return rows.filter((w) => !(ownSlug && w.portfolio_ref?.startsWith(`${ownSlug}#`)))
    },
    ['portfolio-works', studentId, ownSlug ?? ''],
    { revalidate: 300, tags: ['portfolios', 'works'] }
  )
  try {
    const items = await fetcher()
    return items.map((w) => applyLocale(w, ['title', 'description'], locale))
  } catch (err) {
    console.error('[getPortfolioWorks]', err)
    return []
  }
}

/* ── 졸업생 목록 (WORK > 졸업생) ─────────────────────────────
 * 명단(students, 학번 제외 공개 함수 get_graduates) + 공개 포트폴리오를 합친다.
 * 모든 졸업생 카드가 상세(/work/portfolio/[slug])로 이어진다:
 *   포트폴리오가 공개됐으면 그 주소, 아니면 이름 로마자로 만든 주소(예: 2027-lee-seonghyo — 사진·이름·연결된 작품만).
 * 명단에 없는 포트폴리오(학생 연결 전)도 그대로 보여 준다.
 */

export interface GraduateCard {
  key: string
  /** 학생 DB id (명단에 없는 포트폴리오면 null) */
  studentId: string | null
  name: string
  nameEn: string | null
  year: number
  photo: string | null
  cover: string | null
  /** 상세 주소 /work/portfolio/[slug] */
  slug: string
  /** 공개된 포트폴리오가 있는지 */
  hasPortfolio: boolean
  fields: string[]
  tagline: string | null
  sort: number
}

interface GraduateRow {
  id: string
  name: string
  name_en: string | null
  graduation_year: number
  photo_url: string | null
}

const isMissingGraduates = (msg: string) => /get_graduates|photo_url/.test(msg) && /(does not exist|schema cache|Could not find)/i.test(msg)

/** 포트폴리오 → 졸업생 카드 */
export function toGraduateCard(p: PortfolioListItem): GraduateCard {
  return {
    key: p.id,
    studentId: p.student_id,
    name: p.name,
    nameEn: p.name_en,
    year: p.year,
    photo: p.profile_url,
    cover: p.cover_url,
    slug: p.slug,
    hasPortfolio: true,
    fields: p.fields ?? [],
    tagline: p.tagline,
    sort: p.sort_order ?? 0,
  }
}

async function getGraduateRows(): Promise<GraduateRow[]> {
  const fetcher = unstable_cache(
    async (): Promise<GraduateRow[]> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('get_graduates')
      if (error) {
        if (isMissingGraduates(error.message)) return []
        throw new Error(error.message)
      }
      return (data ?? []) as GraduateRow[]
    },
    ['graduates-list'],
    { revalidate: 300, tags: ['portfolios'] }
  )
  try {
    return await fetcher()
  } catch (err) {
    console.error('[getGraduates]', err)
    return []
  }
}

/** 졸업생 목록 — 졸업 연도 최신순 → 이름 가나다순 (포트폴리오를 올렸는지와 상관없이 자리 고정) */
export async function getGraduates(locale: string = 'ko'): Promise<GraduateCard[]> {
  const [rows, portfolios] = await Promise.all([getGraduateRows(), getPortfolios(locale)])
  const byStudent = new Map(portfolios.filter((p) => p.student_id).map((p) => [p.student_id as string, p]))
  const listed = new Set<string>()
  const cards: GraduateCard[] = rows.map((g) => {
    const p = byStudent.get(g.id)
    if (p) {
      listed.add(p.id)
      return { ...toGraduateCard(p), key: g.id, studentId: g.id, photo: p.profile_url ?? g.photo_url }
    }
    return {
      key: g.id,
      studentId: g.id,
      name: locale !== 'ko' && g.name_en?.trim() ? g.name_en : g.name,
      nameEn: g.name_en,
      year: g.graduation_year,
      photo: g.photo_url,
      cover: null,
      slug: `${g.graduation_year}-${nameSlug(g.name, g.name_en) || g.id.slice(0, 8)}`,
      hasPortfolio: false,
      fields: [],
      tagline: null,
      sort: Number.MAX_SAFE_INTEGER,
    }
  })
  for (const p of portfolios) if (!listed.has(p.id)) cards.push(toGraduateCard(p))

  // 같은 해 같은 이름(또는 남의 포트폴리오 주소와 겹침)이면 포트폴리오 없는 쪽 주소 뒤에 id 앞 네 글자
  const used = new Map<string, number>()
  for (const c of cards) used.set(c.slug, (used.get(c.slug) ?? 0) + 1)
  for (const c of cards) if (!c.hasPortfolio && (used.get(c.slug) ?? 0) > 1 && c.studentId) c.slug = `${c.slug}-${c.studentId.slice(0, 4)}`

  return cards.sort((a, b) => b.year - a.year || a.name.localeCompare(b.name, 'ko'))
}

/** 상세 주소로 졸업생 찾기 (포트폴리오가 없는 졸업생 상세용) */
export async function getGraduateBySlug(slug: string, locale: string = 'ko'): Promise<GraduateCard | null> {
  const cards = await getGraduates(locale)
  return cards.find((c) => c.slug === slug) ?? null
}

/** 상세 아래 '다른 졸업생' — 목록에서 이 사람 다음 사람부터 n명 (끝나면 처음으로) */
export function otherGraduates(cards: GraduateCard[], slug: string, n = 4): GraduateCard[] {
  const i = cards.findIndex((c) => c.slug === slug)
  const rest = i < 0 ? cards : [...cards.slice(i + 1), ...cards.slice(0, i)]
  return rest.slice(0, n)
}

/** 학생 id → 졸업생 상세 주소 (작품 제작자 이름 링크용) */
export async function getStudentSlugs(studentIds: string[]): Promise<Map<string, string>> {
  const want = new Set(studentIds.filter(Boolean))
  if (want.size === 0) return new Map()
  const cards = await getGraduates()
  return new Map(cards.filter((c) => c.studentId && want.has(c.studentId)).map((c) => [c.studentId as string, c.slug]))
}

export interface PortfolioThumb {
  src: string
  name: string
  year: number
  title: string | null
}

/** 졸업생 페이지 히어로 — 공개 포트폴리오에 들어간 프로젝트 썸네일(없으면 원본 표지) */
export async function getPortfolioThumbs(locale: string = 'ko'): Promise<PortfolioThumb[]> {
  const fetcher = unstable_cache(
    async (): Promise<PortfolioThumb[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('portfolios')
        .select('name, name_en, year, cover_url, projects, sort_order')
        .eq('is_published', true)
        .order('year', { ascending: false })
        .order('sort_order', { ascending: true })
      if (error) {
        if (isMissingTable(error.message)) return []
        throw new Error(error.message)
      }
      const rows = (data ?? []) as Pick<PortfolioItem, 'name' | 'name_en' | 'year' | 'cover_url' | 'projects'>[]
      const out: PortfolioThumb[] = []
      for (const r of rows) {
        const name = locale !== 'ko' && r.name_en?.trim() ? r.name_en : r.name
        const projects = (r.projects ?? []).filter((pr) => pr.cover || pr.images?.[0])
        for (const pr of projects) {
          const title = locale !== 'ko' && pr.titleEn?.trim() ? pr.titleEn : pr.title
          out.push({ src: (pr.cover || pr.images[0]) as string, name, year: r.year, title })
        }
        if (!projects.length && r.cover_url) out.push({ src: r.cover_url, name, year: r.year, title: null })
      }
      return out
    },
    ['portfolio-thumbs', locale],
    { revalidate: 300, tags: ['portfolios'] }
  )
  try {
    return await fetcher()
  } catch (err) {
    console.error('[getPortfolioThumbs]', err)
    return []
  }
}
