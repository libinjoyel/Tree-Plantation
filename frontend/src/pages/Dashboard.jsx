import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getWeatherForCurrentLocation, getPlantCareSuggestion } from '../services/weatherService';
import plantService from '../services/plantService';
import { calculateHealth, getNextWatering, formatTimeSince } from '../utils/helpers';
import { useRealtimeTimer } from '../hooks';
import AppLayout from '../components/AppLayout';
import MotionCard from '../components/MotionCard';
import Typography from '@mui/material/Typography';
import { fadeInUp, staggerContainer } from '../utils/animations';
import '../styles/Dashboard.css';
import toast from 'react-hot-toast';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import AirIcon from '@mui/icons-material/Air';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import WarningIcon from '@mui/icons-material/Warning';
import YardIcon from '@mui/icons-material/Yard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import SpaIcon from '@mui/icons-material/Spa';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import CloudIcon from '@mui/icons-material/Cloud';
import GrainIcon from '@mui/icons-material/Grain';
import UmbrellaIcon from '@mui/icons-material/Umbrella';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import TimelineIcon from '@mui/icons-material/Timeline';

const weatherIconMap = {
  WbSunny: <WbSunnyIcon fontSize="inherit" />,
  NightsStay: <NightsStayIcon fontSize="inherit" />,
  WbPartlyCloudy: <CloudIcon fontSize="inherit" />,
  Cloud: <CloudIcon fontSize="inherit" />,
  Grain: <GrainIcon fontSize="inherit" />,
  Umbrella: <UmbrellaIcon fontSize="inherit" />,
  Thunderstorm: <ThunderstormIcon fontSize="inherit" />,
  AcUnit: <AcUnitIcon fontSize="inherit" />,
  DeviceThermostat: <DeviceThermostatIcon fontSize="inherit" />,
};

const renderWeatherIcon = (iconName) => {
  const icon = weatherIconMap[iconName];
  if (icon) return icon;
  return <DeviceThermostatIcon fontSize="inherit" />;
};

const suggestionIconMap = {
  Water: <WaterDropIcon fontSize="inherit" />,
  Cloud: <CloudIcon fontSize="inherit" />,
  Hot: <WhatshotIcon fontSize="inherit" />,
  Cold: <AcUnitIcon fontSize="inherit" />,
  Humidity: <WaterDropIcon fontSize="inherit" />,
  CheckCircle: <CheckCircleIcon fontSize="inherit" />,
};

const renderSuggestionIcon = (iconName) => {
  const icon = suggestionIconMap[iconName];
  if (icon) return icon;
  return <WbSunnyIcon fontSize="inherit" />;
};

