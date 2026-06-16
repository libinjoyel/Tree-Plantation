import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';
import authService from '../services/authService';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

interface AppLayoutProps {
  activeMenu: string;
  pageTitle: string;
  children: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard' },
  { id: 'plants', label: 'My Plants', icon: '🌱', href: '/my-plants' },
  { id: 'schedule', label: 'Schedule', icon: '📅', href: '/schedule' },
  { id: 'tips', label: 'Care Tips', icon: '💡', href: '/care-tips' },
  { id: 'charts', label: 'Analytics', icon: '📈', href: '/analytics' },
  { id: 'settings', label: 'Settings', icon: '⚙️', href: '/settings' },
];

export const AppLayout = ({ activeMenu, pageTitle, children }: AppLayoutProps) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const user: User | null = authService.getStoredUser();
  const initials = user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  const handleMenuClick = (href: string) => {
    if (href && href !== '#') {
      navigate(href);
    }
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    await authService.logout();
    navigate('/login');
  };

  return (
    <>
      <div className="dashboard-wrapper">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <div className="logo">🌱</div>
            {sidebarOpen && <h2>PlantCare AI</h2>}
          </div>

          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.href)}
                title={item.label}
              >
                <span className="icon">{item.icon}</span>
                {sidebarOpen && <span className="label">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="logout-sidebar-btn" onClick={handleLogout} title="Logout">
              <span className="icon">🚪</span>
              {sidebarOpen && <span className="label">Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="dashboard-main">
          <nav className="navbar">
            <div className="navbar-content">
              <button
                className="toggle-sidebar"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
              >
                ☰
              </button>
              <div className="navbar-title">
                <h1>{pageTitle}</h1>
              </div>
              <div className="navbar-actions" ref={profileRef}>
                <div className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)} title={user?.name || 'User'}>
                  <div className="profile-avatar">{initials}</div>
                </div>
                {profileOpen && (
                  <div className="profile-card">
                    <div className="profile-card-arrow" />
                    <div className="profile-card-header">
                      <div className="profile-card-avatar">{initials}</div>
                      <div className="profile-card-info">
                        <p className="profile-card-name">{user?.name || 'User'}</p>
                        <p className="profile-card-email">{user?.email || ''}</p>
                      </div>
                    </div>
                    <div className="profile-card-divider" />
                    <div className="profile-card-body">
                      <button className="profile-card-item" onClick={() => { setProfileOpen(false); navigate('/settings'); }}>
                        <span className="profile-card-item-icon">⚙️</span>
                        <span>Settings</span>
                      </button>
                      <button className="profile-card-item" onClick={() => { setProfileOpen(false); navigate('/my-plants'); }}>
                        <span className="profile-card-item-icon">🌱</span>
                        <span>My Plants</span>
                      </button>
                    </div>
                    <div className="profile-card-divider" />
                    <div className="profile-card-footer">
                      <button className="profile-card-logout" onClick={handleLogout}>
                        <span className="profile-card-item-icon">🚪</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </nav>

          <main className="content">
            {children}
          </main>
        </div>
      </div>

      <style>{`
  .navbar-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-left: auto;
    position: relative;
  }
  .profile-trigger {
    display: flex;
    align-items: center;
    padding: 3px;
    background: #f0f2f5;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
    border: 2px solid transparent;
  }
  .profile-trigger:hover {
    background: #e4e7eb;
    border-color: #2d8659;
    transform: scale(1.05);
  }
  .profile-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2d8659, #1b5a3d);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 15px;
    flex-shrink: 0;
    letter-spacing: 0.5px;
  }
  .profile-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 99;
  }
  .profile-card {
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    background: white;
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
    z-index: 100;
    width: 280px;
    animation: profileFadeIn 0.2s ease;
  }
  .profile-card-arrow {
    position: absolute;
    top: -6px;
    right: 20px;
    width: 12px;
    height: 12px;
    background: white;
    transform: rotate(45deg);
    border-radius: 2px;
    box-shadow: -3px -3px 8px rgba(0,0,0,0.04);
  }
  @keyframes profileFadeIn {
    from { opacity: 0; transform: translateY(-10px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .profile-card-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px 20px 16px;
  }
  .profile-card-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2d8659, #1b5a3d);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 20px;
    flex-shrink: 0;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(45,134,89,0.25);
  }
  .profile-card-info {
    flex: 1;
    min-width: 0;
  }
  .profile-card-name {
    font-weight: 700;
    color: #1a1a1a;
    font-size: 15px;
    margin: 0;
    line-height: 1.3;
  }
  .profile-card-email {
    color: #888;
    font-size: 13px;
    margin: 3px 0 0 0;
    word-break: break-all;
    line-height: 1.3;
  }
  .profile-card-divider {
    height: 1px;
    background: #f0f0f0;
    margin: 0 12px;
  }
  .profile-card-body {
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .profile-card-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border: none;
    background: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 14px;
    color: #333;
    transition: all 0.15s;
    text-align: left;
    font-weight: 500;
  }
  .profile-card-item:hover {
    background: #f5f7fa;
    color: #2d8659;
  }
  .profile-card-item-icon {
    font-size: 18px;
    width: 24px;
    text-align: center;
    flex-shrink: 0;
  }
  .profile-card-footer {
    padding: 8px 12px;
  }
  .profile-card-logout {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border: none;
    background: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 14px;
    color: #d93025;
    transition: all 0.15s;
    text-align: left;
    font-weight: 600;
  }
  .profile-card-logout:hover {
    background: #fce8e6;
  }
  body.dark-mode .profile-trigger {
    background: #2a2a2a;
    border-color: transparent;
  }
  body.dark-mode .profile-trigger:hover {
    background: #333;
    border-color: #2d8659;
  }
  body.dark-mode .profile-card {
    background: #1e1e1e;
    box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2);
  }
  body.dark-mode .profile-card-arrow {
    background: #1e1e1e;
  }
  body.dark-mode .profile-card-name {
    color: #e8e8e8;
  }
  body.dark-mode .profile-card-email {
    color: #999;
  }
  body.dark-mode .profile-card-divider {
    background: #333;
  }
  body.dark-mode .profile-card-item {
    color: #ccc;
  }
  body.dark-mode .profile-card-item:hover {
    background: #2a2a2a;
    color: #2d8659;
  }
  body.dark-mode .profile-card-logout {
    color: #f28b82;
  }
  body.dark-mode .profile-card-logout:hover {
    background: #3c1a1a;
  }
`}</style>
    </>
  );
};

export default AppLayout;
