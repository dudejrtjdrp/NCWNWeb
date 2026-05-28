/**
 * 자동 번역 유틸리티
 *
 * MyMemory API (무료, 가입 불필요, 하루 1,000단어)를 사용하여
 * 한국어 DB 콘텐츠를 영어로 번역합니다.
 *
 * - 영어 로케일일 때만 호출
 * - unstable_cache로 번역 결과를 Next.js 서버 캐시에 저장 (TTL 1시간)
 * - 번역 실패 시 원문 그대로 반환 (안전한 폴백)
 * - null/빈 문자열은 번역하지 않음
 */

import { unstable_cache } from 'next/cache'

const MYMEMORY_API = 'https://api.mymemory.translated.net/get'

/**
 * 단일 텍스트 번역 (MyMemory API)
 * 내부 함수 — 외부에서는 translateText / translateFields를 사용
 */
async function fetchTranslation(text: string, from: string, to: string): Promise<string> {
  if (!text || !text.trim()) return text

  try {
    const url = new URL(MYMEMORY_API)
    url.searchParams.set('q', text)
    url.searchParams.set('langpair', `${from}|${to}`)

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // 1시간 HTTP 캐시
    })

    if (!res.ok) return text

    const json = await res.json()
    const translated: string = json?.responseData?.translatedText

    // MyMemory가 번역 실패 시 원문을 반환하거나 에러 메시지를 넣는 경우 대비
    if (!translated || translated.toUpperCase().startsWith('MYMEMORY WARNING')) {
      return text
    }

    return translated
  } catch {
    return text // 네트워크 오류 등 → 원문 반환
  }
}

/**
 * 단일 텍스트 번역 (캐시 포함)
 * 같은 텍스트는 1시간 동안 재번역하지 않음
 */
export const translateText = unstable_cache(
  async (text: string, targetLocale: string = 'en'): Promise<string> => {
    if (targetLocale === 'ko' || !text) return text
    return fetchTranslation(text, 'ko', targetLocale)
  },
  ['translation'],
  { revalidate: 3600, tags: ['translation'] }
)

/**
 * 객체의 지정된 필드들을 일괄 번역
 *
 * @example
 * const translated = await translateFields(item, ['title', 'description'], 'en')
 */
export async function translateFields<T extends Record<string, unknown>>(
  item: T,
  fields: (keyof T)[],
  targetLocale: string
): Promise<T> {
  if (targetLocale === 'ko') return item

  const translated = { ...item }

  await Promise.all(
    fields.map(async (field) => {
      const value = item[field]
      if (typeof value === 'string' && value.trim()) {
        ;(translated as Record<string, unknown>)[field as string] = await translateText(
          value,
          targetLocale
        )
      }
    })
  )

  return translated
}

/**
 * 배열의 모든 항목에 대해 지정 필드 번역
 *
 * @example
 * const translated = await translateItemList(items, ['title', 'description'], 'en')
 */
export async function translateItemList<T extends Record<string, unknown>>(
  items: T[],
  fields: (keyof T)[],
  targetLocale: string
): Promise<T[]> {
  if (targetLocale === 'ko') return items
  return Promise.all(items.map((item) => translateFields(item, fields, targetLocale)))
}
