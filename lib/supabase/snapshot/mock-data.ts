/**
 * 예시(목) 데이터 — 미리보기·로컬 개발에서만 저장 데이터 스냅샷에 덧붙여 보여준다
 * ────────────────────────────────────────────────────────────
 * 실제 DB에 아직 없거나 적은 칸(수상 0건, 작품 1건, 다가오는 행사 0건 등)을 채워
 * 화면 형식을 확인하기 위한 것. 운영(Production)에서는 절대 쓰이지 않는다(lib/supabase/db.ts).
 * - 제목 끝에 '(예시)'를 붙여 실제 데이터와 구분한다.
 * - 이미지는 public/images/mock/ (mock-01~08, 포트폴리오 mock-profile-1~4 · mock-cover-1~4) — '예시' 표시가 들어간 자리 표시용
 * - 행사 날짜는 오늘(한국 시간) 기준으로 만들어서 '다가오는 일정'이 늘 보인다.
 */

const IMG = (n: number) => `/images/mock/mock-${String(n).padStart(2, '0')}.webp`
const id = (prefix: string, n: number) => `00000000-0000-4000-8000-${prefix}${String(n).padStart(12 - prefix.length, '0')}`

/** 한국 시간 오늘에서 n일 뒤 (YYYY-MM-DD) */
function day(n: number): string {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  const [y, m, d] = today.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + n))
  return t.toISOString().slice(0, 10)
}

const created = (n: number) => new Date(Date.UTC(2026, 9, 1 + n)).toISOString()

const awards = [
  { n: 1, year: 2026, competition: '대한민국 콘텐츠 공모전', award_name: '대상', winner: '김하늘', team_members: ['김하늘', '박서준', '이도윤'], category: '인터랙티브 미디어', hosted_by: '한국콘텐츠진흥원', img: 1 },
  { n: 2, year: 2026, competition: 'XR 크리에이터 챌린지', award_name: '최우수상', winner: '이서연', team_members: [], category: 'XR', hosted_by: '과학기술정보통신부', img: 2 },
  { n: 3, year: 2026, competition: '국제 모션그래픽 어워드', award_name: '우수상 (팀)', winner: '최민준', team_members: ['최민준', '정유나'], category: '모션그래픽', hosted_by: 'Motion Awards', img: null },
  { n: 4, year: 2025, competition: '서울 미디어아트 공모전', award_name: '금상', winner: '한지우', team_members: [], category: '미디어아트', hosted_by: '서울문화재단', img: 3 },
  { n: 5, year: 2025, competition: '청년 숏폼 영상제', award_name: '장려상', winner: '오세훈', team_members: ['오세훈', '윤아린'], category: '영상', hosted_by: '경기콘텐츠진흥원', img: 4 },
  { n: 6, year: 2024, competition: '경기 콘텐츠 해커톤', award_name: '은상', winner: '배준상', team_members: ['배준상', '김도현', '서예린', '임하준'], category: '웹·앱', hosted_by: '경기도', img: null },
].map((a) => ({
  id: id('a', a.n),
  competition: `${a.competition} (예시)`,
  award_name: a.award_name,
  winner: a.winner,
  team_members: a.team_members,
  year: a.year,
  category: a.category,
  hosted_by: a.hosted_by,
  description: `${a.competition}에서 ${a.award_name}을 받은 예시 항목입니다.\n작품의 기획 의도와 제작 과정, 심사평 요약이 이 자리에 두세 문단 정도 들어갑니다.`,
  thumbnail_url: a.img ? IMG(a.img) : null,
  created_at: created(a.n),
  competition_en: null,
  award_name_en: null,
  hosted_by_en: null,
  description_en: null,
}))

/** 예시 졸업생 — 이름 → student_id (예시 작품 제작자와 예시 포트폴리오를 잇는다) */
const MOCK_STUDENT_IDS: Record<string, string> = {
  김하늘: id('f', 1),
  이서연: id('f', 2),
  최민준: id('f', 3),
  한지우: id('f', 4),
}