export const Dashboard = () => {
  // Plant states — properly using setter
  const [plants, setPlants] = useState([]);
  const [plantsLoading, setPlantsLoading] = useState(true);

  // Weather states
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');
  const [weatherSuggestion, setWeatherSuggestion] = useState(null);

  // UI states
  const [showSearch, setShowSearch] = useState(false);
  const [showAddPlantModal, setShowAddPlantModal] = useState(false);
  const [wateredPlants, setWateredPlants] = useState(new Set());
  const [editingPlant, setEditingPlant] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', species: '', wateringSchedule: '' });
  const [newPlantData, setNewPlantData] = useState({ name: '', species: '', wateringSchedule: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [actionError, setActionError] = useState('');
  const [activities, setActivities] = useState([]);

  const navigate = useNavigate();

  const addActivity = (type, message) => {
    setActivities(prev => [
      { id: crypto.randomUUID(), type, message, timestamp: new Date() },
      ...prev,
    ].slice(0, 10));
  };

  // Load plants from backend on mount
  useEffect(() => {
    plantService.getAllPlants().then(response => {
      if (response.success && response.data?.plants) {
        setPlants(response.data.plants);
      }
      setPlantsLoading(false);
    });
  }, []);

  // Default weather data shown before user fetches real data
  const defaultWeather = {
    city: 'Unknown Location',
    temperature: 24,
    humidity: 65,
    condition: 'Partly Cloudy',
    feelsLike: 22,
    uvIndex: 6,
    windSpeed: 12,
    weatherIcon: 'WbPartlyCloudy',
    description: 'Partly cloudy',
  };

  // Computed stats
  const needWaterCount = plants.filter(p => calculateHealth(p.lastWatered, p.wateringSchedule) <= 0).length;
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
      setPlants(prev => [response.data.plant, ...prev]);
      setShowAddPlantModal(false);
      setNewPlantData({ name: '', species: '', wateringSchedule: '' });
      setActionError('');
      addActivity('added', `Added new plant "${newPlantData.name}"`);
    } else {
      setActionError(response.error || 'Failed to add plant');
    }
  };

  const handleWaterPlant = async (plantId, plantName) => {
    setWateredPlants(prev => new Set(prev).add(plantId));
    const response = await plantService.waterPlant(plantId);
    if (response.success && response.data?.plant) {
      setPlants(prev => prev.map(p => p.id === plantId ? response.data.plant : p));
      addActivity('watered', `Watered "${plantName}"`);
    }
    setTimeout(() => {
      setWateredPlants(prev => {
        const next = new Set(prev);
        next.delete(plantId);
        return next;
      });
    }, 3000);
  };

  const handleWaterAll = async () => {
    const needsWater = plants.filter(p => calculateHealth(p.lastWatered, p.wateringSchedule) <= 0);
    if (needsWater.length === 0) {
      toast('All plants are already hydrated!', { icon: '💚' });
      return;
    }
    const promises = needsWater.map(p => plantService.waterPlant(p.id));
    const results = await Promise.all(promises);
    results.forEach((r, i) => {
      if (r.success && r.data?.plant) {
        const idx = plants.findIndex(p => p.id === needsWater[i].id);
        if (idx !== -1) {
          setPlants(prev => prev.map(p => p.id === needsWater[i].id ? r.data.plant : p));
          addActivity('watered', `Watered "${needsWater[i].name}"`);
        }
      }
    });
    toast.success(`Watered ${needsWater.length} plant${needsWater.length !== 1 ? 's' : ''}!`);
  };

  const handleEditPlant = (plantId) => {
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
      setPlants(prev => prev.map(p => p.id === editingPlant.id ? response.data.plant : p));
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

  const handleSearch = (query) => {
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
      {/* Quick Actions */}
      <section className="quick-actions">
        <button className="quick-action-btn" onClick={handleAddPlantClick}>
          <span className="quick-action-icon green"><AddIcon fontSize="inherit" /></span>
          <span className="quick-action-label">Add Plant</span>
        </button>
        <button className="quick-action-btn" onClick={handleWaterAll}>
          <span className="quick-action-icon blue"><WaterDropIcon fontSize="inherit" /></span>
          <span className="quick-action-label">Water All</span>
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/schedule')}>
          <span className="quick-action-icon purple"><CalendarMonthIcon fontSize="inherit" /></span>
          <span className="quick-action-label">Create Schedule</span>
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/analytics')}>
          <span className="quick-action-icon orange"><TimelineIcon fontSize="inherit" /></span>
          <span className="quick-action-label">View Analytics</span>
        </button>
      </section>

      {/* Weather + Stats Row */}
      <div className="dashboard-top-row">
        <div className="weather-column">
          <MotionCard className="weather-compact">
            <div className="weather-compact-header">
              <div>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                  Today's Weather
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {currentWeather.city}
                </Typography>
              </div>
              <button
                className={`location-btn ${weatherLoading ? 'loading' : ''}`}
                onClick={handleGetWeather}
                disabled={weatherLoading}
                title="Use current location"
              >
                {weatherLoading ? <HourglassEmptyIcon fontSize="small" /> : <MyLocationIcon fontSize="small" />}
              </button>
            </div>

            <div className="weather-compact-body">
              <div className="weather-compact-main">
                <span className="weather-compact-icon">{renderWeatherIcon(currentWeather.weatherIcon)}</span>
                <div>
                  <span className="weather-compact-temp">{currentWeather.temperature}°C</span>
                  <span className="weather-compact-condition">{currentWeather.condition}</span>
                  <span className="weather-compact-feels">Feels like {currentWeather.feelsLike}°C</span>
                </div>
              </div>
            </div>

            {weatherError && (
              <div className="weather-compact-error">
                <WarningIcon fontSize="inherit" /> {weatherError}
              </div>
            )}

            <div className="weather-details-grid">
              <div className="weather-detail-item">
                <WaterDropIcon fontSize="inherit" />
                <span className="weather-detail-label">Humidity</span>
                <span className="weather-detail-value">{currentWeather.humidity}%</span>
              </div>
              <div className="weather-detail-item">
                <DeviceThermostatIcon fontSize="inherit" />
                <span className="weather-detail-label">UV Index</span>
                <span className="weather-detail-value">{currentWeather.uvIndex}</span>
              </div>
              <div className="weather-detail-item">
                <AirIcon fontSize="inherit" />
                <span className="weather-detail-label">Wind</span>
                <span className="weather-detail-value">{currentWeather.windSpeed} km/h</span>
              </div>
            </div>
          </MotionCard>
        </div>

        <div className="stats-column">
          <div className={`weather-suggestion-outside${!weatherSuggestion ? ' empty' : ''}`}>
            {weatherSuggestion ? (
              <>
                <span className="suggestion-outside-icon">{renderSuggestionIcon(weatherSuggestion.icon)}</span>
                <div className="suggestion-outside-content">
                  <Typography variant="overline" sx={{ fontWeight: 700, color: '#2d8659', lineHeight: 1, letterSpacing: 1, fontSize: 11 }}>
                    {weatherSuggestion.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', lineHeight: 1.3, fontSize: 12 }}>
                    {weatherSuggestion.message}
                  </Typography>
                </div>
              </>
            ) : <span className="suggestion-placeholder" />}
          </div>
          <div className="stats-compact">
          <motion.div className="stat-card enhanced" variants={fadeInUp}>
            <div className="stat-icon-box green"><YardIcon fontSize="inherit" /></div>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d8659', margin: '8px 0 4px' }}>{plants.length}</Typography>
            <Typography variant="caption" sx={{ color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Plants</Typography>
          </motion.div>
          <motion.div className="stat-card enhanced" variants={fadeInUp}>
            <div className="stat-icon-box orange"><WaterDropIcon fontSize="inherit" /></div>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d8659', margin: '8px 0 4px' }}>{needWaterCount}</Typography>
            <Typography variant="caption" sx={{ color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Need Water</Typography>
          </motion.div>
          <motion.div className="stat-card enhanced" variants={fadeInUp}>
            <div className="stat-icon-box teal"><CheckCircleIcon fontSize="inherit" /></div>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d8659', margin: '8px 0 4px' }}>{healthyCount}</Typography>
            <Typography variant="caption" sx={{ color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Healthy</Typography>
          </motion.div>
        </div>
      </div>
      </div>

      {/* Recent Activities */}
      {activities.length > 0 && (
        <section className="recent-activities">
          <div className="section-header">
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HistoryIcon fontSize="inherit" /> Recent Activities
            </Typography>
          </div>
          <div className="activities-list">
            <AnimatePresence initial={false}>
              {activities.slice(0, 5).map((activity) => (
                <motion.div
                  key={activity.id}
                  className="activity-item"
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  <span className={`activity-icon ${activity.type}`}>
                    {activity.type === 'watered' ? <WaterDropIcon fontSize="inherit" /> : <AddIcon fontSize="inherit" />}
                  </span>
                  <div className="activity-content">
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#333', margin: 0 }}>{activity.message}</Typography>
                    <Typography variant="caption" sx={{ color: '#999', margin: 0 }}>{formatTimeSince(activity.timestamp)}</Typography>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Plants Section */}
      <section className="plants-section">
        <div className="section-header">
          <Typography variant="h5" component="h2" sx={{ margin: 0, fontWeight: 700, color: '#333' }}>My Plants</Typography>
          <button className="add-btn" onClick={handleAddPlantClick}>
            + Add Plant
          </button>
        </div>

        {plantsLoading ? (
          <p className="loading-text">Loading plants...</p>
        ) : plants.length > 0 ? (
          <motion.div className="plants-grid" variants={staggerContainer} initial="initial" animate="animate">
            {plants.map((plant) => (
              <DashboardPlantCard
                key={plant.id}
                plant={plant}
                onWater={handleWaterPlant}
                onEdit={handleEditPlant}
                isWatered={wateredPlants.has(plant.id)}
              />
            ))}
          </motion.div>
        ) : (
          <p className="no-plants">No plants yet. Add your first plant to get started!</p>
        )}
      </section>

      {/* Tips Section */}
      <section className="tips-section">
        <Typography variant="h5" component="h2" sx={{ margin: 0, fontWeight: 700, color: '#333' }}><LightbulbIcon fontSize="inherit" /> Plant Care Tips</Typography>
        <motion.div className="tips-grid" variants={staggerContainer} initial="initial" animate="animate">
          {[
            { icon: <WbTwilightIcon fontSize="inherit" />, title: 'Watering Time', tip: 'Water your plants during early morning hours for best results.' },
            { icon: <AirIcon fontSize="inherit" />, title: 'Drainage', tip: 'Ensure proper drainage to prevent root rot and fungal issues.' },
            { icon: <DeviceThermostatIcon fontSize="inherit" />, title: 'Soil Check', tip: 'Check soil moisture before watering by touching the top layer.' },
            { icon: <WbSunnyIcon fontSize="inherit" />, title: 'Light Exposure', tip: 'Keep plants away from direct heat sources and ensure adequate light.' },
          ].map((tip) => (
            <MotionCard key={tip.title} className="tip-card">
              <span className="tip-icon">{tip.icon}</span>
              <Typography variant="subtitle1" component="h4" sx={{ margin: '0 0 12px 0', fontWeight: 700, color: '#333' }}>{tip.title}</Typography>
              <Typography variant="body2" sx={{ color: '#666', margin: 0, lineHeight: 1.6 }}>{tip.tip}</Typography>
            </MotionCard>
          ))}
        </motion.div>
      </section>

      {/* Edit Plant Modal */}
      {editingPlant && (
        <motion.div className="modal-overlay" onClick={handleCancelEdit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <motion.div className="modal-card" onClick={e => e.stopPropagation()} initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
            <div className="modal-header">
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: '#333', margin: 0 }}>Edit Plant</Typography>
              <button className="modal-close" onClick={handleCancelEdit} title="Close"><CloseIcon fontSize="inherit" /></button>
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
          </motion.div>
        </motion.div>
      )}

      {/* Add Plant Modal */}
      {showAddPlantModal && (
        <motion.div className="modal-overlay" onClick={() => setShowAddPlantModal(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <motion.div className="modal-card" onClick={e => e.stopPropagation()} initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
            <div className="modal-header">
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: '#333', margin: 0 }}>Add New Plant</Typography>
              <button className="modal-close" onClick={() => setShowAddPlantModal(false)} title="Close"><CloseIcon fontSize="inherit" /></button>
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
          </motion.div>
        </motion.div>
      )}

      {/* Search Modal */}
      {showSearch && (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <motion.div className="modal-card" initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
            <div className="modal-header">
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: '#333', margin: 0 }}><SearchIcon fontSize="inherit" /> Search Plants</Typography>
              <button className="modal-close" onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }} title="Close"><CloseIcon fontSize="inherit" /></button>
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
                          <Typography variant="subtitle2" component="h4" sx={{ margin: '0 0 4px 0', fontWeight: 600, color: '#333' }}>{plant.name}</Typography>
                          <Typography variant="caption" sx={{ margin: '0 0 4px 0', color: '#666', display: 'block' }}>{plant.species}</Typography>
                          <Typography variant="caption" sx={{ margin: 0, color: '#999', display: 'block' }}>Every {plant.wateringSchedule} days</Typography>
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
          </motion.div>
        </motion.div>
      )}
    </AppLayout>
  );
};

// Subcomponent to use the real-time timer hook per plant card
const DashboardPlantCard = ({
  plant,
  onWater,
  onEdit,
  isWatered,
}) => {
  const timer = useRealtimeTimer(plant.lastWatered);
  const health = calculateHealth(plant.lastWatered, plant.wateringSchedule);
  const needsWater = health <= 0;
  const nextWatering = getNextWatering(plant.lastWatered, plant.wateringSchedule);

  const healthLevel = health >= 75 ? 'high' : health >= 50 ? 'medium' : 'low';
  const healthTextClass = health >= 75 ? 'high-text' : health >= 50 ? 'medium-text' : 'low-text';

  return (
    <motion.div
      className={`plant-card ${needsWater ? 'needs-water' : 'healthy'}`}
      variants={fadeInUp}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      style={{ willChange: 'transform' }}
    >
      <div className="plant-header">
        <span className="plant-emoji"><SpaIcon fontSize="inherit" /></span>
        <span className={`health-badge ${needsWater ? 'warning' : 'good'}`}>
          {needsWater ? <><WarningIcon fontSize="inherit" /> Needs Water</> : <><CheckCircleIcon fontSize="inherit" /> Healthy</>}
        </span>
      </div>

      <Typography variant="h6" component="h3" sx={{ margin: '0 0 4px 0', fontWeight: 700, color: '#333' }}>{plant.name}</Typography>
      <Typography variant="caption" sx={{ color: '#888', fontStyle: 'italic', margin: '0 0 16px 0', display: 'block' }}>{plant.species}</Typography>

      <div className="plant-details">
        <div className="detail-item">
          <span className="detail-icon"><WaterDropIcon fontSize="inherit" /></span>
          <div className="detail-content">
            <Typography variant="caption" sx={{ color: '#666', margin: 0, fontWeight: 500, display: 'block' }}>Watering</Typography>
            <Typography variant="body2" sx={{ color: '#333', margin: 0, fontWeight: 600 }}>Every {plant.wateringSchedule} day{plant.wateringSchedule !== 1 ? 's' : ''}</Typography>
          </div>
        </div>
        <div className="detail-item">
          <span className="detail-icon"><CalendarMonthIcon fontSize="inherit" /></span>
          <div className="detail-content">
            <Typography variant="caption" sx={{ color: '#666', margin: 0, fontWeight: 500, display: 'block' }}>Last Watered</Typography>
            <Typography variant="body2" sx={{ color: '#333', margin: 0, fontWeight: 600 }}>{timer}</Typography>
          </div>
        </div>
        <div className="detail-item">
          <span className="detail-icon"><NotificationsIcon fontSize="inherit" /></span>
          <div className="detail-content">
            <Typography variant="caption" sx={{ color: '#666', margin: 0, fontWeight: 500, display: 'block' }}>Next Watering</Typography>
            <Typography variant="body2" sx={{ color: '#333', margin: 0, fontWeight: 600 }}>{nextWatering}</Typography>
          </div>
        </div>
      </div>

      {/* Attractive Health Progress Bar */}
      <div className="health-bar-wrapper">
        <div className="health-bar-track">
          <motion.div
            className={`health-bar-fill ${healthLevel}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(health, 2)}%` }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
        <div className="health-bar-label">
          <span>Health</span>
          <span className={healthTextClass}>{health}%</span>
        </div>
      </div>

      <div className="plant-actions">
        <button
          className="action-btn primary"
          onClick={() => onWater(plant.id, plant.name)}
          disabled={isWatered}
        >
          {isWatered ? <><CheckCircleIcon fontSize="inherit" /> Watered!</> : <><WaterDropIcon fontSize="inherit" /> Water Now</>}
        </button>
        <button
          className="action-btn secondary"
          onClick={() => onEdit(plant.id)}
        >
          <EditIcon fontSize="inherit" /> Edit
        </button>
      </div>
    </motion.div>
  );
};

export default Dashboard;
