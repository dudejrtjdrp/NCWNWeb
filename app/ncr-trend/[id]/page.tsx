/**
 * NCR Trend 아티클 세부 페이지: /ncr-trend/[id]
 * 기사(아티클) 형식의 세부 페이지.
 * 서버 연결 전까지 정적 mock 데이터 사용.
 */

import Link from 'next/link'
import SubPageLayout from '@/components/layout/SubPageLayout'
import Badge from '@/components/ui/Badge'
import { notFound } from 'next/navigation'

const ARTICLES = [
  {
    id: '1',
    title: 'AI가 바꾸는 미디어 콘텐츠 산업의 미래',
    type: 'editorial' as const,
    season: 'Season 3',
    published_at: '2025-05-10',
    author: 'NCR 에디터팀',
    thumbnail_url: null,
    description: 'AI 기술의 발전이 미디어 콘텐츠 산업 전반에 가져오는 혁신적인 변화를 분석합니다.',
    content: `
인공지능(AI) 기술의 급격한 발전이 미디어 콘텐츠 산업에 근본적인 변화를 일으키고 있습니다. 텍스트 생성부터 이미지, 영상 제작까지 AI가 참여하지 않는 영역이 없을 정도로 그 영향력이 확대되고 있습니다.

## 생성형 AI의 콘텐츠 제작 혁신

생성형 AI는 콘텐츠 제작의 속도와 다양성을 획기적으로 높이고 있습니다. 과거에는 전문 인력과 많은 시간이 필요했던 작업들이 이제는 AI의 도움으로 빠르게 완성될 수 있게 되었습니다. 특히 영상 편집, 자막 생성, 음악 제작 등의 분야에서 두드러진 변화가 나타나고 있습니다.

방송사와 OTT 플랫폼들은 AI를 활용한 개인화 콘텐츠 추천 시스템을 고도화하고 있으며, 시청자들의 취향에 맞춤화된 콘텐츠 큐레이션이 가능해졌습니다. 이는 콘텐츠 소비 패턴을 더욱 세분화시키고, 롱테일 콘텐츠의 발견 가능성을 높이는 효과를 낳고 있습니다.

## 크리에이터 이코노미와 AI의 만남

독립 크리에이터들에게 AI는 거대한 기회입니다. 1인 제작사가 대형 스튜디오 수준의 퀄리티를 구현할 수 있는 시대가 도래했으며, 이는 미디어 산업의 민주화를 가속화하고 있습니다. 영상 편집 AI 툴부터 AI 나레이션, 배경음악 생성 서비스까지, 크리에이터를 위한 AI 도구 생태계가 빠르게 성숙해가고 있습니다.

그러나 이러한 변화는 동시에 새로운 도전도 제시합니다. 저작권 문제, 딥페이크 등 AI 생성 콘텐츠의 윤리적 사용, 인간 창작자의 역할 재정의 등이 업계가 풀어야 할 숙제로 남아 있습니다.

## 미래를 위한 준비

미디어 콘텐츠를 공부하는 학생과 실무자들에게 AI는 선택이 아닌 필수 도구가 되고 있습니다. AI의 작동 원리를 이해하고, 이를 창의적으로 활용하는 능력이 앞으로의 미디어 인재에게 요구되는 핵심 역량이 될 것입니다.

동시에 AI가 대체하기 어려운 인간 고유의 감수성, 창의성, 비판적 사고력을 더욱 키워나가는 것이 중요합니다. AI와의 협업을 통해 인간의 창의성을 증폭시키는 방향으로 나아가는 것, 이것이 미래 미디어 인재의 방향성이라 할 수 있습니다.
    `.trim(),
    tags: ['AI', '미디어', '콘텐츠산업', '크리에이터'],
    related_ids: ['2', '3'],
  },
  {
    id: '2',
    title: '쇼츠 시대의 스토리텔링 전략',
    type: 'trend' as const,
    season: 'Season 3',
    published_at: '2025-04-22',
    author: 'NCR 트렌드팀',
    thumbnail_url: null,
    description: '유튜브 쇼츠, 릴스, 틱톡으로 대표되는 숏폼 콘텐츠 시대에 효과적인 스토리텔링 전략을 분석합니다.',
    content: `
60초 이하의 짧은 영상 포맷, 이른바 '쇼츠(Shorts)'가 전 세계 콘텐츠 소비의 주류로 자리잡고 있습니다. 유튜브 쇼츠, 인스타그램 릴스, 틱톡 등 숏폼 플랫폼의 급성장은 전통적인 스토리텔링 문법에 근본적인 변화를 요구하고 있습니다.

## 3초 안에 시선을 잡아라

숏폼 콘텐츠에서 가장 중요한 것은 처음 3초입니다. 스크롤을 멈추게 하는 강렬한 훅(Hook)이 없다면 시청자는 이미 다음 영상으로 넘어가 있습니다. 기존의 기승전결 구조보다는 '결론 먼저, 이유 나중'의 역피라미드 방식이 효과적입니다.

## 수직형 프레임의 미학

9:16 세로형 화면 비율은 단순한 기술적 규격이 아니라 새로운 미적 언어입니다. 화면을 가득 채우는 클로즈업, 자막의 전략적 활용, 화면 분할 등 숏폼만의 시각적 문법이 빠르게 정착되고 있습니다.

## 트렌드와 나만의 색깔 사이

성공적인 숏폼 크리에이터들은 유행하는 트렌드를 자신만의 방식으로 재해석하는 능력을 갖추고 있습니다. 챌린지 문화, 밈, 사운드 트렌드를 활용하되, 자신의 정체성을 잃지 않는 균형이 중요합니다.
    `.trim(),
    tags: ['쇼츠', '숏폼', '스토리텔링', 'SNS'],
    related_ids: ['1', '4'],
  },
  {
    id: '3',
    title: '메타버스 콘텐츠 창작자가 되는 법',
    type: 'card_news' as const,
    season: 'Season 3',
    published_at: '2025-04-05',
    author: 'NCR 카드뉴스팀',
    thumbnail_url: null,
    description: '메타버스 플랫폼에서 활동하는 콘텐츠 창작자가 되기 위한 필수 지식과 진입 전략을 소개합니다.',
    content: `
메타버스는 단순한 가상현실 공간을 넘어 새로운 경제 생태계가 되고 있습니다. 로블록스, 제페토, 마인크래프트부터 기업용 메타버스 플랫폼까지, 메타버스 콘텐츠 창작자에 대한 수요가 빠르게 증가하고 있습니다.

## 메타버스 창작자가 갖춰야 할 역량

3D 모델링과 애니메이션의 기초 이해, 플랫폼별 도구(예: 로블록스 스튜디오, 제페토 스튜디오) 활용 능력, 그리고 커뮤니티와 소통하는 능력이 핵심입니다. 기존 2D 미디어와는 다른 공간적 사고방식이 요구됩니다.

## 수익화 전략

아이템 판매, 경험(Experience) 제공, 브랜드 협업 등 다양한 수익 모델이 존재합니다. 특히 NFT와의 연계를 통한 디지털 자산 거래도 주목받고 있습니다.
    `.trim(),
    tags: ['메타버스', '3D', '창작자', 'VR'],
    related_ids: ['1', '2'],
  },
  {
    id: '4',
    title: 'K-콘텐츠, 글로벌 플랫폼을 공략하라',
    type: 'editorial' as const,
    season: 'Season 2',
    published_at: '2025-03-18',
    author: 'NCR 에디터팀',
    thumbnail_url: null,
    description: '한류 콘텐츠가 넷플릭스, 디즈니플러스 등 글로벌 OTT 플랫폼에서 성공을 거두는 전략을 분석합니다.',
    content: `
K-드라마, K-팝, K-무비로 대표되는 한국 콘텐츠가 전 세계 시청자를 사로잡고 있습니다. 오징어 게임의 글로벌 흥행 이후 K-콘텐츠에 대한 해외 플랫폼의 투자와 관심이 급증하고 있습니다.

## 보편성과 한국성의 조화

성공한 K-콘텐츠들의 공통점은 한국적 특수성을 유지하면서도 보편적 감정에 호소한다는 점입니다. 계층 갈등, 가족 관계, 생존 본능 등 인류 공통의 주제를 한국적 맥락에서 풀어내는 방식이 주효하고 있습니다.

## 플랫폼별 현지화 전략

글로벌 플랫폼마다 주 이용자층과 콘텐츠 소비 패턴이 다릅니다. 넷플릭스, 틱톡, 유튜브 각각에 맞는 포맷과 마케팅 전략이 필요합니다. 특히 자막과 더빙의 품질이 글로벌 성공을 좌우하는 중요한 요소로 부각되고 있습니다.
    `.trim(),
    tags: ['K-콘텐츠', '글로벌', 'OTT', '한류'],
    related_ids: ['1', '2'],
  },
]