const works = [
  { n: 1, title: '도시의 소리를 모으는 인터랙티브 지도', type: 'design', tags: ['Web', 'Graphic'], people: ['김하늘', '박서준'], year: 2026, img: 5, views: 128 },
  { n: 2, title: '새벽 3시의 편의점', type: 'video', tags: ['Video', 'Motion'], people: ['이서연'], year: 2026, img: 6, views: 342 },
  { n: 3, title: '기억의 방 — VR 전시 공간', type: '3d', tags: ['3D', 'Game'], people: ['최민준', '정유나', '한지우'], year: 2026, img: 1, views: 87 },
  { n: 4, title: '뉴콘 브랜드 아이덴티티 리디자인', type: 'design', tags: ['Graphic'], people: ['한지우'], year: 2025, img: 7, views: 210 },
  { n: 5, title: 'AI 로 만든 가상 아이돌 뮤직비디오', type: 'video', tags: ['AI', 'Video'], people: ['오세훈', '윤아린'], year: 2025, img: 2, views: 512 },
  { n: 6, title: '캠퍼스 사진 아카이브', type: 'design', tags: ['Photo'], people: ['서예린'], year: 2025, img: 3, views: 64 },
  { n: 7, title: '리듬 탈출 — 2D 플랫폼 게임', type: '3d', tags: ['Game'], people: ['배준상', '김도현'], year: 2024, img: 4, views: 158 },
  { n: 8, title: '모션 타이포그래피 실험 12선', type: 'video', tags: ['Motion', 'Graphic'], people: ['임하준'], year: 2024, img: 8, views: 95 },
].map((w) => ({
  id: id('b', w.n),
  title: `${w.title} (예시)`,
  author: w.people.join(', '),
  creators: w.people.map((name) => ({ name, student_id: MOCK_STUDENT_IDS[name] ?? null, student_no: null })),
  year: w.year,
  description: `${w.title}의 작품 소개가 들어가는 자리입니다.\n제작 의도, 사용한 도구, 맡은 역할 등을 두세 문단으로 적습니다.`,
  type: w.type,
  tech_stack: w.tags,
  thumbnail_url: IMG(w.img),
  video_embed: null,
  model_embed: null,
  images: w.type === 'design' ? [IMG(w.img), IMG(((w.img + 1) % 8) + 1), IMG(((w.img + 3) % 8) + 1)] : [],
  view_count: w.views,
  created_at: created(w.n),
  title_en: null,
  description_en: null,
  related_links: w.n % 2 ? [{ url: 'https://example.com', label: '작품 사이트' }] : [],
}))

const articleBody = (title: string, img: number) => `
<p>${title} 기사의 본문이 들어가는 자리입니다. 실제 기사처럼 여러 문단과 소제목, 사진, 인용문이 섞였을 때 어떻게 보이는지 확인하기 위한 예시입니다.</p>
<h2>소제목이 들어갑니다</h2>
<p>두 번째 문단입니다. 학과 활동의 배경과 진행 과정, 참여한 학생들의 이야기가 이어집니다. 문장이 길어져도 한 줄 길이가 너무 길지 않게 읽히는지 봅니다.</p>
<img src="${IMG(img)}" alt="예시 이미지" />
<blockquote>인용문은 이렇게 보입니다. 인터뷰 기사에서 학생의 말을 옮길 때 씁니다.</blockquote>
<h3>작은 소제목</h3>
<ul><li>목록 항목 하나</li><li>목록 항목 둘</li><li>목록 항목 셋</li></ul>
<p>마지막 문단입니다. 기사를 마무리하는 내용이 들어갑니다.</p>`

