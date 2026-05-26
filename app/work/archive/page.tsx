import { redirect } from 'next/navigation'

/** /work/archive → /work/exhibition 영구 리다이렉트 */
export default function ArchiveRedirectPage() {
  redirect('/work/exhibition')
}
