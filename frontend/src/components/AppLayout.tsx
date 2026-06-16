import { useState } from 'react';
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

  const user: User | null = authService.getStoredUser();
  const initials = user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

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
            <div className="navbar-actions">
              <div className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="profile-avatar">{initials}</div>
                <span className="profile-name">{user?.name || 'User'}</span>
              </div>
              {profileOpen && (
                <>
                  <div className="profile-overlay" onClick={() => setProfileOpen(false)} />
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">{initials}</div>
                      <div className="dropdown-info">
                        <p className="dropdown-name">{user?.name || 'User'}</p>
                        <p className="dropdown-email">{user?.email || ''}</p>
                      </div>
                    </div>
                    <div className="dropdown-body">
                      <button className="dropdown-item" onClick={() => { setProfileOpen(false); navigate('/settings'); }}>
                        ⚙️ Settings
                      </button>
                    </div>
                    <div className="dropdown-footer">
                      <button className="dropdown-logout" onClick={handleLogout}>
                        🚪 Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};

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
    gap: 10px;
    padding: 6px 12px 6px 6px;
    background: #f5f5f5;
    border-radius: 24px;
    cursor: pointer;
    transition: background 0.2s;
    user-select: none;
  }
  .profile-trigger:hover {
    background: #e8e8e8;
  }
  .profile-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2d8659, #1b5a3d);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    flex-shrink: 0;
  }
  .profile-name {
    font-weight: 600;
    color: #333;
    font-size: 14px;
    white-space: nowrap;
  }
  .profile-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 99;
  }
  .profile-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    z-index: 100;
    width: 260px;
    overflow: hidden;
    animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .dropdown-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
  }
  .dropdown-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2d8659, #1b5a3d);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
    flex-shrink: 0;
  }
  .dropdown-info {
    flex: 1;
    min-width: 0;
  }
  .dropdown-name {
    font-weight: 700;
    color: #333;
    font-size: 14px;
    margin: 0;
  }
  .dropdown-email {
    color: #999;
    font-size: 12px;
    margin: 2px 0 0 0;
    word-break: break-all;
  }
  .dropdown-body {
    padding: 8px;
  }
  .dropdown-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: none;
    background: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #333;
    transition: background 0.2s;
    text-align: left;
  }
  .dropdown-item:hover {
    background: #f5f5f5;
  }
  .dropdown-footer {
    padding: 8px;
    border-top: 1px solid #f0f0f0;
  }
  .dropdown-logout {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: none;
    background: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #e74c3c;
    transition: background 0.2s;
    text-align: left;
    font-weight: 600;
  }
  .dropdown-logout:hover {
    background: #fff0f0;
  }
  body.dark-mode .profile-trigger {
    background: #333;
  }
  body.dark-mode .profile-trigger:hover {
    background: #444;
  }
  body.dark-mode .profile-name {
    color: #e0e0e0;
  }
  body.dark-mode .profile-dropdown {
    background: #242424;
    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
  }
  body.dark-mode .dropdown-header {
    border-bottom-color: #333;
  }
  body.dark-mode .dropdown-name {
    color: #e0e0e0;
  }
  body.dark-mode .dropdown-item {
    color: #e0e0e0;
  }
  body.dark-mode .dropdown-item:hover {
    background: #333;
  }
  body.dark-mode .dropdown-footer {
    border-top-color: #333;
  }
`}</style>

export default AppLayout;
