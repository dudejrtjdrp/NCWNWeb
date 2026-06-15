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
 */

import Header, { type HeaderVariant } from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface SubPageLayoutProps {
  children: React.ReactNode
  headerVariant?: HeaderVariant
  overlapHeader?: boolean
}

export default function SubPageLayout({
  children,
  headerVariant = 'light',
  overlapHeader = false,
}: SubPageLayoutProps) {
  return (
    <>
      <Header variant={headerVariant} />
      {/* overlapHeader=true → 히어로가 네비바 뒤로 깔리도록 상단 패딩 제거 */}
      <main
        style={{ paddingTop: overlapHeader ? '0' : '64px' }}
        className="min-h-screen bg-white"
      >
        {children}
      </main>
      <Footer />
    </>
  )
}
