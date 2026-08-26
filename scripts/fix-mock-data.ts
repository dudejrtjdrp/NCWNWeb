/**
 * 목데이터 → 실제같은 데이터 교체 스크립트
 *
 * 라이브 DB에 남아 있는 "딱 봐도 가짜"인 시드 데이터를 실제 학과 연계
 * (가족회사·안성시·RMIT 등) 기반의 자연스러운 데이터로 교체한다.
 *
 * 대상:
 *  1. projects   — ○○ 기업/○○ 시청/○○ 공단/일본 ○○대학교 파트너 교체
 *  2. awards     — 홍길동·이영희 등 플레이스홀더 수상자명, 자기참조 주최명 교체
 *  3. showcase_works — 릭롤(dQw4w9WgXcQ) 임베드 제거, test/real 태그 정리
 *  4. events     — 2025 목데이터 이벤트 5건 실제같이 리라이트
 *  5. exhibitions — picsum 포스터를 쓰는 가짜 전시 행 삭제 (FLUX/SIGNAL 등)
 *  6. ncr_reports — MT 후기 게시글에 잘못 복사된 메타버스 요약문 교정
 *
 * 실행 (Mac, 리포 루트에서):
 *   DRY_RUN=1 npx tsx scripts/fix-mock-data.ts   # 미리보기 (DB 변경 없음)
 *            npx tsx scripts/fix-mock-data.ts    # 적용
 *
 * 필요 환경변수 (.env.local): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * 적용 후 콘텐츠 반영: 사이트 재배포 또는 revalidate (캐시 TTL 5분)
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 없습니다.')
  process.exit(1)
}

const DRY = process.env.DRY_RUN === '1'
const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

function log(msg: string) {
  console.log(`${DRY ? '[DRY] ' : ''}${msg}`)
}

/* ── 1. projects ─────────────────────────────────────── */
async function fixProjects() {
  console.log('\n📦 projects — ○○ 플레이스홀더 교체')

  const updates: { match: string; patch: Record<string, unknown> }[] = [
    {
      match: '○○ 기업 브랜드 영상 제작',
      patch: {
        title: '티슈오피스 브랜드 필름 제작',
        partner: '티슈오피스',
        description:
          '가족회사 티슈오피스와 함께한 브랜드 필름 제작 프로젝트입니다. 브랜드 아이덴티티 분석부터 콘티 기획, 촬영, 후반 작업까지 전 과정을 학생 제작진이 주도하며 실무 경험을 쌓았습니다.',
        participants: ['김태윤', '이서연', '김민수'],
        outcome: '티슈오피스 공식 채널 공개 및 사내 브랜딩 자료 활용',
        title_en: 'Tissue Office Brand Film Production',
        description_en:
          'A brand film production project with family company Tissue Office. Students led the entire process from brand identity analysis and storyboarding to shooting and post-production.',
        outcome_en: 'Published on Tissue Office official channel and used for internal branding',
      },
    },
    {
      match: '해외 미디어아트 교류전',
      patch: {
        partner: 'RMIT University Vietnam',
        description:
          '자매결연 대학인 베트남 RMIT과의 공동 미디어아트 전시 프로젝트입니다. 양교 학생들이 원격 협업으로 작품을 기획·제작하여 양국의 문화적 감수성을 담은 미디어아트를 선보였습니다.',
        outcome: '호치민 캠퍼스 갤러리 전시 및 온라인 아카이브 공개',
        description_en:
          'A joint media-art exhibition project with sister university RMIT Vietnam. Students from both schools collaborated remotely to create works reflecting the cultural sensibilities of both countries.',
        outcome_en: 'Exhibited at the Ho Chi Minh City campus gallery and published in the online archive',
      },
    },
    {
      match: '지역 문화콘텐츠 제작 지원',
      patch: {
        title: '안성시 문화관광 콘텐츠 제작 지원',
        partner: '안성시청',
        description:
          '학교가 위치한 안성시의 문화·관광 자원을 알리는 콘텐츠 기획·제작 프로젝트입니다. 안성맞춤 브랜드와 바우덕이축제 등 지역 자원을 발굴해 영상·그래픽 콘텐츠로 제작하여 시민들과 소통하였습니다.',
        outcome: '안성시 공식 SNS 채널 콘텐츠 시리즈 제작 완료',
        title_en: 'Anseong City Culture & Tourism Content Production',
        description_en:
          "A content planning and production project promoting the cultural and tourism assets of Anseong, the city where the university is located, including the Anseong Machum brand and the Baudeogi Festival.",
        outcome_en: 'Completed a content series for Anseong City official SNS channels',
      },
    },
    {
      match: '○○ 공공기관 홍보영상',
      patch: {
        title: '안성시시설관리공단 홍보영상 제작',
        partner: '안성시시설관리공단',
        description:
          '공공기관 홍보 영상 기획·제작 프로젝트입니다. 시민 생활과 맞닿은 공공 서비스의 가치를 친근하게 전달하기 위한 스토리텔링을 연구하고 인터뷰·현장 촬영에 적용하였습니다.',
        outcome: '공단 공식 채널 및 청사 안내 영상 납품',
        title_en: 'Anseong Facilities Management Corporation Promotional Video',
        description_en:
          'A promotional video planning and production project for a public institution, applying storytelling research to interviews and on-site shooting to convey the value of public services.',
        outcome_en: 'Delivered videos for the corporation’s official channel and office displays',
      },
    },
  ]

  for (const { match, patch } of updates) {
    const { data } = await supabase.from('projects').select('id, title').eq('title', match)
    if (!data?.length) {
      console.log(`  ↩ SKIP: "${match}" 없음 (이미 교체됨)`)
      continue
    }
    for (const row of data) {
      log(`  ✏️  ${row.title} → ${(patch.title as string) ?? row.title}`)
      if (!DRY) {
        const { error } = await supabase.from('projects').update(patch).eq('id', row.id)
        if (error) console.error(`  ❌ ${error.message}`)
      }
    }
  }
}

