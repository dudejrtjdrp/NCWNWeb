import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="font-brand text-[120px] text-nwcn-green/10 leading-none select-none">
        404
      </p>
      <h1 className="font-brand text-4xl text-white mt-4 mb-3">
        페이지를 찾을 수 없어요
      </h1>
      <p className="font-body text-sm text-white/40 mb-8">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Link
        href="/"
        className="btn-primary"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}
