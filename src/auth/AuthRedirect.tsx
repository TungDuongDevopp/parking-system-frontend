import { Navigate } from 'react-router-dom'
import { AuthStatusMessage, useAuth } from './AuthContext'
import { getRoleHomePath } from './roles'

const AuthRedirect = () => {
  const { status, user } = useAuth()

  if (status === 'loading' || status === 'error') {
    return <AuthStatusMessage />
  }

  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={getRoleHomePath(user.roles) ?? '/login'} replace />
}

export default AuthRedirect
