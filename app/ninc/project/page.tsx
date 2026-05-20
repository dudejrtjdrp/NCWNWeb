import SubPageLayout from '@/components/layout/SubPageLayout'
import PageHeader from '@/components/common/PageHeader'
import Badge from '@/components/ui/Badge'

const PROJECTS = [
  { id: '1', title: '○○ 기업 브랜드 영상 제작', type: 'industry' as const, partner: '○○ 주식회사', year: 2025, description: '산학협력을 통한 기업 홍보 영상 제작 프로젝트' },
  { id: '2', title: '해외 미디어아트 교류전', type: 'international' as const, partner: '일본 ○○대학교', year: 2024, description: '일본 자매결연 대학과의 공동 미디어아트 전시' },
  { id: '3', title: '지역 문화콘텐츠 제작 지원', type: 'industry' as const, partner: '○○ 시청', year: 2024, description: '지역 문화 홍보 콘텐츠 기획 및 제작' },
]

export default function ProjectPage() {
  return (
    <SubPageLayout>
      <PageHeader
        category="NINC — PROJECT"
        title="프로젝트"
        description="학과의 산학협력 및 해외교류 활동을 소개합니다."
      />
      <section className="py-12">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROJECTS.map((project) => (
              <div key={project.id} className="card-base p-8">
                <div className="flex items-start justify-between mb-4">
                  <Badge variant={project.type === 'industry' ? 'green' : 'yellow'}>
                    {project.type === 'industry' ? '산학협력' : '해외교류'}
                  </Badge>
                  <span className="font-body text-xs text-white/30">{project.year}</span>
                </div>
                <h3 className="font-body text-lg text-white font-semibold mb-2">{project.title}</h3>
                <p className="font-body text-sm text-nwcn-green/70 mb-3">{project.partner}</p>
                <p className="font-body text-sm text-white/40 leading-relaxed">{project.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SubPageLayout>
  )
}