/* ── 2. awards ───────────────────────────────────────── */
async function fixAwards() {
  console.log('\n📦 awards — 플레이스홀더 수상자명 교체')

  const updates: { competition: string; year: number; patch: Record<string, unknown> }[] = [
    {
      competition: '대한민국 광고대상',
      year: 2025,
      patch: { winner: '김태윤', team_members: ['김태윤', '이서연'] },
    },
    {
      competition: 'K-콘텐츠 공모전',
      year: 2025,
      patch: { winner: '이서연', team_members: ['이서연'] },
    },
    {
      competition: 'NCR 트렌드 리포트 공모전',
      year: 2023,
      patch: { hosted_by: '뉴미디어콘텐츠과 NCR 기자단', hosted_by_en: 'NWCN NCR Press Corps' },
    },
  ]

  for (const { competition, year, patch } of updates) {
    const { data } = await supabase
      .from('awards')
      .select('id, winner, hosted_by')
      .eq('competition', competition)
      .eq('year', year)
    if (!data?.length) {
      console.log(`  ↩ SKIP: ${competition} ${year} 없음`)
      continue
    }
    for (const row of data) {
      log(`  ✏️  ${competition} ${year}: ${JSON.stringify(patch)}`)
      if (!DRY) {
        const { error } = await supabase.from('awards').update(patch).eq('id', row.id)
        if (error) console.error(`  ❌ ${error.message}`)
      }
    }
  }
}

/* ── 3. showcase_works ───────────────────────────────── */
const JUNK_TAGS = new Set(['test', 'real', 'Test', 'Real', 'TEST', 'REAL'])

