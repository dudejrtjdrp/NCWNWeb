'use client'

/**
 * BASE 컴포넌트: DepartmentSection
 * Figma node-id: 291:76  /  캔버스 1440×9455
 *
 * ※ Hero(§1) + SubNav 탭은 AboutHero 컴포넌트로 분리됨
 *    이 컴포넌트는 SubNav 아래 콘텐츠(학과소개 ~ 자격증)만 담당
 *
 * 좌표계: DeptSection y = Figma y − 64 (NavBar)
 *         이 컴포넌트 내부 y = DeptSection y − 805 (Hero 높이)
 *
 * 섹션 구성 (AboutHero 이후)
 *  §A 학과소개 인트로   0    – 1308  (h=1308)  ← Figma §2의 SubNav 제외 영역 포함
 *  §B 교육 목표        1308 – 3052  (h=1744)  ← Figma §3
 *  §C 세부 교육 목표   3052 – 3893  (h=841)   ← Figma §4
 *  §D 교육방침         3893 – 4986  (h=1093)  ← Figma §5
 *  §E 졸업 후 진로     4986 – 6778  (h=1792)  ← Figma §6
 *  §F 자격증           6778 – 7579  (h=801)   ← Figma §7
 *
 * 내부 좌표 변환: section_y = Figma_y − 64 − 805 (= Figma_y − 869)
 *   SubNav(Figma top=869)가 AboutHero로 분리됐으므로
 *   §A top=0 = Figma y=869 (SubNav top)
 */

import CertCarousel from '@/components/base/CertCarousel'

/* ─── 에셋 경로 (/public/images/department/ 로컬 저장) ─── */
const IMG = {
  arrowVec:        '/images/department/arrow-vec.png',
  symbolCardBg:    '/images/department/symbol-card-bg.png',
  symbolCardInner: '/images/department/symbol-card-inner.png',
  vecGoal:         '/images/department/vec-goal.png',
  goalCard:        '/images/department/goal-card.png',
  policyImg1:      '/images/department/policy-img1.png',
  policyImg2:      '/images/department/policy-img2.png',
  vecCareer:       '/images/department/vec-career.png',
  certBg:          '/images/department/cert-bg.png',
}

/* ─── SymbolCard ─── */
function SymbolCard() {
  return (
    <div style={{ position: 'relative', width: 606, height: 320 }}>
      <div
        style={{
          position: 'absolute',
          top: '17.19%', right: '12.71%', bottom: '3.88%', left: '25.58%',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: '-3.72% -2.51% 0 0' }}>
          <img src={IMG.symbolCardInner} alt="" style={{ display: 'block', width: '100%', height: '100%', maxWidth: 'none' }} />
        </div>
      </div>
      <img
        src={IMG.symbolCardBg}
        alt="뉴미디어콘텐츠과 상징 이미지"
        style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', maxWidth: 'none' }}
      />
    </div>
  )
}

/* ─── 교육 목표 01-05 데이터 ─── */
const GOALS = [
  { num: '01', text: '가상현실 콘텐츠 제작 전문인력양성',    numLeft: 0,   numTop: 0,   textLeft: 6,   textTop: 103, textW: 450, align: 'left'  as const },
  { num: '02', text: '인터랙티브 콘텐츠 제작 전문인력양성',  numLeft: 744, numTop: 221, textLeft: 362, textTop: 324, textW: 485, align: 'right' as const },
  { num: '03', text: '실감 콘텐츠 제작 전문인력양성',        numLeft: 7,   numTop: 442, textLeft: 7,   textTop: 545, textW: 388, align: 'left'  as const },
  { num: '04', text: '스마트미디어 콘텐츠 제작 전문인력양성', numLeft: 750, numTop: 663, textLeft: 325, textTop: 766, textW: 522, align: 'right' as const },
  { num: '05', text: '웹기반 콘텐츠 제작 전문인력양성',      numLeft: 7,   numTop: 884, textLeft: 7,   textTop: 987, textW: 415, align: 'left'  as const },
]

