import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* 배경 그라디언트 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-nwcn-green/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-nwcn-yellow/5 rounded-full blur-[100px]" />
      </div>

      {/* 그리드 패턴 */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="page-container relative z-10 pt-32 pb-20">
        <div className="max-w-5xl">
          {/* 레이블 */}
          <div className="flex items-center gap-3 mb-8">
            <span className="w-8 h-px bg-nwcn-green" />
            <span className="font-body text-xs font-semibold tracking-widest text-nwcn-green">
              NEWMEDIA CONTENTS
            </span>
          </div>

          {/* 메인 헤드라인 */}
          <h1 className="font-brand text-display-xl text-white leading-tight mb-8">
            예술과 기술이<br />
            만나는 곳에서<br />
            <span className="text-gradient-green">새로운 미디어</span>를<br />
            만들어냅니다
          </h1>

          {/* 서브 카피 */}
          <p className="font-body text-lg text-white/50 max-w-xl leading-relaxed mb-12">
            동아방송예술대학교 뉴미디어콘텐츠과는 방송, 예술, IT가 교차하는
            융복합 창의 인재를 양성합니다.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap gap-4">
            <Button href="/about/department" size="lg">
              학과 소개 보기
            </Button>
            <Button href="/work/showcase" variant="outline" size="lg">
              학생 작품 보기
            </Button>
          </div>
        </div>

        {/* 스크롤 인디케이터 */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="font-body text-xs text-white/20 tracking-widest">SCROLL</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </div>
    </section>
  )
}
