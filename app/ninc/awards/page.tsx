import SubPageLayout from '@/components/layout/SubPageLayout'
import PageHeader from '@/components/common/PageHeader'
import Badge from '@/components/ui/Badge'

const AWARDS_DATA = [
  { id: '1', year: 2025, competition: '대한민국 광고대상', award_name: '금상', winner: '홍길동', team_members: ['홍길동', '이영희'] },
  { id: '2', year: 2025, competition: 'K-콘텐츠 공모전', award_name: '최우수상', winner: '이영희', team_members: ['이영희'] },
  { id: '3', year: 2024, competition: '방송영상 콘텐츠 경진대회', award_name: '우수상', winner: '김민수', team_members: ['김민수', '박태양'] },
  { id: '4', year: 2024, competition: '전국 대학생 미디어 공모전', award_name: '장려상', winner: '최지우', team_members: ['최지우'] },
]

const years = [...new Set(AWARDS_DATA.map((a) => a.year))].sort((a, b) => b - a)

export default function AwardsPage() {
  return (
    <SubPageLayout>
      <PageHeader
        category="NINC — AWARDS"
        title="수상 성과"
        description="뉴미디어콘텐츠과 학생들의 수상 내역을 소개합니다."
      />
      <section className="py-12">
        <div className="page-container space-y-12">
          {years.map((year) => (
            <div key={year}>
              <h2 className="font-brand text-2xl text-nwcn-green mb-6">{year}</h2>
              <div className="space-y-4">
                {AWARDS_DATA.filter((a) => a.year === year).map((award) => (
                  <div key={award.id} className="card-base p-6 flex items-center gap-6">
                    <div className="flex-1">
                      <h3 className="font-body text-base text-white font-semibold mb-1">{award.competition}</h3>
                      <p className="font-body text-sm text-white/40">
                        {award.team_members.join(', ')}
                      </p>
                    </div>
                    <Badge variant="green">{award.award_name}</Badge>
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
