import SubPageLayout from '@/components/layout/SubPageLayout'
import PageHeader from '@/components/common/PageHeader'

const CURRICULUM = {
  1: {
    1: ['영상제작기초', '디지털포토그래피', '컴퓨터그래픽스기초', '미디어리터러시'],
    2: ['영상편집실습', '모션그래픽스기초', '웹디자인기초', '콘텐츠기획론'],
  },
  2: {
    1: ['영상촬영심화', '모션그래픽스심화', '웹&앱디자인', 'SNS콘텐츠제작'],
    2: ['방송영상제작', '브랜드콘텐츠제작', '미디어마케팅', '3D모델링기초'],
  },
}

export default function CurriculumPage() {
  return (
    <SubPageLayout>
      <PageHeader
        category="ABOUT — CURRICULUM"
        title="교육과정"
        description="학년별 이수 체계를 한눈에 확인하세요."
      />
      <section className="py-12">
        <div className="page-container space-y-10">
          {(Object.entries(CURRICULUM) as [string, Record<string, string[]>][]).map(([year, semesters]) => (
            <div key={year}>
              <h2 className="font-brand text-2xl text-nwcn-green mb-6">{year}학년</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(Object.entries(semesters) as [string, string[]][]).map(([sem, courses]) => (
                  <div key={sem} className="card-base p-6">
                    <p className="font-body text-xs font-semibold tracking-widest text-white/40 mb-4">
                      {sem}학기
                    </p>
                    <ul className="space-y-2">
                      {courses.map((course) => (
                        <li key={course} className="flex items-center gap-3 font-body text-sm text-white/70">
                          <span className="w-1.5 h-1.5 rounded-full bg-nwcn-green/60 flex-shrink-0" />
                          {course}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </SubPageLayout>
  )
}
