'use client'

/**
 * 섹션 컴포넌트: ExhibitionCarousel
 * ────────────────────────────────────────────────────────────
 * 졸업전시 포스터 가로형 캐러셀.
 * 기존 자체 커버플로우 → originkit "Smooth Scroll Slider" 기반
 * 관성 레일(SmoothScrollSlider)로 교체했다.
 * 포스터가 아직 등록되지 않은 연도는 가짜 이미지 대신
 * 브랜드 타이포 플레이스홀더로 표시된다.
 */

import SmoothScrollSlider, { type SlideItem } from '@/components/interactive/SmoothScrollSlider'
import type { ExhibitionItem } from '@/lib/supabase/queries/exhibitions'

interface Props {
  items: ExhibitionItem[]
}

export default function ExhibitionCarousel({ items }: Props) {
  if (items.length === 0) return null

  const slides: SlideItem[] = items.map((it) => ({
    id: it.id,
    src: it.poster_url,
    alt: `${it.year} 졸업전시 ${it.title} 포스터`,
    caption: `${it.year} · ${it.title}`,
    subCaption: it.theme ?? undefined,
    href: it.link ?? undefined,
  }))

  return (
    <div>
      <div className="mb-8 text-center">
        <p className="font-body text-label uppercase text-nwcn-gray-muted">Graduation Exhibition</p>
        <p className="mt-2 font-body text-section font-light text-nwcn-text-default">
          뉴미디어콘텐츠과 졸업전시
        </p>
      </div>

      <SmoothScrollSlider
        items={slides}
        slideWidth={268}
        slideHeight={358}
        spacing={22}
        radius={12}
        maxScale={1.8}
        minScale={0.68}
        dim={0.4}
        autoplay={20}
        fit="cover"
        aria-label="졸업전시 포스터 캐러셀"
      />
    </div>
  )
}
