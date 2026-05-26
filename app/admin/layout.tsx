/**
 * Admin 레이아웃
 * 일반 사이트 레이아웃(Header/Footer)을 사용하지 않고
 * 독립적인 관리자 UI 레이아웃을 사용합니다.
 */

export const metadata = {
  title: 'Admin — NWCN',
  description: '관리자 페이지',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {children}
    </div>
  )
}
