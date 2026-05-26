/**
 * BASE 컴포넌트: NcrTrendSection
 * Figma node-id: 376:1609 (NCRTrendSection)
 *
 * 디자인 스펙:
 * - 헤더: "NCR Trend" A2Z체 23.077px, black
 * - 메인 카드 (좌): 585×418 썸네일 + "Talks" 태그(green) + 제목(green) + 날짜
 * - 서브 카드 (우): "Contents" 태그(yellow) + 제목 + 날짜 + 402px 썸네일
 * - 배경: white
 * - 호버: scale-up + shadow 애니메이션
 */

import Link from 'next/link'
import Tag from '@/components/base/Tag'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'

const ASSETS = {
  mainThumb: '/images/ncr/main.svg',
  subThumb: '/images/ncr/sub.png',
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
        <AnimateOnScroll variant="fade-up" className="mb-[29px]">
          <p
            className="font-brand text-[#050505]"
            style={{ fontSize: '23.077px' }}
            data-node-id="376:1496"
          >
            NCR Trend
          </p>
        </AnimateOnScroll>

        {/* 카드 영역 */}
        <div
          className="flex flex-col lg:flex-row gap-[49px] items-start lg:justify-between"
          data-node-id="376:1607"
        >
          {/* ── 메인 카드 (좌) ── */}
          <AnimateOnScroll variant="fade-right" delay={0} className="w-full lg:w-[620px] flex-shrink-0">
          <Link
            href="/ncr-trend/latest"
            className="flex flex-col gap-[22.589px] w-full lg:w-[620px] flex-shrink-0 cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_28px_52px_rgba(0,0,0,0.18)] rounded-[12px] p-5 -m-5"
            data-node-id="376:1574"
          >
            {/* 썸네일 */}
            <div
              className="relative rounded-[7.912px] overflow-hidden"
              style={{ height: '445px' }}
              data-node-id="376:1494"
            >
              <img
                src={ASSETS.mainThumb}
                alt="AI 시대, 학과의 강점과 비전을 묻다"
                className="object-cover w-full h-full"
              />
              {/* 그라디언트 오버레이 */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.00) 40%, rgba(0,0,0,0.55) 100%)' }}
                data-node-id="376:1493"
              />
            </div>

            {/* Talks 태그 */}
            <div data-node-id="376:1559">
              <Tag type="talks">Talks</Tag>
            </div>

            {/* 제목 */}
            <p
              className="font-body font-semibold"
              style={{ fontSize: '31.429px', color: '#09F593', lineHeight: 'normal' }}
              data-node-id="427:874"
            >
              AI 시대, 학과의 강점과 비전을 묻다
            </p>

            {/* 날짜 */}
            <p
              className="font-body font-normal"
              style={{ fontSize: '14.946px', color: '#B9B8B6' }}
              data-node-id="376:1573"
            >
              Aug 25 2025
            </p>
          </Link>
          </AnimateOnScroll>

          {/* ── 서브 카드 (우) ── */}
          <AnimateOnScroll variant="fade-left" delay={150} className="w-full lg:w-[430px] flex-shrink-0">
          <Link
            href="/ncr-trend/latest"
            className="flex flex-col gap-[26.375px] items-end w-full lg:w-[430px] flex-shrink-0 cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_28px_52px_rgba(0,0,0,0.18)] rounded-[12px] p-5 -m-5"
            data-node-id="376:1606"
          >
            {/* Contents 태그 */}
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
              className="relative w-full rounded-[7.912px] overflow-hidden"
              style={{ height: '430px' }}
              data-node-id="376:669"
            >
              <img
                src={ASSETS.subThumb}
                alt="보성 미디어파사드 워크숍"
                className="object-cover w-full h-full"
              />
            </div>
          </Link>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
