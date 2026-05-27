export function logInfo(...args: unknown[]) {
  // 가벼운 런타임 정보 로깅
  if (typeof console !== 'undefined') console.info('[info]', ...args)
}

export function logWarn(...args: unknown[]) {
  if (typeof console !== 'undefined') console.warn('[warn]', ...args)
}

export function logError(...args: unknown[]) {
  if (typeof console !== 'undefined') console.error('[error]', ...args)
}
