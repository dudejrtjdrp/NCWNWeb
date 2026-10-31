/**
 * SubPageLayout — 서브 페이지 공통 레이아웃
 * Header + children + Footer
 * 홈(/) 제외한 모든 서브 페이지에서 사용
 *
 * props:
 *   - headerVariant: 'light'(기본) | 'dark' | 'transparent'
 *       transparent → 히어로 위에 투명 네비바, 스크롤 시 흰 배경 전환
 *   - overlapHeader: true 일 때 main 상단 64px 패딩 제거
 *       (히어로가 네비바 아래까지 풀블리드로 깔리는 페이지용)
 *   - tone: 'white'(기본) | 'paper'
 *       paper → 종이 바탕(#F6F7F3) + 검정 글자. 헤더도 paper 변형을 쓴다
 *       (headerVariant 를 따로 주지 않으면 자동으로 'paper').
 */

import Header, { type HeaderVariant } from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import RevealOnScroll from '@/components/common/RevealOnScroll'

interface SubPageLayoutProps {
  children: React.ReactNode
  headerVariant?: HeaderVariant
  overlapHeader?: boolean
  tone?: 'white' | 'paper'
}

export default function SubPageLayout({
  children,
  headerVariant,
  overlapHeader = false,
  tone = 'white',
}: SubPageLayoutProps) {
  const paper = tone === 'paper'
  return (
    <>
      <Header variant={headerVariant ?? (paper ? 'paper' : 'light')} />
      {/* overlapHeader=true → 히어로가 네비바 뒤로 깔리도록 상단 패딩 제거 */}
      <main
        style={{ paddingTop: overlapHeader ? '0' : '64px' }}
        className={paper ? 'min-h-screen bg-nwcn-paper text-nwcn-dark' : 'min-h-screen bg-white'}
      >
        <RevealOnScroll>{children}</RevealOnScroll>
      </main>
      <Footer />
    </>
  )
}
