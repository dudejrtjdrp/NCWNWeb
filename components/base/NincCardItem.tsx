/**
 * BASE 컴포넌트: NincCardItem
 * Figma node-id: 280:410 (card), 280:428 (caption), 280:446 (Union trophy icon)
 *
 * 디자인 스펙:
 * - 이미지 영역: bg-[#efefef], 높이 209px, overflow-hidden
 * - 트로피 아이콘: 35×74px, 카드 좌상단(left 36px), 카드보다 3px 위 오버랩 (absolute)
 * - 배지: 이미지 우상단 (optional)
 * - 캡션 영역: bg-[#f9f9f9], 48px 높이, 이미지와 18px 간격
 * - caption: 좌측 텍스트 (Pretendard Medium 14px, #323131)
 * - subCaption: 우측 보조 텍스트 (12px, #B9B8B6)
 *
 * 기능 로직 없음 (순수 UI)
 */

import Image from 'next/image'

export interface NincCardItemProps {
  thumbnail?: string | null
  caption: string
  subCaption?: string
  badge?: React.ReactNode
  trophyIconUrl: string
}

export default function NincCardItem({
  thumbnail,
  caption,
  subCaption,
  badge,
  trophyIconUrl,
}: NincCardItemProps) {
  return (
    <div className="relative" data-node-id="280:410">
      {/* ── 트로피 아이콘: 카드 좌에서 36px, 카드 상단보다 3px 위 ── */}
      <div
        className="absolute z-10 pointer-events-none select-none"
        style={{ top: '-3px', left: '36px', width: '35px', height: '74px' }}
        aria-hidden="true"
        data-node-id="280:446"
      >
        {/* TODO: 영구 에셋으로 교체 (7일 만료) */}
        <img
          src={trophyIconUrl}
          alt=""
          className="w-full h-full object-contain"
        />
      </div>

      {/* ── 이미지 영역 ── */}
      <div
        className="relative bg-[#efefef] overflow-hidden w-full"
        style={{ height: '209px' }}
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={caption}
            fill
            className="object-cover"
            unoptimized
          />
        ) : null}

        {/* 배지 (우상단) */}
        {badge && (
          <div className="absolute top-3 right-3 z-10">
            {badge}
          </div>
        )}
      </div>

      {/* ── 캡션 영역: 이미지와 18px 간격 ── */}
      <div
        className="bg-[#f9f9f9] flex items-center gap-2 px-4"
        style={{ height: '48px', marginTop: '18px' }}
        data-node-id="280:428"
      >
        <p className="font-body font-medium text-[14px] text-nwcn-text-muted leading-normal flex-1 truncate">
          {caption}
        </p>
        {subCaption && (
          <p className="font-body font-normal text-[12px] text-nwcn-text-sub whitespace-nowrap shrink-0">
            {subCaption}
          </p>
        )}
      </div>
    </div>
  )
}
