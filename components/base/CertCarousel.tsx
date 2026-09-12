'use client'

/**
 * BASE 컴포넌트: CertCarousel
 * ────────────────────────────────────────────────────────────
 * 학과 취득 가능 자격증 가로형 캐러셀.
 * 자체 구현 커버플로우 → originkit "Smooth Scroll Slider" 기반
 * 관성 레일(SmoothScrollSlider)로 교체했다.
 * 휠·트랙패드·드래그·키보드 모두로 조작되고, 중앙 카드가 확대되며
 * 해당 자격증명이 아래 캡션에 표시된다.
 */

import SmoothScrollSlider, { type SlideItem } from '@/components/interactive/SmoothScrollSlider'

/* ── 실제 자격증서 목업 이미지 (public/images/department/cert) ── */
const CERTS: { file: string; name: string }[] = [
  { file: 'cert-01.png', name: '정보처리산업기사' },
  { file: 'cert-02.png', name: '멀티미디어콘텐츠제작전문가' },
  { file: 'cert-03.png', name: 'GTQ' },
  { file: 'cert-04.png', name: '웹디자인기능사' },
  { file: 'cert-05.png', name: '컬러리스트산업기사' },
  { file: 'cert-06.png', name: '사무자동화산업기사' },
  { file: 'cert-07.png', name: '인터넷정보관리사' },
  { file: 'cert-08.png', name: '웹마스터전문가' },
  { file: 'cert-09.png', name: '인터넷정보검색사' },
  { file: 'cert-10.png', name: '한국영상자격원 영상전문인(편집)' },
  { file: 'cert-11.png', name: '한국영상자격원 영상전문인(촬영)' },
  { file: 'cert-12.png', name: '한국영상자격원 영상전문인(연출)' },
]

const ITEMS: SlideItem[] = CERTS.map((c, i) => ({
  id: `cert-${i + 1}`,
  src: `/images/department/cert/${c.file}`,
  alt: `${c.name} 자격증`,
  caption: c.name,
  subCaption: '취득 가능 자격증',
}))

export default function CertCarousel() {
  return (
    <section className="py-section-md" aria-label="취득 가능 자격증">
      <div className="page-container">
        <p className="section-label mb-2">자격증</p>
        <p className="mb-10 font-body text-body text-nwcn-gray-text">
          재학 중 취득할 수 있는 국가·민간 자격증입니다. 좌우로 밀어 확인해 보세요.
        </p>
      </div>

      <SmoothScrollSlider
        items={ITEMS}
        slideWidth={236}
        slideHeight={310}
        spacing={18}
        radius={10}
        maxScale={1.7}
        minScale={0.7}
        dim={0.35}
        autoplay={24}
        fit="cover"
        className="page-container"
        aria-label="자격증 캐러셀"
      />
    </section>
  )
}
