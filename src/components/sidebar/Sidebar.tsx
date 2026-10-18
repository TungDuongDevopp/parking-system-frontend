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
import { jwtDecode } from 'jwt-decode';
import type { JwtPayload } from '../../types/Account/auth';
import { getUserName } from '../../services/authService';
import { SideBarMenus } from './sidebarConfig';

const getCurrentIdentity = () => {
  const token =
    localStorage.getItem('accessToken') ??
    sessionStorage.getItem('accessToken');

  if (!token) {
    return { role: null, email: '' };
  }

  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (payload.exp * 1000 <= Date.now()) {
      return { role: null, email: '' };
    }

    const tokenRole =
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    const role = tokenRole === 'Admin' || tokenRole === 'Staff' ? tokenRole : null;
    return {
      role,
      email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
    };
  } catch {
    return { role: null, email: '' };
  }
};

interface SidebarProps {
  onUsernameLoaded?: (username: string) => void;
}

const Sidebar = ({ onUsernameLoaded }: SidebarProps) => {
  const navigate = useNavigate();
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { role, email } = getCurrentIdentity();
  const visibleMenus = role
    ? SideBarMenus.filter((menu) => menu.roles.includes(role))
    : [];
  const [username, setUsername] = useState(role ?? 'User');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('sidebar-theme') === 'dark',
  );

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
    let isMounted = true;
    getUserName().then((name) => {
      if (isMounted && name) {
        setUsername(name);
        onUsernameLoaded?.(name);
      }
    }).catch((error: unknown) => {
      console.error('Unable to load sidebar username.', error);
    });

    return () => {
      isMounted = false;
    };
  }, [onUsernameLoaded]);

  useEffect(() => {
    document.documentElement.classList.toggle('dashboard-dark', isDark);
    localStorage.setItem('sidebar-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((dark) => !dark);
  };

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    setIsAccountMenuOpen(false);
    navigate('/login', { replace: true });
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
            <button className="account-menu-item account-menu-signout" type="button" onClick={handleSignOut}>
              <IconLogout2 size={20} stroke={1.75} aria-hidden="true" />
              Đăng xuất
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
            : role ? menuPath[role] : undefined;

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