const reports = [
  { n: 1, title: '졸업전시 준비 현장을 가다', type: 'NCR Press Corp', season: 'Season 3', date: '2026-09-20', img: 5, read: '5분', tags: ['졸업전시', '뉴미디어콘텐츠과'] },
  { n: 2, title: '선배에게 묻다 — 영상 디자이너 편', type: 'Interviews', season: 'Season 3', date: '2026-08-11', img: 6, read: '7분', tags: ['인터뷰', '진로'] },
  { n: 3, title: '1학기 학과 행사 한눈에 보기', type: 'card_news', season: 'Season 2', date: '2025-12-02', img: 7, read: '3분', tags: ['카드뉴스', '학과행사'] },
  { n: 4, title: '생성형 AI 와 영상 제작의 지금', type: 'NewCon Stories', season: 'Season 2', date: '2025-10-14', img: 1, read: '6분', tags: ['AI', '트렌드'] },
  { n: 5, title: 'NCR 기자단 첫 모임 이야기', type: 'NCR Press Corp', season: 'Season 1', date: '2024-11-05', img: 2, read: '4분', tags: ['NCR', '기자단'] },
].map((r) => ({
  id: id('c', r.n),
  title: `${r.title} (예시)`,
  author: 'NCR 기자단',
  type: r.type,
  season: r.season,
  published_at: `${r.date}T00:00:00+00:00`,
  excerpt: `${r.title} — 목록과 카드에 보이는 한두 줄 요약이 들어갑니다.`,
  description: `${r.title} 기사의 설명 문장입니다. 상세 페이지 제목 아래에 보입니다.`,
  content: articleBody(r.title, r.img),
  tags: r.tags,
  related_ids: [],
  thumbnail_url: IMG(r.img),
  read_time: r.read,
  is_published: true,
  created_at: `${r.date}T00:00:00+00:00`,
  is_home_featured: false,
  title_en: null,
  excerpt_en: null,
  description_en: null,
  content_en: null,
}))

const projects = [
  { n: 1, title: '지역 축제 미디어파사드 콘텐츠 제작', type: 'industry', partner: '안성시', year: 2025, duration: '2025.09 – 2025.11', img: 3, people: ['김하늘', '박서준', '이도윤', '한지우'], skills: ['프로젝션 매핑', 'TouchDesigner'], outcome: '축제 기간 3일 동안 매일 저녁 상영, 관람객 약 2만 명', url: 'https://example.com' },
  { n: 2, title: '가족회사 브랜드 숏폼 캠페인', type: 'industry', partner: '티슈오피스', year: 2025, duration: '2025.04 – 2025.06', img: 4, people: ['오세훈', '윤아린'], skills: ['숏폼 영상', '모션그래픽'], outcome: '숏폼 영상 6편 제작, 누적 조회 12만 회', url: null },
  { n: 3, title: '일본 디지털 할리우드 대학 교류 워크숍', type: 'international', partner: 'Digital Hollywood University', year: 2024, duration: '2024.07.08 – 07.12', img: 8, people: ['배준상', '김도현', '서예린'], skills: ['게임 기획', 'Unity'], outcome: '양국 학생 혼합 팀으로 게임 프로토타입 4종 발표', url: null },
].map((p) => ({
  id: id('d', p.n),
  title: `${p.title} (예시)`,
  type: p.type,
  partner: p.partner,
  year: p.year,
  description: `${p.title} 프로젝트 소개가 들어가는 자리입니다.\n\n진행 배경, 학생들이 맡은 일, 현장에서 배운 점을 두세 문단으로 적습니다.`,
  thumbnail_url: IMG(p.img),
  created_at: created(p.n),
  participants: p.people,
  duration: p.duration,
  outcome: p.outcome,
  skills: p.skills,
  title_en: null,
  description_en: null,
  outcome_en: null,
  category: p.skills[0],
  project_url: p.url,
}))

