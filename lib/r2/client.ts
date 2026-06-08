/**
 * Cloudflare R2 클라이언트 (서버 사이드 전용)
 *
 * R2는 S3 호환 API를 제공하므로 @aws-sdk/client-s3를 그대로 사용한다.
 * - endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
 * - region:   'auto' (R2는 리전 개념이 없음)
 *
 * 환경변수 (.env.local):
 *   R2_ACCOUNT_ID        - Cloudflare 계정 ID
 *   R2_ACCESS_KEY_ID     - R2 API 토큰의 Access Key ID
 *   R2_SECRET_ACCESS_KEY - R2 API 토큰의 Secret Access Key
 *   R2_BUCKET_NAME       - 버킷 이름 (예: nwcn-assets)
 *   R2_PUBLIC_URL        - 공개 접근용 커스텀 도메인 (예: https://assets.example.com, 끝에 / 없음)
 */

import { S3Client } from '@aws-sdk/client-s3'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`[R2] 환경변수 ${name} 가 설정되지 않았습니다.`)
  }
  return value
}

export const R2_BUCKET = process.env.R2_BUCKET_NAME ?? ''

/** 공개 URL 베이스 (끝 슬래시 제거) */
export const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')

let _client: S3Client | null = null

/** R2 S3 클라이언트 싱글톤 */
export function getR2Client(): S3Client {
  if (_client) return _client

  const accountId = requireEnv('R2_ACCOUNT_ID')

  _client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
    },
  })

  return _client
}

/** key로부터 공개 URL 생성 */
export function buildPublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`
}

/** 공개 URL에서 R2 object key를 추출 (삭제 시 사용). 베이스가 다르면 null */
export function extractKeyFromUrl(publicUrl: string): string | null {
  if (!R2_PUBLIC_URL || !publicUrl.startsWith(`${R2_PUBLIC_URL}/`)) return null
  const key = publicUrl.slice(R2_PUBLIC_URL.length + 1)
  return key ? decodeURIComponent(key) : null
}
