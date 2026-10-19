import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { UserRole } from '../types/Account/session'
import { AuthStatusMessage, useAuth } from './AuthContext'
import { getRoleHomePath } from './roles'

interface Props {
  children: ReactNode
  allowedRole: UserRole
}

const ProtectedRoute = ({ children, allowedRole }: Props) => {
  const { status, user } = useAuth()

  if (status === 'loading' || status === 'error') {
    return <AuthStatusMessage />
  }

  if (!user) return <Navigate to="/login" replace />

  if (!user.roles.includes(allowedRole)) {
    return <Navigate to={getRoleHomePath(user.roles) ?? '/login'} replace />
  }

  return children
}

export default ProtectedRoute
