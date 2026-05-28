/**
 * 공통 locale 적용 유틸리티
 * locale='en'일 때 `field_en` 컬럼 값을 `field`로 덮어씁니다.
 * 비어있으면 원문(한국어) 그대로 사용합니다.
 */

/** 단일 객체에 locale 적용 */
export function applyLocale<T>(item: T, fields: string[], locale: string): T {
  if (locale === 'ko') return item
  const result = { ...(item as object) } as Record<string, unknown>
  for (const field of fields) {
    const enVal = result[`${field}_en`]
    if (enVal && typeof enVal === 'string' && enVal.trim()) {
      result[field] = enVal
    }
  }
  return result as unknown as T
}

/** 배열에 locale 적용 */
export function applyLocaleList<T>(items: T[], fields: string[], locale: string): T[] {
  if (locale === 'ko') return items
  return items.map((item) => applyLocale(item, fields, locale))
}
