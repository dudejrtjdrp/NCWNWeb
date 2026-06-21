'use client'

/**
 * BASE 컴포넌트: DepartmentSection (반응형 리팩토링)
 * Figma node-id: 291:76  /  캔버스 1440×9455
 *
 * 섹션 구성
 *  §A 학과소개 인트로
 *  §B 교육 목표
 *  §C 세부 교육 목표
 *  §D 교육방침
 *  §E 졸업 후 진로
 *  §F 자격증
 */

import { useTranslations } from 'next-intl'
import CertCarousel from '@/components/base/CertCarousel'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'

/* ─── 에셋 경로 ─── */
const IMG = {
  arrowVec:        '/images/department/arrow-vec.png',
  symbolCardBg:    '/images/department/symbol-card-bg.png',
  symbolCardInner: '/images/department/symbol-card-inner.png',
  vecGoal:         '/images/department/vec-goal.png',
  goalCard:        '/images/department/goal-card.png',
  policyImg1:      '/images/department/policy-img1.png',
  policyImg2:      '/images/department/policy-img2.png',
  vecCareer:       '/images/department/vec-career.png',
}

/* ─── SymbolCard ─── */
function SymbolCard({ alt }: { alt: string }) {
  return (
    <div className="relative w-full max-w-[606px] mx-auto" style={{ aspectRatio: '606/320' }}>
      <div
        className="absolute overflow-hidden"
        style={{ top: '17.19%', right: '12.71%', bottom: '3.88%', left: '25.58%' }}
      >
        <div className="absolute" style={{ inset: '-3.72% -2.51% 0 0' }}>
          <img src={IMG.symbolCardInner} alt="" className="block w-full h-full" style={{ maxWidth: 'none' }} />
        </div>
      </div>
      <img
        src={IMG.symbolCardBg}
        alt={alt}
        className="absolute inset-0 block w-full h-full"
        style={{ maxWidth: 'none' }}
      />
    </div>
  )
}

