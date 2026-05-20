// ── WORK ────────────────────────────────────────

export interface ShowcaseWork {
  id: string
  title: string
  author: string
  description: string | null
  thumbnail_url: string | null
  tech_stack: string[]
  view_count: number
  year: number
  created_at: string
}

export interface ArchiveExhibition {
  id: string
  year: number
  title: string
  poster_url: string | null
  description: string | null
}

// ── ABOUT ───────────────────────────────────────

export interface Faculty {
  id: string
  name: string
  title: string | null
  email: string | null
  photo_url: string | null
  education: string[]
  career: string[]
  sort_order: number
}

export interface CurriculumItem {
  id: string
  year: 1 | 2 | 3 | 4
  semester: 1 | 2
  course_name: string
  credits: number
  category: string
}

// ── NINC ────────────────────────────────────────

export interface Award {
  id: string
  year: number
  competition: string
  award_name: string
  winner: string | null
  team_members: string[]
  description: string | null
}

export interface Project {
  id: string
  title: string
  type: 'industry' | 'international'
  partner: string | null
  description: string | null
  year: number
  thumbnail_url: string | null
}

export interface Event {
  id: string
  title: string
  type: '특강' | '워크숍' | '캠퍼스투어' | '기타'
  start_date: string
  end_date: string | null
  location: string | null
  description: string | null
}

// ── NCR TREND ───────────────────────────────────

export type ReportType = 'editorial' | 'card_news' | 'trend'

export interface NcrReport {
  id: string
  title: string
  type: ReportType
  thumbnail_url: string | null
  external_url: string
  season: string | null
  published_at: string
}
