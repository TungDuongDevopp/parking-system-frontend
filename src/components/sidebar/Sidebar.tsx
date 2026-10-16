import '../../resources/css/sidebar.scss';
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  IconLogout2,
  IconMoon,
  IconSun,
  IconMapPin,
  IconChevronDown,
} from '@tabler/icons-react';
import { jwtDecode } from 'jwt-decode';
import type { JwtPayload } from '../../types/Account/auth';
import { getUserName } from '../../services/authService';
import { SideBarMenus } from './sidebarConfig';

const getCurrentRole = () => {
  const token =
    localStorage.getItem('accessToken') ??
    sessionStorage.getItem('accessToken');

  if (!token) {
    return null;
  }

  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (payload.exp * 1000 <= Date.now()) {
      return null;
    }

    const role =
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    return role === 'Admin' || role === 'Staff' ? role : null;
  } catch {
    return null;
  }
};

interface SidebarProps {
  onUsernameLoaded?: (username: string) => void;
}

const Sidebar = ({ onUsernameLoaded }: SidebarProps) => {
  const navigate = useNavigate();
  const role = getCurrentRole();
  const visibleMenus = role
    ? SideBarMenus.filter((menu) => menu.roles.includes(role))
    : [];
  const [username, setUsername] = useState(role ?? 'User');
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('sidebar-theme') === 'dark',
  );

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
    navigate('/login', { replace: true });
  };

  return (
  <aside className="sidebar-container" data-theme={isDark ? 'dark' : 'light'} aria-label="Sidebar layout">
    <div className="sidebar-top">
      <div className="profile layout-block">
        <span className="avatar layout-block">{username.slice(0, 2).toUpperCase()}</span>
        <span className="info layout-block">{username}</span>
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
      <div className="list-menu layout-block">
         <button className="nav-item layout-block" type="button" onClick={handleSignOut}>
          <IconLogout2 size={20} stroke={1.75} />Logout
        </button>
      </div>
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