const TYPE_LABELS = { editorial: '에디토리얼', trend: '트렌드', card_news: '카드뉴스' }

// 간단한 마크다운 → HTML 변환 (## 헤더, 단락)
function renderContent(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (const line of lines) {
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="font-body font-bold text-[20px] text-nwcn-text-default mt-10 mb-4">
          {line.replace('## ', '')}
        </h2>
      )
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-4" />)
    } else {
      elements.push(
        <p key={key++} className="font-body text-[15px] text-nwcn-text-muted leading-[1.85] mb-1">
          {line}
        </p>
      )
    }
  }

  return elements
}

interface PageProps {
  params: { id: string }
}

export default function ArticleDetailPage({ params }: PageProps) {
  const article = ARTICLES.find((a) => a.id === params.id)
  if (!article) notFound()

  const relatedArticles = ARTICLES.filter((a) => article.related_ids.includes(a.id))

  const formattedDate = new Date(article.published_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <SubPageLayout>
      {/* ── 아티클 히어로 ── */}
      <div className="bg-nwcn-dark pt-[80px] pb-0">
        <div className="page-container pt-12 pb-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-body text-white/30 mb-8">
            <Link href="/ncr-trend/latest" className="hover:text-white/60 transition-colors">
              NCR TREND
            </Link>
            <span>/</span>
            <Badge variant="green">{TYPE_LABELS[article.type]}</Badge>
          </nav>

          {/* 시즌 */}
          <p className="font-body text-xs text-nwcn-green/60 tracking-widest uppercase mb-4">
            {article.season}
          </p>

          {/* 제목 */}
          <h1 className="font-body font-bold text-[32px] md:text-[48px] lg:text-[56px] text-white leading-[1.15] mb-6 max-w-3xl">
            {article.title}
          </h1>

          {/* 설명 */}
          <p className="font-body text-[16px] text-white/50 leading-relaxed max-w-2xl mb-10">
            {article.description}
          </p>

          {/* 메타 정보 */}
          <div className="flex items-center gap-6 pb-10 border-b border-white/10">
            {/* 저자 */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-nwcn-green/20 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#09F593" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <p className="font-body text-xs text-white/30">작성자</p>
                <p className="font-body text-sm text-white/80">{article.author}</p>
              </div>
            </div>

            {/* 날짜 */}
            <div>
              <p className="font-body text-xs text-white/30">발행일</p>
              <p className="font-body text-sm text-white/80">{formattedDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 아티클 본문 ── */}
      <div className="bg-white">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 py-16">

            {/* ── 메인 본문 ── */}
            <article className="lg:col-span-3">
              {/* 썸네일 이미지 영역 */}
              <div className="aspect-[16/7] bg-[#efefef] rounded-2xl mb-12 flex items-center justify-center overflow-hidden">
                <div className="flex flex-col items-center gap-3 opacity-20">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#323131" strokeWidth="1.2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span className="font-brand text-2xl text-nwcn-text-muted">NCR</span>
                </div>
              </div>

              {/* 본문 텍스트 */}
              <div className="max-w-[680px]">
                {renderContent(article.content)}
              </div>

              {/* 태그 */}
              <div className="mt-12 pt-8 border-t border-black/10">
                <p className="font-body text-xs text-nwcn-text-sub mb-3">태그</p>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-body text-xs px-3 py-1.5 border border-nwcn-text-sub/30 text-nwcn-text-muted rounded-full hover:border-nwcn-text-default transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>

            {/* ── 사이드바 ── */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                {/* 이 아티클 정보 */}
                <div className="bg-[#f5f5f5] rounded-xl p-5">
                  <p className="font-body text-xs font-semibold text-nwcn-text-sub uppercase tracking-wider mb-4">
                    아티클 정보
                  </p>
                  <div className="space-y-3">
                    <div>
                      <p className="font-body text-[11px] text-nwcn-text-sub">유형</p>
                      <p className="font-body text-sm text-nwcn-text-muted">{TYPE_LABELS[article.type]}</p>
                    </div>
                    <div>
                      <p className="font-body text-[11px] text-nwcn-text-sub">시즌</p>
                      <p className="font-body text-sm text-nwcn-text-muted">{article.season}</p>
                    </div>
                    <div>
                      <p className="font-body text-[11px] text-nwcn-text-sub">발행일</p>
                      <p className="font-body text-sm text-nwcn-text-muted">{formattedDate}</p>
                    </div>
                  </div>
                </div>

                {/* 관련 아티클 */}
                {relatedArticles.length > 0 && (
                  <div>
                    <p className="font-body text-xs font-semibold text-nwcn-text-sub uppercase tracking-wider mb-4">
                      관련 아티클
                    </p>
                    <div className="space-y-3">
                      {relatedArticles.map((rel) => (
                        <Link
                          key={rel.id}
                          href={`/ncr-trend/${rel.id}`}
                          className="block p-3 rounded-xl border border-black/8 hover:border-nwcn-text-sub/40 transition-colors group"
                        >
                          <p className="font-body text-[11px] text-nwcn-green mb-1">
                            {TYPE_LABELS[rel.type]}
                          </p>
                          <p className="font-body text-sm text-nwcn-text-muted group-hover:text-nwcn-text-default transition-colors leading-snug">
                            {rel.title}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* ── 하단 네비게이션 ── */}
      <div className="bg-white border-t border-black/10 py-8">
        <div className="page-container flex justify-between items-center">
          <Link
            href="/ncr-trend/latest"
            className="flex items-center gap-2 font-body text-sm text-nwcn-text-sub hover:text-nwcn-text-default transition-colors group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            리포트 목록으로
          </Link>
        </div>
      </div>
    </SubPageLayout>
  )
}
