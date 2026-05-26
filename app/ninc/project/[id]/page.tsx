/**
 * Project 세부 페이지: /ninc/project/[id]
 * 산학협력·해외교류 프로젝트 상세 내용을 보여줍니다.
 * 서버 연결 전까지 정적 mock 데이터 사용.
 */

import Link from 'next/link'
import SubPageLayout from '@/components/layout/SubPageLayout'
import { notFound } from 'next/navigation'

const PROJECTS_DATA = [
  {
    id: '1',
    title: '○○ 기업 브랜드 영상 제작',
    type: 'industry' as const,
    partner: '○○ 주식회사',
    year: 2025,
    description: '산학협력을 통한 기업 홍보 영상 제작 프로젝트입니다. 브랜드 아이덴티티를 영상으로 표현하는 과정에서 학생들이 실무 경험을 쌓았습니다. 기업의 핵심 가치와 비전을 효과적으로 전달하기 위한 스토리보드 작성부터 최종 편집까지 전 과정을 진행하였습니다.',
    participants: ['홍길동', '이영희', '김민수'],
    thumbnail_url: null,
    duration: '2025.03 – 2025.06',
    outcome: '기업 공식 유튜브 채널 업로드 및 사내 행사 활용',
    skills: ['영상 기획', '촬영', '편집', '모션그래픽'],
  },
  {
    id: '2',
    title: '해외 미디어아트 교류전',
    type: 'international' as const,
    partner: '일본 ○○대학교',
    year: 2024,
    description: '일본 자매결연 대학과의 공동 미디어아트 전시 프로젝트입니다. 양교 학생들이 공동으로 작품을 기획·제작하여 양국의 문화적 감수성을 담은 미디어아트를 선보였습니다.',
    participants: ['박나연', '최지우', '정은서'],
    thumbnail_url: null,
    duration: '2024.08 – 2024.11',
    outcome: '도쿄 갤러리 전시 및 온라인 아카이브 공개',
    skills: ['미디어아트', '설치미술', '인터랙션 디자인'],
  },
  {
    id: '3',
    title: '지역 문화콘텐츠 제작 지원',
    type: 'industry' as const,
    partner: '○○ 시청',
    year: 2024,
    description: '지역 문화 홍보 콘텐츠 기획 및 제작 프로젝트입니다. 지역의 역사·문화 자원을 발굴하고 이를 영상·그래픽 콘텐츠로 제작하여 시민들과 소통하였습니다.',
    participants: ['한서윤', '이준호'],
    thumbnail_url: null,
    duration: '2024.04 – 2024.07',
    outcome: '시청 공식 SNS 채널 콘텐츠 시리즈 제작 완료',
    skills: ['콘텐츠 기획', '영상 제작', '그래픽 디자인', 'SNS 마케팅'],
  },
  {
    id: '4',
    title: '베트남 RMIT 글로벌 워크숍',
    type: 'international' as const,
    partner: 'RMIT Vietnam',
    year: 2024,
    description: 'M-NODE: DIMA KR × RMIT VN 글로벌 워크숍 참가 프로젝트입니다. 한국과 베트남 학생들이 함께 디지털 미디어 아트 작품을 기획·제작하는 집중 워크숍에 참여하였습니다.',
    participants: ['박서연', '김도현', '오현석'],
    thumbnail_url: null,
    duration: '2024.07 (2주)',
    outcome: '합동 전시회 및 결과 보고서 발표',
    skills: ['국제 협업', '디지털 미디어', '프로젝트 매니지먼트'],
  },
  {
    id: '5',
    title: '보성 미디어파사드 워크숍',
    type: 'industry' as const,
    partner: '보성군',
    year: 2025,
    description: '지자체 연계 미디어파사드 콘텐츠 제작 실습 프로젝트입니다. 보성의 자연경관과 차(茶) 문화를 모티프로 한 대형 미디어파사드 콘텐츠를 기획·제작하였습니다.',
    participants: ['노지연', '황민서', '강민준'],
    thumbnail_url: null,
    duration: '2025.05 – 2025.06',
    outcome: '보성 녹차밭 야간 미디어파사드 행사 운영',
    skills: ['미디어파사드', '모션그래픽', '공간연출'],
  },
  {
    id: '6',
    title: '○○ 공공기관 홍보영상',
    type: 'industry' as const,
    partner: '○○ 공단',
    year: 2023,
    description: '공공기관 대상 홍보 영상 기획 및 제작 프로젝트입니다. 공공 서비스의 가치를 시민들에게 친근하게 전달하기 위한 스토리텔링 방식을 연구하고 적용하였습니다.',
    participants: ['임지민', '윤채원'],
    thumbnail_url: null,
    duration: '2023.09 – 2023.12',
    outcome: '공단 공식 채널 및 TV 홍보 영상 납품',
    skills: ['영상 기획', '인터뷰 촬영', '후반 제작'],
  },
]

const TYPE_LABEL = { industry: '산학협력', international: '해외교류' }
const TYPE_STYLE = {
  industry: 'bg-nwcn-green text-nwcn-text-default',
  international: 'bg-nwcn-yellow text-nwcn-text-default',
}

interface PageProps {
  params: { id: string }
}

