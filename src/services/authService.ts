import type { ChangePassWordRequest } from '../types/Account/changePassword'
import type { LoginRequest, LoginResult } from '../types/Account/login'
import type { RegisterRequest, CanLogin } from '../types/Account/register'
import type { CurrentSessionResponse, SessionUser, UserRole } from '../types/Account/session'
import { getAbpErrorMessage } from './abpError'
import { apiClient, clearXsrfToken, refreshXsrfToken, setXsrfToken } from './apiClient'
import { readAbpResult, readAbpVoid } from './serviceResponse'

export const login = async (data: LoginRequest): Promise<LoginResult> => {
  const response = await apiClient('/api/TokenAuth/BrowserAuthenticate', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  const result = await readAbpResult<LoginResult>(response, 'Username or password is incorrect.')
  const token = response.headers.get('X-XSRF-TOKEN') || result.xsrfToken
  if (token?.trim()) {
    setXsrfToken(token)
  } else {
    await refreshXsrfToken()
  }
  return result
}

export const getCurrentSessionUser = async (): Promise<SessionUser | null> => {
  const response = await apiClient('/api/services/app/Session/GetCurrentLoginInformations')
  const result = await readAbpResult<CurrentSessionResponse['result']>(
    response,
    'Không thể kiểm tra phiên đăng nhập.',
    true,
  )
  const user = result?.user
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
  await readAbpVoid(response, 'Không thể đăng xuất khỏi máy chủ.')
  clearXsrfToken()
}

export const register = async (data: RegisterRequest): Promise<CanLogin> => {
  const response = await apiClient('/api/services/app/Account/Register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return readAbpResult(response, 'Registration failed.')
}

export const changePassword = async (data: ChangePassWordRequest): Promise<boolean> => {
  const response = await apiClient('/api/services/app/User/ChangePassword', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  })
  const changed = await readAbpResult<boolean>(response, 'Change password failed.')
  if (!changed) throw new Error(getAbpErrorMessage(null, 'Change password failed.'))
  return changed
}
