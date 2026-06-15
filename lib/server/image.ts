/**
 * 서버 사이드 이미지 최적화
 *
 * 업로드된 이미지를 webp로 변환하고 너무 큰 이미지는 리사이즈해
 * R2 저장 용량과 원본 전송량(origin transfer)을 줄인다.
 * (브라우저 표시용 추가 최적화는 next/image가 서빙 시점에 별도로 수행한다.)
 *
 * - jpeg/png/webp → webp 재인코딩 (quality 80)
 * - 가로/세로 최대 MAX_DIMENSION 으로 축소 (확대는 안 함)
 * - EXIF 회전 적용 후 메타데이터 제거(rotate)
 * - gif(애니메이션 가능)·변환 실패 시에는 원본을 그대로 보존
 */

import sharp from 'sharp'

/** 리사이즈 상한 (가로·세로 px). 썸네일·포스터 용도엔 충분하며 대용량 원본만 축소된다. */
const MAX_DIMENSION = 2000
/** webp 품질 (0–100). 80은 화질 손실이 거의 없으면서 용량 절감 효과가 크다. */
const WEBP_QUALITY = 80

export interface ProcessedImage {
  buffer: Buffer
  /** 확장자 (예: 'webp', 'gif') — object key 생성에 사용 */
  ext: string
  contentType: string
}

/**
 * File을 받아 최적화된 버퍼/확장자/Content-Type을 반환한다.
 * 변환이 불가능하거나 실패하면 원본을 그대로 반환한다(업로드 자체는 막지 않음).
 */
export async function processImage(file: File): Promise<ProcessedImage> {
  const input = Buffer.from(await file.arrayBuffer())

  // 애니메이션 보존을 위해 gif는 변환하지 않고 원본 유지
  if (file.type === 'image/gif') {
    return { buffer: input, ext: 'gif', contentType: 'image/gif' }
  }

  try {
    const output = await sharp(input)
      .rotate() // EXIF 방향 적용 + 메타데이터 정리
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer()

    return { buffer: output, ext: 'webp', contentType: 'image/webp' }
  } catch {
    // 변환 실패 시 원본 그대로 업로드 (확장자는 파일명에서 추출)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    return {
      buffer: input,
      ext,
      contentType: file.type || 'application/octet-stream',
    }
  }
}

/** object key의 확장자를 새 확장자로 교체한다. (예: 2025/uuid.png → 2025/uuid.webp) */
export function replaceExt(pathWithExt: string, newExt: string): string {
  return pathWithExt.replace(/\.[^./]+$/, '') + '.' + newExt
}
