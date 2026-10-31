import type { FacultyData } from '@/lib/faculty-data'

export interface RoleLabels {
  professor: string
  assistant: string
  chair: string
  adjunct: string
}

/** 직급 표시 — '교수 · 학과장', '겸임교수', '조교' (영문은 messages 의 about.faculty.roles) */
export function facultyRole(f: FacultyData, r: RoleLabels): string {
  if (f.roleLabel === '겸임교수') return r.adjunct
  const base = f.role === '조교' ? r.assistant : r.professor
  if (f.roleLabel === '학과장') return `${base} · ${r.chair}`
  return f.roleLabel ? `${base} · ${f.roleLabel}` : base
}
