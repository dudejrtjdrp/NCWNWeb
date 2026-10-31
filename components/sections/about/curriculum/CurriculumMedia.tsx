/**
 * CurriculumMedia — 교육과정 히어로 오른쪽 판 (수업 사진을 받기 전까지 쓰는 글자 판)
 * 어두운 판 아래쪽에 1·2·3학년 전공 과목 이름을 세 단으로 깐다. 위쪽은 영문 제목이 넘어오는 자리라 비워 둔다.
 * 과목은 lib/curriculum-data.ts 에서 전공필수·전공선택만 뽑아 쓴다(괄호 속 학점 표기는 뺌).
 */

import { useTranslations } from 'next-intl'
import { CURRICULUM_DATA } from '@/lib/curriculum-data'

const courseTitle = (name: string) => name.replace(/\s*\([^()]*학점[^()]*\)\s*$/, '').trim()

export default function CurriculumMedia() {
  const t = useTranslations('about.curriculum')
  const grades = CURRICULUM_DATA.map((g) => ({
    grade: g.grade,
    courses: [
      ...new Set(
        g.categories
          .filter((c) => c.title !== '교양필수')
          .flatMap((c) => c.semesters.flatMap((s) => s.courses.map((co) => courseTitle(co.name))))
      ),
    ],
  }))
  const total = grades.reduce((n, g) => n + g.courses.length, 0)

  return (
    <div className="relative flex h-full min-h-[360px] flex-col justify-end px-5 pb-12 pt-10 sm:px-8 lg:pl-[18%]">
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-3">
        {grades.map((g) => (
          <div key={g.grade} className="min-w-0">
            <p className="m-0 border-b border-white/50 pb-1.5 font-bold text-body-sm">{t('grade', { grade: g.grade })}</p>
            <ul className="mt-2 flex flex-col gap-1 text-[13px] leading-snug text-white/75 lg:text-body-sm">
              {g.courses.map((c) => (
                <li key={c} className="truncate">{c}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="absolute inset-x-0 bottom-0 m-0 truncate py-1.5 pl-4 text-body-sm sm:pl-5">{t('mediaCaption', { n: total })}</p>
    </div>
  )
}
