import { useState, useEffect } from 'react';
import type { Plant, WeatherData, WeatherSuggestion } from '../types';
import { getWeatherForCurrentLocation, getPlantCareSuggestion } from '../services/weatherService';
import plantService from '../services/plantService';
import AppLayout from '../components/AppLayout';
import '../styles/Dashboard.css';

export const Dashboard = () => {
  // Plant states — properly using setter
  const [plants, setPlants] = useState<Plant[]>([]);
  const [plantsLoading, setPlantsLoading] = useState(true);

  // Weather states
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string>('');
  const [weatherSuggestion, setWeatherSuggestion] = useState<WeatherSuggestion | null>(null);

  // UI states
  const [showSearch, setShowSearch] = useState(false);
  const [showAddPlantModal, setShowAddPlantModal] = useState(false);
  const [wateredPlants, setWateredPlants] = useState<Set<string>>(new Set());
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', species: '', wateringSchedule: '' });
  const [newPlantData, setNewPlantData] = useState({ name: '', species: '', wateringSchedule: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Plant[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [actionError, setActionError] = useState('');

  // Load plants from backend on mount
  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    setPlantsLoading(true);
    const response = await plantService.getAllPlants();
    if (response.success && response.data?.plants) {
      setPlants(response.data.plants);
      // Build notifications for overdue plants
      const overdue = response.data.plants.filter(p => getDaysSince(p.lastWatered) >= p.wateringSchedule);
      setNotifications(overdue.map(p => `${p.name} needs water!`));
    }
    setPlantsLoading(false);
  };

  // Default weather data shown before user fetches real data
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

  const getDaysSince = (date: Date): number =>
    Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));

  // Computed stats
  const needWaterCount = plants.filter(p => getDaysSince(p.lastWatered) >= p.wateringSchedule).length;
  const healthyCount = plants.length - needWaterCount;

  const handleAddPlantClick = () => {
    setShowAddPlantModal(true);
    setNewPlantData({ name: '', species: '', wateringSchedule: '' });
    setActionError('');
  };

  const handleSaveNewPlant = async () => {
    const days = parseInt(newPlantData.wateringSchedule);
    if (!newPlantData.name || !newPlantData.species || isNaN(days) || days < 1) {
      setActionError('Please fill all fields. Watering schedule must be a number of days (e.g. 7).');
      return;
    }
    const response = await plantService.createPlant({
      name: newPlantData.name,
      species: newPlantData.species,
      wateringSchedule: days,
    });
    if (response.success && response.data?.plant) {
      setPlants(prev => [response.data!.plant, ...prev]);
      setShowAddPlantModal(false);
      setNewPlantData({ name: '', species: '', wateringSchedule: '' });
      setActionError('');
    } else {
      setActionError(response.error || 'Failed to add plant');
    }
  };

  const handleWaterPlant = async (plantId: string, plantName: string) => {
    setWateredPlants(prev => new Set(prev).add(plantId));
    const response = await plantService.waterPlant(plantId);
    if (response.success && response.data?.plant) {
      setPlants(prev => prev.map(p => p.id === plantId ? response.data!.plant : p));
    }
    setTimeout(() => {
      setWateredPlants(prev => {
        const next = new Set(prev);
        next.delete(plantId);
        return next;
      });
    }, 3000);
    void plantName; // suppress unused warning
  };

  const handleEditPlant = (plantId: string) => {
    const plant = plants.find(p => p.id === plantId);
    if (plant) {
      setEditingPlant(plant);
      setEditFormData({
        name: plant.name,
        species: plant.species,
        wateringSchedule: String(plant.wateringSchedule),
      });
      setActionError('');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPlant) return;
    const days = parseInt(editFormData.wateringSchedule);
    if (!editFormData.name || !editFormData.species || isNaN(days) || days < 1) {
      setActionError('Please fill all fields. Watering schedule must be a number (days).');
      return;
    }
    const response = await plantService.updatePlant(editingPlant.id, {
      name: editFormData.name,
      species: editFormData.species,
      wateringSchedule: days,
    });
    if (response.success && response.data?.plant) {
      setPlants(prev => prev.map(p => p.id === editingPlant.id ? response.data!.plant : p));
      setEditingPlant(null);
      setEditFormData({ name: '', species: '', wateringSchedule: '' });
      setActionError('');
    } else {
      setActionError(response.error || 'Failed to update plant');
    }
  };

  const handleCancelEdit = () => {
    setEditingPlant(null);
    setEditFormData({ name: '', species: '', wateringSchedule: '' });
    setActionError('');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
    } else {
      const results = plants.filter(
        p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.species.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    }
  };

  const handleGetWeather = async () => {
    setWeatherLoading(true);
    setWeatherError('');
    try {
      const data = await getWeatherForCurrentLocation();
      setWeatherData(data);
      setWeatherSuggestion(getPlantCareSuggestion(data));
    } catch (error) {
      setWeatherError(error instanceof Error ? error.message : 'Failed to get weather');
    } finally {
      setWeatherLoading(false);
    }
  };

  const currentWeather = weatherData || defaultWeather;

  return (
    <AppLayout activeMenu="dashboard" pageTitle="Dashboard">
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

        {weatherSuggestion && (
          <div className="care-suggestion-card">
            <div className="suggestion-header">
              <span className="suggestion-icon">{weatherSuggestion.icon}</span>
              <h4>{weatherSuggestion.title}</h4>
            </div>
            <p className="suggestion-message">{weatherSuggestion.message}</p>
          </div>
        )}

        {/* Quick Stats — computed from real plant data */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon-box">🪴</div>
            <p className="stat-count">{plants.length}</p>
            <p className="stat-label">Total Plants</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon-box">💧</div>
            <p className="stat-count">{needWaterCount}</p>
            <p className="stat-label">Need Water</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon-box">✅</div>
            <p className="stat-count">{healthyCount}</p>
            <p className="stat-label">Healthy</p>
          </div>
        </div>
      </section>

      {/* Notifications panel */}
      {showNotifications && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h4>🔔 Notifications</h4>
            <button onClick={() => setShowNotifications(false)}>✕</button>
          </div>
          {notifications.length > 0 ? (
            notifications.map((n, i) => (
              <div key={i} className="notification-item">⚠️ {n}</div>
            ))
          ) : (
            <p className="no-notifications">All plants are doing great! 🌿</p>
          )}
        </div>
      )}

      {/* Notifications toggle button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          className="icon-btn"
          title={`Notifications (${notifications.length})`}
          onClick={() => setShowNotifications(s => !s)}
          style={{ position: 'relative' }}
        >
          🔔
          {notifications.length > 0 && (
            <span className="notification-badge">{notifications.length}</span>
          )}
        </button>
      </div>

      {/* Plants Section */}
      <section className="plants-section">
        <div className="section-header">
          <h2>My Plants</h2>
          <button className="add-btn" onClick={handleAddPlantClick}>
            + Add Plant
          </button>
        </div>

        {plantsLoading ? (
          <p className="loading-text">Loading plants...</p>
        ) : plants.length > 0 ? (
          <div className="plants-grid">
            {plants.map((plant) => {
              const daysSince = getDaysSince(plant.lastWatered);
              const needsWater = daysSince >= plant.wateringSchedule;

              return (
                <div key={plant.id} className={`plant-card ${needsWater ? 'needs-water' : 'healthy'}`}>
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
                        <p className="detail-value">Every {plant.wateringSchedule} day{plant.wateringSchedule !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <div className="detail-content">
                        <p className="detail-label">Last Watered</p>
                        <p className="detail-value">{daysSince === 0 ? 'Today' : `${daysSince} day${daysSince !== 1 ? 's' : ''} ago`}</p>
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
          {[
            { icon: '🌅', title: 'Watering Time', tip: 'Water your plants during early morning hours for best results.' },
            { icon: '💨', title: 'Drainage', tip: 'Ensure proper drainage to prevent root rot and fungal issues.' },
            { icon: '🌡️', title: 'Soil Check', tip: 'Check soil moisture before watering by touching the top layer.' },
            { icon: '☀️', title: 'Light Exposure', tip: 'Keep plants away from direct heat sources and ensure adequate light.' },
          ].map((tip) => (
            <div key={tip.title} className="tip-card">
              <span className="tip-icon">{tip.icon}</span>
              <h4>{tip.title}</h4>
              <p>{tip.tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Edit Plant Modal */}
      {editingPlant && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Plant</h2>
              <button className="modal-close" onClick={handleCancelEdit} title="Close">✕</button>
            </div>
            <div className="modal-body">
              {actionError && <p className="error-text" style={{ marginBottom: 12 }}>{actionError}</p>}
              <div className="form-group">
                <label htmlFor="edit-plant-name">Plant Name</label>
                <input id="edit-plant-name" type="text" value={editFormData.name}
                  onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Enter plant name" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="edit-plant-species">Species</label>
                <input id="edit-plant-species" type="text" value={editFormData.species}
                  onChange={e => setEditFormData({ ...editFormData, species: e.target.value })}
                  placeholder="Enter plant species" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="edit-watering-schedule">Watering Frequency (days)</label>
                <input id="edit-watering-schedule" type="number" min="1" value={editFormData.wateringSchedule}
                  onChange={e => setEditFormData({ ...editFormData, wateringSchedule: e.target.value })}
                  placeholder="e.g. 7" className="form-input" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={handleCancelEdit}>Cancel</button>
              <button className="modal-btn save" onClick={handleSaveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Plant Modal */}
      {showAddPlantModal && (
        <div className="modal-overlay" onClick={() => setShowAddPlantModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Plant</h2>
              <button className="modal-close" onClick={() => setShowAddPlantModal(false)} title="Close">✕</button>
            </div>
            <div className="modal-body">
              {actionError && <p className="error-text" style={{ marginBottom: 12 }}>{actionError}</p>}
              <div className="form-group">
                <label htmlFor="new-plant-name">Plant Name</label>
                <input id="new-plant-name" type="text" value={newPlantData.name}
                  onChange={e => setNewPlantData({ ...newPlantData, name: e.target.value })}
                  placeholder="Enter plant name" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="new-plant-species">Species</label>
                <input id="new-plant-species" type="text" value={newPlantData.species}
                  onChange={e => setNewPlantData({ ...newPlantData, species: e.target.value })}
                  placeholder="Enter plant species" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="new-watering-schedule">Watering Frequency (days)</label>
                <input id="new-watering-schedule" type="number" min="1" value={newPlantData.wateringSchedule}
                  onChange={e => setNewPlantData({ ...newPlantData, wateringSchedule: e.target.value })}
                  placeholder="e.g. 7" className="form-input" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={() => setShowAddPlantModal(false)}>Cancel</button>
              <button className="modal-btn save" onClick={handleSaveNewPlant}>Add Plant</button>
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
              <button className="modal-close" onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }} title="Close">✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="search-input">Search by Name or Species</label>
                <input id="search-input" type="text" value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Type plant name or species..." className="form-input" autoFocus />
              </div>
              <div className="search-results">
                {searchQuery.trim() === '' ? (
                  <p className="no-results">Start typing to search for plants...</p>
                ) : searchResults.length > 0 ? (
                  <div className="results-list">
                    {searchResults.map(plant => (
                      <div key={plant.id} className="search-result-item">
                        <div className="result-info">
                          <h4>{plant.name}</h4>
                          <p className="result-species">{plant.species}</p>
                          <p className="result-schedule">Every {plant.wateringSchedule} days</p>
                        </div>
                        <button className="small-btn edit-btn"
                          onClick={() => { handleEditPlant(plant.id); setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}>
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-results">No plants found matching "{searchQuery}"</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Dashboard;