/* ─── 졸업 후 진로 태그 ─── */
interface CareerTag { label: string; top: number; left: string; width: number }
const CAREER_TAGS: CareerTag[] = [
  { label: '모바일 콘텐츠 기획 및 제작 전문가',  top: 701,  left: 'calc(25% + 31px)',    width: 275 },
  { label: '앱 콘텐츠 기획자',                   top: 786,  left: 'calc(33.33% + 66px)', width: 174 },
  { label: 'UI/UX 디자이너',                     top: 862,  left: 'calc(16.67% + 72px)', width: 174 },
  { label: 'UI/UX 기획자',                       top: 981,  left: 'calc(33.33% + 16px)', width: 149 },
  { label: 'AR/VR 콘텐츠제작 전문가',            top: 999,  left: 'calc(58.33% + 64px)', width: 245 },
  { label: '웹 콘텐츠 개발자',                   top: 1023, left: 'calc(8.33% + 118px)', width: 177 },
  { label: '웹사이트 기획 및 제작자',            top: 1129, left: 'calc(83.33% - 17px)', width: 214 },
  { label: '웹 콘텐츠 기획자',                   top: 1147, left: 'calc(58.33% + 25px)', width: 177 },
  { label: 'AR/VR 콘텐츠 제작자',               top: 1160, left: 'calc(25% + 73px)',     width: 235 },
  { label: '미디어 아티스트',                    top: 1171, left: '41px',                 width: 174 },
  { label: '앱 콘텐츠 개발자',                   top: 1195, left: 'calc(66.67% - 6px)',  width: 177 },
  { label: '인터넷방송 콘텐츠제작 전문가',        top: 1296, left: 'calc(8.33% + 102px)', width: 260 },
  { label: '인터랙티브 콘텐츠 기획 및 제작자',   top: 1321, left: 'calc(58.33% + 57px)', width: 296 },
  { label: '인터렉티브 퍼포먼스 기획 및 제작자', top: 1345, left: 'calc(16.67% + 97px)', width: 296 },
]

