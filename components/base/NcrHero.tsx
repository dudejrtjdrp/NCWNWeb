/**
 * BASE 컴포넌트: NcrHero
 * NCR TREND 섹션 히어로 배너
 */

import AnimateOnScroll from '@/components/common/AnimateOnScroll'

export default function NcrHero() {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: '500px',
        background: 'linear-gradient(135deg, #0d1a0f 0%, #151515 40%, #0a1a12 100%)',
      }}
    >
      {/* 배경 그리드 패턴 */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#09F593 1px, transparent 1px), linear-gradient(90deg, #09F593 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />

      {/* 우측 대형 워터마크 */}
      <div
        className="absolute right-[40px] top-1/2 -translate-y-1/2 pointer-events-none select-none"
        aria-hidden="true"
      >
        <span
          className="font-brand font-black opacity-[0.06] text-nwcn-green"
          style={{ fontSize: 'clamp(120px, 18vw, 260px)', lineHeight: 1 }}
        >
          NCR
        </span>
      </div>

      {/* 상단 그라디언트 */}
      <div
        className="absolute inset-x-0 top-0 h-[120px] pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #151515, transparent)' }}
        aria-hidden="true"
      />

      {/* 하단 그라디언트 */}
      <div
        className="absolute inset-x-0 bottom-0 h-[120px] pointer-events-none"
        style={{ background: 'linear-gradient(to top, #151515, transparent)' }}
        aria-hidden="true"
      />

      {/* 콘텐츠 */}
      <div className="absolute inset-0 flex flex-col justify-center px-[79px]">
        <AnimateOnScroll variant="fade-up" delay={0}>
          <p className="font-body font-semibold text-[12px] tracking-[0.25em] text-nwcn-green mb-6">
            NWCN — MEDIA TREND REPORT
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll variant="fade-up" delay={80}>
          <h1
            className="font-brand font-bold text-white mb-5"
            style={{ fontSize: 'clamp(40px, 6vw, 80px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
          >
            NCR TREND
          </h1>
        </AnimateOnScroll>

        <AnimateOnScroll variant="fade-up" delay={160}>
          <p className="font-body text-[15px] text-white/50 leading-relaxed max-w-[480px]">
            뉴미디어콘텐츠과 기자단 NCR이 직접 발굴하고 분석한
            <br />
            미디어 트렌드 리포트를 확인하세요.
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll variant="fade-up" delay={220}>
          <div className="mt-8 flex items-center gap-4">
            <div className="w-12 h-[2px] bg-nwcn-green" />
            <span className="font-body text-[12px] text-white/30 tracking-widest">
              TREND · EDITORIAL · CARD NEWS
            </span>
          </div>
        </AnimateOnScroll>
      </div>
    </div>
  )
}
