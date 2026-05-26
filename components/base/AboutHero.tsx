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
      {/* ── HERO h=805px ── */}
      <div
        className="relative w-full max-w-[1440px] mx-auto bg-white overflow-hidden"
        style={{ height: '805px' }}
      >
        {/* "ABOUT" 텍스트 */}
        <AnimateOnScroll
          variant="fade-up"
          delay={100}
          as="h1"
          className="absolute whitespace-nowrap font-body font-extrabold text-[56px] leading-normal text-[#050505]"
          style={{
            left: 'calc(79.17% - 113px)',
            top: '157px',
            transform: 'translateY(-50%)',
          }}
        >
          ABOUT
        </AnimateOnScroll>

        {/* NWCN 대형 로고 */}
        <AnimateOnScroll
          variant="fade"
          delay={200}
          duration={900}
          className="absolute"
          style={{ left: 0, top: 261, width: 1270, height: 350 }}
        >
          <div className="absolute" style={{ inset: '-0.86% -0.24%' }}>
            <img
              src={IMG_NWCN}
              alt="NWCN 뉴미디어콘텐츠과"
              className="block w-full h-full"
              style={{ maxWidth: 'none' }}
            />
          </div>
        </AnimateOnScroll>
      </div>
    </div>
  )
}