/* ─── 글래스모피즘 진로 태그 ─── */
function GlassTag({ label, width }: { label: string; width: number }) {
  return (
    <div
      style={{
        width, height: 48, borderRadius: 76,
        backdropFilter: 'blur(3.6px)',
        WebkitBackdropFilter: 'blur(3.6px)',
        background: 'rgba(9,245,147,0.06)',
        boxShadow: [
          '0px 4px 21.5px 0px rgba(0,0,0,0.25)',
          'inset 17px -26px 38.6px 0px rgba(255,255,255,0.81)',
          'inset -390px 0px 44px 0px rgba(209,209,209,0.05)',
          'inset 5px 2px 0px 0px white',
          'inset 4px 1px 0px 0px #46F5AC',
        ].join(', '),
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}
    >
      <span style={{
        fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
        fontWeight: 500, fontSize: 18, lineHeight: '27px', color: '#888', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
    </div>
  )
}


/* ══════════════════════════════════════════════════════
   메인 컴포넌트
══════════════════════════════════════════════════════ */
export default function DepartmentSection() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 1440,
        margin: '0 auto',
        overflowX: 'hidden',
        background: '#fff',
      }}
    >

      {/* ══════════════════════════════════════════
          §A  학과소개 인트로  h=1308
          Figma §2 전체 (SubNav 포함 구조 그대로 유지)
          내부 y: 0=SubNav 위치, 실제 콘텐츠는 아래
          ══════════════════════════════════════ */}
      <div style={{ position: 'relative', height: 1308, background: '#fff' }}>

        {/* 하향 화살표 — Figma: center-y=1074.5(Figma)=205(§2 내부) */}
        <div
          style={{
            position: 'absolute',
            top: 205,
            left: '50%',
            transform: 'translateX(-50%) translateY(-50%) rotate(180deg)',
            width: 64,
            height: 61,
          }}
        >
          <img src={IMG.arrowVec} alt="" aria-hidden
            style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>

        {/* "학과 소개" — Figma: center-y=1164.5→section=295 */}
        <p style={{
          position: 'absolute', top: 295, left: '50%',
          transform: 'translateX(-50%) translateY(-50%)',
          margin: 0,
          fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
          fontWeight: 700, fontSize: 24, color: '#444',
          lineHeight: 'normal', whiteSpace: 'nowrap',
        }}>
          학과 소개
        </p>

        {/* SymbolCard — Figma: top=1299(DeptSection=1235)→section=430 */}
        <div style={{ position: 'absolute', top: 430, left: '50%', transform: 'translateX(-50%)' }}>
          <SymbolCard />
        </div>

        {/* 소개 텍스트 — Figma: center-y=1836.5→section=967 */}
        <div style={{
          position: 'absolute', top: 967, left: '50%',
          transform: 'translateX(-50%) translateY(-50%)',
          textAlign: 'center', width: 860,
        }}>
          <p style={{
            margin: 0,
            fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
            fontWeight: 400, fontSize: 32, lineHeight: '37px', color: '#000',
          }}>
            뉴미디어 산업을 선도할 수 있는 융합 콘텐츠 전문인 양성
          </p>
          <p style={{
            margin: 0,
            fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
            fontWeight: 700, fontSize: 32, lineHeight: '60px',
            background: 'linear-gradient(to right, #00844D, #09F593)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            2022년 뉴미디어 콘텐츠 제작 분야 국내 Top 3
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          §B  교육 목표  h=1744
          Figma: container left=calc(16.67%+57px), w=847
          grid top = label(24px) + gap(153px) = 177px
          ══════════════════════════════════════ */}
      <div style={{ position: 'relative', height: 1744, overflow: 'hidden', background: '#fff' }}>

        {/* 배경 벡터 좌 */}
        <div style={{
          position: 'absolute', left: 'calc(4.17% + 45.64px)', top: 141,
          transform: 'translateX(-50%) translateY(-50%) rotate(48.7deg)',
          width: 757, height: 721, pointerEvents: 'none',
        }} aria-hidden>
          <img src={IMG.vecGoal} alt="" style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>

        {/* 배경 벡터 우 */}
        <div style={{
          position: 'absolute', left: 'calc(95.83% - 35.36px)', top: 330,
          transform: 'translateX(-50%) translateY(-50%) rotate(48.7deg)',
          width: 757, height: 721, pointerEvents: 'none',
        }} aria-hidden>
          <img src={IMG.vecGoal} alt="" style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>

        {/* 목표 컨테이너 */}
        <div style={{ position: 'absolute', left: 'calc(16.67% + 57px)', top: 0, width: 847 }}>
          <p style={{
            position: 'absolute', top: 0, left: 0, width: '100%', margin: 0,
            fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
            fontWeight: 700, fontSize: 24, color: '#444',
            textAlign: 'center', lineHeight: 'normal',
          }}>
            교육 목표
          </p>

          {GOALS.map((g) => (
            <div key={g.num} style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}>
              <span style={{
                position: 'absolute', top: 177 + g.numTop, left: g.numLeft,
                fontFamily: "'Nova Slim', serif",
                fontWeight: 400, fontSize: 76, lineHeight: 'normal',
                color: '#09F593', whiteSpace: 'nowrap',
              }}>
                {g.num}
              </span>
              <p style={{
                position: 'absolute', top: 177 + g.textTop, left: g.textLeft,
                width: g.textW, margin: 0,
                fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
                fontWeight: 700, fontSize: 25, lineHeight: 'normal',
                color: '#1d1d1d', textAlign: g.align,
              }}>
                {g.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          §C  세부 교육 목표  h=841
          Figma: left=106, w=1218, flex-col gap=75
          ══════════════════════════════════════ */}
      <div style={{
        position: 'relative', height: 841, background: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingLeft: 106, paddingRight: 116,
      }}>
        <p style={{
          margin: 0,
          fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
          fontWeight: 700, fontSize: 24, color: '#444',
          lineHeight: 'normal', textAlign: 'center', width: '100%',
        }}>
          세부 교육 목표
        </p>
        <div style={{ display: 'flex', gap: 42, alignItems: 'center', marginTop: 75 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ position: 'relative', width: 378, height: 283, flexShrink: 0 }}>
              <img src={IMG.goalCard} alt={`세부 교육 목표 ${i + 1}`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', maxWidth: 'none' }} />
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          §D  교육방침  h=1093
          Figma: left=98, w=1244, flex-col gap=111(label→images), images gap=41
          ══════════════════════════════════════ */}
      <div style={{ position: 'relative', height: 1093, background: '#fff' }}>
        <div style={{ position: 'absolute', left: 98, top: 0, width: 1244 }}>
          <p style={{
            margin: 0,
            fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
            fontWeight: 700, fontSize: 24, color: '#444',
            lineHeight: 'normal', textAlign: 'center',
          }}>
            교육방침
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 41, marginTop: 111 }}>

            {/* 이미지 1 — 우측 텍스트 */}
            <div style={{ display: 'inline-grid', gridTemplateColumns: 'max-content', gridTemplateRows: 'max-content' }}>
              <div style={{ gridColumn: 1, gridRow: 1, position: 'relative', width: 1244, height: 323 }}>
                <img src={IMG.policyImg1} alt="" aria-hidden
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', maxWidth: 'none' }} />
              </div>
              <div style={{
                gridColumn: 1, gridRow: 1,
                width: 1244, height: 323,
                border: '1px solid rgba(9,245,147,0.06)',
                background: 'linear-gradient(to right, rgba(0,172,101,0) 36.58%, #000 100%)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
                paddingBottom: 31, paddingRight: 35, paddingLeft: 317,
              }}>
                <p style={{
                  margin: 0,
                  fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
                  fontWeight: 500, fontSize: 18, lineHeight: '27px',
                  color: '#fff', textAlign: 'right', whiteSpace: 'nowrap',
                }}>
                  4차 산업혁명과 5G상용화에 따라 VR/AR콘텐츠, 스마트폰, 태블릿PC 등과 관련된 인터랙티브 콘텐츠(쌍방향 콘텐츠)를<br />
                  제작할 수 있는 다양한 디지털 장비와 컴퓨터를 고루 갖추어 실무에서 곧바로 사용할 수 있는 현장 중심 실무형 교육을 실시한다.
                </p>
              </div>
            </div>

            {/* 이미지 2 — 좌측 텍스트 */}
            <div style={{ display: 'inline-grid', gridTemplateColumns: 'max-content', gridTemplateRows: 'max-content' }}>
              <div style={{ gridColumn: 1, gridRow: 1, position: 'relative', width: 1244, height: 323, overflow: 'hidden' }}>
                <img src={IMG.policyImg2} alt="" aria-hidden
                  style={{ position: 'absolute', left: 0, top: '-70.47%', width: '100%', height: '282.35%', maxWidth: 'none', objectFit: 'cover' }} />
              </div>
              <div style={{
                gridColumn: 1, gridRow: 1,
                width: 1244, height: 323,
                border: '1px solid rgba(9,245,147,0.06)',
                background: 'linear-gradient(to right, #000 0%, rgba(2,66,40,0.75) 70.19%, rgba(9,245,147,0.06) 100%)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start',
                paddingBottom: 31, paddingLeft: 35, paddingRight: 82,
              }}>
                <p style={{
                  margin: 0,
                  fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
                  fontWeight: 500, fontSize: 18, lineHeight: '27px',
                  color: '#fff', whiteSpace: 'nowrap',
                }}>
                  또한, VR/AR 콘텐츠 제작을 위한 프로그래밍 기술(Java, Processing 등)과 사이트 구축을 위한 기술(HTML5, CSS3, Javascript, JSP 등)을 갖춘<br />
                  실무와 이론을 겸비한 능력을 가진다. 콘텐츠를 제작하는데 기반이 되는 기획능력, 디자인능력, 프로그래밍능력을 고루 갖추는 교육을 통해<br />
                  실무에 빠르게 적응하는 융합형 인재를 양성한다.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          §E  졸업 후 진로  h=1792
          Figma: Vector3 배경, 글래스 태그 14개
          ══════════════════════════════════════ */}
      <div style={{ position: 'relative', height: 1792, overflow: 'hidden', background: '#fff' }}>

        {/* 네트워크 배경 */}
        <div style={{
          position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)',
          width: 1452, height: 1383, pointerEvents: 'none',
        }} aria-hidden>
          <img src={IMG.vecCareer} alt="" style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>

        {/* "뉴미디어콘텐츠과는" — Figma center-y=6150.98→§6 rel=296 */}
        <div style={{
          position: 'absolute', top: 296, left: 'calc(29.17% - 12.3px)',
          transform: 'translateX(-50%) translateY(-50%) rotate(23.07deg)',
        }}>
          <span style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontWeight: 700, fontSize: 24, color: '#444', whiteSpace: 'nowrap' }}>
            뉴미디어콘텐츠과는
          </span>
        </div>
        {/* "졸업 후" — Figma center-y=6376.29→§6 rel=521 */}
        <div style={{
          position: 'absolute', top: 521, left: 'calc(58.33% - 19.71px)',
          transform: 'translateX(-50%) translateY(-50%) rotate(45deg)',
        }}>
          <span style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontWeight: 700, fontSize: 24, color: '#444', whiteSpace: 'nowrap' }}>
            졸업 후
          </span>
        </div>
        {/* "무슨 일을 하나요?" — Figma center-y=6470.38→§6 rel=615 */}
        <div style={{
          position: 'absolute', top: 615, left: 'calc(83.33% - 50.54px)',
          transform: 'translateX(-50%) translateY(-50%) rotate(-21.3deg)',
        }}>
          <span style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontWeight: 700, fontSize: 24, color: '#444', whiteSpace: 'nowrap' }}>
            무슨 일을 하나요?
          </span>
        </div>

        {/* 진로 태그 */}
        {CAREER_TAGS.map((tag) => (
          <div key={tag.label} style={{ position: 'absolute', top: tag.top, left: tag.left }}>
            <GlassTag label={tag.label} width={tag.width} />
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          §F  자격증 — Swiper Coverflow Carousel
          ══════════════════════════════════════ */}
      <CertCarousel />

    </div>
  )
}
