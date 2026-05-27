/**
 * 서버 전용 입력값 검증 유틸
 *
 * - isValidUUID          : UUID 형식 검증 (SQL Injection / 잘못된 키 방어)
 * - validateFileUpload   : 파일 업로드 크기·MIME·확장자 검증
 * - sanitizeRedirectPath : 오픈 리다이렉트 방지 (next 파라미터 등)
 * - truncateText         : 텍스트 필드 최대 길이 강제 적용
 */

import { ApiError } from './apiError'

// ── UUID 검증 ──────────────────────────────────────────────

/** UUID v1–v5 모두 허용하는 기본 패턴 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidUUID(id: unknown): id is string {
  return typeof id === 'string' && UUID_RE.test(id)
}

/**
 * UUID가 유효하지 않으면 ApiError(400)를 throw
 * Server Action 내 id 파라미터 검증에 사용
 */
export function assertValidUUID(id: unknown, fieldName = 'id'): asserts id is string {
  if (!isValidUUID(id)) {
    throw new ApiError(`유효하지 않은 ${fieldName} 형식입니다.`, 400)
  }
}

// ── 파일 업로드 검증 ────────────────────────────────────────

const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
])

const ALLOWED_IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif'])

export interface FileValidationOptions {
  /** 허용 최대 파일 크기(bytes). 기본 10MB */
  maxSizeBytes?: number
  /** 허용 MIME 타입 집합. 기본 이미지 타입 */
  allowedMimes?: Set<string>
  /** 허용 확장자 집합. 기본 이미지 확장자 */
  allowedExts?: Set<string>
}

/**
 * 파일 업로드 유효성 검증.
 * 검증 실패 시 { error: string } 형태로 반환.
 * 성공 시 null 반환.
 */
export function validateFileUpload(
  file: File,
  options: FileValidationOptions = {}
): string | null {
  const {
    maxSizeBytes = 10 * 1024 * 1024, // 10 MB
    allowedMimes = ALLOWED_IMAGE_MIMES,
    allowedExts  = ALLOWED_IMAGE_EXTS,
  } = options

  // 파일 크기
  if (file.size > maxSizeBytes) {
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0)
    return `파일 크기가 ${maxMb}MB를 초과합니다. (현재: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`
  }

  // MIME 타입 (클라이언트가 전달한 값이므로 보조적 검증으로만 사용)
  if (file.type && !allowedMimes.has(file.type.toLowerCase())) {
    return `허용되지 않는 파일 형식입니다. (허용: ${[...allowedMimes].join(', ')})`
  }

  // 확장자 (최후 방어선)
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!allowedExts.has(ext)) {
    return `허용되지 않는 파일 확장자입니다. (.${ext})`
  }

  return null
}

// ── 오픈 리다이렉트 방지 ────────────────────────────────────

/**
 * 리다이렉트 경로를 안전하게 정리합니다.
 * 외부 URL 또는 프로토콜 상대 URL은 fallback으로 대체됩니다.
 *
 * @param path    - 사용자 입력값 (예: formData.get('next'))
 * @param fallback - 기본 경로 (예: '/admin')
 */
export function sanitizeRedirectPath(path: unknown, fallback = '/'): string {
  if (typeof path !== 'string' || path.trim() === '') return fallback

  const trimmed = path.trim()

  // 반드시 /로 시작해야 하며, //로 시작하면 안 됨 (프로토콜 상대 URL 방어)
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return fallback

  // javascript:, data: 등의 인젝션 방어
  if (/^[a-z][a-z0-9+\-.]*:/i.test(trimmed)) return fallback

  // 길이 제한
  if (trimmed.length > 200) return fallback

  return trimmed
}

// ── 텍스트 길이 제한 ────────────────────────────────────────

export const TEXT_LIMITS = {
  title:       200,
  author:      100,
  description: 5_000,
  content:     100_000,
  excerpt:     500,
  competition: 200,
  location:    200,
  theme:       200,
  partner:     200,
  season:      100,
  duration:    100,
} as const

export type TextLimitKey = keyof typeof TEXT_LIMITS

/**
 * 문자열이 최대 길이를 초과하면 에러 메시지를, 아니면 null을 반환합니다.
 */
export function checkTextLength(
  value: string | null | undefined,
  key: TextLimitKey,
  label: string
): string | null {
  if (!value) return null
  if (value.length > TEXT_LIMITS[key]) {
    return `${label}은(는) ${TEXT_LIMITS[key].toLocaleString()}자를 초과할 수 없습니다. (현재: ${value.length}자)`
  }
  return null
}
