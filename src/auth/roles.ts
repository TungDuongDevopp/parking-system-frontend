import type { UserRole } from '../types/Account/session'

export const getRoleHomePath = (roles: UserRole[]): string | null => {
  if (roles.includes('Admin')) return '/admin'
  if (roles.includes('Staff')) return '/staff'
  if (roles.includes('Customer')) return '/'
  return null
}
