import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const handleMenuClick = (href: string) => {
    if (href && href !== '#') {
      navigate(href);
    }
  };

  const handleLogout = async () => {
    await authService.logout(); // clears token + user from localStorage
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
          </div>
        </nav>

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
