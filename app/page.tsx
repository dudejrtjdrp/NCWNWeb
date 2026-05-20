/**
 * 홈페이지 (/)
 * NavBar (transparent, scroll-overlay) + HeroSection (scroll animation)
 * + WhatIsSection + NincSection + NcrTrendSection + HomeFooter
 */

import NavBar from '@/components/base/NavBar'
import HeroSection from '@/components/base/HeroSection'
import WhatIsSection from '@/components/base/WhatIsSection'
import NincSection from '@/components/base/NincSection'
import NcrTrendSection from '@/components/base/NcrTrendSection'
import HomeFooter from '@/components/base/HomeFooter'

export default function HomePage() {
  return (
    <>
      {/* NavBar: transparent=true → 히어로 위에 fixed overlay */}
      <NavBar transparent />

      {/* 히어로 섹션: 300vh 스크롤 컨테이너, 패널 슬라이드 애니메이션 */}
      <HeroSection scrollHeight="300vh" />

      {/* 검은색 분리 바: HeroSection 바로 아래 붙음 */}
      <div
        aria-hidden="true"
        style={{ height: '70px', background: 'var(--Color-Background-Dark, #151515)' }}
      />

      {/* What is NewCon? */}
      <WhatIsSection />

      {/* Now In NewCon */}
      <NincSection />

      {/* NCR Trend */}
      <NcrTrendSection />

      {/* 푸터 */}
      <HomeFooter />
    </>
  )
}
