/**
 * BASE 컴포넌트: WorkHero
 * WORK 섹션 히어로 배너
 */

import AnimateOnScroll from '@/components/common/AnimateOnScroll'

export default function WorkHero() {
  return (
    <div className="bg-white">
      <div
        className="relative w-full max-w-[1440px] mx-auto overflow-hidden"
        style={{ height: '680px' }}
      >
        {/* 배경 장식 — 대형 WORK 워터마크 */}
        <div
          className="absolute select-none pointer-events-none"
          style={{ right: '-40px', top: '50%', transform: 'translateY(-50%)' }}
          aria-hidden="true"
        >
          <span
            className="font-brand font-black text-[#f0f0f0]"
            style={{ fontSize: 'clamp(160px, 22vw, 320px)', lineHeight: 1 }}
          >
            WORK
          </span>
        </div>

        {/* 좌측 그린 세로 액센트 바 */}
        <div
          className="absolute left-[79px] top-[180px] w-[4px] bg-nwcn-green rounded-full"
          style={{ height: '200px' }}
          aria-hidden="true"
        />

        {/* 콘텐츠 */}
        <div
          className="absolute left-[79px] flex flex-col justify-center gap-6"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        >
          <AnimateOnScroll variant="fade-up" delay={0}>
            <p className="font-body font-semibold text-[13px] tracking-[0.2em] text-nwcn-green pl-[18px]">
              NWCN — STUDENT WORKS
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={80}>
            <h1
              className="font-brand font-bold text-nwcn-text-default pl-[18px]"
              style={{ fontSize: 'clamp(48px, 7vw, 96px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
            >
              학생 작품
              <br />
              포트폴리오
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={160}>
            <p className="font-body text-[15px] text-[#888] leading-relaxed pl-[18px] max-w-[400px]">
              뉴미디어콘텐츠과 재학생들의 크리에이티브한
              <br />
              작품과 졸업전시 기록을 만나보세요.
            </p>
          </AnimateOnScroll>
        </div>

        {/* 우하단 장식 도트 패턴 */}
        <AnimateOnScroll
          variant="fade"
          delay={300}
          className="absolute right-[79px] bottom-[60px] grid grid-cols-5 gap-3 opacity-20 pointer-events-none select-none"
          aria-hidden="true"
        >
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-nwcn-green" />
          ))}
        </AnimateOnScroll>
      </div>
    </div>
  )
}