export default function ProjectDetailPage({ params }: PageProps) {
  const project = PROJECTS_DATA.find((p) => p.id === params.id)
  if (!project) notFound()

  return (
    <SubPageLayout>
      {/* ── 상단 배너 ── */}
      <div className="bg-white pt-[80px] pb-0">
        <div className="page-container">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-body text-nwcn-text-sub mb-8">
            <Link href="/ninc/project" className="hover:text-nwcn-text-muted transition-colors">
              PROJECT
            </Link>
            <span>/</span>
            <span className="text-nwcn-text-muted truncate max-w-[200px]">{project.title}</span>
          </nav>

          {/* 타입 배지 */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`font-body text-sm font-semibold px-4 py-1.5 rounded-full ${TYPE_STYLE[project.type]}`}>
              {TYPE_LABEL[project.type]}
            </span>
            <span className="font-body text-sm text-nwcn-text-sub">{project.partner}</span>
          </div>

          {/* 제목 */}
          <h1 className="font-body font-bold text-[32px] md:text-[44px] text-nwcn-text-default leading-tight mb-3">
            {project.title}
          </h1>

          {/* 연도 */}
          <p className="font-body text-sm text-nwcn-text-sub mb-10">
            {project.year}년 · {project.duration}
          </p>
        </div>
        <div className="border-b border-black/10" />
      </div>

      {/* ── 본문 ── */}
      <div className="bg-white py-16">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* ── 사이드바: 프로젝트 정보 ── */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="border border-black/10 rounded-2xl overflow-hidden sticky top-24">
                {/* 썸네일 플레이스홀더 */}
                <div className="aspect-[4/3] bg-[#efefef] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 opacity-30">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#323131" strokeWidth="1.5">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                    </svg>
                    <span className="font-body text-xs text-nwcn-text-sub">이미지 없음</span>
                  </div>
                </div>

                {/* 정보 */}
                <div className="p-6 space-y-4">
                  <div>
                    <p className="font-body text-xs text-nwcn-text-sub mb-1">파트너</p>
                    <p className="font-body text-sm font-semibold text-nwcn-text-default">{project.partner}</p>
                  </div>
                  <div>
                    <p className="font-body text-xs text-nwcn-text-sub mb-1">기간</p>
                    <p className="font-body text-sm text-nwcn-text-muted">{project.duration}</p>
                  </div>
                  <div>
                    <p className="font-body text-xs text-nwcn-text-sub mb-1">참여 인원</p>
                    <p className="font-body text-sm text-nwcn-text-muted">
                      {project.participants.join(', ')}
                    </p>
                  </div>
                  <div>
                    <p className="font-body text-xs text-nwcn-text-sub mb-1">활용 기술/역량</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {project.skills.map((skill) => (
                        <span key={skill} className="font-body text-xs px-2.5 py-1 bg-[#f0f0f0] text-nwcn-text-muted rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* ── 메인: 상세 내용 ── */}
            <main className="lg:col-span-2 order-1 lg:order-2">
              {/* 프로젝트 소개 */}
              <section className="mb-12">
                <h2 className="font-body font-semibold text-[18px] text-nwcn-text-default mb-4 pb-2 border-b border-black/10">
                  프로젝트 소개
                </h2>
                <p className="font-body text-[15px] text-nwcn-text-muted leading-relaxed">
                  {project.description}
                </p>
              </section>

              {/* 결과물 */}
              <section className="mb-12">
                <h2 className="font-body font-semibold text-[18px] text-nwcn-text-default mb-4 pb-2 border-b border-black/10">
                  결과물·성과
                </h2>
                <div className="bg-[#f5f5f5] rounded-xl p-5 flex items-start gap-4">
                  <div className="w-8 h-8 bg-nwcn-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#09F593" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="font-body text-[15px] text-nwcn-text-muted leading-relaxed">
                    {project.outcome}
                  </p>
                </div>
              </section>

              {/* 참여 학생 */}
              <section className="mb-12">
                <h2 className="font-body font-semibold text-[18px] text-nwcn-text-default mb-4 pb-2 border-b border-black/10">
                  참여 학생
                </h2>
                <div className="flex flex-wrap gap-3">
                  {project.participants.map((member) => (
                    <div
                      key={member}
                      className="flex items-center gap-3 bg-[#f5f5f5] px-4 py-3 rounded-xl"
                    >
                      <div className="w-9 h-9 rounded-full bg-nwcn-text-sub/20 flex items-center justify-center flex-shrink-0">
                        <span className="font-body text-sm font-semibold text-nwcn-text-muted">
                          {member.charAt(0)}
                        </span>
                      </div>
                      <p className="font-body text-sm font-medium text-nwcn-text-default">{member}</p>
                    </div>
                  ))}
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>

      {/* ── 하단 네비게이션 ── */}
      <div className="bg-white border-t border-black/10 py-8">
        <div className="page-container flex justify-between items-center">
          <Link
            href="/ninc/project"
            className="flex items-center gap-2 font-body text-sm text-nwcn-text-sub hover:text-nwcn-text-default transition-colors group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            프로젝트 목록으로
          </Link>
        </div>
      </div>
    </SubPageLayout>
  )
}
