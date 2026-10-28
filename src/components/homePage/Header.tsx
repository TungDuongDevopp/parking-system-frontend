import logo from '../../assets/logo-purple.png'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { getRoleHomePath } from '../../auth/roles'

const Header = () => {
    const { status, user, logout } = useAuth()
    const [logoutError, setLogoutError] = useState('')
    const [isSigningOut, setIsSigningOut] = useState(false)
    const isCustomer = status === 'authenticated' && user?.roles.includes('Customer')

    const handleLogout = async () => {
        setLogoutError('')
        setIsSigningOut(true)
        try {
            await logout()
        } catch (error) {
            setLogoutError(error instanceof Error ? error.message : 'Unable to log out from the server.')
        } finally {
            setIsSigningOut(false)
        }
    }

    return (
    <header className="nav-container">
        <div className="nav-content">
            <Link className="logo" to="/" aria-label="ParkOS home">
                <img src={logo} alt="Parking system" />
            </Link>
            <nav className="nav">
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/about">About</Link></li>
                    <li><Link to="/pricing">Pricing</Link></li>
                    <li>
                        <Link to={isCustomer ? '/customer/find-parking' : '/login'}>
                            Find Parking
                        </Link>
                    </li>
                    <li><Link to="/customer/guide">User Guide</Link></li>
                </ul>
            </nav>
            <div className="action-btn">
                {isCustomer ? (
                    <details className="homepage-account">
                        <summary>{user?.name || user?.userName || 'Account'}</summary>
                        <div className="homepage-account-menu">
                            <Link to="/customer/profile">My Profile</Link>
                            <Link to="/customer/reservations">My Reservations</Link>
                            <Link to="/customer/subscriptions">My Subscriptions</Link>
                            <Link to="/change-password">Change password</Link>
                            <button type="button" onClick={handleLogout} disabled={isSigningOut}>
                                {isSigningOut ? 'Logging out...' : 'Logout'}
                            </button>
                            {logoutError && <p role="alert">{logoutError}</p>}
                        </div>
                    </details>
                ) : status === 'anonymous' ? (
                    <>
                        <Link className="btn btn-signin" to="/login">Sign in</Link>
                        <Link className="btn btn-signup" to="/register">
                            Sign up <span aria-hidden="true">→</span>
                        </Link>
                    </>
                ) : status === 'authenticated' ? (
                    <Link className="btn btn-signin" to={getRoleHomePath(user?.roles ?? []) ?? '/login'}>
                        Dashboard
                    </Link>
                ) : null}
            </div>
        </div>
    </header>
    )
}
export default Header;