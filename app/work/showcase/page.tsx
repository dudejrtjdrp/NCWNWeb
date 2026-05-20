'use client'

import { useState } from 'react'
import PageHeader from '@/components/common/PageHeader'
import FilterBar from '@/components/common/FilterBar'
import ShowcaseGrid from '@/components/sections/ShowcaseGrid'

const TECH_FILTERS = ['전체', 'Video', 'Graphic', 'Web', 'Motion', 'Photo', 'AI']

export default function ShowcasePage() {
  const [activeFilter, setActiveFilter] = useState('전체')

  return (
    <>
      <PageHeader
        category="WORK — SHOWCASE"
        title="학생 작품 전시"
        description="뉴미디어콘텐츠과 재학생들의 포트폴리오를 만나보세요."
      />
      <section className="py-12">
        <div className="page-container">
          <FilterBar
            filters={TECH_FILTERS}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            className="mb-10"
          />
          <ShowcaseGrid activeFilter={activeFilter} />
        </div>
      </section>
    </>
  )
}
