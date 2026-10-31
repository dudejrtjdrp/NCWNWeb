/**
 * 상세 페이지 공용 조각 (E4) — 수상·프로젝트 상세에서 쓴다.
 * - DetailMedia: 어두운 판 위에 사진을 잘리지 않게(contain) 올리고, 뒤에 같은 사진을 크게 블러로 깐다.
 * - InfoTable: 제목 오른쪽 1px 선 정보표.
 */

import Image from 'next/image'

export function DetailMedia({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-nwcn-dark sm:aspect-[16/9]">
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <Image src={src} alt="" fill sizes="40vw" className="poster-backdrop object-cover" />
      </div>
      <div className="absolute inset-[4%]">
        <Image src={src} alt={alt} fill priority sizes="(min-width: 1440px) 1300px, 92vw" className="poster-shadow object-contain" />
      </div>
    </div>
  )
}

export function InfoTable({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="border-b border-nwcn-dark text-list">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-12 gap-x-4 border-t border-nwcn-dark py-2.5">
          <dt className="col-span-4 text-nwcn-neutral-600">{row.label}</dt>
          <dd className="col-span-8 min-w-0 break-words">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}
