/**
 * BASE 컴포넌트: NcrTrendSection
 * Figma node-id: 376:1609 (NCRTrendSection)
 *
 * 디자인 스펙:
 * - 헤더: "NCR Trend" A2Z체 23.077px, black
 * - 메인 카드 (좌): 585×418 썸네일 + "Talks" 태그(green) + 제목(green) + 날짜
 * - 서브 카드 (우): "Contents" 태그(yellow) + 제목 + 날짜 + 402px 썸네일
 * - 배경: white
 */

import Tag from '@/components/base/Tag'
// using plain <img> for local SVGs to avoid Next.js image optimization issues


// 로컬 플레이스홀더로 대체
const ASSETS = {
  mainThumb: '/images/ncr/main.svg',
  subThumb: '/images/ncr/sub.svg',
}

export interface NcrTrendSectionProps {
  className?: string
}

export default function NcrTrendSection({ className = '' }: NcrTrendSectionProps) {
  return (
    <section
      className={`bg-white py-[60px] px-4 ${className}`}
      data-node-id="376:1609"
      aria-label="NCR Trend"
    >
      <div className="max-w-[1266px] mx-auto">
        {/* 섹션 헤더 */}
        <div
          className="mb-[29px]"
          data-node-id="376:1495"
        >
          <p
            className="font-brand text-[#050505]"
            style={{ fontSize: '23.077px' }}
            data-node-id="376:1496"
          >
            NCR Trend
          </p>
        </div>

        {/* 카드 영역 */}
        <div
          className="flex flex-col lg:flex-row gap-[49px] items-start lg:justify-between"
          data-node-id="376:1607"
        >
          {/* ── 메인 카드 (좌) ── */}
          <div
            className="flex flex-col gap-[22.589px] w-full lg:w-[620px] flex-shrink-0"
            data-node-id="376:1574"
          >
            {/* 썸네일 + 오버레이 (외부 그림자) */}
            <div
              className="relative"
              style={{ height: '445px' }}
              data-node-id="376:1494"
            >
              <div
                style={{ borderRadius: '7.912px', boxShadow: '0 20px 40px rgba(0,0,0,0.23)', overflow: 'visible' }}
              >
                <div className="relative rounded-[7.912px] overflow-hidden" style={{ height: '100%' }}>
                  <img
                    src={ASSETS.mainThumb}
                    alt="AI 시대, 학과의 강점과 비전을 묻다"
                    className="object-cover w-full h-full"
                  />
                  {/* 그라디언트 오버레이 */}
                  <div
                    className="absolute inset-0"
                    // style={{ background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.00) 32.22%, #000 100%)' }}
                    data-node-id="376:1493"
                  />
                </div>
              </div>
            </div>

            {/* Talks 태그 (green) */}
            <div data-node-id="376:1559">
              <Tag type="talks">Talks</Tag>
            </div>

            {/* 제목 */}
            <div
              className="relative"
              style={{ height: '37.321px' }}
              data-node-id="427:872"
            >
              <div
                className="absolute inset-0"
                style={{ background: '#050505' }}
              />
              <p
                className="absolute font-body font-semibold"
                style={{
                  fontSize: '31.429px',
                  color: '#09F593',
                  top: '0.53%',
                  left: '1.08%',
                  right: '-1.27%',
                  bottom: '-2.35%',
                  lineHeight: 'normal',
                }}
                data-node-id="427:874"
              >
                AI 시대, 학과의 강점과 비전을 묻다
              </p>
            </div>

            {/* 날짜 */}
            <p
              className="font-body font-normal"
              style={{ fontSize: '14.946px', color: '#B9B8B6' }}
              data-node-id="376:1573"
            >
              Aug 25 2025
            </p>
          </div>

          {/* ── 서브 카드 (우) ── */}
          <div
            className="flex flex-col gap-[26.375px] items-end w-full lg:w-[430px] flex-shrink-0"
            data-node-id="376:1606"
          >
            {/* Contents 태그 (yellow) */}
            <div data-node-id="376:1592">
              <Tag type="contents">Contents</Tag>
            </div>

            {/* 제목 + 날짜 */}
            <div
              className="flex flex-col gap-[5.275px] w-full text-right"
              data-node-id="376:1615"
            >
              <p
                className="font-body font-semibold w-full"
                style={{ fontSize: '17.583px', color: '#323131' }}
                data-node-id="376:1600"
              >
                보성 미디어파사드 워크숍
              </p>
              <p
                className="font-body font-normal"
                style={{ fontSize: '14.946px', color: '#B9B8B6' }}
                data-node-id="376:1603"
              >
                5 May 2026
              </p>
            </div>

            {/* 서브 썸네일 */}
            <div
              className="relative w-full"
              style={{ height: '430px' }}
              data-node-id="376:669"
            >
              <div style={{ borderRadius: '7.912px', boxShadow: '-7.033px 12.308px 18.287px rgba(0,0,0,0.23)', overflow: 'visible' }}>
                <div className="relative w-full rounded-[7.912px] overflow-hidden" style={{ height: '100%' }}>
                  <img
                    src={ASSETS.subThumb}
                    alt="보성 미디어파사드 워크숍"
                    className="object-cover w-full h-full"
                  />
                  {/* 그라디언트 오버레이 (서브 썸네일) */}
                  <div
                    className="absolute inset-0"
                    // style={{ background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.00) 32.22%, #000 100%)' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