const events = [
  { n: 1, title: '현직 모션 디자이너 초청 특강', type: '특강', start: 3, end: null, location: '본관 301호' },
  { n: 2, title: 'TouchDesigner 입문 워크숍', type: '워크숍', start: 8, end: 9, location: '뉴미디어 실습실' },
  { n: 3, title: '고교생 캠퍼스투어 — 뉴미디어콘텐츠과 체험', type: '캠퍼스투어', start: 15, end: null, location: '학과 실습실 일대' },
  { n: 4, title: '포트폴리오 리뷰 데이', type: '특강', start: 22, end: null, location: '본관 세미나실' },
  { n: 5, title: '졸업작품 중간 발표', type: '기타', start: 29, end: 30, location: '학과 강의실' },
  { n: 6, title: 'Unity 게임잼 워크숍', type: '워크숍', start: 41, end: 42, location: '뉴미디어 실습실' },
  { n: 7, title: '2학기 종강 파티', type: '기타', start: 48, end: null, location: null },
].map((e) => ({
  id: id('e', e.n),
  title: `${e.title} (예시)`,
  type: e.type,
  start_date: day(e.start),
  end_date: e.end === null ? null : day(e.end),
  location: e.location,
  description: null,
  is_published: true,
  created_at: created(e.n),
  title_en: null,
  description_en: null,
}))

const PROFILE = (n: number) => `/images/mock/mock-profile-${n}.webp`
const COVER = (n: number) => `/images/mock/mock-cover-${n}.webp`

const portfolioProject = (title: string, fields: string[], img: number, extra: Partial<Record<string, unknown>> = {}) => ({
  title: `${title} (예시)`,
  titleEn: '',
  year: '2026',
  fields,
  format: '팀 3명',
  role: '기획, 인터랙션 개발',
  tools: ['Figma', 'TouchDesigner'],
  summary: `${title}의 한 줄 요약이 들어갑니다.`,
  description: `${title} 프로젝트 설명입니다. 무엇을, 왜, 어떻게 만들었는지 3~5문장으로 정리한 내용이 들어갑니다. 양식의 글자 수 제한(300자) 안에서 담백한 서술형으로 씁니다.`,
  descriptionEn: '',
  points: ['핵심 포인트 하나가 들어갑니다', '두 번째 포인트는 이 정도 길이입니다', '세 번째 포인트'],
  outcome: '결과·성과가 있으면 여기에 (예: 졸업전시 출품)',
  video: '',
  images: [IMG(img), IMG((img % 6) + 1), IMG(((img + 1) % 6) + 1)],
  cover: IMG(img),
  ...extra,
})

