'use client'

/**
 * BASE 컴포넌트: DepartmentSection
 * Figma node-id: 291:76  /  캔버스 1440×9455
 *
 * ※ Hero(§1) + SubNav 탭은 AboutHero 컴포넌트로 분리됨
 *    이 컴포넌트는 SubNav 아래 콘텐츠(학과소개 ~ 자격증)만 담당
 *
 * 섹션 구성 (AboutHero 이후)
 *  §A 학과소개 인트로   0    – 1308
 *  §B 교육 목표        1308 – 3052
 *  §C 세부 교육 목표   3052 – 3893
 *  §D 교육방침         3893 – 4986
 *  §E 졸업 후 진로     4986 – 6778
 *  §F 자격증           6778 – 7579
 */

import { useTranslations } from 'next-intl'
import CertCarousel from '@/components/base/CertCarousel'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'

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
function SymbolCard({ alt }: { alt: string }) {
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
        alt={alt}
        style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', maxWidth: 'none' }}
      />
    </div>
  )
}

/* ─── 교육 목표 위치 데이터 (텍스트 제외) ─── */
const GOAL_POSITIONS = [
  { num: '01', numLeft: 0,   numTop: 0,   textLeft: 6,   textTop: 103, textW: 450, align: 'left'  as const },
  { num: '02', numLeft: 744, numTop: 221, textLeft: 362, textTop: 324, textW: 485, align: 'right' as const },
  { num: '03', numLeft: 7,   numTop: 442, textLeft: 7,   textTop: 545, textW: 388, align: 'left'  as const },
  { num: '04', numLeft: 750, numTop: 663, textLeft: 325, textTop: 766, textW: 522, align: 'right' as const },
  { num: '05', numLeft: 7,   numTop: 884, textLeft: 7,   textTop: 987, textW: 415, align: 'left'  as const },
]

