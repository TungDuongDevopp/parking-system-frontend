export const BASE_URL = 'https://localhost:44337'

type ApiClientOptions = RequestInit & {
  authenticated?: boolean
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE'])
const XSRF_ENDPOINT = '/api/TokenAuth/GetXsrfToken'
export const AUTH_UNAUTHORIZED_EVENT = 'parking:auth-unauthorized'

let xsrfToken: string | null = null

export const setXsrfToken = (token: string | null) => {
  xsrfToken = token?.trim() || null
}

export class SessionExpiredError extends Error {
  constructor() {
    super('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
    this.name = 'SessionExpiredError'
  }
}

export const refreshXsrfToken = async (): Promise<string> => {
  const response = await fetch(`${BASE_URL}${XSRF_ENDPOINT}`, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })

  if (response.status === 401) {
    throw new SessionExpiredError()
  }

  const data = await response.json() as {
    result?: { xsrfToken?: string | null } | null
  }
  if (!response.ok) {
    throw new Error(`Không thể làm mới CSRF token (HTTP ${response.status}).`)
  }

  const token = response.headers.get('X-XSRF-TOKEN') || data.result?.xsrfToken
  if (!token?.trim()) {
    throw new Error('Backend không trả về CSRF token hợp lệ.')
  }

  setXsrfToken(token)
  return token
}

export const clearXsrfToken = () => setXsrfToken(null)

export const apiClient = async (endpoint: string, options: ApiClientOptions = {}) => {
  const { authenticated = false, headers, body, ...requestOptions } = options
  const requestHeaders = new Headers(headers)
  const method = (requestOptions.method ?? 'GET').toUpperCase()

  if (body && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (!SAFE_METHODS.has(method)) {
    if (!xsrfToken && authenticated) {
      try {
        await refreshXsrfToken()
      } catch (error) {
        if (error instanceof SessionExpiredError) {
          window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT))
        }
        throw error
      }
    }

    if (xsrfToken) {
      requestHeaders.set('X-XSRF-TOKEN', xsrfToken)
    } else if (authenticated) {
      throw new Error('Không thể gửi request bảo vệ: thiếu CSRF token.')
    }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...requestOptions,
    body,
    headers: requestHeaders,
    credentials: 'include',
  })

  if (authenticated && response.status === 401) {
    window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT))
  }

  return response
}
