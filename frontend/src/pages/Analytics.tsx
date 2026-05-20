import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export const Analytics = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('charts');

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard' },
    { id: 'plants', label: 'My Plants', icon: '🌱', href: '/my-plants' },
    { id: 'schedule', label: 'Schedule', icon: '📅', href: '/schedule' },
    { id: 'tips', label: 'Care Tips', icon: '💡', href: '/care-tips' },
    { id: 'charts', label: 'Analytics', icon: '📈', href: '/analytics' },
    { id: 'settings', label: 'Settings', icon: '⚙️', href: '/settings' },
  ];

  const plantStats = [
    { name: 'Monstera Deliciosa', health: 92, waterFreq: 7, lastWatered: 3 },
    { name: 'Snake Plant', health: 85, waterFreq: 14, lastWatered: 5 },
    { name: 'Pothos', health: 88, waterFreq: 5, lastWatered: 1 },
    { name: 'Spider Plant', health: 90, waterFreq: 10, lastWatered: 2 },
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

  const getHealthColor = (health: number) => {
    if (health >= 90) return '#2d8659';
    if (health >= 75) return '#ffa500';
    return '#ff6b6b';
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
            <h1>📈 Analytics</h1>
          </div>
        </nav>

        <main className="content">
          {/* Overview Cards */}
          <div className="section">
            <h2>📊 Overview</h2>
            <div className="analytics-cards">
              <div className="analytics-card">
                <div className="card-icon">🌱</div>
                <div className="card-content">
                  <p className="card-label">Total Plants</p>
                  <p className="card-value">4</p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">💧</div>
                <div className="card-content">
                  <p className="card-label">Waterings This Month</p>
                  <p className="card-value">16</p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">🎯</div>
                <div className="card-content">
                  <p className="card-label">Average Health</p>
                  <p className="card-value">88.75%</p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">⭐</div>
                <div className="card-content">
                  <p className="card-label">Care Tasks</p>
                  <p className="card-value">27</p>
                </div>
              </div>
            </div>
          </div>

          {/* Plant Health */}
          <div className="section">
            <h2>🏥 Plant Health Status</h2>
            <div className="health-stats">
              {plantStats.map((plant, index) => (
                <div key={index} className="health-item">
                  <div className="health-name">{plant.name}</div>
                  <div className="health-bar">
                    <div
                      className="health-fill"
                      style={{
                        width: `${plant.health}%`,
                        backgroundColor: getHealthColor(plant.health),
                      }}
                    ></div>
                  </div>
                  <div className="health-info">
                    <span className="health-percent">{plant.health}%</span>
                    <span className="health-watered">Last watered: {plant.lastWatered}d ago</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="section">
            <h2>📈 Statistics</h2>
            <div className="stats-grid">
              <div className="stat-box">
                <h4>💧 Watering Frequency</h4>
                <p className="stat-text">Average every 9 days</p>
                <p className="stat-subtext">4 plants tracked</p>
              </div>
              <div className="stat-box">
                <h4>🎯 Health Goal</h4>
                <p className="stat-text">Keep all plants 85%+ health</p>
                <p className="stat-subtext">3/4 plants at goal</p>
              </div>
              <div className="stat-box">
                <h4>📊 Care Consistency</h4>
                <p className="stat-text">92% consistency rate</p>
                <p className="stat-subtext">This month</p>
              </div>
              <div className="stat-box">
                <h4>🏆 Top Performer</h4>
                <p className="stat-text">Monstera Deliciosa</p>
                <p className="stat-subtext">92% health score</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="section">
            <h2>💡 Recommendations</h2>
            <div className="recommendations">
              <div className="recommendation-item">
                <span className="rec-icon">⚠️</span>
                <div className="rec-content">
                  <h4>Monitor Snake Plant</h4>
                  <p>Health score at 85%. Consider adjusting watering or fertilizing.</p>
                </div>
              </div>
              <div className="recommendation-item">
                <span className="rec-icon">💧</span>
                <div className="rec-content">
                  <h4>Water Pothos Today</h4>
                  <p>Due for watering based on 5-day schedule.</p>
                </div>
              </div>
              <div className="recommendation-item">
                <span className="rec-icon">✨</span>
                <div className="rec-content">
                  <h4>Great Job!</h4>
                  <p>You've maintained 88.75% average plant health. Keep it up!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Working Scenario */}
          <div className="section">
            <h2>🎯 Working Scenario</h2>
            <div className="scenario-container">
              <div className="scenario-step">
                <div className="scenario-number">1</div>
                <div className="scenario-content">
                  <h4>Monitor Plant Health</h4>
                  <p>Check the Plant Health Status section to see how your plants are doing. A plant below 85% may need attention.</p>
                </div>
              </div>
              <div className="scenario-step">
                <div className="scenario-number">2</div>
                <div className="scenario-content">
                  <h4>Check Health Trends</h4>
                  <p>Review each plant's health percentage and watering history. Identify which plants need attention and adjust your care routine accordingly.</p>
                </div>
              </div>
              <div className="scenario-step">
                <div className="scenario-number">3</div>
                <div className="scenario-content">
                  <h4>Analyze Statistics</h4>
                  <p>Review watering frequency, consistency rate, and care goals. These help you understand your plant care patterns.</p>
                </div>
              </div>
              <div className="scenario-step">
                <div className="scenario-number">4</div>
                <div className="scenario-content">
                  <h4>Take Action</h4>
                  <p>Use recommendations to adjust your care routine. Go to Schedule or My Plants to implement changes based on your analytics.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
