import SubPageLayout from '@/components/layout/SubPageLayout'
import PageHeader from '@/components/common/PageHeader'

const GOALS = [
  { title: '교육목표', content: '방송·영상·디지털미디어 분야의 창의적 전문 인력 양성' },
  { title: '교육방침', content: '이론과 실습을 결합한 현장 중심 교육, 융복합 콘텐츠 제작 역량 강화' },
  { title: '진로', content: '방송국, 영상 제작사, 디지털 미디어 기업, 광고대행사, 1인 미디어 크리에이터' },
]

const CERTIFICATIONS = [
  '컴퓨터그래픽스운용기능사', '방송통신기능사', '멀티미디어콘텐츠제작전문가',
  '영상편집기능사', '웹디자인기능사', 'ACA (Adobe Certified Associate)',
]

export default function DepartmentPage() {
  return (
    <SubPageLayout>
      <PageHeader
        category="ABOUT — DEPARTMENT"
        title="학과 소개"
        description="뉴미디어콘텐츠과의 교육 목표와 방향을 소개합니다."
      />
      <section className="py-12">
        <div className="page-container space-y-16">
          {/* 교육 목표·방침·진로 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GOALS.map((item) => (
              <div key={item.title} className="card-base p-8">
                <p className="font-body text-xs font-semibold tracking-widest text-nwcn-green mb-4">
                  {item.title}
                </p>
                <p className="font-body text-white/70 leading-relaxed text-sm">
                  {item.content}
                </p>
              </div>
            ))}
          </div>

          {/* 취득 가능 자격증 */}
          <div>
            <h2 className="font-brand text-display-md text-white mb-8">취득 가능 자격증</h2>
            <div className="flex flex-wrap gap-3">
              {CERTIFICATIONS.map((cert) => (
                <span
                  key={cert}
                  className="px-4 py-2.5 bg-nwcn-dark-3 border border-white/10 rounded-full font-body text-sm text-white/70 hover:border-nwcn-green/30 hover:text-white transition-all duration-200"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SubPageLayout>
  )
}
