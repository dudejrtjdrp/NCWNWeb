/**
 * CurriculumContent — 교육과정 (E4)
 * 학년마다 한 섹션, 그 안을 학기로 나누고 과목을 한 줄씩(이수 구분 · 과목·학점 · 내용).
 * 학년 제목 오른쪽에 과목 수와 학점 합계를 데이터에서 계산해 보여준다.
 */

import { useTranslations } from 'next-intl'
import { CURRICULUM_DATA, type GradeData } from '@/lib/curriculum-data'
import { AboutMoreLinks } from '@/components/sections/about/Editorial'

type CategoryKey = 'required' | 'majorRequired' | 'majorElective'

const CATEGORY_KEY: Record<string, CategoryKey> = {
  교양필수: 'required',
  전공필수: 'majorRequired',
  전공선택: 'majorElective',
}

const SEMESTERS = [
  { label: '1학기', key: 'semester1' },
  { label: '2학기', key: 'semester2' },
] as const

interface Row {
  category: CategoryKey
  title: string
  credit: number
  theory?: number
  practice?: number
  description?: string
}

/** '웹프로그래밍기초 (3학점 / 이론1 실기2)' → 과목명 + 학점·이론·실기 */
function parseCourse(name: string) {
  const m = name.match(/^(.*)\(\s*([^()]*학점[^()]*)\)\s*$/)
  const title = (m ? m[1] : name).trim()
  const meta = m ? m[2] : ''
  const num = (re: RegExp) => {
    const hit = meta.match(re)
    return hit ? Number(hit[1]) : undefined
  }
  return { title, credit: num(/(\d+)\s*학점/) ?? 0, theory: num(/이론\s*(\d+)/), practice: num(/실기\s*(\d+)/) }
}

function rowsFor(grade: GradeData, semester: string): Row[] {
  const rows: Row[] = []
  for (const category of grade.categories) {
    const key = CATEGORY_KEY[category.title] ?? 'majorElective'
    for (const sem of category.semesters) {
      if (sem.label !== semester) continue
      for (const course of sem.courses) rows.push({ category: key, ...parseCourse(course.name), description: course.description })
    }
  }
  return rows
}

export const CURRICULUM_SECTIONS = CURRICULUM_DATA.map((g) => ({ id: `grade-${g.grade}`, grade: g.grade }))

export default function CurriculumContent() {
  const t = useTranslations('about.curriculum')

  const creditText = (row: Row) =>
    [
      t('credit', { n: row.credit }),
      row.theory !== undefined ? t('theory', { n: row.theory }) : null,
      row.practice !== undefined ? t('practice', { n: row.practice }) : null,
    ]
      .filter(Boolean)
      .join(' · ')

  return (
    <div className="editorial-container">
      <p className="max-w-3xl pt-chapter text-intro">{t('intro')}</p>

      {CURRICULUM_DATA.map((grade) => {
        const semesters = SEMESTERS.map((s) => ({ ...s, rows: rowsFor(grade, s.label) })).filter((s) => s.rows.length)
        const all = semesters.flatMap((s) => s.rows)
        const credits = all.reduce((sum, r) => sum + r.credit, 0)
        const id = `grade-${grade.grade}`

        return (
          <section key={id} id={id} aria-labelledby={`${id}-title`} className="scroll-mt-36 pt-chapter">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <h2 id={`${id}-title`} className="m-0 font-extrabold text-headline">
                {t('grade', { grade: grade.grade })}
              </h2>
              <p className="font-semibold tabular-nums text-body-sm">{t('gradeSummary', { courses: all.length, credits })}</p>
            </div>

            {semesters.map((sem) => (
              <div key={sem.key} className="mb-10 last:mb-0">
                <h3 className="m-0 border-t border-nwcn-dark py-3.5 font-bold text-section">{t(sem.key)}</h3>
                <div aria-hidden="true" className="hidden grid-cols-12 gap-x-6 border-t border-nwcn-rule py-2 text-caption text-nwcn-neutral-600 lg:grid">
                  <span className="col-span-2">{t('headers.category')}</span>
                  <span className="col-span-4">{t('headers.course')}</span>
                  <span className="col-span-6">{t('headers.description')}</span>
                </div>
                <ul className="border-b border-nwcn-dark">
                  {sem.rows.map((row) => (
                    <li key={`${row.category}-${row.title}`} className="grid grid-cols-12 gap-x-6 gap-y-1 border-t border-nwcn-rule py-4">
                      <span className="col-span-12 text-body-sm text-nwcn-neutral-600 lg:col-span-2">{t(row.category)}</span>
                      <span className="col-span-12 flex flex-col lg:col-span-4">
                        <strong className="font-bold text-list">{row.title}</strong>
                        <span className="text-body-sm tabular-nums text-nwcn-neutral-600">{creditText(row)}</span>
                      </span>
                      {row.description && (
                        <p className="col-span-12 mt-2 text-body text-nwcn-neutral-700 lg:col-span-6 lg:mt-0">{row.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )
      })}

      <AboutMoreLinks current="curriculum" />
    </div>
  )
}
