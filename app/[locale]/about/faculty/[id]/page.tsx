/**
 * 교수진 상세 페이지
 * Route: /about/faculty/[id]
 *
 * ─ 화면 구성 ─────────────────────────────────────────
 * 1. 교수 사진 (대형)
 * 2. 교수 이름 (한글 + 영문)
 * 3. 직급 + 이메일
 * 4. 교수님의 한마디 (인용문)
 * 5. 뒤로 가기 버튼
 * ──────────────────────────────────────────────────────
 */

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import SubPageLayout from '@/components/layout/SubPageLayout'
import { FACULTY_LIST } from '@/lib/faculty-data'
import { getTranslations } from 'next-intl/server'

// ──────────────────────────────────────────────────────
// Static Params (빌드 시 정적 생성)
// ──────────────────────────────────────────────────────
export function generateStaticParams() {
  return FACULTY_LIST.map((f) => ({ id: f.id }))
}

// ──────────────────────────────────────────────────────
// Metadata
// ──────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = await params
  const faculty = FACULTY_LIST.find((f) => f.id === id)
  if (!faculty) return { title: '교수진 — NWCN' }
  return {
    title: `${faculty.nameKo} ${faculty.role} — ABOUT | NWCN`,
    description: faculty.quote,
  }
}

// ──────────────────────────────────────────────────────
// Page Component
// ──────────────────────────────────────────────────────
export default async function FacultyDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params
  const faculty = FACULTY_LIST.find((f) => f.id === id)
  if (!faculty) notFound()

  const t = await getTranslations({ locale, namespace: 'about.faculty.detail' })

  /* 배경 accent 색상 (variant별) */
  const accentColor =
    faculty.colorVariant === 'yellow'
      ? '#E3E94D'
      : faculty.colorVariant === 'green-gradient'
        ? 'transparent'
        : '#09F593'

  const isgreenGradient = faculty.colorVariant === 'green-gradient'

  return (
    <SubPageLayout>
      {/* ── 히어로 영역 ─────────────────────────────── */}
      <section className="relative bg-white overflow-hidden pt-16 pb-0">
        {/* 배경 accent 블롭 */}
        <div
          className="absolute top-0 left-0 w-full h-[460px] opacity-10 pointer-events-none"
          aria-hidden="true"
          style={{
            background: isgreenGradient
              ? 'linear-gradient(to bottom right, #00FF95, #007E4A)'
              : `radial-gradient(ellipse at 50% 0%, ${accentColor} 0%, transparent 70%)`,
          }}
        />

        <div className="page-container relative z-10">
          {/* 뒤로 가기 */}
          <Link
            href="/about/faculty"
            className="inline-flex items-center gap-2 mb-10 font-body text-[14px] text-[#888] hover:text-nwcn-green transition-colors group"
            aria-label={t('backToList')}
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-1"
              fill="none" stroke="currentColor" strokeWidth="2"
              viewBox="0 0 24 24" aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t('backToList')}
          </Link>

          {/* 메인 카드 레이아웃 */}
          <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-start md:items-center pb-20">

            {/* ── 교수 사진 카드 ─────────────────────── */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              {/* Figma 카드 스타일 그대로 대형 버전 적용 */}
              <div
                className="relative w-[290px] h-[379px] rounded-[5.21px] overflow-hidden shadow-[0px_8px_24px_rgba(0,0,0,0.20)]"
                style={
                  isgreenGradient
                    ? { background: 'linear-gradient(to bottom, #00FF95, #007E4A)' }
                    : { backgroundColor: accentColor }
                }
              >
                {faculty.photoUrl ? (
                  <Image
                    src={faculty.photoUrl}
                    alt={`${faculty.nameKo} ${faculty.role}`}
                    fill
                    className="object-cover object-top rounded-[5px] mt-[9px]"
                    priority
                    unoptimized={faculty.photoUrl.startsWith('http')}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="font-body font-extrabold text-[96px] leading-none text-black/10"
                      aria-hidden="true"
                    >
                      {faculty.nameKo[0]}
                    </span>
                  </div>
                )}

                {/* 좌측 수직 이름 (카드 디자인 유지) */}
                <div
                  className="absolute left-0 top-0 w-[78px] h-full flex items-center justify-center z-10"
                  aria-hidden="true"
                >
                  <div className="flex-none rotate-90">
                    <span
                      className="block font-body font-extrabold text-[36.5px] leading-[60px] whitespace-nowrap select-none bg-gradient-to-r bg-clip-text text-transparent"
                      style={
                        isgreenGradient
                          ? { backgroundImage: 'linear-gradient(to right, white 46%, #00FF95)' }
                          : { backgroundImage: 'linear-gradient(to right, black, #007042)' }
                      }
                    >
                      {faculty.nameEn}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 교수 정보 ───────────────────────────── */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              {/* 직급 뱃지 */}
              <span
                className="inline-block mb-4 px-4 py-1 rounded-full font-body font-medium text-[13px] text-[#050505]"
                style={{ backgroundColor: accentColor !== 'transparent' ? accentColor : '#09F593' }}
              >
                {faculty.role}
              </span>

              {/* 한글 이름 — 영어 모드에서도 한글 이름 유지 */}
              <h1
                className="font-body font-extrabold text-[48px] md:text-[56px] text-[#050505] leading-tight mb-1"
                lang="ko"
              >
                {faculty.nameKo}
              </h1>

              {/* 영문 이름 */}
              <p
                className="font-body font-light text-[18px] text-[#888] tracking-widest uppercase mb-6"
                lang="en"
              >
                {faculty.nameEn.replace(/-/g, ' ')}
              </p>

              {/* 이메일 */}
              {faculty.email && (
                <a
                  href={`mailto:${faculty.email}`}
                  className="inline-block font-body text-[14px] text-[#888] hover:text-nwcn-green transition-colors mb-8"
                >
                  {faculty.email}
                </a>
              )}

              {/* ── 교수님의 한마디 ─────────────────── */}
              <blockquote
                className="relative border-l-4 border-nwcn-green pl-6 py-2"
              >
                {/* 인용부호 장식 */}
                <span
                  className="absolute -top-4 -left-1 font-body font-extrabold text-[64px] leading-none text-nwcn-green/20 select-none pointer-events-none"
                  aria-hidden="true"
                >
                  &ldquo;
                </span>
                <p className="font-body text-[18px] md:text-[20px] text-[#323131] leading-[1.7] font-medium relative z-10">
                  {faculty.quote}
                </p>
              </blockquote>

              {/* 학력 / 경력 */}
              {(faculty.education?.length || faculty.career?.length) && (
                <div className="mt-8 space-y-4">
                  {faculty.education && faculty.education.length > 0 && (
                    <div>
                      <h3 className="font-body font-semibold text-[13px] text-nwcn-green uppercase tracking-wider mb-2">
                        {t('education')}
                      </h3>
                      <ul className="space-y-1">
                        {faculty.education.map((edu, i) => (
                          <li key={i} className="font-body text-[14px] text-[#555]">
                            {edu}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {faculty.career && faculty.career.length > 0 && (
                    <div>
                      <h3 className="font-body font-semibold text-[13px] text-nwcn-green uppercase tracking-wider mb-2">
                        {t('career')}
                      </h3>
                      <ul className="space-y-1">
                        {faculty.career.map((car, i) => (
                          <li key={i} className="font-body text-[14px] text-[#555]">
                            {car}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </SubPageLayout>
  )
}
