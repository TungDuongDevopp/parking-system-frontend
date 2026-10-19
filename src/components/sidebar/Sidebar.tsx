import '../../resources/css/sidebar.scss';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  IconLogout2,
  IconMoon,
  IconSun,
  IconMapPin,
  IconChevronDown,
  IconUserCircle,
  IconSettings,
} from '@tabler/icons-react';
import { SideBarMenus } from './sidebarConfig';
import { useAuth } from '../../auth/AuthContext';
import type { UserRole } from '../../types/Account/session';

interface SidebarProps {
  onUsernameLoaded?: (username: string) => void;
}

const Sidebar = ({ onUsernameLoaded }: SidebarProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const sidebarRoles = user?.roles.filter(
    (role): role is Extract<UserRole, 'Admin' | 'Staff'> => role === 'Admin' || role === 'Staff',
  ) ?? [];
  const sidebarRole = sidebarRoles[0] ?? null;
  const visibleMenus = SideBarMenus.filter((menu) =>
    menu.roles.some((role) => sidebarRoles.includes(role)),
  );
  const [username, setUsername] = useState('User');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('sidebar-theme') === 'dark',
  );
  const email = user?.emailAddress ?? '';

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
        setIsAccountSettingsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
        setIsAccountSettingsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const name = user?.name || user?.userName || sidebarRole || 'User';
    setUsername(name);
    onUsernameLoaded?.(name);
  }, [onUsernameLoaded, sidebarRole, user?.name, user?.userName]);

  useEffect(() => {
    document.documentElement.classList.toggle('dashboard-dark', isDark);
    localStorage.setItem('sidebar-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((dark) => !dark);
  };

  const handleSignOut = async () => {
    setLogoutError('');
    setIsSigningOut(true);
    try {
      await logout();
      setIsAccountMenuOpen(false);
      navigate('/login', { replace: true });
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Không thể đăng xuất khỏi máy chủ.');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
  <aside className="sidebar-container" data-theme={isDark ? 'dark' : 'light'} aria-label="Sidebar layout">
    <div className="sidebar-top">
      <div className="account-dropdown" ref={accountMenuRef}>
        <button
          className="account-avatar-trigger"
          type="button"
          aria-label="Open account menu"
          aria-expanded={isAccountMenuOpen}
          onClick={() => setIsAccountMenuOpen((open) => !open)}
        >
          <span className="avatar">{username.slice(0, 2).toUpperCase()}</span>
          <IconChevronDown size={18} stroke={1.75} aria-hidden="true" />
        </button>
        {isAccountMenuOpen && (
          <div className="account-menu" aria-label="Account menu">
            {logoutError && <p role="alert">{logoutError}</p>}
            <div className="account-menu-identity">
              <span className="account-menu-avatar" aria-hidden="true">
                {username.slice(0, 2).toUpperCase()}
              </span>
              <span className="account-menu-user">
                <strong>{username}</strong>
                {email && <span>{email}</span>}
              </span>
            </div>
            <div className="account-menu-divider" />
            <button className="account-menu-item" type="button" disabled title="Sắp ra mắt">
              <IconUserCircle size={20} stroke={1.75} aria-hidden="true" />
              Hồ sơ cá nhân
            </button>
           
            <button
              className="account-menu-item"
              type="button"
              aria-expanded={isAccountSettingsOpen}
              onClick={() => setIsAccountSettingsOpen((open) => !open)}
            >
              <IconSettings size={20} stroke={1.75} aria-hidden="true" />
              Cài đặt tài khoản
              <IconChevronDown
                className={isAccountSettingsOpen ? 'account-menu-chevron is-open' : 'account-menu-chevron'}
                size={18}
                stroke={1.75}
                aria-hidden="true"
              />
            </button>
            {isAccountSettingsOpen && (
              <Link
                className="account-menu-subitem"
                to="/change-password"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  setIsAccountSettingsOpen(false);
                }}
              >
                Đổi mật khẩu
              </Link>
            )}
            <div className="account-menu-divider" />
            <button className="account-menu-item account-menu-signout" type="button" onClick={handleSignOut} disabled={isSigningOut}>
              <IconLogout2 size={20} stroke={1.75} aria-hidden="true" />
              {isSigningOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </button>
          </div>
        )}
      </div>
      <section className="parking-area-filter" aria-label="Parking area filter">
        <div className="parking-area-select-row">
          <IconMapPin className="parking-area-icon" size={20} stroke={1.75} aria-hidden="true" />
          <div className="parking-area-select-wrap">
            <select className="parking-area-select" aria-label="Select parking area" defaultValue="all">
              <option value="all">All Parking Areas</option>
            </select>
            <IconChevronDown className="parking-area-chevron" size={18} stroke={1.75} aria-hidden="true" />
          </div>
        </div>
       
      </section>
      <nav className="list-item" aria-label="Navigation layout">
        {visibleMenus.map(({ label, icon: Icon, path: menuPath }) => {
          const path = typeof menuPath === 'string'
            ? menuPath
            : sidebarRoles.map((role) => menuPath[role]).find(Boolean);

          return path ? (
          <NavLink className="nav-item layout-block" key={path} to={path} end>
            <Icon stroke={1.75} size={20} /> {label}
          </NavLink>
          ) : null;
        })}
      </nav>
    </div>

    <div className="sidebar-bottom">
      <div className="list-control layout-block">
      <span className="theme-label">
        {isDark ? <IconMoon size={20} stroke={1.75} /> : <IconSun size={20} stroke={1.75} />}
        <span>{isDark ? 'Dark mode' : 'Light mode'}</span>
      </span>
      <button
        className="theme-switch"
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={`Enable ${isDark ? 'light' : 'dark'} mode`}
        onClick={toggleTheme}
      >
        <span className="theme-switch-thumb" />
      </button>
    </div>
    </div>
  </aside>
  );
};

export default Sidebar;