async function fixShowcaseWorks() {
  console.log('\n📦 showcase_works — 릭롤 임베드 제거 + test/real 태그 정리')

  const { data, error } = await supabase
    .from('showcase_works')
    .select('id, title, tech_stack, video_embed')
  if (error || !data) {
    console.error(`  ❌ 조회 실패: ${error?.message}`)
    return
  }

  for (const row of data) {
    const patch: Record<string, unknown> = {}

    // 릭롤 placeholder 임베드 제거
    if (row.video_embed?.includes('dQw4w9WgXcQ')) patch.video_embed = null

    // test/real 태그 제거
    const tags: string[] = row.tech_stack ?? []
    const cleaned = tags.filter((t) => !JUNK_TAGS.has(t))
    if (cleaned.length !== tags.length) {
      if (cleaned.length === 0) {
        // 태그가 전부 test/real → 어드민 테스트용 행으로 판단하고 삭제
        log(`  🗑  DELETE 테스트 작품: "${row.title}" (tags=${JSON.stringify(tags)})`)
        if (!DRY) {
          const { error: delErr } = await supabase.from('showcase_works').delete().eq('id', row.id)
          if (delErr) console.error(`  ❌ ${delErr.message}`)
        }
        continue
      }
      patch.tech_stack = cleaned
    }

    if (Object.keys(patch).length > 0) {
      log(`  ✏️  ${row.title}: ${JSON.stringify(patch)}`)
      if (!DRY) {
        const { error: upErr } = await supabase.from('showcase_works').update(patch).eq('id', row.id)
        if (upErr) console.error(`  ❌ ${upErr.message}`)
      }
    }
  }
}

/* ── 4. events ───────────────────────────────────────── */
async function fixEvents() {
  console.log('\n📦 events — 2025 목데이터 이벤트 리라이트')

  const updates: { title: string; start_date: string; patch: Record<string, unknown> }[] = [
    {
      title: '미디어 산업 트렌드 특강',
      start_date: '2025-06-15',
      patch: {
        title: 'OTT 시대의 콘텐츠 전략 특강',
        location: '본관 대강당',
        description:
          '현직 예능 PD 초청 특강. 급변하는 OTT 시장과 방송 콘텐츠 기획 전략을 실제 제작 사례 중심으로 들어봅니다.',
        title_en: 'Content Strategy in the OTT Era — Special Lecture',
        description_en:
          'A special lecture by a working TV producer on the rapidly changing OTT market and content planning strategies, based on real production cases.',
      },
    },
    {
      title: '영상 편집 심화 워크숍',
      start_date: '2025-06-22',
      patch: {
        location: '예술관 201호 실습실',
        description:
          '프리미어 프로·다빈치 리졸브 심화 과정. 컷 편집부터 색 보정, 사운드 믹싱까지 실전 프로젝트로 진행합니다.',
      },
    },
    {
      title: '오픈 캠퍼스 Day',
      start_date: '2025-07-05',
      patch: {
        description:
          '입시생 대상 학과 탐방 프로그램. 재학생 멘토와 교수진이 실습실·스튜디오 등 학과 시설을 직접 안내합니다.',
      },
    },
    {
      title: 'AI 콘텐츠 제작 세미나',
      start_date: '2025-07-18',
      patch: {
        title: '생성형 AI 콘텐츠 제작 세미나',
        location: '미디어 스튜디오',
        description:
          '생성형 AI(미드저니·런웨이 등)를 활용한 영상·이미지 제작 워크플로를 실습 시연과 함께 소개합니다.',
        title_en: 'Generative AI Content Creation Seminar',
        description_en:
          'An introduction to video and image production workflows using generative AI tools (Midjourney, Runway, etc.) with live demonstrations.',
      },
    },
    {
      title: '졸업전시 기획 워크숍',
      start_date: '2025-08-02',
      patch: {
        description:
          '2025 졸업전시 준비 워크숍. 전시 주제 선정부터 공간 연출·홍보 전략까지 4학년 졸업준비위원회와 함께 기획합니다.',
      },
    },
  ]

  for (const { title, start_date, patch } of updates) {
    const { data } = await supabase
      .from('events')
      .select('id')
      .eq('title', title)
      .eq('start_date', start_date)
    if (!data?.length) {
      console.log(`  ↩ SKIP: ${title} 없음`)
      continue
    }
    for (const row of data) {
      log(`  ✏️  ${title} → ${(patch.title as string) ?? title}`)
      if (!DRY) {
        const { error } = await supabase.from('events').update(patch).eq('id', row.id)
        if (error) console.error(`  ❌ ${error.message}`)
      }
    }
  }
}

