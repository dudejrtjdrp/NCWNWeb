/**
 * BASE 컴포넌트: ProfessorDetailSection
 * Figma: ABOUT/Faculty/Detail/배윤경/Desktop (node-id: 926:430)
 *
 * ─ 화면 구성 ──────────────────────────────────────────
 * 1. FacultyDetailSection — 프로필 사진 + 경력(CAREER) + 이름/이메일
 * 2. InterviewSection     — 5개 Q&A + 마지막 인용 문구
 * 3. 하단 FACULTY 목록 복귀 링크
 * ──────────────────────────────────────────────────────
 *
 * ─ 컴포넌트 규칙 ──────────────────────────────────────
 * - 순수 UI 컴포넌트 (기능 로직 없음)
 * - 모든 데이터는 props(FacultyData)로 전달
 * - 모든 교수진에게 동일한 템플릿 적용 가능
 * ──────────────────────────────────────────────────────
 */

import Image from 'next/image'
import Link from 'next/link'
import type { FacultyData } from '@/lib/faculty-data'

/* ── 에셋 경로 ── */
const IMG_NWCN_BG = '/images/department/nwcn-logo.png'

/* ──────────────────────────────────────────────────────
   텍스트 파싱 유틸 — **bold** 마커 → <strong>
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
  return answer.split('\n\n').map((para, pi) => (
    <p
      key={pi}
      className="leading-[26px] text-[20px] font-body font-normal text-[#888] whitespace-pre-wrap"
      style={{ marginBottom: pi < answer.split('\n\n').length - 1 ? '0' : undefined }}
    >
      {parseInlineText(para)}
    </p>
  ))
}

/* ──────────────────────────────────────────────────────
   ProfileBgCircle — Figma의 타원형 배경 장식 (CSS 재현)
   ────────────────────────────────────────────────────── */
function ProfileBgCircle() {
  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: '136px',
        top: '40px',
        width: '524px',
        height: '495px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-hidden="true"
    >
      <div
        style={{
          width: '470px',
          height: '253px',
          transform: 'rotate(-39.56deg)',
          border: '2px solid rgba(9, 245, 147, 0.35)',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(9,245,147,0.08) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}

/* ──────────────────────────────────────────────────────
   NWCN 배경 장식 텍스트 이미지
   ────────────────────────────────────────────────────── */
function NwcnBg({ top }: { top: number }) {
  return (
    <div
      className="absolute left-0 pointer-events-none select-none overflow-hidden"
      style={{ top, width: '1270px', height: '350px' }}
      aria-hidden="true"
    >
      <img
        src={IMG_NWCN_BG}
        alt=""
        className="block w-full h-full"
        style={{ maxWidth: 'none', objectFit: 'fill' }}
      />
    </div>
  )
}

/* ──────────────────────────────────────────────────────
   QuoteHighlight — 인용문 강조 밑줄 장식 (CSS 재현)
   ────────────────────────────────────────────────────── */
function QuoteHighlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline">
      {/* 하이라이트 밑줄 장식 */}
      <span
        className="absolute bottom-[-4px] left-0 right-0 pointer-events-none"
        style={{
          height: '10px',
          background: 'linear-gradient(90deg, #E3E94D 0%, #09F593 100%)',
          borderRadius: '2px',
          opacity: 0.6,
          transform: 'rotate(-0.28deg)',
        }}
        aria-hidden="true"
      />
      <span className="relative">{children}</span>
    </span>
  )
}

/* ──────────────────────────────────────────────────────
   Props 인터페이스
   ────────────────────────────────────────────────────── */
export interface ProfessorDetailSectionProps {
  faculty: FacultyData
  className?: string
}

/* ──────────────────────────────────────────────────────
   메인 컴포넌트
   ────────────────────────────────────────────────────── */