/* ─── 졸업 후 진로 위치 데이터 (텍스트 제외) ─── */
const CAREER_POSITIONS = [
  { top: 701,  left: 'calc(25% + 31px)',    width: 275 },
  { top: 786,  left: 'calc(33.33% + 66px)', width: 174 },
  { top: 862,  left: 'calc(16.67% + 72px)', width: 174 },
  { top: 981,  left: 'calc(33.33% + 16px)', width: 149 },
  { top: 999,  left: 'calc(58.33% + 64px)', width: 245 },
  { top: 1023, left: 'calc(8.33% + 118px)', width: 177 },
  { top: 1129, left: 'calc(83.33% - 17px)', width: 214 },
  { top: 1147, left: 'calc(58.33% + 25px)', width: 177 },
  { top: 1160, left: 'calc(25% + 73px)',     width: 235 },
  { top: 1171, left: '41px',                 width: 174 },
  { top: 1195, left: 'calc(66.67% - 6px)',  width: 177 },
  { top: 1296, left: 'calc(8.33% + 102px)', width: 260 },
  { top: 1321, left: 'calc(58.33% + 57px)', width: 296 },
  { top: 1345, left: 'calc(16.67% + 97px)', width: 296 },
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
  const t = useTranslations('about.department')
  const goals = t.raw('goals') as string[]
  const careers = t.raw('careers') as string[]

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
          ══════════════════════════════════════ */}
      <AnimateOnScroll variant="fade-up" threshold={0.05}>
      <div style={{ position: 'relative', height: 1308, background: '#fff' }}>

        {/* 하향 화살표 */}
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

        {/* "학과 소개" 타이틀 */}
        <p style={{
          position: 'absolute', top: 295, left: '50%',
          transform: 'translateX(-50%) translateY(-50%)',
          margin: 0,
          fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
          fontWeight: 700, fontSize: 24, color: '#444',
          lineHeight: 'normal', whiteSpace: 'nowrap',
        }}>
          {t('intro')}
        </p>

        {/* SymbolCard */}
        <div style={{ position: 'absolute', top: 430, left: '50%', transform: 'translateX(-50%)' }}>
          <SymbolCard alt={t('imageAlt')} />
        </div>

        {/* 소개 텍스트 */}
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
            {t('introText1')}
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
            {t('introText2')}
          </p>
        </div>
      </div>
      </AnimateOnScroll>

      {/* ══════════════════════════════════════════
          §B  교육 목표  h=1744
          ══════════════════════════════════════ */}
      <AnimateOnScroll variant="fade-up" threshold={0.05}>
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
            {t('goal')}
          </p>

          {GOAL_POSITIONS.map((g, i) => (
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
                {goals[i]}
              </p>
            </div>
          ))}
        </div>
      </div>
      </AnimateOnScroll>

      {/* ══════════════════════════════════════════
          §C  세부 교육 목표  h=841
          ══════════════════════════════════════ */}
      <AnimateOnScroll variant="fade-up" threshold={0.05}>
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
          {t('detailGoal')}
        </p>
        <div style={{ display: 'flex', gap: 42, alignItems: 'center', marginTop: 75 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ position: 'relative', width: 378, height: 283, flexShrink: 0 }}>
              <img src={IMG.goalCard} alt={`${t('detailGoal')} ${i + 1}`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', maxWidth: 'none' }} />
            </div>
          ))}
        </div>
      </div>
      </AnimateOnScroll>

      {/* ══════════════════════════════════════════
          §D  교육방침  h=1093
          ══════════════════════════════════════ */}
      <AnimateOnScroll variant="fade-up" threshold={0.05}>
      <div style={{ position: 'relative', height: 1093, background: '#fff' }}>
        <div style={{ position: 'absolute', left: 98, top: 0, width: 1244 }}>
          <p style={{
            margin: 0,
            fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
            fontWeight: 700, fontSize: 24, color: '#444',
            lineHeight: 'normal', textAlign: 'center',
          }}>
            {t('policy')}
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
                  color: '#fff', textAlign: 'right', whiteSpace: 'pre-line',
                }}>
                  {t('policyText1')}
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
                  color: '#fff', whiteSpace: 'pre-line',
                }}>
                  {t('policyText2')}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
      </AnimateOnScroll>

      {/* ══════════════════════════════════════════
          §E  졸업 후 진로  h=1792
          ══════════════════════════════════════ */}
      <AnimateOnScroll variant="fade-up" threshold={0.05}>
      <div style={{ position: 'relative', height: 1792, overflow: 'hidden', background: '#fff' }}>

        {/* 네트워크 배경 */}
        <div style={{
          position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)',
          width: 1452, height: 1383, pointerEvents: 'none',
        }} aria-hidden>
          <img src={IMG.vecCareer} alt="" style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>

        {/* careerQ1 */}
        <div style={{
          position: 'absolute', top: 296, left: 'calc(29.17% - 12.3px)',
          transform: 'translateX(-50%) translateY(-50%) rotate(23.07deg)',
        }}>
          <span style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontWeight: 700, fontSize: 24, color: '#444', whiteSpace: 'nowrap' }}>
            {t('careerQ1')}
          </span>
        </div>
        {/* careerQ2 */}
        <div style={{
          position: 'absolute', top: 521, left: 'calc(58.33% - 19.71px)',
          transform: 'translateX(-50%) translateY(-50%) rotate(45deg)',
        }}>
          <span style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontWeight: 700, fontSize: 24, color: '#444', whiteSpace: 'nowrap' }}>
            {t('careerQ2')}
          </span>
        </div>
        {/* careerQ3 */}
        <div style={{
          position: 'absolute', top: 615, left: 'calc(83.33% - 50.54px)',
          transform: 'translateX(-50%) translateY(-50%) rotate(-21.3deg)',
        }}>
          <span style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontWeight: 700, fontSize: 24, color: '#444', whiteSpace: 'nowrap' }}>
            {t('careerQ3')}
          </span>
        </div>

        {/* 진로 태그 */}
        {CAREER_POSITIONS.map((pos, i) => (
          <div key={i} style={{ position: 'absolute', top: pos.top, left: pos.left }}>
            <GlassTag label={careers[i] ?? ''} width={pos.width} />
          </div>
        ))}
      </div>
      </AnimateOnScroll>

      {/* ══════════════════════════════════════════
          §F  자격증 — Swiper Coverflow Carousel
          ══════════════════════════════════════ */}
      <AnimateOnScroll variant="fade-up" threshold={0.05}>
        <CertCarousel />
      </AnimateOnScroll>

    </div>
  )
}
