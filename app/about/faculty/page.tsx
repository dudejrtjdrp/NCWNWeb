import SubPageLayout from '@/components/layout/SubPageLayout'
import PageHeader from '@/components/common/PageHeader'
import Image from 'next/image'

// TODO: Supabase fetch로 교체
const FACULTY_DATA = [
  {
    id: '1', name: '이주헌', title: '교수', email: 'jhlee@dba.ac.kr',
    education: ['홍익대학교 영상학과 박사'],
    career: ['현) 동아방송예술대학교 뉴미디어콘텐츠과 교수'],
    photo_url: null,
  },
  {
    id: '2', name: '육심웅', title: '교수', email: 'swryuk@dba.ac.kr',
    education: ['중앙대학교 첨단영상대학원 석사'],
    career: ['현) 동아방송예술대학교 뉴미디어콘텐츠과 교수'],
    photo_url: null,
  },
]

export default function FacultyPage() {
  return (
    <SubPageLayout>
      <PageHeader
        category="ABOUT — FACULTY"
        title="교수진"
        description="뉴미디어콘텐츠과를 이끄는 교수진을 소개합니다."
      />
      <section className="py-12">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FACULTY_DATA.map((faculty) => (
              <div key={faculty.id} className="card-base p-8 flex gap-6">
                {/* 프로필 사진 */}
                <div className="flex-shrink-0 w-20 h-20 rounded-full bg-nwcn-dark-2 border border-white/10 overflow-hidden flex items-center justify-center">
                  {faculty.photo_url ? (
                    <Image src={faculty.photo_url} alt={faculty.name} width={80} height={80} className="object-cover" />
                  ) : (
                    <span className="font-brand text-2xl text-nwcn-green/30">{faculty.name[0]}</span>
                  )}
                </div>
                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-body text-xl font-semibold text-white">{faculty.name}</h3>
                  <p className="font-body text-sm text-nwcn-green mb-1">{faculty.title}</p>
                  <a href={`mailto:${faculty.email}`} className="font-body text-xs text-white/30 hover:text-nwcn-green transition-colors mb-4 block">
                    {faculty.email}
                  </a>
                  <div className="space-y-1">
                    {faculty.education.map((edu, i) => (
                      <p key={i} className="font-body text-xs text-white/50">{edu}</p>
                    ))}
                    {faculty.career.map((car, i) => (
                      <p key={i} className="font-body text-xs text-white/50">{car}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SubPageLayout>
  )
}
