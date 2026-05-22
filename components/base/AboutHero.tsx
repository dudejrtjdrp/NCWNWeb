'use client'

/**
 * BASE 컴포넌트: AboutHero
 * About 계열 모든 서브 페이지(Department / Faculty / Curricullim / Lab) 공유 헤더
 *
 * ── 구조 ────────────────────────────────────────────
 *  [1] Hero 영역 (h=805px)
 *      - "ABOUT" 텍스트: Pretendard ExtraBold 56px, 우측
 *      - NWCN 대형 로고 이미지
 *  [2] SubNav 영역 (자체 높이, 흰색 배경, Hero와 명확히 분리)
 *      - DEPARTMENT | FACULTY | CURRICULLIM | LAB 탭
 *      - usePathname으로 활성 탭 결정
 *      - 활성: Bold #151515 + 그린 언더라인
 *      - 비활성: Regular/Light #888
 * ────────────────────────────────────────────────────
 *
 * Figma: node-id 291:76 / 427:831
 * 좌표계: Figma y − 64 = DeptSection y (NavBar 64px 오프셋)
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/* ─── 에셋 경로 (/public/images/department/ 로컬 저장) ─── */
const IMG_NWCN = '/images/department/nwcn-logo.png'
const IMG_LINE2 = '/images/department/line2.png'

/* ─── 탭 정의 ─── */
const ABOUT_TABS = [
  { label: 'DEPARTMENT', href: '/about/department', weight: 700 },
  { label: 'FACULTY',    href: '/about/faculty',    weight: 400 },
  { label: 'CURRICULLIM', href: '/about/curriculum', weight: 300 },
  { label: 'LAB',        href: '/about/lab',         weight: 300 },
]

export default function AboutHero() {
  const pathname = usePathname()

  return (
    <div style={{ background: '#fff' }}>

      {/* ══════════════════════════════════════════
          [1] HERO  h=805px
          Figma: DeptSection y 0–805
          ══════════════════════════════════════ */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 1440,
          margin: '0 auto',
          height: 805,
          overflow: 'hidden',
          background: '#fff',
        }}
      >
        {/* "ABOUT" 텍스트 — Figma: left=calc(79.17%-113px), center-y=157 */}
        <h1
          style={{
            position: 'absolute',
            left: 'calc(79.17% - 113px)',
            top: 157,
            transform: 'translateY(-50%)',
            margin: 0,
            fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
            fontWeight: 800,
            fontSize: 56,
            lineHeight: 'normal',
            color: '#050505',
            whiteSpace: 'nowrap',
          }}
        >
          ABOUT
        </h1>

        {/* NWCN 대형 로고 — Figma: left=0, top=261, w=1270, h=350 */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 261,
            width: 1270,
            height: 350,
          }}
        >
          <div style={{ position: 'absolute', inset: '-0.86% -0.24%' }}>
            <img
              src={IMG_NWCN}
              alt="NWCN 뉴미디어콘텐츠과"
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                maxWidth: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          [2] SUBNAV 탭 영역 — Hero 아래 완전히 분리
          흰색 배경 + 하단 보더로 시각적 구분
          Figma: Pretendard, gap=75px, active=Bold/#151515
          ══════════════════════════════════════ */}
      <div
        style={{
          width: '100%',
          background: '#fff',
          borderBottom: '1px solid #e8e8e8',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <nav
          aria-label="ABOUT 서브 메뉴"
          style={{
            maxWidth: 1440,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: 75,
          }}
        >
          {ABOUT_TABS.map((tab) => {
            const active = pathname === tab.href
            return (
              <Link
                key={tab.label}
                href={tab.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 10px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
                    fontWeight: active ? 700 : tab.weight,
                    fontSize: 24,
                    lineHeight: 'normal',
                    color: active ? '#151515' : '#888',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.15s',
                  }}
                >
                  {tab.label}
                </span>

                {/* 활성 탭 언더라인 — Figma Line2 이미지 */}
                {active && (
                  <div style={{ position: 'relative', width: '100%', height: 3 }}>
                    <img
                      src={IMG_LINE2}
                      alt=""
                      aria-hidden
                      style={{
                        position: 'absolute',
                        inset: '-3px 0 0 0',
                        width: '100%',
                        height: 6,
                        objectFit: 'fill',
                      }}
                    />
                  </div>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

    </div>
  )
}
