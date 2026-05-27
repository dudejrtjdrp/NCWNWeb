/**
 * Supabase 목데이터 시딩 스크립트
 *
 * 실행 방법:
 *   npx tsx scripts/seed.ts
 *
 * 필요 환경변수 (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// .env.local 우선 로드 (Next.js 관례)
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

// Node.js 18 WebSocket 폴리필 (realtime 클라이언트 초기화 오류 방지)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof (globalThis as any).WebSocket === 'undefined') {
  // 더미 WebSocket — seed 스크립트는 realtime 기능을 사용하지 않음
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).WebSocket = class DummyWS {
    constructor() {}
    addEventListener() {}
    removeEventListener() {}
    close() {}
  }
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ 환경변수 NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다.')
  console.error('   .env.local 파일에 SUPABASE_SERVICE_ROLE_KEY를 추가하세요.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
  // seed 스크립트에서 realtime 채널은 불필요
  realtime: { timeout: 0 } as never,
})

// ── 유틸 ──────────────────────────────────────────────────
async function seedTable<T extends Record<string, unknown>>(
  tableName: string,
  rows: T[],
  checkColumn = 'id'
) {
  console.log(`\n📦 ${tableName} 시딩 중... (${rows.length}개)`)

  for (const row of rows) {
    // 중복 체크 (checkColumn 값 기준)
    const { data: existing } = await supabase
      .from(tableName)
      .select('id')
      .eq(checkColumn, row[checkColumn] as string)
      .maybeSingle()

    if (existing) {
      console.log(`  ↩ SKIP: ${row[checkColumn]} (이미 존재)`)
      continue
    }

    const { error } = await supabase.from(tableName).insert(row)
    if (error) {
      console.error(`  ❌ INSERT 실패 (${row[checkColumn]}):`, error.message)
    } else {
      console.log(`  ✅ INSERT: ${row[checkColumn] ?? JSON.stringify(row).slice(0, 50)}`)
    }
  }
}

// ── 교수진 ────────────────────────────────────────────────
async function seedFaculty() {
  const rows = [
    {
      id: 'bae-yun-gyeong',
      name_en: 'BAEYUNGYEONG',
      name_ko: '배윤경',
      role: '교수',
      photo_url: '/images/faculty/bae-yun-gyeong.png',
      color_variant: 'green-solid',
      quote: '창의성과 기술이 만나는 곳, 뉴미디어콘텐츠과에서 여러분의 꿈을 펼치세요.',
      sort_order: 1,
    },
    {
      id: 'lee-gwang-soo',
      name_en: 'LEEGWANG-SOO',
      name_ko: '이광수',
      role: '교수',
      photo_url: '/images/faculty/lee-gwang-soo.png',
      color_variant: 'green-gradient',
      quote: '미디어의 경계를 넘어 새로운 가능성을 탐구하는 여정을 함께합니다.',
      sort_order: 2,
    },
    {
      id: 'lee-seock-hee',
      name_en: 'LEESEOCKHEE',
      name_ko: '이석희',
      role: '교수',
      photo_url: '/images/faculty/lee-seock-hee.png',
      color_variant: 'green-solid',
      quote: '콘텐츠를 통해 세상과 소통하는 창작자로 성장하길 응원합니다.',
      sort_order: 3,
    },
    {
      id: 'lee-ju-heon',
      name_en: 'LEEJUHEON',
      name_ko: '이주헌',
      role: '교수',
      photo_url: '/images/faculty/lee-ju-heon.png',
      color_variant: 'green-gradient',
      quote: '새로운 기술과 예술의 융합으로 미래 미디어를 선도하는 인재를 양성합니다.',
      email: 'jhlee@dba.ac.kr',
      education: ['홍익대학교 영상학과 박사'],
      career: ['현) 동아방송예술대학교 뉴미디어콘텐츠과 교수'],
      sort_order: 4,
    },
    {
      id: 'ahn-jong-gu',
      name_en: 'AHNJONG-GU',
      name_ko: '안종구',
      role: '교수',
      photo_url: '/images/faculty/ahn-jong-gu.png',
      color_variant: 'green-solid',
      quote: '실무 중심의 교육으로 현장에서 즉시 활약할 수 있는 전문가를 키웁니다.',
      sort_order: 5,
    },
    {
      id: 'yuk-sim-woong',
      name_en: 'YUKSIM-WOONG',
      name_ko: '육심웅',
      role: '교수',
      photo_url: '/images/faculty/yuk-sim-woong.png',
      color_variant: 'green-gradient',
      quote: '디지털 시대의 변화를 이끄는 창의적 콘텐츠 크리에이터를 함께 만들어갑니다.',
      email: 'swryuk@dba.ac.kr',
      education: ['중앙대학교 첨단영상대학원 석사'],
      career: ['현) 동아방송예술대학교 뉴미디어콘텐츠과 교수'],
      sort_order: 6,
    },
    {
      id: 'park-min-yu',
      name_en: 'PARKMIN-YU',
      name_ko: '박민유',
      role: '조교',
      photo_url: '/images/faculty/park-min-yu.png',
      color_variant: 'yellow',
      quote: '학과 생활의 첫걸음을 함께하며 든든한 지원군이 되겠습니다.',
      sort_order: 10,
    },
  ]

  await seedTable('faculty', rows)
}

// ── 수상 ─────────────────────────────────────────────────
async function seedAwards() {
  const rows = [
    {
      competition: '대한민국 광고대상',
      award_name: '금상',
      winner: '홍길동',
      team_members: ['홍길동', '이영희'],
      year: 2025,
      category: '광고',
      hosted_by: '한국광고총연합회',
      description: '국내 최고 권위의 광고 시상식에서 금상을 수상하였습니다. 혁신적인 디지털 광고 캠페인으로 심사위원단의 높은 평가를 받았습니다. 브랜드 스토리텔링과 감각적인 영상 편집이 돋보였으며, 수용자 분석을 바탕으로 한 타깃 메시지 전달이 특히 인정받았습니다.',
    },
    {
      competition: 'K-콘텐츠 공모전',
      award_name: '최우수상',
      winner: '이영희',
      team_members: ['이영희'],
      year: 2025,
      category: '콘텐츠',
      hosted_by: '문화체육관광부',
      description: 'K-콘텐츠의 글로벌 경쟁력을 높이기 위한 공모전에서 최우수상을 수상하였습니다. 한국 문화의 독창성을 현대적 감각으로 재해석한 작품으로 심사위원들로부터 호평을 받았습니다.',
    },
    {
      competition: '방송영상 콘텐츠 경진대회',
      award_name: '우수상',
      winner: '김민수',
      team_members: ['김민수', '박태양'],
      year: 2024,
      category: '영상',
      hosted_by: '한국방송영상산업진흥원',
      description: '방송영상 분야의 신진 창작자를 발굴하는 경진대회에서 우수상을 수상하였습니다. 독창적인 서사 구조와 뛰어난 영상미로 심사위원단의 호평을 받았습니다.',
    },
    {
      competition: '전국 대학생 미디어 공모전',
      award_name: '장려상',
      winner: '최지우',
      team_members: ['최지우'],
      year: 2024,
      category: '미디어',
      hosted_by: '한국미디어학회',
      description: '전국 대학생을 대상으로 한 미디어 공모전에서 장려상을 수상하였습니다.',
    },
    {
      competition: '한국광고학회 공모전',
      award_name: '대상',
      winner: '박서연',
      team_members: ['박서연', '김도현'],
      year: 2024,
      category: '광고',
      hosted_by: '한국광고학회',
      description: '한국광고학회 주관 공모전에서 영예의 대상을 수상하였습니다. 데이터 기반의 광고 전략과 창의적인 크리에이티브의 조화로 대상의 영예를 안았습니다.',
    },
    {
      competition: '디지털 콘텐츠 창작 경진대회',
      award_name: '우수상',
      winner: '이준호',
      team_members: ['이준호'],
      year: 2024,
      category: '디지털',
      hosted_by: '한국콘텐츠진흥원',
      description: '디지털 환경에서의 창의적 콘텐츠 제작 역량을 겨루는 경진대회에서 우수상을 수상하였습니다.',
    },
    {
      competition: '대학생 영상 페스티벌',
      award_name: '최우수상',
      winner: '박나연',
      team_members: ['박나연', '강민준'],
      year: 2023,
      category: '영상',
      hosted_by: '대학영화제연합',
      description: '대학생 영상 창작자들의 축제에서 최우수상을 수상하였습니다. 실험적인 영상 언어와 독창적인 내러티브로 심사위원의 극찬을 받았습니다.',
    },
    {
      competition: 'NCR 트렌드 리포트 공모전',
      award_name: '대상',
      winner: '정은서',
      team_members: ['정은서'],
      year: 2023,
      category: '리포트',
      hosted_by: 'NCR',
      description: 'NCR에서 주관하는 미디어 트렌드 리포트 공모전에서 대상을 수상하였습니다.',
    },
    {
      competition: '스마트 미디어 어워드',
      award_name: '금상',
      winner: '한서윤',
      team_members: ['한서윤', '임지민'],
      year: 2023,
      category: '스마트미디어',
      hosted_by: '스마트미디어산업진흥협회',
      description: '스마트 미디어 분야의 혁신적인 작품을 선정하는 어워드에서 금상을 수상하였습니다.',
    },
    {
      competition: '전국 방송 콘텐츠 공모전',
      award_name: '장려상',
      winner: '오현석',
      team_members: ['오현석'],
      year: 2023,
      category: '방송',
      hosted_by: '방송통신위원회',
      description: '전국 단위의 방송 콘텐츠 공모전에서 장려상을 수상하였습니다.',
    },
    {
      competition: '대한민국 학생 창작 공모전',
      award_name: '우수상',
      winner: '노지연',
      team_members: ['노지연', '황민서'],
      year: 2022,
      category: '미디어아트',
      hosted_by: '한국예술문화단체총연합회',
      description: '대한민국 학생 창작 공모전에서 우수상을 수상하였습니다. 실험적인 미디어 아트 작품으로 창의성과 기술력을 동시에 인정받았습니다.',
    },
  ]

  console.log(`\n📦 awards 시딩 중... (${rows.length}개)`)
  // awards는 UUID PK라 competition+year 기준으로 중복 체크
  for (const row of rows) {
    const { data: existing } = await supabase
      .from('awards')
      .select('id')
      .eq('competition', row.competition)
      .eq('year', row.year)
      .maybeSingle()

    if (existing) {
      console.log(`  ↩ SKIP: ${row.competition} ${row.year}`)
      continue
    }
    const { error } = await supabase.from('awards').insert(row)
    if (error) {
      console.error(`  ❌ INSERT 실패 (${row.competition}):`, error.message)
    } else {
      console.log(`  ✅ INSERT: ${row.competition} ${row.year} - ${row.award_name}`)
    }
  }
}

// ── 프로젝트 ──────────────────────────────────────────────
async function seedProjects() {
  const rows = [
    {
      title: '○○ 기업 브랜드 영상 제작',
      type: 'industry',
      partner: '○○ 주식회사',
      year: 2025,
      description: '산학협력을 통한 기업 홍보 영상 제작 프로젝트입니다. 브랜드 아이덴티티를 영상으로 표현하는 과정에서 학생들이 실무 경험을 쌓았습니다.',
      participants: ['홍길동', '이영희', '김민수'],
      duration: '2025.03 – 2025.06',
      outcome: '기업 공식 유튜브 채널 업로드 및 사내 행사 활용',
      skills: ['영상 기획', '촬영', '편집', '모션그래픽'],
    },
    {
      title: '해외 미디어아트 교류전',
      type: 'international',
      partner: '일본 ○○대학교',
      year: 2024,
      description: '일본 자매결연 대학과의 공동 미디어아트 전시 프로젝트입니다. 양교 학생들이 공동으로 작품을 기획·제작하여 양국의 문화적 감수성을 담은 미디어아트를 선보였습니다.',
      participants: ['박나연', '최지우', '정은서'],
      duration: '2024.08 – 2024.11',
      outcome: '도쿄 갤러리 전시 및 온라인 아카이브 공개',
      skills: ['미디어아트', '설치미술', '인터랙션 디자인'],
    },
    {
      title: '지역 문화콘텐츠 제작 지원',
      type: 'industry',
      partner: '○○ 시청',
      year: 2024,
      description: '지역 문화 홍보 콘텐츠 기획 및 제작 프로젝트입니다. 지역의 역사·문화 자원을 발굴하고 이를 영상·그래픽 콘텐츠로 제작하여 시민들과 소통하였습니다.',
      participants: ['한서윤', '이준호'],
      duration: '2024.04 – 2024.07',
      outcome: '시청 공식 SNS 채널 콘텐츠 시리즈 제작 완료',
      skills: ['콘텐츠 기획', '영상 제작', '그래픽 디자인', 'SNS 마케팅'],
    },
    {
      title: '베트남 RMIT 글로벌 워크숍',
      type: 'international',
      partner: 'RMIT Vietnam',
      year: 2024,
      description: 'M-NODE: DIMA KR × RMIT VN 글로벌 워크숍 참가 프로젝트입니다. 한국과 베트남 학생들이 함께 디지털 미디어 아트 작품을 기획·제작하는 집중 워크숍에 참여하였습니다.',
      participants: ['박서연', '김도현', '오현석'],
      duration: '2024.07 (2주)',
      outcome: '합동 전시회 및 결과 보고서 발표',
      skills: ['국제 협업', '디지털 미디어', '프로젝트 매니지먼트'],
    },
    {
      title: '보성 미디어파사드 워크숍',
      type: 'industry',
      partner: '보성군',
      year: 2025,
      description: '지자체 연계 미디어파사드 콘텐츠 제작 실습 프로젝트입니다. 보성의 자연경관과 차(茶) 문화를 모티프로 한 대형 미디어파사드 콘텐츠를 기획·제작하였습니다.',
      participants: ['노지연', '황민서', '강민준'],
      duration: '2025.05 – 2025.06',
      outcome: '보성 녹차밭 야간 미디어파사드 행사 운영',
      skills: ['미디어파사드', '모션그래픽', '공간연출'],
    },
    {
      title: '○○ 공공기관 홍보영상',
      type: 'industry',
      partner: '○○ 공단',
      year: 2023,
      description: '공공기관 대상 홍보 영상 기획 및 제작 프로젝트입니다. 공공 서비스의 가치를 시민들에게 친근하게 전달하기 위한 스토리텔링 방식을 연구하고 적용하였습니다.',
      participants: ['임지민', '윤채원'],
      duration: '2023.09 – 2023.12',
      outcome: '공단 공식 채널 및 TV 홍보 영상 납품',
      skills: ['영상 기획', '인터뷰 촬영', '후반 제작'],
    },
  ]

  console.log(`\n📦 projects 시딩 중... (${rows.length}개)`)
  for (const row of rows) {
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('title', row.title)
      .eq('year', row.year)
      .maybeSingle()

    if (existing) {
      console.log(`  ↩ SKIP: ${row.title}`)
      continue
    }
    const { error } = await supabase.from('projects').insert(row)
    if (error) {
      console.error(`  ❌ INSERT 실패 (${row.title}):`, error.message)
    } else {
      console.log(`  ✅ INSERT: ${row.title} (${row.type})`)
    }
  }
}

// ── 이벤트 ────────────────────────────────────────────────
async function seedEvents() {
  const rows = [
    {
      title: '미디어 산업 트렌드 특강',
      type: '특강',
      start_date: '2025-06-15',
      location: '본관 강당',
      description: '현직 방송 PD 초청 특강 — 변화하는 OTT 시장과 콘텐츠 전략을 현장 관점에서 들어봅니다.',
      is_published: true,
    },
    {
      title: '영상 편집 심화 워크숍',
      type: '워크숍',
      start_date: '2025-06-22',
      location: '실습실 201',
      description: '프리미어 프로 & 다빈치 리졸브 고급 과정. 색 보정과 사운드 믹싱까지 실전 중심으로 진행합니다.',
      is_published: true,
    },
    {
      title: '오픈 캠퍼스 Day',
      type: '캠퍼스투어',
      start_date: '2025-07-05',
      location: '학과 전체',
      description: '입시생 대상 학과 탐방 행사. 재학생과 교수진이 직접 학과 시설을 안내합니다.',
      is_published: true,
    },
    {
      title: 'AI 콘텐츠 제작 세미나',
      type: '특강',
      start_date: '2025-07-18',
      location: '미디어 스튜디오',
      description: '생성 AI를 활용한 영상·이미지 콘텐츠 제작 최신 트렌드 세미나.',
      is_published: true,
    },
    {
      title: '졸업전시 기획 워크숍',
      type: '워크숍',
      start_date: '2025-08-02',
      location: '세미나실 302',
      description: '2025 졸업전시 준비를 위한 기획·연출 워크숍. 4학년 전용 프로그램.',
      is_published: true,
    },
  ]

  console.log(`\n📦 events 시딩 중... (${rows.length}개)`)
  for (const row of rows) {
    const { data: existing } = await supabase
      .from('events')
      .select('id')
      .eq('title', row.title)
      .eq('start_date', row.start_date)
      .maybeSingle()

    if (existing) {
      console.log(`  ↩ SKIP: ${row.title}`)
      continue
    }
    const { error } = await supabase.from('events').insert(row)
    if (error) {
      console.error(`  ❌ INSERT 실패 (${row.title}):`, error.message)
    } else {
      console.log(`  ✅ INSERT: ${row.title}`)
    }
  }
}

// ── 쇼케이스 작품 ─────────────────────────────────────────
async function seedShowcaseWorks() {
  type ShowcaseWorkSeedRow = {
    title: string
    author: string
    year: number
    description: string
    type: string
    tech_stack: string[]
    view_count: number
    video_embed?: string
    model_embed?: string
  }

  const rows: ShowcaseWorkSeedRow[] = [
    {
      title: '빛의 도시',
      author: '김민준',
      year: 2025,
      description: '도시의 빛과 그림자를 테마로 한 단편 영상 작품입니다. 어두운 도시 풍경 속에서 빛이 가진 희망의 메시지를 시각적으로 담아냈습니다. 드론 촬영과 타임랩스 기법을 결합하여 도시의 낮과 밤을 역동적으로 표현하였습니다.',
      type: 'video',
      tech_stack: ['Video', 'Motion'],
      view_count: 342,
      video_embed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    {
      title: 'Digital Fragments',
      author: '이서연',
      year: 2025,
      description: '디지털 세계와 물리 세계의 경계를 탐구하는 그래픽 디자인 시리즈입니다. 픽셀과 기하학적 형태를 활용하여 현대인의 분절된 정체성을 표현하였습니다.',
      type: 'design',
      tech_stack: ['Graphic', 'AI'],
      view_count: 218,
    },
    {
      title: '도시의 소리',
      author: '박태양',
      year: 2025,
      description: '도시 공간의 사운드스케이프를 시각화한 인터랙티브 웹 프로젝트입니다. 사용자가 소리를 통해 도시를 새롭게 경험할 수 있도록 설계되었습니다.',
      type: 'video',
      tech_stack: ['Web', 'Video'],
      view_count: 189,
      video_embed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    {
      title: 'Metamorphosis',
      author: '최지우',
      year: 2024,
      description: '변태(Metamorphosis)를 주제로 한 3D 애니메이션 작품입니다. 블렌더를 활용하여 생명체의 변화 과정을 추상적으로 표현하였습니다.',
      type: '3d',
      tech_stack: ['Motion', 'Graphic'],
      view_count: 156,
      model_embed: 'https://sketchfab.com/models/dGtzXf5MhE54a8RgPi34Kw/embed',
    },
    {
      title: '연결의 언어',
      author: '정하늘',
      year: 2024,
      description: '사람과 사람 사이의 연결을 시각 언어로 표현한 그래픽 포스터 시리즈입니다. 타이포그래피와 일러스트레이션을 결합하여 소통의 의미를 탐구합니다.',
      type: 'design',
      tech_stack: ['Web', 'AI'],
      view_count: 134,
    },
    {
      title: 'Still Life 2024',
      author: '윤채원',
      year: 2024,
      description: '정물 사진 시리즈입니다. 일상적인 사물들을 새로운 시각으로 포착하여 평범한 것들의 아름다움을 발견합니다.',
      type: 'design',
      tech_stack: ['Photo'],
      view_count: 98,
    },
    {
      title: 'Frame by Frame',
      author: '한지수',
      year: 2024,
      description: '프레임 단위의 스톱모션 애니메이션 작품입니다. 수작업의 따뜻함과 디지털 기술이 조화를 이룹니다.',
      type: 'video',
      tech_stack: ['Motion', 'Video'],
      view_count: 87,
    },
    {
      title: '픽셀 사이로',
      author: '오세준',
      year: 2023,
      description: '픽셀아트와 현대 그래픽 디자인을 융합한 포스터 시리즈입니다. 디지털의 근원으로 돌아가는 여정을 표현했습니다.',
      type: 'design',
      tech_stack: ['Graphic', 'Web'],
      view_count: 73,
    },
    {
      title: 'Neon Dreams',
      author: '신예림',
      year: 2023,
      description: '네온 조명과 도시 야경을 주제로 한 영상 작품입니다. AI 색상 보정 기술을 활용하여 몽환적인 분위기를 연출했습니다.',
      type: 'video',
      tech_stack: ['Video', 'AI'],
      view_count: 61,
    },
  ]

  console.log(`\n📦 showcase_works 시딩 중... (${rows.length}개)`)
  for (const row of rows) {
    const { data: existing } = await supabase
      .from('showcase_works')
      .select('id')
      .eq('title', row.title)
      .eq('author', row.author)
      .maybeSingle()

    if (existing) {
      console.log(`  ↩ SKIP: ${row.title}`)
      continue
    }
    const { error } = await supabase.from('showcase_works').insert(row)
    if (error) {
      console.error(`  ❌ INSERT 실패 (${row.title}):`, error.message)
    } else {
      console.log(`  ✅ INSERT: ${row.title} by ${row.author}`)
    }
  }
}

// ── 졸업전시 ──────────────────────────────────────────────
async function seedExhibitions() {
  const rows = [
    { year: 2025, title: 'FLUX — 흐름과 변화', description: '2025 졸업전시', theme: '변화와 흐름의 미학' },
    { year: 2024, title: 'SIGNAL — 신호와 연결', description: '2024 졸업전시', theme: '연결과 소통의 시대' },
    { year: 2023, title: 'BOUNDARY — 경계를 넘어', description: '2023 졸업전시', theme: '경계 해체와 융합' },
    { year: 2022, title: 'NODE — 연결의 시작', description: '2022 졸업전시', theme: '네트워크와 관계망' },
    { year: 2021, title: 'PIXEL — 디지털의 근원', description: '2021 졸업전시', theme: '디지털 본질 탐구' },
  ]

  console.log(`\n📦 exhibitions 시딩 중... (${rows.length}개)`)
  for (const row of rows) {
    const { data: existing } = await supabase
      .from('exhibitions')
      .select('id')
      .eq('year', row.year)
      .maybeSingle()

    if (existing) {
      console.log(`  ↩ SKIP: ${row.year} ${row.title}`)
      continue
    }
    const { error } = await supabase.from('exhibitions').insert(row)
    if (error) {
      console.error(`  ❌ INSERT 실패 (${row.year}):`, error.message)
    } else {
      console.log(`  ✅ INSERT: ${row.year} ${row.title}`)
    }
  }
}

// ── NCR 리포트 ────────────────────────────────────────────
async function seedNcrReports() {
  const rows = [
    {
      title: 'AI가 바꾸는 미디어 콘텐츠 산업의 미래',
      author: 'NCR 에디터팀',
      type: 'editorial',
      season: 'Season 3',
      published_at: new Date('2025-05-10').toISOString(),
      excerpt: 'AI 기술의 발전이 미디어 콘텐츠 산업에 근본적인 변화를 일으키고 있다. 제작 비용 절감부터 개인화 추천까지...',
      description: 'AI 기술의 발전이 미디어 콘텐츠 산업 전반에 가져오는 혁신적인 변화를 분석합니다.',
      content: `인공지능(AI) 기술의 급격한 발전이 미디어 콘텐츠 산업에 근본적인 변화를 일으키고 있습니다.

## 생성형 AI의 콘텐츠 제작 혁신

생성형 AI는 콘텐츠 제작의 속도와 다양성을 획기적으로 높이고 있습니다. 과거에는 전문 인력과 많은 시간이 필요했던 작업들이 이제는 AI의 도움으로 빠르게 완성될 수 있게 되었습니다.

## 크리에이터 이코노미와 AI의 만남

독립 크리에이터들에게 AI는 거대한 기회입니다. 1인 제작사가 대형 스튜디오 수준의 퀄리티를 구현할 수 있는 시대가 도래했습니다.

## 미래를 위한 준비

AI와의 협업을 통해 인간의 창의성을 증폭시키는 방향으로 나아가는 것이 미래 미디어 인재의 방향성입니다.`,
      tags: ['AI', '미디어', '콘텐츠산업', '크리에이터'],
      read_time: '8분',
      is_published: true,
    },
    {
      title: '쇼츠 시대의 스토리텔링 전략',
      author: 'NCR 트렌드팀',
      type: 'trend',
      season: 'Season 3',
      published_at: new Date('2025-04-22').toISOString(),
      excerpt: '60초 안에 시청자를 사로잡는 숏폼 콘텐츠. 기승전결 없이도 강렬한 인상을 남기는 법을 분석한다.',
      description: '유튜브 쇼츠, 릴스, 틱톡으로 대표되는 숏폼 콘텐츠 시대에 효과적인 스토리텔링 전략을 분석합니다.',
      content: `60초 이하의 짧은 영상 포맷, 이른바 '쇼츠(Shorts)'가 전 세계 콘텐츠 소비의 주류로 자리잡고 있습니다.

## 3초 안에 시선을 잡아라

숏폼 콘텐츠에서 가장 중요한 것은 처음 3초입니다. 스크롤을 멈추게 하는 강렬한 훅(Hook)이 없다면 시청자는 이미 다음 영상으로 넘어가 있습니다.

## 수직형 프레임의 미학

9:16 세로형 화면 비율은 단순한 기술적 규격이 아니라 새로운 미적 언어입니다.`,
      tags: ['쇼츠', '숏폼', '스토리텔링', 'SNS'],
      read_time: '6분',
      is_published: true,
    },
    {
      title: '메타버스 콘텐츠 창작자가 되는 법',
      author: 'NCR 카드뉴스팀',
      type: 'card_news',
      season: 'Season 3',
      published_at: new Date('2025-04-05').toISOString(),
      excerpt: '가상 공간 속 새로운 미디어 생태계. 메타버스 플랫폼에서 크리에이터로 살아남는 핵심 전략.',
      description: '메타버스 플랫폼에서 활동하는 콘텐츠 창작자가 되기 위한 필수 지식과 진입 전략을 소개합니다.',
      content: `메타버스는 단순한 가상현실 공간을 넘어 새로운 경제 생태계가 되고 있습니다.

## 메타버스 창작자가 갖춰야 할 역량

3D 모델링과 애니메이션의 기초 이해, 플랫폼별 도구 활용 능력, 그리고 커뮤니티와 소통하는 능력이 핵심입니다.

## 수익화 전략

아이템 판매, 경험(Experience) 제공, 브랜드 협업 등 다양한 수익 모델이 존재합니다.`,
      tags: ['메타버스', '3D', '창작자', 'VR'],
      read_time: '4분',
      is_published: true,
    },
    {
      title: 'K-콘텐츠, 글로벌 플랫폼을 공략하라',
      author: 'NCR 에디터팀',
      type: 'editorial',
      season: 'Season 2',
      published_at: new Date('2025-03-18').toISOString(),
      excerpt: 'K-드라마, K-팝을 넘어 이제는 K-콘텐츠 전반이 글로벌 OTT를 장악하고 있다. 그 핵심 동력은 무엇인가.',
      description: '한류 콘텐츠가 넷플릭스, 디즈니플러스 등 글로벌 OTT 플랫폼에서 성공을 거두는 전략을 분석합니다.',
      content: `K-드라마, K-팝, K-무비로 대표되는 한국 콘텐츠가 전 세계 시청자를 사로잡고 있습니다.

## 보편성과 한국성의 조화

성공한 K-콘텐츠들의 공통점은 한국적 특수성을 유지하면서도 보편적 감정에 호소한다는 점입니다.

## 플랫폼별 현지화 전략

글로벌 플랫폼마다 주 이용자층과 콘텐츠 소비 패턴이 다릅니다. 넷플릭스, 틱톡, 유튜브 각각에 맞는 포맷과 마케팅 전략이 필요합니다.`,
      tags: ['K-콘텐츠', '글로벌', 'OTT', '한류'],
      read_time: '10분',
      is_published: true,
    },
  ]

  console.log(`\n📦 ncr_reports 시딩 중... (${rows.length}개)`)
  for (const row of rows) {
    const { data: existing } = await supabase
      .from('ncr_reports')
      .select('id')
      .eq('title', row.title)
      .maybeSingle()

    if (existing) {
      console.log(`  ↩ SKIP: ${row.title}`)
      continue
    }
    const { error } = await supabase.from('ncr_reports').insert(row)
    if (error) {
      console.error(`  ❌ INSERT 실패 (${row.title}):`, error.message)
    } else {
      console.log(`  ✅ INSERT: ${row.title}`)
    }
  }
}

// ── 메인 ─────────────────────────────────────────────────
async function main() {
  console.log('🌱 NWCN Supabase 시딩 시작\n')
  console.log(`URL: ${supabaseUrl}`)

  await seedFaculty()
  await seedAwards()
  await seedProjects()
  await seedEvents()
  await seedShowcaseWorks()
  await seedExhibitions()
  await seedNcrReports()

  console.log('\n✅ 시딩 완료!')
}

main().catch((err) => {
  console.error('💥 시딩 중 오류 발생:', err)
  process.exit(1)
})
