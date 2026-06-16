/**
 * Supabase 요청용 타임아웃 fetch
 *
 * 응답이 timeoutMs 안에 오지 않으면 AbortController로 요청을 중단한다.
 * → 서버 컴포넌트 렌더 중 Supabase 연결이 멈추더라도 await 가 영원히 걸리지 않고
 *   에러로 처리되어(각 쿼리 함수의 try/catch 가 폴백 반환) 페이지가 렌더된다.
 *   (loading.tsx 가 끝없이 떠 있는 무한 로딩 방지)
 */
export function createTimeoutFetch(timeoutMs = 8000): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    // 호출 측에서 전달한 signal 도 함께 존중한다.
    const callerSignal = init?.signal
    if (callerSignal) {
      if (callerSignal.aborted) controller.abort()
      else callerSignal.addEventListener('abort', () => controller.abort(), { once: true })
    }

    try {
      return await fetch(input, { ...init, signal: controller.signal })
    } finally {
      clearTimeout(timer)
    }
  }
}
