import { ImageResponse } from 'next/og'

/**
 * 동적 Apple 터치 아이콘 (iOS 홈 화면 추가)
 * - 180x180 권장 사이즈
 * - 브랜드 컬러: 다크 배경(#151515) + 그린(#09F593)
 */
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#151515',
          color: '#09F593',
          fontSize: 110,
          fontWeight: 900,
          letterSpacing: '-4px',
        }}
      >
        N
      </div>
    ),
    { ...size }
  )
}
