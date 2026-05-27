/**
 * 동적 sitemap — Next.js App Router
 * 정적 페이지 + Supabase에서 동적 콘텐츠 URL을 포함합니다.
 *
 * 빌드 시 /sitemap.xml 로 서빙됩니다.
 */

import type { MetadataRoute } from 'next'
import { createDbClient } from '@/lib/supabase/db'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nwcn.kr'

/** Supabase에서 발행된 NCR 리포트 ID + 날짜 조회 */
async function getNcrIds(): Promise<{ id: string; updated_at: string }[]> {
  try {
    const supabase = createDbClient()
    const { data } = await supabase
      .from('ncr_reports')
      .select('id, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
    return (data ?? []).map((r) => ({ id: r.id, updated_at: r.created_at }))
  } catch {
    return []
  }
}

/** Supabase에서 쇼케이스 작품 ID 조회 */
async function getWorkIds(): Promise<{ id: string; updated_at: string }[]> {
  try {
    const supabase = createDbClient()
    const { data } = await supabase
      .from('showcase_works')
      .select('id, created_at')
      .order('created_at', { ascending: false })
    return (data ?? []).map((r) => ({ id: r.id, updated_at: r.created_at }))
  } catch {
    return []
  }
}

/** Supabase에서 수상 ID 조회 */
async function getAwardIds(): Promise<{ id: string; updated_at: string }[]> {
  try {
    const supabase = createDbClient()
    const { data } = await supabase
      .from('awards')
      .select('id, created_at')
      .order('created_at', { ascending: false })
    return (data ?? []).map((r) => ({ id: r.id, updated_at: r.created_at }))
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString()

  /** 정적 페이지 목록 */
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,                              lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/about/department`,        lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/about/faculty`,           lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/about/curriculum`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/about/lab`,               lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/ncr-trend/latest`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE_URL}/ncr-trend/archive`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE_URL}/ninc/project`,            lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE_URL}/ninc/awards`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE_URL}/ninc/event`,              lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/work/showcase`,           lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE_URL}/work/exhibition`,         lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/info/admission`,          lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/info/contact`,            lastModified: now, changeFrequency: 'yearly',  priority: 0.5 },
  ]

  const [ncrIds, workIds, awardIds] = await Promise.all([
    getNcrIds(),
    getWorkIds(),
    getAwardIds(),
  ])

  const ncrPages: MetadataRoute.Sitemap = ncrIds.map(({ id, updated_at }) => ({
    url: `${SITE_URL}/ncr-trend/${id}`,
    lastModified: updated_at,
    changeFrequency: 'monthly',
    priority: 0.85,
  }))

  const workPages: MetadataRoute.Sitemap = workIds.map(({ id, updated_at }) => ({
    url: `${SITE_URL}/work/${id}`,
    lastModified: updated_at,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const awardPages: MetadataRoute.Sitemap = awardIds.map(({ id, updated_at }) => ({
    url: `${SITE_URL}/ninc/awards/${id}`,
    lastModified: updated_at,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticPages, ...ncrPages, ...workPages, ...awardPages]
}