/* ─── 글래스모피즘 진로 태그 ─── */
function GlassTag({ label }: { label: string }) {
  return (
    <div
      className="inline-flex items-center justify-center px-5 py-2.5 rounded-full"
      style={{
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
      }}
    >
      <span
        className="font-body font-medium text-[14px] sm:text-[16px] lg:text-[18px] text-[#888] whitespace-nowrap"
      >
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
    <div className="relative w-full max-w-[1440px] mx-auto bg-white">

      {/* ══════════════════════════════════════════
          §A  학과소개 인트로
          ══════════════════════════════════════ */}
      <AnimateOnScroll variant="fade-up" threshold={0.05}>
        <section className="flex flex-col items-center px-4 sm:px-8 lg:px-[79px] py-12 sm:py-16 lg:py-24 bg-white">
          {/* 하향 화살표 */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 rotate-180 mb-4 sm:mb-6">
            <img src={IMG.arrowVec} alt="" aria-hidden className="w-full h-full" />
          </div>

          {/* "학과 소개" 타이틀 */}
          <p className="font-body font-bold text-[20px] sm:text-[24px] text-[#444] text-center mb-8 sm:mb-12">
            {t('intro')}
          </p>

          {/* SymbolCard */}
          <div className="w-full max-w-[480px] sm:max-w-[560px] lg:max-w-[606px] mb-10 sm:mb-16">
            <SymbolCard alt={t('imageAlt')} />
          </div>

          {/* 소개 텍스트 */}
          <div className="text-center max-w-[860px] px-4">
            <p
              className="font-body font-normal text-[#000] mb-2 sm:mb-3"
              style={{ fontSize: 'clamp(18px, 2.5vw, 32px)', lineHeight: 1.4 }}
            >
              {t('introText1')}
            </p>
            <p
              className="font-body font-bold"
              style={{
                fontSize: 'clamp(18px, 2.5vw, 32px)',
                lineHeight: 1.6,
                background: 'linear-gradient(to right, #00844D, #09F593)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t('introText2')}
            </p>
            {/* 검색 노출용 약칭 안내 (동방예대·뉴콘·NewCon 자연 문구) */}
            <p className="mt-4 sm:mt-5 font-body font-normal text-[13px] sm:text-[14px] text-[#888]">
              {t('aka')}
            </p>
          </div>
        </section>
      </AnimateOnScroll>

      {/* ══════════════════════════════════════════
          §B  교육 목표
          ══════════════════════════════════════ */}
      <AnimateOnScroll variant="fade-up" threshold={0.05}>
        <section className="relative overflow-hidden bg-white px-4 sm:px-8 lg:px-[79px] py-12 sm:py-16 lg:py-24">
          {/* 배경 벡터 장식 (데스크탑만) */}
          <div
            className="absolute hidden lg:block pointer-events-none select-none"
            style={{ left: '-5%', top: '10%', width: 500, height: 476, opacity: 0.4, transform: 'rotate(48.7deg)' }}
            aria-hidden
          >
            <img src={IMG.vecGoal} alt="" className="w-full h-full" />
          </div>
          <div
            className="absolute hidden lg:block pointer-events-none select-none"
            style={{ right: '-5%', top: '20%', width: 500, height: 476, opacity: 0.4, transform: 'rotate(48.7deg)' }}
            aria-hidden
          >
            <img src={IMG.vecGoal} alt="" className="w-full h-full" />
          </div>

          <p className="font-body font-bold text-[20px] sm:text-[24px] text-[#444] text-center mb-10 sm:mb-16">
            {t('goal')}
          </p>

          <div className="max-w-[900px] mx-auto flex flex-col gap-10 sm:gap-14 lg:gap-16">
            {goals.map((goalText, i) => {
              const num = String(i + 1).padStart(2, '0')
              const isRight = i % 2 === 1
              return (
                <AnimateOnScroll key={num} variant="fade-up" delay={i * 80} threshold={0.05}>
                  <div className={`flex ${isRight ? 'flex-row-reverse' : 'flex-row'} items-start gap-4 sm:gap-6`}>
                    <span
                      className="shrink-0 font-[Nova_Slim,serif] text-nwcn-green leading-none"
                      style={{ fontSize: 'clamp(40px, 6vw, 76px)' }}
                    >
                      {num}
                    </span>
                    <p
                      className={`font-body font-bold text-[#1d1d1d] ${isRight ? 'text-right' : 'text-left'} leading-snug`}
                      style={{ fontSize: 'clamp(16px, 2vw, 25px)', paddingTop: '0.3em' }}
                    >
                      {goalText}
                    </p>
                  </div>
                </AnimateOnScroll>
              )
            })}
          </div>
        </section>
      </AnimateOnScroll>

      {/* ══════════════════════════════════════════
          §C  세부 교육 목표
          ══════════════════════════════════════ */}
      <AnimateOnScroll variant="fade-up" threshold={0.05}>
        <section className="bg-white px-4 sm:px-8 lg:px-[106px] py-12 sm:py-16 lg:py-[81px]">
          <p className="font-body font-bold text-[20px] sm:text-[24px] text-[#444] text-center mb-8 sm:mb-12 lg:mb-[75px]">
            {t('detailGoal')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-[42px]">
            {[0, 1, 2].map((i) => (
              <AnimateOnScroll key={i} variant="fade-up" delay={i * 80} threshold={0.05}>
                <div className="relative w-full overflow-hidden rounded-sm" style={{ aspectRatio: '378/283' }}>
                  <img
                    src={IMG.goalCard}
                    alt={`${t('detailGoal')} ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </section>
      </AnimateOnScroll>

      {/* ══════════════════════════════════════════
          §D  교육방침
          ══════════════════════════════════════ */}
      <AnimateOnScroll variant="fade-up" threshold={0.05}>
        <section className="bg-white px-4 sm:px-8 lg:px-[98px] py-12 sm:py-16 lg:py-[80px]">
          <p className="font-body font-bold text-[20px] sm:text-[24px] text-[#444] text-center mb-8 sm:mb-12 lg:mb-[111px]">
            {t('policy')}
          </p>

          <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[41px]">
            {/* 이미지 1 — 사진: 왼쪽→오른쪽 / 글씨: 아래→위 */}
            <AnimateOnScroll variant="fade-right" duration={800} threshold={0.2}>
              <div className="relative w-full overflow-hidden rounded-sm" style={{ aspectRatio: '1244/323', minHeight: '180px' }}>
                <img src={IMG.policyImg1} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
                <div
                  className="absolute inset-0 flex items-end justify-end p-4 sm:p-6 lg:p-8"
                  style={{
                    border: '1px solid rgba(9,245,147,0.06)',
                    background: 'linear-gradient(to right, rgba(0,172,101,0) 30%, #000 100%)',
                  }}
                >
                  <AnimateOnScroll variant="fade-up" delay={300} duration={700} threshold={0.2}>
                    <p
                      className="font-body font-medium text-white text-right"
                      style={{ fontSize: 'clamp(13px, 1.4vw, 18px)', lineHeight: 1.6, whiteSpace: 'pre-line', maxWidth: '60%' }}
                    >
                      {t('policyText1')}
                    </p>
                  </AnimateOnScroll>
                </div>
              </div>
            </AnimateOnScroll>

            {/* 이미지 2 — 사진: 오른쪽→왼쪽 / 글씨: 아래→위 */}
            <AnimateOnScroll variant="fade-left" duration={800} threshold={0.2}>
              <div className="relative w-full overflow-hidden rounded-sm" style={{ aspectRatio: '1244/323', minHeight: '180px' }}>
                <img src={IMG.policyImg2} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
                <div
                  className="absolute inset-0 flex items-end justify-start p-4 sm:p-6 lg:p-8"
                  style={{
                    border: '1px solid rgba(9,245,147,0.06)',
                    background: 'linear-gradient(to right, #000 0%, rgba(2,66,40,0.75) 60%, rgba(9,245,147,0.06) 100%)',
                  }}
                >
                  <AnimateOnScroll variant="fade-up" delay={300} duration={700} threshold={0.2}>
                    <p
                      className="font-body font-medium text-white"
                      style={{ fontSize: 'clamp(13px, 1.4vw, 18px)', lineHeight: 1.6, whiteSpace: 'pre-line', maxWidth: '60%' }}
                    >
                      {t('policyText2')}
                    </p>
                  </AnimateOnScroll>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      </AnimateOnScroll>

      {/* ══════════════════════════════════════════
          §E  졸업 후 진로
          ══════════════════════════════════════ */}
      <AnimateOnScroll variant="fade-up" threshold={0.05}>
        <section className="relative bg-white px-4 sm:px-8 lg:px-[79px] py-12 sm:py-16 lg:py-24 overflow-hidden">
          {/* 네트워크 배경 (데스크탑) */}
          <div
            className="absolute inset-0 hidden lg:block pointer-events-none select-none opacity-30"
            aria-hidden
          >
            <img src={IMG.vecCareer} alt="" className="w-full h-full object-cover" />
          </div>

          <div className="relative z-10">
            {/* 질문 텍스트들 */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-10 sm:mb-14 lg:mb-16">
              {(['careerQ1', 'careerQ2', 'careerQ3'] as const).map((key, i) => (
                <AnimateOnScroll key={key} variant="fade-up" delay={i * 80} threshold={0.05}>
                  <span
                    className="font-body font-bold text-[#444]"
                    style={{ fontSize: 'clamp(16px, 2vw, 24px)' }}
                  >
                    {t(key)}
                  </span>
                </AnimateOnScroll>
              ))}
            </div>

            {/* 진로 태그 그리드 */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-[1000px] mx-auto">
              {careers.map((career, i) => (
                <AnimateOnScroll key={i} variant="fade-up" delay={Math.min(i * 40, 320)} threshold={0.05}>
                  <GlassTag label={career} />
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
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
