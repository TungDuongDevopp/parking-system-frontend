export type UserRole = 'Admin' | 'Staff' | 'Customer'

export interface SessionUser {
  id: number
  name: string | null
  surname: string | null
  userName: string
  emailAddress: string | null
  roles: UserRole[]
}

import type { AbpError } from '../Apb/abp'

export interface CurrentSessionResponse {
  result: {
    user: SessionUser | null
  } | null
  success: boolean
  error: AbpError | null
}
