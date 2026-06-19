import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppSettings, UserInfo } from '../types';
import settingsService from '../services/settingsService';
import AppLayout from '../components/AppLayout';
import MotionCard from '../components/MotionCard';
import Typography from '@mui/material/Typography';
import '../styles/Dashboard.css';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaletteIcon from '@mui/icons-material/Palette';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteIcon from '@mui/icons-material/Delete';
import toast from 'react-hot-toast';

export const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // User info state
  const [userInfo, setUserInfo] = useState<UserInfo>({
    username: '',
    email: '',
  });

  // Settings state
  const [settings, setSettings] = useState<AppSettings>({
    notificationsEnabled: true,
    emailAlerts: true,
    wateringReminders: true,
    weeklyReports: false,
    darkMode: false,
    language: 'English',
    timezone: 'UTC',
  });

  // Password change state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load user info and settings on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [infoRes, settingsRes] = await Promise.all([
          settingsService.getUserInfo(),
          settingsService.getSettings()
        ]);

        if (infoRes.success && infoRes.data) {
          setUserInfo(infoRes.data.userInfo);
        } else {
          setError(infoRes.error || 'Failed to load user info');
        }

        if (settingsRes.success && settingsRes.data) {
          setSettings(settingsRes.data.settings);
        } else {
          setError(settingsRes.error || 'Failed to load settings');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading settings');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply dark mode theme
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

  const handleSettingChange = (key: keyof AppSettings, value: boolean | string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleUserInfoChange = (key: keyof UserInfo, value: string) => {
    setUserInfo((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Save account settings (username only, email is read-only)
  const handleSaveAccountSettings = async () => {
    if (!userInfo.username.trim()) {
      toast.error('Username cannot be empty!');
      return;
    }

    try {
      const res = await settingsService.updateUserInfo({ name: userInfo.username });
      if (res.success && res.data) {
        setUserInfo(res.data.userInfo);
        toast.success('Account settings updated successfully!');
      } else {
        toast.error(`Failed to update account settings: ${res.error}`);
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message || 'Failed to save account settings'}`);
    }
  };

  // Save preferences & notification settings
  const handleSavePreferences = async () => {
    try {
      const res = await settingsService.updateSettings(settings);
      if (res.success && res.data) {
        setSettings(res.data.settings);
        toast.success('Preferences saved successfully!');
      } else {
        toast.error(`Failed to save preferences: ${res.error}`);
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message || 'Failed to save preferences'}`);
    }
  };

  const handleChangePasswordClick = () => {
    setShowChangePassword(!showChangePassword);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields!');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long!');
      return;
    }

    try {
      const res = await settingsService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (res.success) {
        toast.success('Password changed successfully!');
        setShowChangePassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(`Failed to change password: ${res.error}`);
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message || 'Failed to change password'}`);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await settingsService.deleteAccount();
      if (res.success) {
        toast.success('Account deleted successfully.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        toast.error(`Failed to delete account: ${res.error}`);
        setDeleting(false);
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message || 'Failed to delete account'}`);
      setDeleting(false);
    }
  };

  return (
    <AppLayout activeMenu="settings" pageTitle="Settings">
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading settings...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p><CloseIcon fontSize="inherit" /> Error: {error}</p>
        </div>
      ) : (
        <>
          {/* User Account Section */}
          <div className="settings-section">
            <Typography variant="h5" component="h2" sx={{ margin: '0 0 24px 0', fontWeight: 700, color: '#333', paddingBottom: '12px', borderBottom: '2px solid #e0e0e0' }}><PersonIcon fontSize="inherit" /> Account Settings</Typography>
            <MotionCard className="settings-card">
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
                <label htmlFor="email">Email Address (Read-only)</label>
                <input
                  id="email"
                  type="email"
                  value={userInfo.email}
                  className="form-input read-only-input"
                  disabled
                  title="Email address cannot be changed."
                />
              </div>

              <button className="btn primary" onClick={handleSaveAccountSettings}>
                <SaveIcon fontSize="inherit" /> Save Account Settings
              </button>
            </MotionCard>
          </div>

          {/* Security Section */}
          <div className="settings-section">
            <Typography variant="h5" component="h2" sx={{ margin: '0 0 24px 0', fontWeight: 700, color: '#333', paddingBottom: '12px', borderBottom: '2px solid #e0e0e0' }}><LockIcon fontSize="inherit" /> Security</Typography>
            <MotionCard className="settings-card">
              {!showChangePassword ? (
                <button className="btn primary" onClick={handleChangePasswordClick}>
                  <VpnKeyIcon fontSize="inherit" /> Change Password
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
                      <CheckCircleIcon fontSize="inherit" /> Update Password
                    </button>
                    <button className="btn secondary" onClick={handleChangePasswordClick}>
                      <CloseIcon fontSize="inherit" /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </MotionCard>
          </div>

          {/* Notifications Section */}
          <div className="settings-section">
            <Typography variant="h5" component="h2" sx={{ margin: '0 0 24px 0', fontWeight: 700, color: '#333', paddingBottom: '12px', borderBottom: '2px solid #e0e0e0' }}><NotificationsIcon fontSize="inherit" /> Notifications</Typography>
            <MotionCard className="settings-card">
              <div className="settings-toggle">
                <div>
                  <label htmlFor="notifications-enabled">Enable All Notifications</label>
                  <Typography variant="caption" sx={{ color: '#999', margin: '4px 0 0 0', display: 'block' }}>Receive all types of notifications</Typography>
                </div>
                <input
                  id="notifications-enabled"
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                  className="toggle-input"
                />
              </div>

              <div className="settings-toggle">
                <div>
                  <label htmlFor="email-alerts">Email Alerts</label>
                  <Typography variant="caption" sx={{ color: '#999', margin: '4px 0 0 0', display: 'block' }}>Get important updates via email</Typography>
                </div>
                <input
                  id="email-alerts"
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={(e) => handleSettingChange('emailAlerts', e.target.checked)}
                  className="toggle-input"
                  disabled={!settings.notificationsEnabled}
                />
              </div>

              <div className="settings-toggle">
                <div>
                  <label htmlFor="watering-reminders">Watering Reminders</label>
                  <Typography variant="caption" sx={{ color: '#999', margin: '4px 0 0 0', display: 'block' }}>Be reminded when plants need water</Typography>
                </div>
                <input
                  id="watering-reminders"
                  type="checkbox"
                  checked={settings.wateringReminders}
                  onChange={(e) => handleSettingChange('wateringReminders', e.target.checked)}
                  className="toggle-input"
                  disabled={!settings.notificationsEnabled}
                />
              </div>

              <div className="settings-toggle">
                <div>
                  <label htmlFor="weekly-reports">Weekly Reports</label>
                  <Typography variant="caption" sx={{ color: '#999', margin: '4px 0 0 0', display: 'block' }}>Receive weekly plant health reports</Typography>
                </div>
                <input
                  id="weekly-reports"
                  type="checkbox"
                  checked={settings.weeklyReports}
                  onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                  className="toggle-input"
                  disabled={!settings.notificationsEnabled}
                />
              </div>
            </MotionCard>
          </div>

          {/* Preferences Section */}
          <div className="settings-section">
            <Typography variant="h5" component="h2" sx={{ margin: '0 0 24px 0', fontWeight: 700, color: '#333', paddingBottom: '12px', borderBottom: '2px solid #e0e0e0' }}><PaletteIcon fontSize="inherit" /> Preferences</Typography>
            <MotionCard className="settings-card">
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
                  <label htmlFor="dark-mode">Dark Mode</label>
                  <Typography variant="caption" sx={{ color: '#999', margin: '4px 0 0 0', display: 'block' }}>Enable dark theme for comfortable viewing</Typography>
                </div>
                <input
                  id="dark-mode"
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                  className="toggle-input"
                />
              </div>

              <button className="btn primary" onClick={handleSavePreferences}>
                <SaveIcon fontSize="inherit" /> Save Preferences
              </button>
            </MotionCard>
          </div>

          {/* Danger Zone */}
          <div className="settings-section">
            <Typography variant="h5" component="h2" sx={{ margin: '0 0 24px 0', fontWeight: 700, color: '#c0392b', paddingBottom: '12px', borderBottom: '2px solid #ff6b6b' }}><WarningIcon fontSize="inherit" /> Danger Zone</Typography>
            <MotionCard className="settings-card danger">
              <button
                className="btn danger"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                <DeleteIcon fontSize="inherit" /> {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </MotionCard>
          </div>
        </>
      )}

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

        .read-only-input {
          background-color: #f5f5f5;
          color: #777;
          cursor: not-allowed;
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

        .loading-state, .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(45, 134, 89, 0.1);
          border-top-color: #2d8659;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AppLayout>
  );
};

export default Settings;
