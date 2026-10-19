import type { ChangePassWordRequest, ChangePassWordResponse } from '../types/Account/changePassword'
import type { LoginRequest, LoginResponse } from '../types/Account/login'
import type { RegisterRequest, RegisterResponse } from '../types/Account/register'
import type { CurrentSessionResponse, SessionUser, UserRole } from '../types/Account/session'
import { getAbpErrorMessage } from './abpError'
import { apiClient, clearXsrfToken, refreshXsrfToken, setXsrfToken } from './apiClient'

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient('/api/TokenAuth/BrowserAuthenticate', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  const result = await response.json() as LoginResponse

  if (response.ok && result.success && result.result) {
    const token = response.headers.get('X-XSRF-TOKEN') || result.result.xsrfToken
    if (token?.trim()) {
      setXsrfToken(token)
    } else {
      await refreshXsrfToken()
    }
  }

  return result
}

export const getCurrentSessionUser = async (): Promise<SessionUser | null> => {
  const response = await apiClient('/api/services/app/Session/GetCurrentLoginInformations')
  if (!response.ok) {
    throw new Error(`Không thể kiểm tra phiên đăng nhập (HTTP ${response.status}).`)
  }

  const result = await response.json() as CurrentSessionResponse
  if (!result.success) {
    throw new Error(getAbpErrorMessage(result.error, 'Không thể kiểm tra phiên đăng nhập.'))
  }

  const user = result.result?.user
  if (!user) {
    clearXsrfToken()
    return null
  }

  if (!Array.isArray(user.roles)) {
    throw new Error('Current session response does not include user roles.')
  }

  const supportedRoles = user.roles.filter((role): role is UserRole =>
    role === 'Admin' || role === 'Staff' || role === 'Customer',
  )
  if (supportedRoles.length === 0) {
    throw new Error('Current user does not have a supported ParkingSystem role.')
  }

  await refreshXsrfToken()
  return { ...user, roles: supportedRoles }
}

export const browserLogout = async (): Promise<void> => {
  const response = await apiClient('/api/TokenAuth/BrowserLogout', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify({}),
  })
  const result = await response.json() as {
    success: boolean
    error: import('../types/Apb/abp').AbpError | null
  }

  if (!response.ok || !result.success) {
    throw new Error(getAbpErrorMessage(result.error, 'Không thể đăng xuất khỏi máy chủ.'))
  }
}

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await apiClient('/api/services/app/Account/Register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json() as Promise<RegisterResponse>
}

export const changePassword = async (
  data: ChangePassWordRequest,
): Promise<ChangePassWordResponse> => {
  const response = await apiClient('/api/services/app/User/ChangePassword', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  })
  return response.json() as Promise<ChangePassWordResponse>
}
