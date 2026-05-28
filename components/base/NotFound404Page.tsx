/**
 * BASE 컴포넌트: NotFound404Page
 * Figma node-id : 376:1202  (페이지명: "3", 파일: 2026_뉴콘 웹페이지)
 * Figma URL     : https://www.figma.com/design/qsivnPCWhkDHrJZzuHpXWZ/...?node-id=376-1202
 *
 * ── 디자인 스펙 (1440 × 725px 프레임 기준) ──────────────────────────────────
 * 배경          : #f0f0f0
 *
 * NWCN 로고     : node 376:1208  x=678 y=98   w=85   h=24.33   (centered x=720)
 * 404 이미지    : node 376:1203  x=488 y=139  w=464  h=325     (visual 177px)
 *                 → Tiqui Taca 폰트로 렌더링된 텍스트를 PNG 이미지로 사용
 * PAGE NOT FOUND: node 376:1207  x=508 y=383  w=424  h=57
 *                 → Pretendard Bold 48px  #444444
 * 설명 텍스트   : node 376:1206  x=316 y=457  w=809  h=56
 *                 → Pretendard Regular 20px  #444444  line-height 28px
 * 메인으로 버튼 : node 376:1205  x=584 y=543  w=126  h=43
 *                 → bg #09F593  border black  text black  Bold
 * 이전으로 버튼 : node 376:1204  x=730 y=543  w=126  h=43
 *                 → border #444444  text #444444  Regular
 *
 * ── 수직 간격 계산 ───────────────────────────────────────────────────────────
 * paddingTop        98px  (로고 y 위치)
 * 로고 h            24px
 * 로고 → 404        17px  (139 - 122 = 17)
 * 404 visual h     177px
 * 404 → 제목        67px  (383 - 316 = 67)
 * 제목 h            57px
 * 제목 → 설명       17px  (457 - 440 = 17)
 * 설명 h            56px  (2줄 × 28px)
 * 설명 → 버튼       30px  (543 - 513 = 30)
 * 버튼 h            43px
 * 하단 여백        139px  (725 - 586 = 139)
 *
 * ── 규칙 ────────────────────────────────────────────────────────────────────
 * 기능 로직 금지 — 순수 UI 전용 컴포넌트
 * onBack / homeHref 는 not-found.tsx 에서 주입
 * ──────────────────────────────────────────────────────────────────────────
 */

'use client'

import Image from 'next/image'
import Link  from 'next/link'
import Button from '@/components/ui/Button'
import { useTranslations } from 'next-intl'

const NWCN_LOGO_URL = '/images/common/newcon-logo.png'
const NOT_FOUND_404_URL = '/images/common/404-text.svg'

// ── Props ──────────────────────────────────────────────────────────────────
export interface NotFound404PageProps {
  /** "← 이전으로" 버튼 클릭 핸들러 (not-found.tsx 에서 router.back() 주입) */
  onBack?: () => void
  /** "메인으로" 버튼 href  기본값 "/" */
  homeHref?: string
}

// ── Component ──────────────────────────────────────────────────────────────
export default function NotFound404Page({
  onBack,
  homeHref = '/',
}: NotFound404PageProps) {
  const t = useTranslations('notFound')

  return (
    <div
      className="min-h-screen bg-[#f0f0f0] flex flex-col items-center"
      data-node-id="376:1202"
    >
      {/* ── NWCN 로고 ─────────────────────────────────────────────────────
          Figma: x=678 y=98 w=85 h=24.33   centered(x=720)
          실제 PNG: 129×114px (정방형에 가까운 비율)
          → 높이 고정 48px, 너비 auto로 비율 유지               ── */}
      <div style={{ paddingTop: 98 }} data-node-id="376:1208">
        <Link href={homeHref} aria-label="NWCN 홈으로">
          <Image
            src={NWCN_LOGO_URL}
            alt="NWCN"
            width={54}
            height={48}
            style={{ width: 'auto', height: 48 }}
            unoptimized
            priority
          />
        </Link>
      </div>

      {/* ── 404 이미지 (PNG) ──────────────────────────────────────────────
          Figma: x=488 y=139 w=464 h=325  (실제 시각 높이 177px, 투명 배경)
          gap: 139 - (98+24) = 17px
          반응형: max-w-[464px] w-full  →  모바일에서 자동 축소         ── */}
      <div
        className="flex justify-center w-full px-4"
        style={{ marginTop: 17 }}
        data-node-id="376:1203"
      >
        <Image
          src={NOT_FOUND_404_URL}
          alt="404 페이지를 찾을 수 없음"
          width={464}
          height={177}
          unoptimized
          priority
          className="w-full max-w-[464px] h-auto"
        />
      </div>

      {/* ── PAGE NOT FOUND! ───────────────────────────────────────────────
          Figma: x=508 y=383 w=424 h=57
          gap: 383 - (139+177) = 67px
          Pretendard Bold 48px  #444444  line-height 57px            ── */}
      <h1
        className="font-body font-bold text-[#444444] text-center whitespace-nowrap"
        style={{
          marginTop: 67,
          fontSize: 'clamp(22px, 3.33vw, 48px)',
          lineHeight: '57px',
        }}
        data-node-id="376:1207"
      >
        PAGE NOT FOUND!
      </h1>

      {/* ── 설명 텍스트 ───────────────────────────────────────────────────
          Figma: x=316 y=457 w=809 h=56 (2줄 × 28px)
          gap: 457 - (383+57) = 17px
          Pretendard Regular 20px  #444444  line-height 28px          ── */}
      <div
        className="font-body font-normal text-[#444444] text-center px-4"
        style={{
          marginTop: 17,
          fontSize: 'clamp(14px, 1.39vw, 20px)',
          lineHeight: '28px',
        }}
        data-node-id="376:1206"
      >
        <p>{t('description1')}</p>
        <p>{t('description2')}</p>
      </div>

      {/* ── 버튼 영역 ─────────────────────────────────────────────────────
          Figma: y=543
          메인으로:  x=584 w=126 h=43  bg-green  border-black  Bold
          이전으로:  x=730 w=126 h=43  border-#444  text-#444  Regular
          두 버튼 간격: 730 - (584+126) = 20px                        ── */}
      <div
        className="flex items-center flex-wrap justify-center"
        style={{ marginTop: 30, gap: 20, paddingBottom: 139 }}
      >
        {/* 메인으로 — primary + 검정 테두리 + Bold */}
        <Button
          variant="primary"
          href={homeHref}
          className="border border-black font-bold w-[126px] justify-center"
          data-node-id="376:1205"
        >
          {t('goHome')}
        </Button>

        {/* ← 이전으로 — ghost 컬러 Figma 스펙(#444)으로 오버라이드 + Regular */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="border-[#444444] text-[#444444] font-normal w-[126px] justify-center"
          data-node-id="376:1204"
        >
          {t('goBack')}
        </Button>
      </div>
    </div>
  )
}
