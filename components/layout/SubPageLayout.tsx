/**
 * SubPageLayout — 서브 페이지 공통 레이아웃
 * NavBar (흰 배경 고정) + children + Footer
 * 홈(/) 제외한 모든 서브 페이지에서 사용
 */

import NavBar from '@/components/base/NavBar'
import HomeFooter from '@/components/base/HomeFooter'

export default function SubPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      {/* NavBar 높이(64px)만큼 상단 여백 */}
      <main style={{ paddingTop: '64px' }} className="min-h-screen bg-white">
        {children}
      </main>
      <HomeFooter />
    </>
  )
}
