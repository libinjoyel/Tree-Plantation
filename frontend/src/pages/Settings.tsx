import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export const Settings = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('settings');

  // Initialize dark mode from localStorage
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('appSettings');
    const defaultSettings = {
      notificationsEnabled: true,
      emailAlerts: true,
      wateringReminders: true,
      weeklyReports: false,
      darkMode: localStorage.getItem('darkMode') === 'true' ? true : false,
      language: 'English',
      timezone: 'UTC-5',
    };
    return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
  });

  // Apply dark mode to document
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.style.colorScheme = 'dark';
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.style.colorScheme = 'light';
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
    }
  }, [settings.darkMode]);

  const [userInfo, setUserInfo] = useState({
    username: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
  });

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard' },
    { id: 'plants', label: 'My Plants', icon: '🌱', href: '/my-plants' },
    { id: 'schedule', label: 'Schedule', icon: '📅', href: '/schedule' },
    { id: 'tips', label: 'Care Tips', icon: '💡', href: '/care-tips' },
    { id: 'charts', label: 'Analytics', icon: '📈', href: '/analytics' },
    { id: 'settings', label: 'Settings', icon: '⚙️', href: '/settings' },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  const handleMenuClick = (menuId: string, href: string) => {
    setActiveMenu(menuId);
    if (href && href !== '#') {
      navigate(href);
    }
  };

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleUserInfoChange = (key: string, value: string) => {
    setUserInfo({ ...userInfo, [key]: value });
  };

  const handleSaveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    alert('✅ Settings saved successfully!');
  };

  const handleChangePasswordClick = () => {
    setShowChangePassword(!showChangePassword);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('❌ Please fill in all password fields!');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('❌ New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('❌ Password must be at least 6 characters long!');
      return;
    }
    alert('✅ Password changed successfully!');
    setShowChangePassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
              onClick={() => handleMenuClick(item.id, item.href)}
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
            <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <h1>⚙️ Settings</h1>
          </div>
        </nav>

        <main className="content">
          {/* User Account Section */}
          <div className="settings-section">
            <h2>👤 Account Settings</h2>
            <div className="settings-card">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={userInfo.username}
                  onChange={(e) => handleUserInfoChange('username', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => handleUserInfoChange('email', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={userInfo.phone}
                  onChange={(e) => handleUserInfoChange('phone', e.target.value)}
                  className="form-input"
                />
              </div>

              <button className="btn primary" onClick={handleSaveSettings}>
                💾 Save Account Settings
              </button>
            </div>
          </div>

          {/* Security Section */}
          <div className="settings-section">
            <h2>🔒 Security</h2>
            <div className="settings-card">
              {!showChangePassword ? (
                <button className="btn primary" onClick={handleChangePasswordClick}>
                  🔑 Change Password
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label htmlFor="current-password">Current Password</label>
                    <input
                      id="current-password"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="new-password">New Password</label>
                    <input
                      id="new-password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirm-password">Confirm New Password</label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      className="form-input"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn primary" onClick={handleChangePassword}>
                      ✅ Update Password
                    </button>
                    <button className="btn secondary" onClick={handleChangePasswordClick}>
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notifications Section */}
          <div className="settings-section">
            <h2>🔔 Notifications</h2>
            <div className="settings-card">
              <div className="settings-toggle">
                <div>
                  <label>Enable All Notifications</label>
                  <p className="toggle-description">Receive all types of notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                  className="toggle-input"
                />
              </div>

              <div className="settings-toggle">
                <div>
                  <label>Email Alerts</label>
                  <p className="toggle-description">Get important updates via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={(e) => handleSettingChange('emailAlerts', e.target.checked)}
                  className="toggle-input"
                  disabled={!settings.notificationsEnabled}
                />
              </div>

              <div className="settings-toggle">
                <div>
                  <label>Watering Reminders</label>
                  <p className="toggle-description">Be reminded when plants need water</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.wateringReminders}
                  onChange={(e) => handleSettingChange('wateringReminders', e.target.checked)}
                  className="toggle-input"
                  disabled={!settings.notificationsEnabled}
                />
              </div>

              <div className="settings-toggle">
                <div>
                  <label>Weekly Reports</label>
                  <p className="toggle-description">Receive weekly plant health reports</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.weeklyReports}
                  onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                  className="toggle-input"
                  disabled={!settings.notificationsEnabled}
                />
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="settings-section">
            <h2>🎨 Preferences</h2>
            <div className="settings-card">
              <div className="form-group">
                <label htmlFor="language">Language</label>
                <select
                  id="language"
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="form-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Chinese">Chinese</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="timezone">Timezone</label>
                <select
                  id="timezone"
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  className="form-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="UTC-8">Pacific Time (UTC-8)</option>
                  <option value="UTC-7">Mountain Time (UTC-7)</option>
                  <option value="UTC-6">Central Time (UTC-6)</option>
                  <option value="UTC-5">Eastern Time (UTC-5)</option>
                  <option value="UTC">UTC</option>
                  <option value="UTC+1">Central European Time (UTC+1)</option>
                </select>
              </div>

              <div className="settings-toggle">
                <div>
                  <label>Dark Mode</label>
                  <p className="toggle-description">Enable dark theme for comfortable viewing</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                  className="toggle-input"
                />
              </div>

              <button className="btn primary" onClick={handleSaveSettings}>
                💾 Save Preferences
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="settings-section">
            <h2>⚠️ Danger Zone</h2>
            <div className="settings-card danger">
              <button
                className="btn danger"
                onClick={() => {
                  if (window.confirm('Are you sure? This action cannot be undone.')) {
                    alert('❌ Account deletion request submitted. We will process it within 30 days.');
                  }
                }}
              >
                🗑️ Delete Account
              </button>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .settings-section {
          margin-bottom: 32px;
        }

        .settings-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .settings-card.danger {
          border: 2px solid #ff6b6b;
          background: #fff5f5;
        }

        .settings-toggle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .settings-toggle:last-child {
          border-bottom: none;
        }

        .settings-toggle label {
          font-weight: 600;
          color: #333;
          cursor: pointer;
        }

        .toggle-description {
          font-size: 13px;
          color: #999;
          margin: 4px 0 0 0;
        }

        .toggle-input {
          width: 48px;
          height: 24px;
          cursor: pointer;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .btn.danger {
          background: #ff6b6b;
          color: white;
        }

        .btn.danger:hover {
          background: #ff5252;
          transform: translateY(-2px);
        }

        .btn.secondary {
          background: #f0f0f0;
          color: #333;
        }

        .btn.secondary:hover {
          background: #e8e8e8;
        }
      `}</style>
    </div>
  );
};

export default Settings;
