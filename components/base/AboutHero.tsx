/**
 * BASE 컴포넌트: AboutHero (히어로 배너 전용)
 * Figma: node-id 291:76
 */

import AnimateOnScroll from '@/components/common/AnimateOnScroll'

/* ─── 에셋 경로 ─── */
const IMG_NWCN = '/images/department/nwcn-logo.png'

export default function AboutHero() {
  return (
    <div className="bg-white">
      {/* ── HERO ── */}
      <div
        className="relative w-full max-w-[1440px] mx-auto bg-white overflow-hidden flex flex-col justify-center"
        style={{ minHeight: 'clamp(300px, 50vw, 805px)' }}
      >
        {/* "ABOUT" 텍스트 */}
        <AnimateOnScroll
          variant="fade-up"
          delay={100}
          as="h1"
          className="absolute right-[5%] sm:right-[10%] lg:right-[21%] top-[20%] font-body font-extrabold leading-normal text-[#050505]"
          style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}
        >
          ABOUT
        </AnimateOnScroll>

        {/* NWCN 대형 로고 */}
        <AnimateOnScroll
          variant="fade"
          delay={200}
          duration={900}
          className="w-[88%] sm:w-[80%] lg:w-[1270px] mx-auto mt-[12%] sm:mt-[10%]"
        >
          <img
            src={IMG_NWCN}
            alt="NWCN 뉴미디어콘텐츠과"
            className="block w-full h-auto"
          />
        </AnimateOnScroll>
      </div>
    </div>
  )
}
