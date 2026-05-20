import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export const CareTips = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('tips');

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard' },
    { id: 'plants', label: 'My Plants', icon: '🌱', href: '/my-plants' },
    { id: 'schedule', label: 'Schedule', icon: '📅', href: '/schedule' },
    { id: 'tips', label: 'Care Tips', icon: '💡', href: '/care-tips' },
    { id: 'charts', label: 'Analytics', icon: '📈', href: '/analytics' },
    { id: 'settings', label: 'Settings', icon: '⚙️', href: '/settings' },
  ];

  const tips = [
    {
      icon: '🌅',
      title: 'Watering Time',
      description: 'Water your plants during early morning hours for best results. This allows plants to absorb water before the heat of the day.',
      details: 'Early morning watering prevents water loss through evaporation and ensures plants have hydration throughout the day.'
    },
    {
      icon: '💨',
      title: 'Drainage',
      description: 'Ensure proper drainage to prevent root rot and fungal issues. Use pots with drainage holes.',
      details: 'Proper drainage prevents water accumulation, which is one of the most common causes of plant death.'
    },
    {
      icon: '🌡️',
      title: 'Soil Check',
      description: 'Check soil moisture before watering by touching the top layer. Water only when soil is dry.',
      details: 'This simple test prevents overwatering, the most common plant care mistake.'
    },
    {
      icon: '☀️',
      title: 'Light Exposure',
      description: 'Keep plants away from direct heat sources and ensure adequate light.',
      details: 'Different plants need different light levels. Research your plant\'s specific light requirements.'
    },
    {
      icon: '🍂',
      title: 'Humidity Levels',
      description: 'Maintain appropriate humidity levels based on plant type. Use a humidifier for tropical plants.',
      details: 'Most houseplants prefer humidity levels between 40-50%. Group plants together to increase humidity naturally.'
    },
    {
      icon: '🔄',
      title: 'Seasonal Rotation',
      description: 'Rotate your plants every few weeks to ensure even light exposure on all sides.',
      details: 'This prevents plants from becoming leggy and ensures symmetrical, healthy growth.'
    },
    {
      icon: '✂️',
      title: 'Pruning & Trimming',
      description: 'Remove dead leaves and stems regularly to encourage new growth.',
      details: 'Pruning improves air circulation and removes diseased or damaged plant material.'
    },
    {
      icon: '🌿',
      title: 'Pest Management',
      description: 'Inspect plants regularly for pests and treat infestations early.',
      details: 'Common indoor plant pests include spider mites, scale, and mealybugs. Neem oil is an effective organic treatment.'
    },
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
            <h1>💡 Plant Care Tips</h1>
          </div>
        </nav>

        <main className="content">
          <div className="section">
            <h2>Essential Plant Care Guide</h2>
            <div className="tips-grid">
              {tips.map((tip, index) => (
                <div key={index} className="tip-card">
                  <div className="tip-icon">{tip.icon}</div>
                  <h3>{tip.title}</h3>
                  <p className="tip-description">{tip.description}</p>
                  <p className="tip-details">{tip.details}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="section" style={{ marginTop: '40px' }}>
            <h2>Quick Tips</h2>
            <div className="quick-tips">
              <div className="quick-tip-item">
                <strong>🚫 Don't Overwater:</strong> Most plant problems stem from overwatering. Let soil dry between waterings.
              </div>
              <div className="quick-tip-item">
                <strong>📍 Location Matters:</strong> Place plants near windows for natural light, but avoid direct harsh sunlight on sensitive plants.
              </div>
              <div className="quick-tip-item">
                <strong>🧪 Know Your Soil:</strong> Use well-draining potting soil appropriate for your plant type (cacti, tropical, etc.).
              </div>
              <div className="quick-tip-item">
                <strong>🌡️ Temperature Control:</strong> Keep plants away from heating vents, air conditioners, and cold drafts.
              </div>
              <div className="quick-tip-item">
                <strong>👃 Smell Test:</strong> If soil smells bad, it indicates root rot. Repot the plant immediately with fresh soil.
              </div>
              <div className="quick-tip-item">
                <strong>📚 Research:</strong> Each plant species has unique care requirements. Research before bringing a new plant home.
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CareTips;