const portfolios = [
  {
    n: 1, name: '김하늘', name_en: 'Kim Haneul', year: 2027, fields: ['인터랙티브', '웹'],
    tagline: '도시의 소리와 움직임을 화면으로 옮기는 인터랙션 디자이너',
    projects: [
      portfolioProject('도시의 소리를 모으는 인터랙티브 지도', ['인터랙티브', '웹'], 5),
      portfolioProject('졸업전시 〈.ZIP〉 인터랙티브 설치', ['인터랙티브'], 1, { format: '팀 5명', role: '센서 인터랙션 개발' }),
      portfolioProject('학과 홈페이지 리디자인', ['웹', 'UX/UI'], 3, { format: '개인', role: '디자인·개발 전체' }),
    ],
  },
  {
    n: 2, name: '이서연', name_en: 'Lee Seoyeon', year: 2027, fields: ['영상', '모션'],
    tagline: '짧은 영상 안에 하루의 온도를 담는 영상 디자이너',
    projects: [
      portfolioProject('새벽 3시의 편의점', ['영상'], 6, { format: '개인', role: '연출·촬영·편집', tools: ['Premiere Pro', 'After Effects'] }),
      portfolioProject('브랜드 숏폼 캠페인', ['영상', '모션'], 4, { tools: ['After Effects'] }),
    ],
  },
  {
    n: 3, name: '최민준', name_en: 'Choi Minjun', year: 2027, fields: ['3D', 'XR', '게임'],
    tagline: '기억을 걸어 다닐 수 있는 공간으로 만드는 3D 아티스트',
    projects: [
      portfolioProject('기억의 방 — VR 전시 공간', ['3D', 'XR'], 1, { tools: ['Unity', 'Blender'] }),
      portfolioProject('리듬 탈출 — 2D 플랫폼 게임', ['게임'], 4, { format: '팀 2명', tools: ['Unity'] }),
      portfolioProject('가상 전시장 모델링 연습', ['3D'], 2, { format: '개인', role: '모델링' }),
      portfolioProject('XR 캠퍼스 투어', ['XR'], 3),
    ],
  },
  {
    n: 4, name: '한지우', name_en: 'Han Jiwoo', year: 2026, fields: ['그래픽', 'UX/UI'],
    tagline: '정보를 단정한 그래픽으로 정리하는 디자이너',
    projects: [
      portfolioProject('뉴콘 브랜드 아이덴티티 리디자인', ['그래픽'], 6, { year: '2025', format: '개인', role: '브랜딩 전체', tools: ['Illustrator', 'Figma'] }),
      portfolioProject('학사 일정 앱 UX 개선', ['UX/UI'], 5, { year: '2025' }),
    ],
  },
].map((p) => ({
  id: id('g', p.n),
  student_id: id('f', p.n),
  slug: `${p.year}-${p.name_en.toLowerCase().replace(/\s+/g, '-')}`,
  year: p.year,
  name: p.name,
  name_en: p.name_en,
  fields: p.fields,
  tagline: `${p.tagline} (예시)`,
  tagline_en: null,
  bio: `${p.name}의 자기소개가 들어가는 자리입니다. 무엇을 만드는 사람인지, 어떤 방식으로 작업하는지 3~4문장(250자 이내)으로 정리합니다. 이 내용은 예시입니다.`,
  bio_en: null,
  interests: p.fields,
  tools: ['Figma', 'After Effects', 'Unity'],
  email: p.n % 2 ? `example${p.n}@example.com` : null,
  website: 'https://example.com',
  instagram: '@nwcn_example',
  other_links: p.n === 1 ? ['https://github.com/example'] : [],
  profile_url: PROFILE(p.n),
  cover_url: COVER(p.n),
  pages: [COVER(p.n), IMG(1), IMG(2), IMG(3), IMG(4), IMG(5), IMG(6), IMG(1), IMG(2)],
  pdf_url: null,
  projects: p.projects,
  history: {
    awards: p.n <= 2 ? ['2025 대한민국 콘텐츠 공모전 대상 (예시)'] : [],
    exhibitions: [p.year === 2027 ? '2026 졸업전시 〈.ZIP〉 (예시)' : '2025 졸업전시 〈CONNECTION〉 (예시)', '학과 작품 발표회 (예시)'],
    experience: p.n === 3 ? [] : ['가족회사 현장실습 (예시)'],
  },
  is_published: true,
  sort_order: p.n,
  created_at: created(p.n),
  updated_at: created(p.n),
}))

/** 예시 졸업생 명단 — 공개 함수 get_graduates 가 돌려주는 모양(학번 없음).
 *  포트폴리오가 있는 4명 + 아직 없는 3명(사진 없는 카드·'포트폴리오 준비 중' 확인용) */
const graduates = [
  ...portfolios.map((p) => ({ id: p.student_id, name: p.name, name_en: p.name_en, graduation_year: p.year, photo_url: p.profile_url })),
  { id: id('f', 5), name: '박서준', name_en: 'Park Seojun', graduation_year: 2027, photo_url: null },
  { id: id('f', 6), name: '정유나', name_en: 'Jung Yuna', graduation_year: 2027, photo_url: null },
  { id: id('f', 7), name: '윤도현', name_en: 'Yoon Dohyun', graduation_year: 2026, photo_url: null },
]

/** 표 이름 → 덧붙일 예시 행 (graduates 는 표가 아니라 get_graduates 함수 결과) */
export const MOCK_TABLES: Record<string, Record<string, unknown>[]> = {
  awards,
  showcase_works: works,
  ncr_reports: reports,
  projects,
  events,
  portfolios,
  graduates,
}
