/**
 * BASE 컴포넌트: AboutHero (히어로 배너 전용)
 * Figma: node-id 291:76
 *
 * ── 구조 ───────────────────────────────────────────
 *  Hero 영역 (h=805px)
 *   - "ABOUT" 텍스트: Pretendard ExtraBold 56px, 우측 (79.17% 기준)
 *   - NWCN 대형 로고 이미지
 * ───────────────────────────────────────────────────
 *
 * ✅ 리팩토링: SubNav 분리 → 공용 SubNav 컴포넌트 사용
 *   - 기존: AboutHero 내부에 SubNav 내장 (inline styles)
 *   - 현재: 순수 히어로 배너만 담당
 *   - SubNav는 각 about/* 페이지에서 <SubNav items={ABOUT_NAV_ITEMS} />로 직접 사용
 *
 * ✅ 리팩토링: inline styles → Tailwind 전환
 */

/* ─── 에셋 경로 ─── */
const IMG_NWCN = '/images/department/nwcn-logo.png'

export default function AboutHero() {
  return (
    <div className="bg-white">
      {/* ── HERO h=805px — Figma: DeptSection y 0–805 ── */}
      <div className="relative w-full max-w-[1440px] mx-auto bg-white overflow-hidden"
        style={{ height: '805px' }}
      >
        {/* "ABOUT" 텍스트 — Figma: left=calc(79.17%-113px), top=157(center) */}
        <h1
          className="absolute whitespace-nowrap font-body font-extrabold text-[56px] leading-normal text-[#050505]"
          style={{
            left: 'calc(79.17% - 113px)',
            top: '157px',
            transform: 'translateY(-50%)',
          }}
        >
          ABOUT
        </h1>

        {/* NWCN 대형 로고 — Figma: left=0, top=261, w=1270, h=350 */}
        <div
          className="absolute"
          style={{ left: 0, top: 261, width: 1270, height: 350 }}
        >
          <div className="absolute" style={{ inset: '-0.86% -0.24%' }}>
            <img
              src={IMG_NWCN}
              alt="NWCN 뉴미디어콘텐츠과"
              className="block w-full h-full"
              style={{ maxWidth: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
