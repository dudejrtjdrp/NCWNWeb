export class ApiError extends Error {
  status: number
  code?: string
  constructor(message: string, status = 500, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export function toJsonError(err: unknown) {
  if (err instanceof ApiError) {
    return { message: err.message, status: err.status, code: err.code }
  }
  const message = err instanceof Error ? err.message : 'Internal Server Error'
  return { message, status: 500 }
}
