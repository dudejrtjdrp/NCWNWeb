/**
 * Admin 루트 페이지 — /admin/work 로 리다이렉트
 */

import { redirect } from 'next/navigation'

export default function AdminPage() {
  redirect('/admin/work')
}
