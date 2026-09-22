
export const BASE_URL = 'https://localhost:44337'

type ApiClientOptions = RequestInit & {
  authenticated?: boolean
}

export const getAccessToken = () =>
  localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken')

export const apiClient = async (endpoint: string, options: ApiClientOptions = {}) => {
  const { authenticated = false, headers, body, ...requestOptions } = options
  const requestHeaders = new Headers(headers)

  if (body && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (authenticated) {
    const accessToken = getAccessToken()

    if (!accessToken) {
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
    }

    requestHeaders.set('Authorization', `Bearer ${accessToken}`)
  }

  return fetch(`${BASE_URL}${endpoint}`, {
    ...requestOptions,
    body,
    headers: requestHeaders,
  })
}