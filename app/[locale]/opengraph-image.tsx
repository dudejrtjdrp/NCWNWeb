import { ImageResponse } from 'next/og'

/**
 * 동적 OG 이미지 (소셜 공유 미리보기)
 * - 정적 바이너리 없이 Next.js ImageResponse로 생성
 * - 브랜드 컬러(다크 배경 + 그린 로고) 적용
 */
export const alt = '동아방송예술대학교 뉴미디어콘텐츠과'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#151515',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 180,
            fontWeight: 900,
            letterSpacing: '-4px',
            color: '#09F593',
            lineHeight: 1,
          }}
        >
          NWCN
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 40,
            fontWeight: 500,
            color: '#ffffff',
          }}
        >
          뉴미디어콘텐츠과
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 26,
            color: '#B9B8B6',
          }}
        >
          동아방송예술대학교 New Media Contents
        </div>
      </div>
    ),
    { ...size }
  )
}
