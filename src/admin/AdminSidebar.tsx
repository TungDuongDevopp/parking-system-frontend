import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { getUserName } from '../services/authService'

type MenuIconName = 'dashboard' | 'roles' | 'users' | 'parking' | 'reports' | 'notification' | 'password' | 'logout' | 'sun' | 'moon'

function MenuIcon({ name }: { name: MenuIconName }) {
	const paths: Record<MenuIconName, string> = {
		dashboard: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
		roles: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',
		users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.5 20c.5-3 2.3-5 5.5-5s5 2 5.5 5M15 8h5M17.5 6v4',
		parking: 'M5 20V4h8a4 4 0 0 1 0 8H5M5 12h7',
		reports: 'M5 20V4h14v16M8 16h8M8 12h8M8 8h4',
		notification: 'M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
		password: 'M14.5 5.5a4 4 0 0 0-5.2 5.2L4 16v3h3v-2h2v-2h2.2l2.1-2.1a4 4 0 0 0 1.2-7.4ZM17 4l3 3m-1.5-1.5 1.5-1.5',
		logout: 'M10 5H5.5A1.5 1.5 0 0 0 4 6.5v11A1.5 1.5 0 0 0 5.5 19H10M14 8l4 4-4 4M18 12H9',
		sun: 'M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z',
		moon: 'M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z',
	}
	return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name]} /></svg>
}

function AdminSidebar({ variant = 'admin', onUsernameLoaded }: { variant?: 'admin' | 'staff'; onUsernameLoaded?: (username: string) => void }) {
	const [isDark, setIsDark] = useState(() => localStorage.getItem('dashboard-theme') === 'dark')
	const [isSettingsOpen, setIsSettingsOpen] = useState(false)
	const [username, setUsername] = useState(variant === 'staff' ? 'Minh Nguyen' : 'Admin')
	const isStaff = variant === 'staff'

	useEffect(() => {
		let isMounted = true
		getUserName().then((name) => {
			if (isMounted && name) {
				setUsername(name)
				onUsernameLoaded?.(name)
			}
		}).catch(() => undefined)
		return () => { isMounted = false }
	}, [onUsernameLoaded])

	useEffect(() => {
		document.documentElement.classList.toggle('dashboard-dark', isDark)
		localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light')
	}, [isDark])

	const handleSignOut = () => {
		localStorage.removeItem('accessToken')
		sessionStorage.clear()
		window.location.href = '/login'
	}

	return (
		<aside className="sidebar">
			<div className="sidebar-profile">
				<div className="profile-avatar">{username.slice(0, 2).toUpperCase()}</div>
				<div><span>Welcome back,</span><strong>{username}</strong></div>
				<button className="settings-button" type="button" aria-expanded={isSettingsOpen} aria-label="Open settings" onClick={() => setIsSettingsOpen((open) => !open)}>⚙</button>
				{isSettingsOpen && <div className="settings-menu">
					<Link to="/change-password" onClick={() => setIsSettingsOpen(false)}><span className="side-icon"><MenuIcon name="password" /></span>Change password</Link>
				</div>}
			</div>
			<label className="sidebar-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Search" aria-label="Search admin menu" /></label>
			<nav className="side-nav" aria-label={`${isStaff ? 'Staff' : 'Admin'} navigation`}>
				{isStaff ? <>
					<NavLink to="/staff" end className={({ isActive }) => isActive ? 'active' : ''}><span className="side-icon"><MenuIcon name="dashboard" /></span><span>My dashboard</span><b>≡</b></NavLink>
					<a href="#check-in"><span className="side-icon"><MenuIcon name="parking" /></span><span>Check in vehicle</span><b>≡</b></a>
					<a href="#tickets"><span className="side-icon"><MenuIcon name="roles" /></span><span>Tickets</span><b>≡</b></a>
					<a href="#incidents"><span className="side-icon"><MenuIcon name="reports" /></span><span>Incidents</span><b>≡</b></a>
					<a href="#notifications"><span className="side-icon"><MenuIcon name="notification" /></span><span>Notifications</span><b className="notification-badge">3</b></a>
				</> : <>
					<NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}><span className="side-icon"><MenuIcon name="dashboard" /></span><span>Dashboard</span><b>≡</b></NavLink>
					<NavLink to="/admin/roles" className={({ isActive }) => isActive ? 'active' : ''}><span className="side-icon"><MenuIcon name="roles" /></span><span>Roles</span><b>≡</b></NavLink>
					<a href="#users"><span className="side-icon"><MenuIcon name="users" /></span><span>Users</span><b>≡</b></a>
					<a href="#locations"><span className="side-icon"><MenuIcon name="parking" /></span><span>Parking locations</span><b>≡</b></a>
					<a href="#reports"><span className="side-icon"><MenuIcon name="reports" /></span><span>Reports</span><b>≡</b></a>
					<a href="#notifications"><span className="side-icon"><MenuIcon name="notification" /></span><span>Notifications</span><b className="notification-badge">3</b></a>
				</>}
			</nav>
			<div className="sidebar-spacer" />
			<nav className="side-nav sidebar-bottom-nav" aria-label="Account navigation">
				<button className="theme-toggle" type="button" onClick={() => setIsDark((dark) => !dark)} aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}><span className="side-icon"><MenuIcon name={isDark ? 'sun' : 'moon'} /></span><span>{isDark ? 'Light mode' : 'Dark mode'}</span></button>
				<button type="button" onClick={handleSignOut}><span className="side-icon"><MenuIcon name="logout" /></span><span>Sign out</span></button>
			</nav>
		</aside>
	)
}

export default AdminSidebar