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
 * - href: 선택적 링크 (전달 시 Next Link로 래핑, 호버 애니메이션 활성화)
 *
 * 기능 로직 없음 (순수 UI)
 */

import Image from 'next/image'
import Link from 'next/link'

export interface NincCardItemProps {
  thumbnail?: string | null
  caption: string
  subCaption?: string
  badge?: React.ReactNode
  trophyIconUrl: string
  /** 전달 시 카드 전체가 링크가 되고 호버 효과 활성화 */
  href?: string
}

export default function NincCardItem({
  thumbnail,
  caption,
  subCaption,
  badge,
  trophyIconUrl,
  href,
}: NincCardItemProps) {
  const Wrapper = href
    ? ({ children }: { children: React.ReactNode }) => (
        <Link href={href} className="block group" data-node-id="280:410">
          {children}
        </Link>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <div className="relative" data-node-id="280:410">
          {children}
        </div>
      )

  return (
    <Wrapper>
      {/* ── 트로피 아이콘: 카드 좌에서 36px, 카드 상단보다 3px 위 ── */}
      <div
        className="absolute z-10 pointer-events-none select-none"
        style={{ top: '-3px', left: '36px', width: '35px', height: '74px' }}
        aria-hidden="true"
        data-node-id="280:446"
      >
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
            className={`object-cover transition-transform duration-500${href ? ' group-hover:scale-105' : ''}`}
            unoptimized
          />
        ) : (
          /* 썸네일 없을 때 호버 오버레이 */
          href ? (
            <div className="absolute inset-0 flex items-center justify-center transition-colors duration-300 group-hover:bg-black/10">
              <div className="w-8 h-8 rounded-full border-2 border-nwcn-text-sub/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#323131" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ) : null
        )}

        {/* 호버 오버레이 (링크 있을 때) */}
        {href && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <span className="font-body text-xs text-white bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                자세히 보기
              </span>
            </div>
          </div>
        )}

        {/* 배지 (우상단) */}
        {badge && (
          <div className="absolute top-3 right-3 z-10">
            {badge}
          </div>
        )}
      </div>

      {/* ── 캡션 영역: 이미지와 18px 간격 ── */}
      <div
        className={`bg-[#f9f9f9] flex items-center gap-2 px-4 transition-colors duration-300${href ? ' group-hover:bg-[#f0f0f0]' : ''}`}
        style={{ height: '48px', marginTop: '18px' }}
        data-node-id="280:428"
      >
        <p className={`font-body font-medium text-[14px] text-nwcn-text-muted leading-normal flex-1 truncate transition-colors duration-300${href ? ' group-hover:text-nwcn-text-default' : ''}`}>
          {caption}
        </p>
        {subCaption && (
          <p className="font-body font-normal text-[12px] text-nwcn-text-sub whitespace-nowrap shrink-0">
            {subCaption}
          </p>
        )}
        {/* 화살표 아이콘 (링크 있을 때) */}
        {href && (
          <svg
            className="w-3 h-3 text-nwcn-text-sub opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </Wrapper>
  )
}
