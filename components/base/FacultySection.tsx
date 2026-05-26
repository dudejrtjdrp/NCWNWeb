'use client'

/**
 * BASE 컴포넌트: FacultySection
 * Figma node-id: 427:889 (ABOUT/Faculty/Desktop)
 */

import Image from 'next/image'
import FacultyCard from '@/components/base/FacultyCard'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'
import { FACULTY_LIST } from '@/lib/faculty-data'

const ASSETS = {
  arrowDown: '/images/common/arrow-down.svg',
}

function SectionArrow() {
  return (
    <div className="flex items-center justify-center w-[64px] h-[61px] mx-auto mb-4">
      <div className="rotate-180 relative w-[64px] h-[61px]" aria-hidden="true">
        <Image src={ASSETS.arrowDown} alt="" fill className="object-contain" unoptimized />
      </div>
    </div>
  )
}

export interface FacultySectionProps {
  className?: string
}

export default function FacultySection({ className }: FacultySectionProps) {
  const professors = FACULTY_LIST.filter((f) => f.role === '교수')
  const assistants = FACULTY_LIST.filter((f) => f.role === '조교')

  return (
    <div className={`bg-white overflow-hidden ${className ?? ''}`} data-node-id="427:889">

      {/* ── 교수진 섹션 ── */}
      <section
        className="flex flex-col items-center"
        style={{ paddingTop: '80px', paddingBottom: '80px' }}
        aria-labelledby="faculty-heading"
      >
        <AnimateOnScroll variant="fade-up" delay={0}>
          <SectionArrow />
          <h2
            id="faculty-heading"
            className="font-body font-bold text-[24px] text-[#444] text-center mb-[60px]"
            data-node-id="427:910"
          >
            교수진
          </h2>
        </AnimateOnScroll>

        <div className="page-container w-full">
          <div className="flex flex-wrap justify-center gap-[41px]">
            {professors.map((faculty, i) => (
              <AnimateOnScroll
                key={faculty.id}
                variant="fade-up"
                delay={Math.min(i * 80, 320)}
              >
                <FacultyCard
                  id={faculty.id}
                  nameEn={faculty.nameEn}
                  nameKo={faculty.nameKo}
                  role={faculty.role}
                  photoUrl={faculty.photoUrl}
                  colorVariant={faculty.colorVariant}
                />
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── 조교 섹션 ── */}
      <section
        className="flex flex-col items-center"
        style={{ paddingBottom: '120px' }}
        aria-labelledby="assistant-heading"
      >
        <AnimateOnScroll variant="fade-up" delay={0}>
          <SectionArrow />
          <h2
            id="assistant-heading"
            className="font-body font-bold text-[24px] text-[#444] text-center mb-[60px]"
            data-node-id="427:1250"
          >
            조교
          </h2>
        </AnimateOnScroll>

        <div className="flex justify-center">
          {assistants.map((ta, i) => (
            <AnimateOnScroll key={ta.id} variant="fade-up" delay={i * 80}>
              <FacultyCard
                id={ta.id}
                nameEn={ta.nameEn}
                nameKo={ta.nameKo}
                role={ta.role}
                photoUrl={ta.photoUrl}
                colorVariant={ta.colorVariant}
              />
            </AnimateOnScroll>
          ))}
        </div>
      </section>
    </div>
  )
}
