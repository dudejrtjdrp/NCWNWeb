/**
 * BASE 컴포넌트: ProfessorDetailSection
 * Figma: ABOUT/Faculty/Detail/배윤경/Desktop (node-id: 926:430)
 *
 * ─ 레이어 구조 (Figma 동일) ────────────────────────────────
 *  [페이지 래퍼 bg-white]
 *    ├─ NWCN bg #1 : absolute, top=0, width=88.16%, height=350px — 프로필 섹션 위
 *    ├─ 여백(spacer)  : NWCN bg가 보이는 흰 영역
 *    ├─ #fcfcfc 프로필 섹션 (z-10) ← NWCN bg 위에 떠있는 흰 블록
 *    │    ├─ ProfileBgCircle SVG (rotation baked-in) : absolute left=9.44%, top=40px
 *    │    ├─ 프로필 사진               : absolute left=13.75%, top=30px   (photo z-10)
 *    │    ├─ 이름/이메일               : absolute left=13.54%, top=520px
 *    │    └─ CAREER                   : absolute left=52.43%, top=69px
 *    ├─ NWCN bg #2 : 프로필↔인터뷰 사이 흰 여백에 보임
 *    └─ 인터뷰 섹션 (z-10, gradient)
 *
 * ─ Figma 측정값 (1440px 기준) ──────────────────────────────
 *  ProfileBgCircle SVG (398×358, rotation baked):
 *    container left=136(9.44%), top=40, w=524(36.39%), h≈495
 *    → SVG를 36.39% width, height=auto로 렌더 (rotate 추가 없음)
 *  ProfileImage: left=198(13.75%), top=30, w=349(24.24%), h=466
 *  ProfileInfo:  left=195(13.54%), top=520
 *  CareerSection: left=755(52.43%), top=69, w=498(34.58%)
 * ──────────────────────────────────────────────────────────
 */

import Image from 'next/image'
import Link from 'next/link'
import type { FacultyData } from '@/lib/faculty-data'
import CareerList from '@/components/base/CareerList'

const IMG_NWCN_BG = '/images/department/nwcn-logo.png'

/* ──────────────────────────────────────────────────────
   텍스트 파싱 — **bold** 마커 → <strong>
   ────────────────────────────────────────────────────── */
