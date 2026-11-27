import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../services/authService';
import plantService from '../services/plantService';
import { calculateHealth } from '../utils/helpers';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SpaIcon from '@mui/icons-material/Spa';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import InsightsIcon from '@mui/icons-material/Insights';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import GrassIcon from '@mui/icons-material/Grass';
import { navItem, staggerContainer } from '../utils/animations';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon fontSize="inherit" />, href: '/dashboard' },
  { id: 'plants', label: 'My Plants', icon: <SpaIcon fontSize="inherit" />, href: '/my-plants' },
  { id: 'schedule', label: 'Schedule', icon: <CalendarMonthIcon fontSize="inherit" />, href: '/schedule' },
  { id: 'tips', label: 'Care Tips', icon: <LightbulbIcon fontSize="inherit" />, href: '/care-tips' },
  { id: 'charts', label: 'Analytics', icon: <InsightsIcon fontSize="inherit" />, href: '/analytics' },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon fontSize="inherit" />, href: '/settings' },
];

export const AppLayout = ({ activeMenu, pageTitle, children }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth > 768 : true
  );
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const user = authService.getStoredUser();
  const initials = user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handleChange = (e) => setSidebarOpen(!e.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      const response = await plantService.getAllPlants();
      if (response.success && response.data?.plants) {
        const overdue = response.data.plants.filter(p => calculateHealth(p.lastWatered, p.wateringSchedule) <= 0);
        setNotifications(overdue.map(p => `${p.name} needs water!`));
      }
    };
    loadNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (profileOpen || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen, showNotifications]);

  const handleMenuClick = (href) => {
    if (href && href !== '#') {
      navigate(href);
    }
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setSidebarOpen(false);
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
        {sidebarOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <motion.div className="logo" whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.2 }}><SpaIcon sx={{ fontSize: 32 }} /></motion.div>
            {sidebarOpen && <Typography variant="h6" component="h2" sx={{ margin: 0, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', flex: 1 }}>PlantCare</Typography>}
            <button
              className="sidebar-close-btn"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <CloseIcon fontSize="inherit" />
            </button>
          </div>

          <motion.nav className="sidebar-nav" variants={staggerContainer} initial="initial" animate="animate">
            {menuItems.map((item) => (
              <motion.button
                key={item.id}
                className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.href)}
                title={item.label}
                variants={navItem}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}
                whileTap="tap"
              >
                <span className="icon">{item.icon}</span>
                {sidebarOpen && <motion.span key={`label-${item.id}`} className="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>{item.label}</motion.span>}
              </motion.button>
            ))}
          </motion.nav>

          <div className="sidebar-footer">
            <motion.button className="logout-sidebar-btn" onClick={handleLogout} title="Logout" whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)' }} whileTap={{ scale: 0.97 }}>
              <span className="icon"><LogoutIcon fontSize="inherit" /></span>
              {sidebarOpen && <span className="label">Logout</span>}
            </motion.button>
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
                <MenuIcon fontSize="inherit" />
              </button>
              <div className="navbar-title">
                <Typography variant="h5" component="h1" sx={{ margin: 0, fontWeight: 700, color: '#333' }}>{pageTitle}</Typography>
              </div>
              <div className="navbar-actions" ref={profileRef}>
                <div style={{ position: 'relative' }} ref={notifRef}>
                  <button
                    className="icon-btn"
                    title={`Notifications (${notifications.length})`}
                    onClick={() => setShowNotifications(s => !s)}
                    style={{ position: 'relative' }}
                  >
                    <NotificationsIcon fontSize="inherit" />
                    {notifications.length > 0 && (
                      <span className="notification-badge">{notifications.length}</span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="notifications-panel">
                      <div className="notifications-header">
                        <Typography variant="subtitle1" component="h4" sx={{ fontWeight: 700, color: '#333', margin: 0 }}><NotificationsIcon fontSize="inherit" /> Notifications</Typography>
                        <button onClick={() => setShowNotifications(false)}><CloseIcon fontSize="inherit" /></button>
                      </div>
                      {notifications.length > 0 ? (
                        notifications.map((n, i) => (
                          <div key={i} className="notification-item"><WarningIcon fontSize="inherit" /> {n}</div>
                        ))
                      ) : (
                        <p className="no-notifications">All plants are doing great! <GrassIcon fontSize="inherit" /></p>
                      )}
                    </div>
                  )}
                </div>
                <div className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)} title={user?.name || 'User'}>
                  <div className="profile-avatar">{initials}</div>
                </div>
                {profileOpen && (
                  <div className="profile-card">
                    <div className="profile-card-arrow" />
                    <div className="profile-card-header">
                      <div className="profile-card-avatar">{initials}</div>
                      <div className="profile-card-info">
                        <Typography variant="body2" sx={{ color: '#1a1a1a', margin: 0, lineHeight: 1.3, fontWeight: 700 }}>{user?.name || 'User'}</Typography>
                        <Typography variant="caption" sx={{ color: '#888', margin: '3px 0 0 0', display: 'block', wordBreak: 'break-all', lineHeight: 1.3 }}>{user?.email || ''}</Typography>
                      </div>
                    </div>
                    <div className="profile-card-divider" />
                    <div className="profile-card-body">
                      <button className="profile-card-item" onClick={() => { setProfileOpen(false); navigate('/settings'); }}>
                        <span className="profile-card-item-icon"><SettingsIcon fontSize="inherit" /></span>
                        <span>Settings</span>
                      </button>
                      <button className="profile-card-item" onClick={() => { setProfileOpen(false); navigate('/my-plants'); }}>
                        <span className="profile-card-item-icon"><SpaIcon fontSize="inherit" /></span>
                        <span>My Plants</span>
                      </button>
                    </div>
                    <div className="profile-card-divider" />
                    <div className="profile-card-footer">
                      <button className="profile-card-logout" onClick={handleLogout}>
                        <span className="profile-card-item-icon"><LogoutIcon fontSize="inherit" /></span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </nav>

          <motion.main
            className="content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {children}
          </motion.main>
        </div>
      </div>

      <style>{`
  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.2s;
    font-size: 20px;
  }
  .icon-btn:hover {
    background: #f0f2f5;
    color: #2d8659;
  }
  body.dark-mode .icon-btn {
    color: #aaa;
  }
  body.dark-mode .icon-btn:hover {
    background: #2a2a2a;
    color: #2d8659;
  }
  .notification-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    background: #ff6b6b;
    color: white;
    font-size: 11px;
    font-weight: 700;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    box-shadow: 0 2px 6px rgba(255, 107, 107, 0.4);
  }
  .notifications-panel {
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    background: white;
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
    z-index: 100;
    width: 320px;
    padding: 16px;
    animation: profileFadeIn 0.2s ease;
  }
  .notifications-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
  }
  .notifications-header button {
    background: none;
    border: none;
    cursor: pointer;
    color: #999;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s;
  }
  .notifications-header button:hover {
    background: #f5f5f5;
    color: #333;
  }
  .notification-item {
    padding: 10px 12px;
    border-radius: 10px;
    background: #fff8f0;
    margin-bottom: 8px;
    font-size: 13px;
    color: #333;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .notification-item:last-child {
    margin-bottom: 0;
  }
  .no-notifications {
    text-align: center;
    color: #999;
    padding: 24px;
    font-size: 14px;
    margin: 0;
  }
  body.dark-mode .notifications-panel {
    background: #242424;
  }
  body.dark-mode .notifications-header {
    border-bottom-color: #333;
  }
  body.dark-mode .notification-item {
    background: rgba(255, 107, 107, 0.1);
    color: #e0e0e0;
  }
  body.dark-mode .no-notifications {
    color: #888;
  }
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
    display: flex;
    align-items: center;
    justify-content: center;
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
  .sidebar-backdrop {
    display: none;
  }
  .sidebar-close-btn {
    display: none;
    background: rgba(255, 255, 255, 0.15);
    border: none;
    color: white;
    border-radius: 8px;
    padding: 6px;
    cursor: pointer;
    font-size: 20px;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .sidebar-close-btn:hover {
    background: rgba(255, 255, 255, 0.25);
  }
  @media (max-width: 768px) {
    .sidebar-backdrop {
      display: block;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      z-index: 150;
      backdrop-filter: blur(2px);
    }
    .sidebar-close-btn {
      display: inline-flex;
    }
  }
  @media (max-width: 480px) {
    .notifications-panel {
      width: min(320px, calc(100vw - 24px));
      right: -46px;
    }
    .profile-card {
      width: min(280px, calc(100vw - 24px));
    }
  }
`}</style>
    </>
  );
};

export default AppLayout;
