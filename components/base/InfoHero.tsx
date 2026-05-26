/**
 * BASE 컴포넌트: InfoHero
 * INFO 섹션 히어로 배너
 *
 * 디자인:
 * - 배경: bg-white, 라이트/클린 톤
 * - 높이: 420px
 * - "INFO" 워터마크 + 학과 안내 타이틀
 * - 미니멀 모던 스타일
 */

export default function InfoHero() {
  return (
    <div className="bg-white">
      <div
        className="relative w-full max-w-[1440px] mx-auto overflow-hidden"
        style={{ height: '420px' }}
      >
        {/* 배경 워터마크 */}
        <div
          className="absolute select-none pointer-events-none"
          style={{ right: '-20px', bottom: '-20px' }}
          aria-hidden="true"
        >
          <span
            className="font-brand font-black text-[#f4f4f4]"
            style={{ fontSize: 'clamp(120px, 18vw, 280px)', lineHeight: 1 }}
          >
            INFO
          </span>
        </div>

        {/* 상단 장식 선 */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-nwcn-green via-nwcn-yellow to-transparent" />

        {/* 콘텐츠 */}
        <div
          className="absolute left-[79px] flex flex-col justify-center gap-5"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        >
          {/* 브레드크럼 */}
          <p className="font-body font-semibold text-[12px] tracking-[0.2em] text-nwcn-green">
            NWCN — INFORMATION
          </p>

          {/* 메인 타이틀 */}
          <h1
            className="font-brand font-bold text-nwcn-text-default"
            style={{ fontSize: 'clamp(40px, 6vw, 80px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
          >
            학과 안내
          </h1>

          {/* 설명 */}
          <p className="font-body text-[15px] text-[#888] leading-relaxed max-w-[420px]">
            입시 정보, 문의 연락처, 개인정보처리방침 등
            <br />
            학과 관련 안내 정보를 확인하세요.
          </p>

          {/* 하단 구분선 */}
          <div className="flex items-center gap-3 mt-2">
            <div className="w-8 h-[2px] bg-nwcn-green" />
            <div className="w-4 h-[2px] bg-nwcn-yellow" />
            <div className="w-2 h-[2px] bg-[#e0e0e0]" />
          </div>
        </div>
      </div>
    </div>
  )
}