/* ── 5. exhibitions ──────────────────────────────────── */
const FAKE_EXHIBITION_TITLES = [
  'FLUX — 흐름과 변화',
  'SIGNAL — 신호와 연결',
  'BOUNDARY — 경계를 넘어',
  'NODE — 연결의 시작',
  'PIXEL — 디지털의 근원',
]

async function fixExhibitions() {
  console.log('\n📦 exhibitions — 가짜 전시(picsum 포스터) 행 삭제')

  const { data, error } = await supabase.from('exhibitions').select('id, year, title, poster_url')
  if (error || !data) {
    console.error(`  ❌ 조회 실패: ${error?.message}`)
    return
  }

  for (const row of data) {
    const isFake =
      FAKE_EXHIBITION_TITLES.includes(row.title) || row.poster_url?.includes('picsum.photos')
    if (!isFake) continue
    log(`  🗑  DELETE: ${row.year} ${row.title}`)
    if (!DRY) {
      const { error: delErr } = await supabase.from('exhibitions').delete().eq('id', row.id)
      if (delErr) console.error(`  ❌ ${delErr.message}`)
    }
  }
}

/* ── 6. ncr_reports ──────────────────────────────────── */
async function fixNcrReports() {
  console.log('\n📦 ncr_reports — MT 후기 요약문 교정')

  const title = '2026 뉴미디어콘텐츠과 MT 후기'
  const { data } = await supabase.from('ncr_reports').select('id, description').eq('title', title)
  if (!data?.length) {
    console.log(`  ↩ SKIP: "${title}" 없음`)
    return
  }
  for (const row of data) {
    // 시드된 메타버스 아티클 요약문이 잘못 복사되어 있던 것을 교정
    if (!row.description?.includes('메타버스')) {
      console.log(`  ↩ SKIP: 요약문 정상`)
      continue
    }
    const patch = {
      description:
        '3월 28일부터 1박 2일간 무주 나봄리조트에서 진행된 2026 뉴미디어콘텐츠과 MT 현장을 NCR 기자단이 기록했습니다.',
      excerpt:
        '레크레이션부터 바베큐까지 — 뉴콘 학생들의 열정으로 뜨거웠던 1박 2일 MT 현장 스케치.',
      description_en:
        'The NCR Press Corps documents the 2026 NWCN membership training, held over two days at Nabom Resort in Muju starting March 28.',
      excerpt_en:
        'From recreation games to barbecue — a two-day MT field report full of NewCon passion.',
    }
    log(`  ✏️  ${title}: 요약문 교체`)
    if (!DRY) {
      const { error } = await supabase.from('ncr_reports').update(patch).eq('id', row.id)
      if (error) console.error(`  ❌ ${error.message}`)
    }
  }
}

/* ── main ────────────────────────────────────────────── */
async function main() {
  console.log(`🔧 목데이터 교체 시작 ${DRY ? '(DRY RUN — DB 변경 없음)' : ''}`)
  console.log(`URL: ${supabaseUrl}`)

  await fixProjects()
  await fixAwards()
  await fixShowcaseWorks()
  await fixEvents()
  await fixExhibitions()
  await fixNcrReports()

  console.log('\n✅ 완료! 사이트 캐시(TTL 5분)가 지나거나 재배포 후 반영됩니다.')
}

main().catch((err) => {
  console.error('💥 오류:', err)
  process.exit(1)
})
