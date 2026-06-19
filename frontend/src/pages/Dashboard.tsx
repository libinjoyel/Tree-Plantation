import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Plant, WeatherData, WeatherSuggestion } from '../types';
import { getWeatherForCurrentLocation, getPlantCareSuggestion } from '../services/weatherService';
import plantService from '../services/plantService';
import { calculateHealth, getNextWatering } from '../utils/helpers';
import { useRealtimeTimer } from '../hooks';
import AppLayout from '../components/AppLayout';
import MotionCard from '../components/MotionCard';
import Typography from '@mui/material/Typography';
import { fadeInUp, staggerContainer } from '../utils/animations';
import '../styles/Dashboard.css';
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
import FavoriteIcon from '@mui/icons-material/Favorite';
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

const weatherIconMap: Record<string, React.ReactNode> = {
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

const renderWeatherIcon = (iconName: string): React.ReactNode => {
  const icon = weatherIconMap[iconName];
  if (icon) return icon;
  return <DeviceThermostatIcon fontSize="inherit" />;
};

const suggestionIconMap: Record<string, React.ReactNode> = {
  Water: <WaterDropIcon fontSize="inherit" />,
  Cloud: <CloudIcon fontSize="inherit" />,
  Hot: <WhatshotIcon fontSize="inherit" />,
  Cold: <AcUnitIcon fontSize="inherit" />,
  Humidity: <WaterDropIcon fontSize="inherit" />,
  CheckCircle: <CheckCircleIcon fontSize="inherit" />,
};

const renderSuggestionIcon = (iconName: string): React.ReactNode => {
  const icon = suggestionIconMap[iconName];
  if (icon) return icon;
  return <WbSunnyIcon fontSize="inherit" />;
};

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
        <MotionCard className="weather-card">
          <div className="weather-header">
            <div className="weather-title">
              <Typography variant="h6" component="h3" sx={{ margin: '0 0 4px 0', fontWeight: 600 }}>Today's Weather</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500 }}>{currentWeather.city}</Typography>
            </div>
            <button
              className={`location-btn ${weatherLoading ? 'loading' : ''}`}
              onClick={handleGetWeather}
              disabled={weatherLoading}
              title="Use current location"
            >
              {weatherLoading ? <HourglassEmptyIcon fontSize="inherit" /> : <MyLocationIcon fontSize="inherit" />}
            </button>
          </div>

          {weatherError && (
            <div className="weather-error">
              <span className="error-icon"><WarningIcon fontSize="inherit" /></span>
              <p>{weatherError}</p>
            </div>
          )}

          <div className="weather-main">
            <div className="temperature">
              <span className="weather-emoji">{renderWeatherIcon(currentWeather.weatherIcon)}</span>
              <div className="temp-info">
                <span className="temp-value">{currentWeather.temperature}°C</span>
                <p className="temp-condition">{currentWeather.condition}</p>
                <p className="temp-feels">Feels like {currentWeather.feelsLike}°C</p>
              </div>
            </div>
          </div>

          <div className="weather-details">
            <div className="weather-stat">
              <span className="stat-icon"><WaterDropIcon fontSize="inherit" /></span>
              <span className="stat-label">Humidity</span>
              <span className="stat-value">{currentWeather.humidity}%</span>
            </div>
            <div className="weather-stat">
              <span className="stat-icon"><DeviceThermostatIcon fontSize="inherit" /></span>
              <span className="stat-label">UV Index</span>
              <span className="stat-value">{currentWeather.uvIndex}</span>
            </div>
            <div className="weather-stat">
              <span className="stat-icon"><AirIcon fontSize="inherit" /></span>
              <span className="stat-label">Wind</span>
              <span className="stat-value">{currentWeather.windSpeed} km/h</span>
            </div>
          </div>
        </MotionCard>

        {weatherSuggestion && (
          <MotionCard className="care-suggestion-card">
            <div className="suggestion-header">
              <span className="suggestion-icon">{renderSuggestionIcon(weatherSuggestion.icon)}</span>
              <Typography variant="overline" component="h4" sx={{ fontWeight: 700, color: '#2d8659', margin: 0, letterSpacing: 1 }}>{weatherSuggestion.title}</Typography>
            </div>
            <Typography variant="caption" sx={{ color: '#666', margin: 0, lineHeight: 1.4, paddingLeft: '30px' }}>{weatherSuggestion.message}</Typography>
          </MotionCard>
        )}

        {/* Quick Stats — computed from real plant data */}
        <motion.div className="stats-cards" variants={staggerContainer} initial="initial" animate="animate">
          <MotionCard className="stat-card">
            <div className="stat-icon-box"><YardIcon fontSize="inherit" /></div>
            <Typography variant="h4" component="p" sx={{ margin: '0 0 8px 0', fontWeight: 700, color: '#2d8659' }}>{plants.length}</Typography>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Plants</Typography>
          </MotionCard>
          <MotionCard className="stat-card">
            <div className="stat-icon-box"><WaterDropIcon fontSize="inherit" /></div>
            <Typography variant="h4" component="p" sx={{ margin: '0 0 8px 0', fontWeight: 700, color: '#2d8659' }}>{needWaterCount}</Typography>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Need Water</Typography>
          </MotionCard>
          <MotionCard className="stat-card">
            <div className="stat-icon-box"><CheckCircleIcon fontSize="inherit" /></div>
            <Typography variant="h4" component="p" sx={{ margin: '0 0 8px 0', fontWeight: 700, color: '#2d8659' }}>{healthyCount}</Typography>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Healthy</Typography>
          </MotionCard>
        </motion.div>
      </section>

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
}: {
  plant: Plant;
  onWater: (id: string, name: string) => void;
  onEdit: (id: string) => void;
  isWatered: boolean;
}) => {
  const timer = useRealtimeTimer(plant.lastWatered);
  const health = calculateHealth(plant.lastWatered, plant.wateringSchedule);
  const needsWater = health <= 0;
  const nextWatering = getNextWatering(plant.lastWatered, plant.wateringSchedule);

  return (
    <motion.div
      className={`plant-card ${needsWater ? 'needs-water' : 'healthy'}`}
      variants={fadeInUp}
      whileHover={{ y: -4 }}
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
        <div className="detail-item">
          <span className="detail-icon"><FavoriteIcon fontSize="inherit" /></span>
          <div className="detail-content">
            <Typography variant="caption" sx={{ color: '#666', margin: 0, fontWeight: 500, display: 'block' }}>Health</Typography>
            <Typography variant="body2" sx={{ color: '#333', margin: 0, fontWeight: 600 }}>
              <span style={{
                display: 'inline-block',
                width: `${Math.max(health, 5)}%`,
                minWidth: 4,
                height: 8,
                backgroundColor: health >= 75 ? '#2d8659' : health >= 50 ? '#ffa500' : '#ff6b6b',
                borderRadius: 4,
                marginRight: 6,
                verticalAlign: 'middle',
              }}></span>
              {health}%
            </Typography>
          </div>
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