export default function ProfessorDetailSection({
  faculty,
  className,
}: ProfessorDetailSectionProps) {
  const displayName = faculty.roleLabel
    ? `${faculty.nameKo} (${faculty.roleLabel})`
    : faculty.nameKo

  const hasInterview = !!faculty.interview

  return (
    <div
      className={`bg-white relative overflow-hidden ${className ?? ''}`}
      data-node-id="926:430"
    >
      {/* ══ 배경 NWCN 로고 데코레이션 ══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <NwcnBg top={85} />
        <NwcnBg top={709} />
      </div>

      {/* ══ 1. FacultyDetailSection ══ */}
      <section
        className="relative mx-auto bg-[#fcfcfc]"
        style={{
          maxWidth: '1440px',
          minHeight: '649px',
          paddingTop: '40px',
          paddingBottom: '40px',
        }}
        data-node-id="926:447"
        aria-label="교수 프로필"
      >
        {/* ── 데스크탑: flex 2열 레이아웃 ── */}
        <div className="relative flex flex-col md:flex-row items-start gap-10 md:gap-0 px-6 md:px-0">

          {/* ── 프로필 영역 (좌측) ── */}
          <div
            className="relative flex-shrink-0 md:ml-[136px] flex flex-col items-start"
            data-node-id="926:451"
          >
            {/* 타원형 배경 장식 (데스크탑만) */}
            <div className="relative" style={{ width: '349px', minHeight: '466px' }}>
              <ProfileBgCircle />

              {/* 프로필 사진 */}
              <div
                className="relative overflow-hidden rounded-[4px] shadow-md"
                style={{ width: '349px', height: '466px' }}
                data-node-id="926:454"
              >
                {faculty.photoUrl ? (
                  <Image
                    src={faculty.photoUrl}
                    alt={`${faculty.nameKo} ${faculty.role} 프로필 사진`}
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
            </div>

            {/* 이름 + 이메일 */}
            <div
              className="mt-6 md:mt-8 flex flex-col gap-1"
              data-node-id="926:455"
            >
              <h1
                className="font-body font-bold text-[24px] text-black leading-normal"
                data-node-id="926:456"
                lang="ko"
              >
                {displayName}
              </h1>
              {faculty.email && (
                <a
                  href={`mailto:${faculty.email}`}
                  className="font-body font-normal text-[20px] text-[#888] leading-normal hover:text-nwcn-green transition-colors"
                  data-node-id="926:457"
                >
                  {faculty.email}
                </a>
              )}
            </div>
          </div>

          {/* ── CAREER 영역 (우측) ── */}
          {faculty.career && faculty.career.length > 0 && (
            <div
              className="flex-1 flex flex-col gap-5 md:ml-[75px] md:mt-[69px] md:max-w-[498px]"
              data-node-id="926:448"
            >
              <p
                className="font-body font-extrabold text-[26px] text-nwcn-green leading-normal"
                data-node-id="926:449"
              >
                CAREER
              </p>
              <div
                className="flex flex-col font-body font-normal text-[20px] text-[#050505]"
                style={{ lineHeight: '34.467px' }}
                data-node-id="926:450"
              >
                {faculty.career.map((item, i) => (
                  <p key={i}>{item}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══ 2. InterviewSection ══ */}
      {hasInterview && faculty.interview && (
        <>
          {/* 배경 그라디언트 */}
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              top: '1059px',
              height: '2031px',
              background: 'linear-gradient(to bottom, #fcfcfc, #ffffff)',
            }}
            aria-hidden="true"
          />

          <section
            className="relative mx-auto flex flex-col items-center"
            style={{
              maxWidth: '1440px',
              paddingTop: '74px',
              paddingBottom: '165px',
              paddingLeft: 'clamp(24px, 13.06%, 188px)',
              paddingRight: 'clamp(24px, 13.06%, 188px)',
            }}
            data-node-id="926:459"
            aria-label="교수 인터뷰"
          >
            <div className="w-full flex flex-col gap-[108px] items-center">

              {/* ── 인터뷰 콘텐츠 ── */}
              <div className="w-full flex flex-col gap-[153px] items-center">

                {/* 헤더 + Q&A */}
                <div className="w-full flex flex-col gap-[57px] items-start">

                  {/* "INTERVIEW" 헤딩 */}
                  <p
                    className="font-brand font-extrabold text-[28px] text-nwcn-green leading-normal w-full"
                    data-node-id="926:462"
                  >
                    INTERVIEW
                  </p>

                  {/* Q&A 목록 */}
                  <div
                    className="w-full flex flex-col gap-[57px] items-start"
                    data-node-id="926:463"
                  >
                    {faculty.interview.qa.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col gap-[49px] w-full"
                        data-node-id={`926:${464 + idx * 3}`}
                      >
                        {/* 질문 */}
                        <p
                          className="font-body font-bold text-[24px] text-black leading-normal max-w-[1061px]"
                        >
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

                {/* ── 마무리 인용 ── */}
                <div
                  className="w-full flex flex-col items-center gap-[62px]"
                  data-node-id="926:479"
                >
                  {/* 마지막 질문 */}
                  <p
                    className="font-body font-bold text-[24px] text-black text-center leading-normal max-w-[544px]"
                    data-node-id="926:480"
                  >
                    {faculty.interview.closingQuestion}
                  </p>

                  {/* 인용 문구 + 하이라이트 */}
                  <div
                    className="relative w-full flex flex-col items-center"
                    data-node-id="926:481"
                  >
                    {/* 하이라이트 장식 (인용 문구 뒤에 배치되어 특정 단어 강조) */}
                    {faculty.interview.closingHighlight && (
                      <div
                        className="absolute pointer-events-none select-none"
                        style={{
                          top: '39px',
                          left: '50%',
                          transform: 'translateX(-10%)',
                          width: '248px',
                          height: '58px',
                          background: 'linear-gradient(90deg, #E3E94D 0%, #09F593 60%, #E3E94D 100%)',
                          borderRadius: '4px',
                          opacity: 0.35,
                          rotate: '-0.28deg',
                        }}
                        aria-hidden="true"
                      />
                    )}

                    {/* 인용 문구 */}
                    <p
                      className="relative font-body font-bold text-[36px] text-black text-center leading-normal max-w-[916px] z-10"
                      data-node-id="926:483"
                    >
                      {faculty.interview.closingQuote.split('\n').map((line, li) => (
                        <span key={li}>
                          {faculty.interview!.closingHighlight && line.includes(faculty.interview!.closingHighlight)
                            ? line.split(faculty.interview!.closingHighlight).map((part, pi, arr) => (
                                <span key={pi}>
                                  {part}
                                  {pi < arr.length - 1 && (
                                    <QuoteHighlight>
                                      {faculty.interview!.closingHighlight}
                                    </QuoteHighlight>
                                  )}
                                </span>
                              ))
                            : line}
                          {li < faculty.interview!.closingQuote.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── 목록 복귀 링크 ── */}
              <Link
                href="/about/faculty"
                className="font-body font-normal text-[20px] text-[#888] text-center leading-[26px] hover:text-nwcn-green transition-colors"
                aria-label="교수진 목록으로 돌아가기"
                data-node-id="926:484"
                data-annotations="클릭하면 다시 목록으로 돌아감"
              >
                FACULTY
              </Link>
            </div>
          </section>
        </>
      )}

      {/* ══ 인터뷰 없을 때 — 기본 뒤로가기 ══ */}
      {!hasInterview && (
        <div className="flex justify-center py-16">
          <Link
            href="/about/faculty"
            className="inline-flex items-center gap-2 font-body text-[14px] text-[#888] hover:text-nwcn-green transition-colors group"
            aria-label="교수진 목록으로 돌아가기"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
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
