import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { SessionUser } from '../types/Account/session'
import { browserLogout, getCurrentSessionUser } from '../services/authService'
import {
  AUTH_UNAUTHORIZED_EVENT,
  clearXsrfToken,
  SessionExpiredError,
} from '../services/apiClient'

type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'error'

interface AuthContextValue {
  status: AuthStatus
  user: SessionUser | null
  error: string | null
  refreshSession: () => Promise<SessionUser | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<SessionUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const refreshPromise = useRef<Promise<SessionUser | null> | null>(null)

  const refreshSession = useCallback((): Promise<SessionUser | null> => {
    if (refreshPromise.current) return refreshPromise.current

    setStatus('loading')
    setError(null)
    const request = getCurrentSessionUser()
      .then((currentUser) => {
        setUser(currentUser)
        setStatus(currentUser ? 'authenticated' : 'anonymous')
        return currentUser
      })
      .catch((cause: unknown) => {
        if (cause instanceof SessionExpiredError) {
          clearXsrfToken()
          setUser(null)
          setStatus('anonymous')
          return null
        }
        setError(cause instanceof Error ? cause.message : 'Không thể xác minh phiên đăng nhập.')
        setStatus('error')
        return null
      })
      .finally(() => {
        refreshPromise.current = null
      })
    refreshPromise.current = request
    return request
  }, [])

  useEffect(() => {
    void refreshSession()
  }, [refreshSession])

  useEffect(() => {
    const handleUnauthorized = () => {
      void refreshSession()
    }
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [refreshSession])

  const logout = useCallback(async () => {
    await browserLogout()
    clearXsrfToken()
    setUser(null)
    setError(null)
    setStatus('anonymous')
  }, [])

  return (
    <AuthContext.Provider value={{ status, user, error, refreshSession, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.')
  }
  return context
}

export const AuthStatusMessage = () => {
  const { status, error, refreshSession } = useAuth()

  if (status === 'loading') {
    return <p role="status">Checking your session...</p>
  }

  if (status === 'error') {
    return (
      <main>
        <p role="alert">{error}</p>
        <button type="button" onClick={() => void refreshSession()}>Try again</button>
      </main>
    )
  }

  return null
}
