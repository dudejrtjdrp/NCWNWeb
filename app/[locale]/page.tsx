/**
 * 홈페이지 (/)
 * Header (transparent) + HomeHeroSection (scroll animation)
 * + WhatIsSection + NincPreviewSection + NcrTrendPreviewSection + Footer
 */

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HomeHeroSection from '@/components/sections/home/HomeHeroSection'
import WhatIsSection from '@/components/base/WhatIsSection'
import NincSection from '@/components/base/NincSection'
import NcrTrendSection from '@/components/base/NcrTrendSection'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params

  return (
    <>
      {/* Header: transparent → 히어로 위에 fixed overlay, 스크롤 시 흰 배경 */}
      <Header variant="transparent" />

      {/* 히어로 섹션: 300vh 스크롤 컨테이너, 패널 슬라이드 애니메이션 */}
      <HomeHeroSection scrollHeight="300vh" />

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
      <NcrTrendSection locale={locale} />

      {/* 푸터 */}
      <Footer />
    </>
  )
}
