/**
 * Awards 세부 페이지: /ninc/awards/[id]
 * 수상 항목의 상세 내용을 보여줍니다.
 * 서버 연결 전까지 정적 mock 데이터 사용.
 */

import Link from 'next/link'
import SubPageLayout from '@/components/layout/SubPageLayout'
import { notFound } from 'next/navigation'

// ── 임시 데이터 (서버 연결 시 fetch로 교체) ────────────────
const AWARDS_DATA = [
  {
    id: '1',
    year: 2025,
    competition: '대한민국 광고대상',
    award_name: '금상',
    winner: '홍길동',
    team_members: ['홍길동', '이영희'],
    description: '국내 최고 권위의 광고 시상식에서 금상을 수상하였습니다. 혁신적인 디지털 광고 캠페인으로 심사위원단의 높은 평가를 받았습니다. 브랜드 스토리텔링과 감각적인 영상 편집이 돋보였으며, 수용자 분석을 바탕으로 한 타깃 메시지 전달이 특히 인정받았습니다.',
    thumbnail_url: null,
    category: '광고',
    hosted_by: '한국광고총연합회',
  },
  {
    id: '2',
    year: 2025,
    competition: 'K-콘텐츠 공모전',
    award_name: '최우수상',
    winner: '이영희',
    team_members: ['이영희'],
    description: 'K-콘텐츠의 글로벌 경쟁력을 높이기 위한 공모전에서 최우수상을 수상하였습니다. 한국 문화의 독창성을 현대적 감각으로 재해석한 작품으로 심사위원들로부터 호평을 받았습니다.',
    thumbnail_url: null,
    category: '콘텐츠',
    hosted_by: '문화체육관광부',
  },
  {
    id: '3',
    year: 2024,
    competition: '방송영상 콘텐츠 경진대회',
    award_name: '우수상',
    winner: '김민수',
    team_members: ['김민수', '박태양'],
    description: '방송영상 분야의 신진 창작자를 발굴하는 경진대회에서 우수상을 수상하였습니다. 독창적인 서사 구조와 뛰어난 영상미로 심사위원단의 호평을 받았습니다.',
    thumbnail_url: null,
    category: '영상',
    hosted_by: '한국방송영상산업진흥원',
  },
  {
    id: '4',
    year: 2024,
    competition: '전국 대학생 미디어 공모전',
    award_name: '장려상',
    winner: '최지우',
    team_members: ['최지우'],
    description: '전국 대학생을 대상으로 한 미디어 공모전에서 장려상을 수상하였습니다. 소셜미디어 트렌드를 반영한 참신한 콘텐츠 기획으로 주목을 받았습니다.',
    thumbnail_url: null,
    category: '미디어',
    hosted_by: '한국미디어학회',
  },
  {
    id: '5',
    year: 2024,
    competition: '한국광고학회 공모전',
    award_name: '대상',
    winner: '박서연',
    team_members: ['박서연', '김도현'],
    description: '한국광고학회 주관 공모전에서 영예의 대상을 수상하였습니다. 데이터 기반의 광고 전략과 창의적인 크리에이티브의 조화로 대상의 영예를 안았습니다.',
    thumbnail_url: null,
    category: '광고',
    hosted_by: '한국광고학회',
  },
  {
    id: '6',
    year: 2024,
    competition: '디지털 콘텐츠 창작 경진대회',
    award_name: '우수상',
    winner: '이준호',
    team_members: ['이준호'],
    description: '디지털 환경에서의 창의적 콘텐츠 제작 역량을 겨루는 경진대회에서 우수상을 수상하였습니다.',
    thumbnail_url: null,
    category: '디지털',
    hosted_by: '한국콘텐츠진흥원',
  },
  {
    id: '7',
    year: 2023,
    competition: '대학생 영상 페스티벌',
    award_name: '최우수상',
    winner: '박나연',
    team_members: ['박나연', '강민준'],
    description: '대학생 영상 창작자들의 축제에서 최우수상을 수상하였습니다. 실험적인 영상 언어와 독창적인 내러티브로 심사위원의 극찬을 받았습니다.',
    thumbnail_url: null,
    category: '영상',
    hosted_by: '대학영화제연합',
  },
  {
    id: '8',
    year: 2023,
    competition: 'NCR 트렌드 리포트 공모전',
    award_name: '대상',
    winner: '정은서',
    team_members: ['정은서'],
    description: 'NCR에서 주관하는 미디어 트렌드 리포트 공모전에서 대상을 수상하였습니다. 심층적인 미디어 분석과 명확한 시각화로 높은 평가를 받았습니다.',
    thumbnail_url: null,
    category: '리포트',
    hosted_by: 'NCR',
  },
  {
    id: '9',
    year: 2023,
    competition: '스마트 미디어 어워드',
    award_name: '금상',
    winner: '한서윤',
    team_members: ['한서윤', '임지민'],
    description: '스마트 미디어 분야의 혁신적인 작품을 선정하는 어워드에서 금상을 수상하였습니다.',
    thumbnail_url: null,
    category: '스마트미디어',
    hosted_by: '스마트미디어산업진흥협회',
  },
  {
    id: '10',
    year: 2023,
    competition: '전국 방송 콘텐츠 공모전',
    award_name: '장려상',
    winner: '오현석',
    team_members: ['오현석'],
    description: '전국 단위의 방송 콘텐츠 공모전에서 장려상을 수상하였습니다.',
    thumbnail_url: null,
    category: '방송',
    hosted_by: '방송통신위원회',
  },
  {
    id: '11',
    year: 2022,
    competition: '대한민국 학생 창작 공모전',
    award_name: '우수상',
    winner: '노지연',
    team_members: ['노지연', '황민서'],
    description: '대한민국 학생 창작 공모전에서 우수상을 수상하였습니다. 실험적인 미디어 아트 작품으로 창의성과 기술력을 동시에 인정받았습니다.',
    thumbnail_url: null,
    category: '미디어아트',
    hosted_by: '한국예술문화단체총연합회',
  },
]

