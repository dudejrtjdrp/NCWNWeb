/**
 * SubPageLayout — 서브 페이지 공통 레이아웃
 * Header (light variant) + children + Footer
 * 홈(/) 제외한 모든 서브 페이지에서 사용
 */

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function SubPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header variant="light" />
      {/* Header 높이(64px)만큼 상단 여백 */}
      <main style={{ paddingTop: '64px' }} className="min-h-screen bg-white">
        {children}
      </main>
      <Footer />
    </>
  )
}
