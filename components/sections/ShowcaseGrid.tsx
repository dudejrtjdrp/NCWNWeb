'use client'

import Image from 'next/image'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'

// TODO: Supabase fetch로 교체
const PLACEHOLDER_WORKS = [
  { id: '1', title: '빛의 도시', author: '김민준', tech_stack: ['Video', 'Motion'], view_count: 342, year: 2025, thumbnail_url: null },
  { id: '2', title: 'Digital Fragments', author: '이서연', tech_stack: ['Graphic', 'AI'], view_count: 218, year: 2025, thumbnail_url: null },
  { id: '3', title: '도시의 소리', author: '박태양', tech_stack: ['Web', 'Video'], view_count: 189, year: 2025, thumbnail_url: null },
  { id: '4', title: 'Metamorphosis', author: '최지우', tech_stack: ['Motion', 'Graphic'], view_count: 156, year: 2024, thumbnail_url: null },
  { id: '5', title: '연결의 언어', author: '정하늘', tech_stack: ['Web', 'AI'], view_count: 134, year: 2024, thumbnail_url: null },
  { id: '6', title: 'Still Life 2024', author: '윤채원', tech_stack: ['Photo'], view_count: 98, year: 2024, thumbnail_url: null },
]

interface ShowcaseGridProps {
  activeFilter: string
}

export default function ShowcaseGrid({ activeFilter }: ShowcaseGridProps) {
  const filtered = activeFilter === '전체'
    ? PLACEHOLDER_WORKS
    : PLACEHOLDER_WORKS.filter((w) => w.tech_stack.includes(activeFilter))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((work, i) => (
        <AnimateOnScroll
          key={work.id}
          variant="fade-up"
          delay={Math.min((i % 3) * 80, 160)}
        >
          <Link href={`/work/${work.id}`} className="block">
            <article className="card-base group cursor-pointer h-full">
              {/* 썸네일 */}
              <div className="aspect-[4/3] bg-nwcn-dark-3 relative overflow-hidden">
                {work.thumbnail_url ? (
                  <Image src={work.thumbnail_url} alt={work.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-nwcn-dark-3 to-nwcn-dark-2">
                    <span className="font-brand text-5xl text-nwcn-green/10">{work.title[0]}</span>
                  </div>
                )}
                {/* 조회수 */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span className="font-body text-xs text-white/80">{work.view_count}</span>
                </div>
              </div>
              {/* 정보 */}
              <div className="p-5">
                <h3 className="font-body text-base text-white font-semibold mb-1 group-hover:text-nwcn-green transition-colors">
                  {work.title}
                </h3>
                <p className="font-body text-sm text-white/40 mb-3">{work.author} · {work.year}</p>
                <div className="flex flex-wrap gap-1.5">
                  {work.tech_stack.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            </article>
          </Link>
        </AnimateOnScroll>
      ))}
    </div>
  )
}
