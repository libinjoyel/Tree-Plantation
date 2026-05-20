import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Plant, WeatherData, WeatherSuggestion } from '../types';
import { getWeatherForCurrentLocation, getPlantCareSuggestion } from '../services/weatherService';
import '../styles/Dashboard.css';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // Weather states
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string>('');
  const [weatherSuggestion, setWeatherSuggestion] = useState<WeatherSuggestion | null>(null);

  // UI states
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddPlantModal, setShowAddPlantModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [wateredPlants, setWateredPlants] = useState<Set<string>>(new Set());
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', species: '', wateringSchedule: '' });
  const [newPlantData, setNewPlantData] = useState({ name: '', species: '', wateringSchedule: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Plant[]>([]);
  const [profileData, setProfileData] = useState({ name: 'John Doe', email: 'john.doe@example.com', phone: '+1 (555) 123-4567' });

  // Default dummy weather data
  const defaultWeather: WeatherData = {
    city: 'Unknown Location',
    temperature: 24,
    humidity: 65,
    condition: 'Partly Cloudy',
    feelsLike: 22,
    uvIndex: 6,
    windSpeed: 12,
    weatherIcon: '⛅',
    description: 'Partly cloudy',
  };

  const [plants] = useState<Plant[]>([
    {
      id: '1',
      name: 'Monstera Deliciosa',
      species: 'Monstera Deliciosa',
      wateringSchedule: 'Every 7 days',
      lastWatered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      name: 'Snake Plant',
      species: 'Sansevieria Trifasciata',
      wateringSchedule: 'Every 14 days',
      lastWatered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      name: 'Pothos',
      species: 'Epipremnum aureum',
      wateringSchedule: 'Every 5 days',
      lastWatered: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: '4',
      name: 'Spider Plant',
      species: 'Chlorophytum comosum',
      wateringSchedule: 'Every 10 days',
      lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ]);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard' },
    { id: 'plants', label: 'My Plants', icon: '🌱', href: '/my-plants' },
    { id: 'schedule', label: 'Schedule', icon: '📅', href: '/schedule' },
    { id: 'tips', label: 'Care Tips', icon: '💡', href: '/care-tips' },
    { id: 'charts', label: 'Analytics', icon: '📈', href: '/analytics' },
    { id: 'settings', label: 'Settings', icon: '⚙️', href: '/settings' },
  ];

  const handleMenuClick = (menuId: string, href: string) => {
    setActiveMenu(menuId);
    if (href && href !== '#') {
      navigate(href);
    }
  };
  const handleNotificationsClick = () => {
    setShowNotifications(!showNotifications);
    alert('You have 2 new notifications:\n1. Spider Plant needs water\n2. Dashboard usage summary ready');
  };

  const handleAddPlantClick = () => {
    setShowAddPlantModal(true);
    setNewPlantData({ name: '', species: '', wateringSchedule: '' });
  };

  const handleSaveNewPlant = () => {
    if (newPlantData.name && newPlantData.species && newPlantData.wateringSchedule) {
      // Add new plant to the array
      const newPlant: Plant = {
        id: String(plants.length + 1),
        name: newPlantData.name,
        species: newPlantData.species,
        wateringSchedule: newPlantData.wateringSchedule,
        lastWatered: new Date(),
      };
      plants.push(newPlant);
      alert(`✅ ${newPlantData.name} has been added successfully!`);
      setShowAddPlantModal(false);
      setNewPlantData({ name: '', species: '', wateringSchedule: '' });
    } else {
      alert('Please fill in all fields!');
    }
  };

  const handleCancelAddPlant = () => {
    setShowAddPlantModal(false);
    setNewPlantData({ name: '', species: '', wateringSchedule: '' });
  };

  const handleWaterPlant = (plantId: string, plantName: string) => {
    setWateredPlants((prev) => new Set(prev).add(plantId));
    alert(`✅ ${plantName} has been watered! Next watering reminder will be in the scheduled days.`);
    // Reset after a few seconds
    setTimeout(() => {
      setWateredPlants((prev) => {
        const next = new Set(prev);
        next.delete(plantId);
        return next;
      });
    }, 3000);
  };

  const handleEditPlant = (plantId: string) => {
    const plant = plants.find(p => p.id === plantId);
    if (plant) {
      setEditingPlant(plant);
      setEditFormData({
        name: plant.name,
        species: plant.species,
        wateringSchedule: plant.wateringSchedule,
      });
    }
  };

  const handleSaveEdit = () => {
    if (editingPlant && editFormData.name && editFormData.species && editFormData.wateringSchedule) {
      // Update the plant data
      const plantIndex = plants.findIndex(p => p.id === editingPlant.id);
      if (plantIndex !== -1) {
        plants[plantIndex] = {
          ...plants[plantIndex],
          name: editFormData.name,
          species: editFormData.species,
          wateringSchedule: editFormData.wateringSchedule,
        };
        alert(`✅ ${editFormData.name} has been updated successfully!`);
        setEditingPlant(null);
        setEditFormData({ name: '', species: '', wateringSchedule: '' });
      }
    } else {
      alert('Please fill in all fields!');
    }
  };

  const handleCancelEdit = () => {
    setEditingPlant(null);
    setEditFormData({ name: '', species: '', wateringSchedule: '' });
  };

  const handleSearchClick = () => {
    setShowSearch(true);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
    } else {
      const results = plants.filter(
        (plant) =>
          plant.name.toLowerCase().includes(query.toLowerCase()) ||
          plant.species.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    }
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUserProfileClick = () => {
    setShowProfileModal(true);
  };

  const handleCloseProfile = () => {
    setShowProfileModal(false);
  };

  const handleSaveProfile = () => {
    if (profileData.name && profileData.email && profileData.phone) {
      alert(`✅ Profile updated successfully!\nName: ${profileData.name}\nEmail: ${profileData.email}`);
      setShowProfileModal(false);
    } else {
      alert('Please fill in all fields!');
    }
  };

  const handleGetWeather = async () => {
    setWeatherLoading(true);
    setWeatherError('');

    try {
      const data = await getWeatherForCurrentLocation();
      setWeatherData(data);
      const suggestion = getPlantCareSuggestion(data);
      setWeatherSuggestion(suggestion);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get weather';
      setWeatherError(errorMessage);
      console.error('Weather error:', error);
    } finally {
      setWeatherLoading(false);
    }
  };

  const currentWeather = weatherData || defaultWeather;

  const handleLogout = () => {
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
        {/* Navbar */}
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
              <h1>Dashboard</h1>
            </div>

            <div className="navbar-actions">
              <button 
                className="icon-btn" 
                title="Search"
                onClick={handleSearchClick}
              >
                🔍
              </button>
              <button 
                className="icon-btn" 
                title="Notifications"
                onClick={handleNotificationsClick}
              >
                🔔
              </button>
              <div 
                className="user-profile"
                onClick={handleUserProfileClick}
              >
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                  alt="User"
                  className="profile-avatar"
                />
                <span className="profile-name">John Doe</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <main className="dashboard-content">
          {/* Weather Section */}
          <section className="weather-section">
            <div className="weather-card">
              <div className="weather-header">
                <div className="weather-title">
                  <h3>Today's Weather</h3>
                  <p className="weather-location">{currentWeather.city}</p>
                </div>
                <button
                  className={`location-btn ${weatherLoading ? 'loading' : ''}`}
                  onClick={handleGetWeather}
                  disabled={weatherLoading}
                  title="Use current location"
                >
                  {weatherLoading ? '⏳' : '📍'}
                </button>
              </div>

              {weatherError && (
                <div className="weather-error">
                  <span className="error-icon">⚠️</span>
                  <p>{weatherError}</p>
                </div>
              )}

              <div className="weather-main">
                <div className="temperature">
                  <span className="weather-emoji">{currentWeather.weatherIcon}</span>
                  <div className="temp-info">
                    <span className="temp-value">{currentWeather.temperature}°C</span>
                    <p className="temp-condition">{currentWeather.condition}</p>
                    <p className="temp-feels">Feels like {currentWeather.feelsLike}°C</p>
                  </div>
                </div>
              </div>

              <div className="weather-details">
                <div className="weather-stat">
                  <span className="stat-icon">💧</span>
                  <span className="stat-label">Humidity</span>
                  <span className="stat-value">{currentWeather.humidity}%</span>
                </div>
                <div className="weather-stat">
                  <span className="stat-icon">🌡️</span>
                  <span className="stat-label">UV Index</span>
                  <span className="stat-value">{currentWeather.uvIndex}</span>
                </div>
                <div className="weather-stat">
                  <span className="stat-icon">💨</span>
                  <span className="stat-label">Wind</span>
                  <span className="stat-value">{currentWeather.windSpeed} km/h</span>
                </div>
              </div>
            </div>

            {/* Plant Care Suggestion */}
            {weatherSuggestion && (
              <div className="care-suggestion-card">
                <div className="suggestion-header">
                  <span className="suggestion-icon">{weatherSuggestion.icon}</span>
                  <h4>{weatherSuggestion.title}</h4>
                </div>
                <p className="suggestion-message">{weatherSuggestion.message}</p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon-box">🪴</div>
                <p className="stat-count">{plants.length}</p>
                <p className="stat-label">Total Plants</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon-box">💧</div>
                <p className="stat-count">3</p>
                <p className="stat-label">Need Water</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon-box">✅</div>
                <p className="stat-count">1</p>
                <p className="stat-label">Healthy</p>
              </div>
            </div>
          </section>

          {/* Plants Section */}
          <section className="plants-section">
            <div className="section-header">
              <h2>My Plants</h2>
              <button 
                className="add-btn"
                onClick={handleAddPlantClick}
              >
                + Add Plant
              </button>
            </div>

            {plants.length > 0 ? (
              <div className="plants-grid">
                {plants.map((plant) => {
                  const daysSinceWatering = Math.floor(
                    (Date.now() - plant.lastWatered.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const needsWater = daysSinceWatering > 5;

                  return (
                    <div
                      key={plant.id}
                      className={`plant-card ${needsWater ? 'needs-water' : 'healthy'}`}
                    >
                      <div className="plant-header">
                        <span className="plant-emoji">🪴</span>
                        <span className={`health-badge ${needsWater ? 'warning' : 'good'}`}>
                          {needsWater ? '⚠️ Needs Water' : '✅ Healthy'}
                        </span>
                      </div>

                      <h3 className="plant-name">{plant.name}</h3>
                      <p className="plant-species">{plant.species}</p>

                      <div className="plant-details">
                        <div className="detail-item">
                          <span className="detail-icon">💧</span>
                          <div className="detail-content">
                            <p className="detail-label">Watering</p>
                            <p className="detail-value">{plant.wateringSchedule}</p>
                          </div>
                        </div>
                        <div className="detail-item">
                          <span className="detail-icon">📅</span>
                          <div className="detail-content">
                            <p className="detail-label">Last Watered</p>
                            <p className="detail-value">{daysSinceWatering} days ago</p>
                          </div>
                        </div>
                      </div>

                      <div className="plant-actions">
                        <button 
                          className="action-btn primary"
                          onClick={() => handleWaterPlant(plant.id, plant.name)}
                          disabled={wateredPlants.has(plant.id)}
                        >
                          {wateredPlants.has(plant.id) ? '✅ Watered!' : '💧 Water Now'}
                        </button>
                        <button 
                          className="action-btn secondary"
                          onClick={() => handleEditPlant(plant.id)}
                        >
                          📝 Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-plants">No plants yet. Add your first plant to get started!</p>
            )}
          </section>

          {/* Tips Section */}
          <section className="tips-section">
            <h2>💡 Plant Care Tips</h2>
            <div className="tips-grid">
              <div className="tip-card">
                <span className="tip-icon">🌅</span>
                <h4>Watering Time</h4>
                <p>Water your plants during early morning hours for best results.</p>
              </div>
              <div className="tip-card">
                <span className="tip-icon">💨</span>
                <h4>Drainage</h4>
                <p>Ensure proper drainage to prevent root rot and fungal issues.</p>
              </div>
              <div className="tip-card">
                <span className="tip-icon">🌡️</span>
                <h4>Soil Check</h4>
                <p>Check soil moisture before watering by touching the top layer.</p>
              </div>
              <div className="tip-card">
                <span className="tip-icon">☀️</span>
                <h4>Light Exposure</h4>
                <p>Keep plants away from direct heat sources and ensure adequate light.</p>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Edit Plant Modal */}
      {editingPlant && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Plant</h2>
              <button 
                className="modal-close"
                onClick={handleCancelEdit}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="plant-name">Plant Name</label>
                <input
                  id="plant-name"
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Enter plant name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="plant-species">Species</label>
                <input
                  id="plant-species"
                  type="text"
                  value={editFormData.species}
                  onChange={(e) => setEditFormData({ ...editFormData, species: e.target.value })}
                  placeholder="Enter plant species"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="watering-schedule">Watering Schedule</label>
                <input
                  id="watering-schedule"
                  type="text"
                  value={editFormData.wateringSchedule}
                  onChange={(e) => setEditFormData({ ...editFormData, wateringSchedule: e.target.value })}
                  placeholder="e.g., Every 7 days"
                  className="form-input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="modal-btn cancel"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
              <button 
                className="modal-btn save"
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Plant Modal */}
      {showAddPlantModal && (
        <div className="modal-overlay" onClick={handleCancelAddPlant}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Plant</h2>
              <button 
                className="modal-close"
                onClick={handleCancelAddPlant}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="new-plant-name">Plant Name</label>
                <input
                  id="new-plant-name"
                  type="text"
                  value={newPlantData.name}
                  onChange={(e) => setNewPlantData({ ...newPlantData, name: e.target.value })}
                  placeholder="Enter plant name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="new-plant-species">Species</label>
                <input
                  id="new-plant-species"
                  type="text"
                  value={newPlantData.species}
                  onChange={(e) => setNewPlantData({ ...newPlantData, species: e.target.value })}
                  placeholder="Enter plant species"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="new-watering-schedule">Watering Schedule</label>
                <input
                  id="new-watering-schedule"
                  type="text"
                  value={newPlantData.wateringSchedule}
                  onChange={(e) => setNewPlantData({ ...newPlantData, wateringSchedule: e.target.value })}
                  placeholder="e.g., Every 7 days"
                  className="form-input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="modal-btn cancel"
                onClick={handleCancelAddPlant}
              >
                Cancel
              </button>
              <button 
                className="modal-btn save"
                onClick={handleSaveNewPlant}
              >
                Add Plant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearch && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>🔍 Search Plants</h2>
              <button 
                className="modal-close"
                onClick={handleCloseSearch}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="search-input">Search by Name or Species</label>
                <input
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Type plant name or species..."
                  className="form-input"
                  autoFocus
                />
              </div>

              <div className="search-results">
                {searchQuery.trim() === '' ? (
                  <p className="no-results">Start typing to search for plants...</p>
                ) : searchResults.length > 0 ? (
                  <div className="results-list">
                    {searchResults.map((plant) => (
                      <div key={plant.id} className="search-result-item">
                        <div className="result-info">
                          <h4>{plant.name}</h4>
                          <p className="result-species">{plant.species}</p>
                          <p className="result-schedule">{plant.wateringSchedule}</p>
                        </div>
                        <div className="result-actions">
                          <button
                            className="small-btn edit-btn"
                            onClick={() => {
                              handleEditPlant(plant.id);
                              handleCloseSearch();
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-results">No plants found matching "{searchQuery}"</p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="modal-btn cancel"
                onClick={handleCloseSearch}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>👤 User Profile</h2>
              <button 
                className="modal-close"
                onClick={handleCloseProfile}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="profile-name">Full Name</label>
                <input
                  id="profile-name"
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-email">Email Address</label>
                <input
                  id="profile-email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-phone">Phone Number</label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="form-input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="modal-btn cancel"
                onClick={handleCloseProfile}
              >
                Cancel
              </button>
              <button 
                className="modal-btn save"
                onClick={handleSaveProfile}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