function parseInlineText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) =>
    part.startsWith('**') ? (
      <strong key={i} className="font-bold text-[#050505]">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

function parseAnswer(answer: string) {
  const paras = answer.split('\n\n')
  return paras.map((para, pi) => (
    <p
      key={pi}
      className="text-[clamp(14px,1.39vw,20px)] font-body font-normal text-[#888]"
      style={{ lineHeight: '26px' }}
    >
      {parseInlineText(para)}
    </p>
  ))
}

/* ──────────────────────────────────────────────────────
   마무리 인용문 렌더 — 강조 문구를 손그림 동그라미 SVG로 감싼다.
   기존: 교수마다 절대좌표(top/left)를 수동 지정 → 위치가 어긋남.
   개선: 강조 단어 위에 인라인으로 원을 겹쳐 화면 크기·교수와 무관하게 항상 정렬.
   ────────────────────────────────────────────────────── */
function renderClosingQuote(quote: string, highlight: string | undefined, svgSrc: string) {
  const lines = quote.split('\n')
  return lines.map((line, li) => {
    const idx = highlight ? line.indexOf(highlight) : -1
    return (
      <span key={li}>
        {idx >= 0 && highlight ? (
          <>
            {line.slice(0, idx)}
            <span className="relative inline-block whitespace-nowrap">
              <img
                src={svgSrc}
                alt=""
                aria-hidden="true"
                className="pointer-events-none select-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
                style={{ width: '122%', height: 'auto' }}
              />
              <span className="relative z-10">{highlight}</span>
            </span>
            {line.slice(idx + highlight.length)}
          </>
        ) : (
          line
        )}
        {li < lines.length - 1 && <br />}
      </span>
    )
  })
}

/* ── Props ── */
export interface ProfessorDetailSectionProps {
  faculty: FacultyData
  className?: string
}

export default function ProfessorDetailSection({
  faculty,
  className,
}: ProfessorDetailSectionProps) {
  const displayName = faculty.roleLabel
    ? `${faculty.nameKo} (${faculty.roleLabel})`
    : faculty.nameKo
  const hasInterview = !!faculty.interview

  return (
    /* ─────────────────────────────────────────────────────────
       최상위 래퍼: 흰 배경, 상대위치
       NWCN 배경 이미지들이 absolute 로 배치됨
       ───────────────────────────────────────────────────────── */
    <div className={`relative bg-white overflow-x-hidden ${className ?? ''}`}>

      {/* ══ NWCN 배경 #1 ══
          Figma: left=0, top=85(page) → 여기서는 top=0(컴포넌트 최상단)
          width=88.16%(1269/1440), height=350px
          z-0 → 프로필 섹션(z-10) 뒤에 위치 */}
      <div
        className="absolute left-0 top-0 pointer-events-none select-none"
        style={{ width: '88.16%', height: '350px', zIndex: 0 }}
        aria-hidden="true"
      >
        <div className="absolute" style={{ inset: '-0.86% -0.24%' }}>
          <img
            src={IMG_NWCN_BG}
            alt=""
            className="block w-full h-full"
            style={{ maxWidth: 'none', objectFit: 'fill' }}
          />
        </div>
      </div>

      {/* ══ 상단 여백 (NWCN bg가 보이는 흰 영역) ══
          모바일: 20px, 데스크탑: 80px */}
      <div className="relative h-[20px] lg:h-[80px]" style={{ zIndex: 10 }} />

      {/* ══════════════════════════════════════════════════════
          프로필 섹션
          Figma 926:447 — bg-[#fcfcfc], 1440×649px
          z-10 → NWCN bg 위에 떠있는 흰 블록
          ══════════════════════════════════════════════════════ */}
      <section
        className="relative bg-[#fcfcfc]"
        style={{ minHeight: 'clamp(400px, 45vw, 649px)', zIndex: 10 }}
        aria-label="교수 프로필"
      >
        {/* ── 데스크탑 레이아웃 (lg+) ── */}
        <div
          className="hidden lg:block relative mx-auto"
          style={{ maxWidth: 1440, minHeight: 'clamp(400px, 45vw, 649px)', height: 'clamp(400px, 45vw, 649px)' }}
        >
          {faculty.combinedImageUrl ? (
            /* ── 합쳐진 이미지 (타원 + 프로필 사진) ────────────
               타원과 사진의 상대 위치가 이미 이미지에 baked-in 되어 있어
               별도 타원 SVG 없이 그룹 bounding box 위치에 그대로 배치
               Figma group bbox: left=136(9.44%), top=30(4.6%), w=524(36.39%)
               이미지 비율 525:506 → height auto
               ─────────────────────────────────────────────── */
            <img
              src={faculty.combinedImageUrl}
              alt={`${faculty.nameKo} ${faculty.roleLabel ?? faculty.role} 프로필 사진`}
              className="absolute pointer-events-none select-none"
              style={{
                left: '9.44%',
                top: '4.6%',
                width: '36.39%',
                height: 'auto',
                zIndex: 10,
              }}
            />
          ) : (
            <>
              {/* ── ProfileBgCircle ──────────────────────────────
                  Figma: container left=136(9.44%), top=40, w=524(36.39%), h≈495
                  SVG 398×358 — rotation은 SVG 내부에 이미 baked-in → CSS rotation 없음
                  width를 container 너비(36.39%)로 설정, height는 비율 유지
                  z-0: 사진(z-10) 뒤에 위치
                  ─────────────────────────────────────────────── */}
              <img
                src="/images/faculty/ProfileBgCircle.svg"
                alt=""
                aria-hidden="true"
                className="absolute pointer-events-none select-none"
                style={{
                  left: '15.44%',
                  top: '6.2%',
                  width: '30%',
                  height: 'auto',
                  zIndex: 0,
                }}
              />

              {/* ── 프로필 사진 ──────────────────────────────────
                  Figma: left≈198px(13.75%), top=30, w=349(24.24%), h=466
                  aspect-ratio 349:466 → vw 기반으로 반응형 스케일
                  z-10: 타원 위에 표시
                  ─────────────────────────────────────────────── */}
              <div
                className="absolute overflow-hidden"
                style={{
                  left: '13.75%',
                  top: '4.6%',
                  width: '24.24%',
                  aspectRatio: '349 / 466',
                  zIndex: 10,
                }}
              >
                {faculty.photoUrl ? (
                  <Image
                    src={faculty.photoUrl}
                    alt={`${faculty.nameKo} ${faculty.roleLabel ?? faculty.role} 프로필 사진`}
                    fill
                    className="object-cover object-top"
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-nwcn-green flex items-end justify-center pb-8">
                    <span className="font-body font-extrabold text-[96px] text-black/10 leading-none">
                      {faculty.nameKo[0]}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── 이름 + 이메일 ─────────────────────────────────
              Figma: left=195(13.54%), top=520
              ─────────────────────────────────────────────── */}
          <div
            className="absolute flex flex-col gap-[10px]"
            style={{ left: '13.54%', top: '80%', zIndex: 10 }}
          >
            <h1
              className="font-body font-bold text-[24.415px] text-black leading-normal"
            >
              {displayName}
            </h1>
            {faculty.email && (
              <a
                href={`mailto:${faculty.email}`}
                className="font-body font-normal text-[24px] text-[#888] leading-normal hover:text-nwcn-green transition-colors"
              >
                {faculty.email}
              </a>
            )}
          </div>

          {/* ── CAREER ───────────────────────────────────────
              Figma: left=755(52.43%), top=69, w=498(34.58%)
              items-end: 오른쪽 정렬 (Figma와 동일)
              ─────────────────────────────────────────────── */}
          {faculty.career && faculty.career.length > 0 && (
            <div
              className="absolute flex flex-col gap-[21px] items-end"
              style={{ left: '52.43%', top: '10.6%', width: '34.58%', zIndex: 10 }}
            >
              <p className="font-body font-extrabold text-[26.261px] text-nwcn-green leading-normal w-full">
                CAREER
              </p>
              <CareerList
                items={faculty.career}
                collapsedCount={5}
                className="w-full"
                itemClassName="w-full font-body font-normal text-[20px] text-[#050505]"
                lineHeight="34.467px"
                buttonClassName="text-[17px]"
              />
            </div>
          )}
        </div>

        {/* ── 모바일 레이아웃 (<lg) ── */}
        <div className="lg:hidden px-6 pt-10 pb-12 flex flex-col gap-8">
          {/* 사진 */}
          {faculty.combinedImageUrl ? (
            /* 합쳐진 이미지 (타원 + 사진) — 비율 525:506 유지 */
            <img
              src={faculty.combinedImageUrl}
              alt={`${faculty.nameKo} 프로필 사진`}
              className="w-full max-w-[360px] mx-auto h-auto pointer-events-none select-none"
            />
          ) : (
            <div
              className="relative w-full max-w-[300px] mx-auto overflow-hidden"
              style={{ aspectRatio: '349/466' }}
            >
              {faculty.photoUrl ? (
                <Image
                  src={faculty.photoUrl}
                  alt={`${faculty.nameKo} 프로필 사진`}
                  fill
                  className="object-cover object-top"
                  priority
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-nwcn-green flex items-end justify-center pb-8">
                  <span className="font-body font-extrabold text-[60px] text-black/10 leading-none">
                    {faculty.nameKo[0]}
                  </span>
                </div>
              )}
            </div>
          )}
          {/* 이름 + 이메일 */}
          <div className="flex flex-col gap-2">
            <h1 className="font-body font-bold text-[20px] text-black leading-normal">
              {displayName}
            </h1>
            {faculty.email && (
              <a
                href={`mailto:${faculty.email}`}
                className="font-body font-normal text-[15px] text-[#888] leading-normal hover:text-nwcn-green transition-colors"
              >
                {faculty.email}
              </a>
            )}
          </div>
          {/* CAREER */}
          {faculty.career && faculty.career.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="font-body font-extrabold text-[20px] text-nwcn-green leading-normal">
                CAREER
              </p>
              <CareerList
                items={faculty.career}
                collapsedCount={4}
                itemClassName="font-body font-normal text-[14px] text-[#050505]"
                lineHeight={1.75}
                buttonClassName="text-[14px]"
              />
            </div>
          )}
        </div>
      </section>

      {/* ══ NWCN 배경 #2 ══
          Figma: top=709(page) → 프로필 섹션 아래 여백에 위치
          relative 섹션으로 높이를 확보하고 absolute NWCN bg 배치 */}
      {hasInterview && (
        <div className="relative" style={{ height: 80, zIndex: 5 }}>
          <div
            className="absolute left-0 top-0 pointer-events-none select-none"
            style={{ width: '88.16%', height: '350px', zIndex: 0 }}
            aria-hidden="true"
          >
            <div className="absolute" style={{ inset: '-0.86% -0.24%' }}>
              <img
                src={IMG_NWCN_BG}
                alt=""
                className="block w-full h-full"
                style={{ maxWidth: 'none', objectFit: 'fill' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          인터뷰 섹션
          Figma 926:459 — pt=74, pb=165, px=188
          bg: gradient #fcfcfc → white
          z-10 → NWCN bg #2 위에 위치
          ══════════════════════════════════════════════════════ */}
      {hasInterview && faculty.interview ? (
        <section
          className="relative"
          style={{
            background: 'linear-gradient(to bottom, #fcfcfc, #ffffff)',
            zIndex: 10,
          }}
          aria-label="교수 인터뷰"
        >
          <div
            className="mx-auto flex flex-col items-center"
            style={{
              maxWidth: 1440,
              paddingTop: 'clamp(40px, 5.14vw, 74px)',
              paddingBottom: 'clamp(60px, 11.46vw, 165px)',
              paddingLeft: 'clamp(24px, 13.06vw, 188px)',
              paddingRight: 'clamp(24px, 13.06vw, 188px)',
            }}
          >
            {/* gap: content ↔ FACULTY 링크 = 108px */}
            <div className="w-full flex flex-col items-center gap-[clamp(60px,7.5vw,108px)]">

              {/* interview content: Q&A ↔ Closing gap = 153px */}
              <div className="w-full flex flex-col items-center gap-[clamp(60px,10.63vw,153px)]">

                {/* INTERVIEW 헤딩 + Q&A list — gap=57px */}
                <div className="w-full flex flex-col gap-[clamp(28px,3.96vw,57px)] items-start">
                  <p className="font-brand font-extrabold text-[clamp(20px,1.94vw,28px)] text-nwcn-green leading-normal w-full">
                    INTERVIEW
                  </p>

                  <div className="w-full flex flex-col gap-[clamp(28px,3.96vw,57px)] items-start">
                    {faculty.interview.qa.map((item, idx) => (
                      <div key={idx} className="w-full flex flex-col gap-[clamp(20px,3.4vw,49px)]">
                        {/* 질문 */}
                        <p className="font-body font-bold text-[clamp(16px,1.67vw,24px)] text-black leading-normal">
                          {item.question}
                        </p>
                        {/* 답변 */}
                        <div className="flex flex-col gap-0 max-w-[1061px]">
                          {parseAnswer(item.answer)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── 마무리 (ClosingGroup) ── */}
                <div className="w-full flex flex-col items-center gap-[clamp(32px,4.31vw,62px)]">
                  {/* 마지막 질문 */}
                  <p className="font-body font-bold text-[clamp(16px,1.67vw,24px)] text-black text-center leading-normal max-w-[544px]">
                    {faculty.interview.closingQuestion}
                  </p>

                  {/* 인용 문구 — 강조 단어를 감싸는 인라인 동그라미(자동 정렬) */}
                  <div className="w-full flex justify-center">
                    <div className="relative max-w-[916px] w-full">
                      <p className="font-body font-bold text-[clamp(20px,2.5vw,36px)] text-black text-center leading-[1.7]">
                        {renderClosingQuote(
                          faculty.interview.closingQuote,
                          faculty.interview.closingHighlight,
                          `/images/faculty/${faculty.id}-highlight.svg`,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FACULTY 복귀 링크 */}
              <Link
                href="/about/faculty"
                className="font-body font-normal text-[clamp(14px,1.39vw,20px)] text-[#888] text-center leading-[26px] hover:text-nwcn-green transition-colors"
                aria-label="교수진 목록으로 돌아가기"
              >
                FACULTY
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <div className="relative flex justify-center py-16" style={{ zIndex: 10 }}>
          <Link
            href="/about/faculty"
            className="inline-flex items-center gap-2 font-body text-[14px] text-[#888] hover:text-nwcn-green transition-colors group"
            aria-label="교수진 목록으로 돌아가기"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-1"
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            교수진 목록으로
          </Link>
        </div>
      )}
    </div>
  )
}
