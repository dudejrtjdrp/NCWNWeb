import { ImageResponse } from 'next/og'

/**
 * 동적 파비콘 (브라우저 탭 아이콘)
 * - 정적 바이너리 없이 ImageResponse로 생성
 * - 브랜드 컬러: 다크 배경(#151515) + 그린(#09F593)
 */
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
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
          fontSize: 20,
          fontWeight: 900,
          letterSpacing: '-1px',
          borderRadius: 6,
        }}
      >
        N
      </div>
    ),
    { ...size }
  )
}