const AWARD_GRADE_COLOR: Record<string, string> = {
  '대상': 'bg-nwcn-green text-nwcn-text-default',
  '금상': 'bg-nwcn-green text-nwcn-text-default',
  '최우수상': 'bg-nwcn-yellow text-nwcn-text-default',
  '우수상': 'bg-nwcn-yellow text-nwcn-text-default',
  '장려상': 'bg-white/10 text-white',
}

interface PageProps {
  params: { id: string }
}

export default function AwardDetailPage({ params }: PageProps) {
  const award = AWARDS_DATA.find((a) => a.id === params.id)
  if (!award) notFound()

  return (
    <SubPageLayout>
      {/* ── 상단 배너 (흰 배경) ── */}
      <div className="bg-white pt-[80px] pb-0">
        <div className="page-container">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-body text-nwcn-text-sub mb-8">
            <Link href="/ninc/awards" className="hover:text-nwcn-text-muted transition-colors">
              AWARDS
            </Link>
            <span>/</span>
            <span className="text-nwcn-text-muted truncate max-w-[200px]">{award.competition}</span>
          </nav>

          {/* 수상명 + 배지 */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className={`font-body text-sm font-semibold px-4 py-1.5 rounded-full ${AWARD_GRADE_COLOR[award.award_name] ?? 'bg-white/10 text-white'}`}>
              {award.award_name}
            </span>
            <span className="font-body text-sm text-nwcn-text-sub">{award.category}</span>
          </div>

          {/* 대회명 */}
          <h1 className="font-body font-bold text-[32px] md:text-[44px] text-nwcn-text-default leading-tight mb-3">
            {award.competition}
          </h1>

          {/* 연도 + 주최 */}
          <p className="font-body text-sm text-nwcn-text-sub mb-10">
            {award.year}년 · {award.hosted_by}
          </p>
        </div>

        {/* 구분선 */}
        <div className="border-b border-black/10" />
      </div>

      {/* ── 본문 ── */}
      <div className="bg-white py-16">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* ── 왼쪽: 주요 정보 카드 ── */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="border border-black/10 rounded-2xl overflow-hidden sticky top-24">
                {/* 썸네일 */}
                <div className="aspect-[4/3] bg-[#efefef] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 opacity-30">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#323131" strokeWidth="1.5">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                    <span className="font-body text-xs text-nwcn-text-sub">이미지 없음</span>
                  </div>
                </div>

                {/* 정보 목록 */}
                <div className="p-6 space-y-4">
                  <div>
                    <p className="font-body text-xs text-nwcn-text-sub mb-1">수상자</p>
                    <p className="font-body text-sm font-semibold text-nwcn-text-default">{award.winner}</p>
                  </div>
                  {award.team_members.length > 1 && (
                    <div>
                      <p className="font-body text-xs text-nwcn-text-sub mb-1">팀원</p>
                      <p className="font-body text-sm text-nwcn-text-muted">
                        {award.team_members.join(', ')}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="font-body text-xs text-nwcn-text-sub mb-1">수상 연도</p>
                    <p className="font-body text-sm text-nwcn-text-muted">{award.year}년</p>
                  </div>
                  <div>
                    <p className="font-body text-xs text-nwcn-text-sub mb-1">주최</p>
                    <p className="font-body text-sm text-nwcn-text-muted">{award.hosted_by}</p>
                  </div>
                  <div>
                    <p className="font-body text-xs text-nwcn-text-sub mb-1">분야</p>
                    <p className="font-body text-sm text-nwcn-text-muted">{award.category}</p>
                  </div>
                </div>
              </div>
            </aside>

            {/* ── 오른쪽: 상세 설명 ── */}
            <main className="lg:col-span-2 order-1 lg:order-2">
              {/* 섹션: 수상 소개 */}
              <section className="mb-12">
                <h2 className="font-body font-semibold text-[18px] text-nwcn-text-default mb-4 pb-2 border-b border-black/10">
                  수상 소개
                </h2>
                <p className="font-body text-[15px] text-nwcn-text-muted leading-relaxed">
                  {award.description}
                </p>
              </section>

              {/* 섹션: 수상자 정보 */}
              <section className="mb-12">
                <h2 className="font-body font-semibold text-[18px] text-nwcn-text-default mb-4 pb-2 border-b border-black/10">
                  수상자
                </h2>
                <div className="flex flex-wrap gap-3">
                  {award.team_members.map((member) => (
                    <div
                      key={member}
                      className="flex items-center gap-3 bg-[#f5f5f5] px-4 py-3 rounded-xl"
                    >
                      {/* 아바타 */}
                      <div className="w-9 h-9 rounded-full bg-nwcn-text-sub/20 flex items-center justify-center flex-shrink-0">
                        <span className="font-body text-sm font-semibold text-nwcn-text-muted">
                          {member.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-body text-sm font-medium text-nwcn-text-default">{member}</p>
                        {member === award.winner && (
                          <p className="font-body text-[11px] text-nwcn-text-sub">대표 수상자</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 섹션: 수상 플레이크 (장식) */}
              <div className="bg-[#f9f9f9] rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-nwcn-text-sub/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B9B8B6" strokeWidth="1.5">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
                <div>
                  <p className="font-body text-sm font-medium text-nwcn-text-default">
                    {award.competition}
                  </p>
                  <p className="font-body text-xs text-nwcn-text-sub">
                    {award.year}년 · {award.award_name}
                  </p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* ── 하단 네비게이션 ── */}
      <div className="bg-white border-t border-black/10 py-8">
        <div className="page-container flex justify-between items-center">
          <Link
            href="/ninc/awards"
            className="flex items-center gap-2 font-body text-sm text-nwcn-text-sub hover:text-nwcn-text-default transition-colors group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            수상 목록으로
          </Link>
        </div>
      </div>
    </SubPageLayout>
  )
}
