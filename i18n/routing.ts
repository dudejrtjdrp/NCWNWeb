import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
  localePrefix: 'as-needed', // 기본 로케일(ko)은 prefix 없이, /en/... 형태
})
