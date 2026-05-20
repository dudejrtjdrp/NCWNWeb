import SubPageLayout from '@/components/layout/SubPageLayout'
import PageHeader from '@/components/common/PageHeader'
import Badge from '@/components/ui/Badge'

const EVENTS = [
  { id: '1', title: '미디어 산업 트렌드 특강', type: '특강' as const, start_date: '2025-06-15', location: '본관 강당', description: '현직 방송 PD 초청 특강' },
  { id: '2', title: '영상 편집 심화 워크숍', type: '워크숍' as const, start_date: '2025-06-22', location: '실습실 201', description: '프리미어 프로 & 다빈치 리졸브 고급 과정' },
  { id: '3', title: '오픈 캠퍼스 Day', type: '캠퍼스투어' as const, start_date: '2025-07-05', location: '학과 전체', description: '입시생 대상 학과 탐방 행사' },
]

const TYPE_COLORS = {
  '특강': 'green' as const,
  '워크숍': 'yellow' as const,
  '캠퍼스투어': 'outline' as const,
  '기타': 'gray' as const,
}

export default function EventPage() {
  return (
    <SubPageLayout>
      <PageHeader
        category="NINC — EVENT"
        title="이벤트·행사"
        description="학과의 특강, 워크숍 등 다양한 행사 일정을 확인하세요."
      />
      <section className="py-12">
        <div className="page-container">
          <div className="space-y-4">
            {EVENTS.map((event) => (
              <div key={event.id} className="card-base p-6 flex gap-6 items-start">
                {/* 날짜 */}
                <div className="flex-shrink-0 w-16 text-center">
                  <p className="font-body text-xs text-white/30">
                    {new Date(event.start_date).toLocaleDateString('ko-KR', { month: 'short' })}
                  </p>
                  <p className="font-brand text-3xl text-nwcn-green">
                    {new Date(event.start_date).getDate()}
                  </p>
                </div>
                {/* 내용 */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-body text-base text-white font-semibold">{event.title}</h3>
                    <Badge variant={TYPE_COLORS[event.type]}>{event.type}</Badge>
                  </div>
                  <p className="font-body text-sm text-white/40 mb-1">{event.description}</p>
                  {event.location && (
                    <p className="font-body text-xs text-white/20 flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {event.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SubPageLayout>
  )
}
