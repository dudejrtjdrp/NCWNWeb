/** 졸업생 포트폴리오 공용 값 — 서버·클라이언트 어디서나 import 가능 ('use client' 파일의 값은 서버에서 못 부름) */

/** 양식의 분야 목록 순서 (docs/portfolio/NWCN_졸업생포트폴리오_양식.txt) */
export const PORTFOLIO_FIELDS = ['영상', '모션', '그래픽', '웹', 'UX/UI', '사진', '3D', 'XR', '게임', 'AI', '사운드', '인터랙티브', '기획']

/** 졸업 연도 묶음의 목차 앵커 */
export const portfolioYearAnchor = (year: number) => `y${year}`

/** 분야 이름 — 영문 페이지에서는 영문으로 (쇼케이스 필터 태그와 같은 말) */
const FIELD_EN: Record<string, string> = {
  영상: 'Video', 모션: 'Motion', 그래픽: 'Graphic', 웹: 'Web', 'UX/UI': 'UX/UI', 사진: 'Photo', '3D': '3D', XR: 'XR',
  게임: 'Game', AI: 'AI', 사운드: 'Sound', 인터랙티브: 'Interactive', 기획: 'Planning',
}
export const fieldLabel = (f: string, locale: string) => (locale === 'ko' ? f : FIELD_EN[f] ?? f)

/** 프로젝트 형태 — 영문 페이지: '개인' → Solo, '팀 5명' → Team of 5, '팀 (…)' → Team */
export function formatLabel(v: string | undefined, locale: string): string | undefined {
  if (!v || locale === 'ko') return v
  if (/^개인/.test(v)) return 'Solo'
  const m = v.match(/^팀\s*(\d+)\s*명/)
  if (m) return `Team of ${m[1]}`
  if (/^팀/.test(v)) return 'Team'
  return v
}

/** 관련 링크 이름 — 영문 페이지에서 자주 쓰는 한글 이름만 영어로 */
const LINK_LABEL_EN: Record<string, string> = {
  사이트: 'Website', 웹사이트: 'Website', 홈페이지: 'Website', 서비스: 'Service', 깃허브: 'GitHub', 노션: 'Notion',
  앱스토어: 'App Store', 플레이스토어: 'Google Play', 구글플레이: 'Google Play', 랜딩: 'Landing page', 데모: 'Demo',
  발표자료: 'Slides', 기사: 'Article', 영상: 'Video', 비핸스: 'Behance',
}
export const linkLabel = (label: string, locale: string) => (locale === 'ko' ? label : LINK_LABEL_EN[label.replace(/\s+/g, '')] ?? label)

/** 이력 한 줄 '2026.03–2026.06 · 내용' → 날짜·내용 (날짜가 없으면 date=null). sortKey 는 앞 날짜(연·월) — 최신순 정렬용 */
export function splitDated(s: string): { date: string | null; text: string; sortKey: number } {
  const m = s.match(/^\s*((?:19|20)\d{2}(?:\.\d{1,2})?(?:\s*[–~-]\s*(?:(?:19|20)\d{2}(?:\.\d{1,2})?)?)?)\s*(?:[·:|]|-(?=\s))?\s*(.+)$/)
  if (!m) return { date: null, text: s.trim(), sortKey: 0 }
  const [y, mo] = m[1].split(/[–~-]/)[0].trim().split('.')
  return { date: m[1].replace(/\s*([–~-])\s*/, '–').trim(), text: m[2].trim(), sortKey: Number(y) * 100 + (Number(mo) || 0) }
}

/** 연락처 링크 — 상단 바로가기와 '연락' 칸이 함께 쓴다 */
export interface ContactLink {
  kind: 'email' | 'website' | 'instagram' | 'link'
  href: string
  /** 전체 표기 (연락 칸) */
  text: string
  /** 짧은 표기 (상단 바로가기) — 이메일 주소, @아이디, GitHub 같은 서비스 이름 */
  short: string
}
const LINK_NAME: [RegExp, string][] = [
  [/github\.com/, 'GitHub'], [/behance\.net/, 'Behance'], [/notion\.(site|so)/, 'Notion'], [/linkedin\.com/, 'LinkedIn'],
  [/youtube\.com|youtu\.be/, 'YouTube'], [/vimeo\.com/, 'Vimeo'], [/dribbble\.com/, 'Dribbble'], [/artstation\.com/, 'ArtStation'],
  [/velog\.io/, 'velog'], [/tistory\.com/, 'Tistory'], [/blog\.naver\.com/, 'Blog'],
]
const isHttp = (u?: string | null): u is string => !!u && /^https?:\/\//.test(u)
const bare = (u: string) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
export function contactLinks(item: { email: string | null; website: string | null; instagram: string | null; other_links: string[] }): ContactLink[] {
  const out: ContactLink[] = []
  if (item.email) out.push({ kind: 'email', href: `mailto:${item.email}`, text: item.email, short: item.email })
  if (isHttp(item.website)) out.push({ kind: 'website', href: item.website, text: bare(item.website), short: bare(item.website).split('/')[0] })
  if (item.instagram) {
    const ig: string = item.instagram
    const href = /^https?:\/\//.test(ig) ? ig : `https://instagram.com/${ig.replace(/^@/, '')}`
    const handle = `@${href.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/[/?].*$/, '')}`
    out.push({ kind: 'instagram', href, text: handle, short: handle })
  }
  for (const u of item.other_links.filter(isHttp)) {
    const host = bare(u).split('/')[0]
    out.push({ kind: 'link', href: u, text: bare(u), short: LINK_NAME.find(([re]) => re.test(host))?.[1] ?? host })
  }
  return out
}
