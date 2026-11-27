import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import plantService from '../services/plantService';
import { calculateHealth, getNextWatering } from '../utils/helpers';
import { useRealtimeTimer } from '../hooks';
import AppLayout from '../components/AppLayout';
import Typography from '@mui/material/Typography';
import '../styles/Dashboard.css';
import { fadeInUp, staggerContainer } from '../utils/animations';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FavoriteIcon from '@mui/icons-material/Favorite';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SpaIcon from '@mui/icons-material/Spa';

export const MyPlants = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddPlantModal, setShowAddPlantModal] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', species: '', wateringSchedule: '' });
  const [newPlantData, setNewPlantData] = useState({ name: '', species: '', wateringSchedule: '' });
  const [wateredPlants, setWateredPlants] = useState(new Set());
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    plantService.getAllPlants().then(response => {
      if (response.success && response.data?.plants) {
        setPlants(response.data.plants);
      }
      setLoading(false);
    });
  }, []);

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
    } else {
      setActionError(response.error || 'Failed to add plant');
    }
  };

  const handleDeletePlant = async (plantId) => {
    if (!window.confirm('Are you sure you want to delete this plant?')) return;
    const response = await plantService.deletePlant(plantId);
    if (response.success) {
      setPlants(prev => prev.filter(p => p.id !== plantId));
    }
  };

  const handleWaterPlant = async (plantId) => {
    setWateredPlants(prev => new Set(prev).add(plantId));
    const response = await plantService.waterPlant(plantId);
    if (response.success && response.data?.plant) {
      setPlants(prev => prev.map(p => p.id === plantId ? response.data.plant : p));
    }
    setTimeout(() => {
      setWateredPlants(prev => {
        const next = new Set(prev);
        next.delete(plantId);
        return next;
      });
    }, 3000);
  };

  return (
    <AppLayout activeMenu="plants" pageTitle="My Plants">
      <div className="section">
        <div className="section-header">
          <Typography variant="h5" component="h2" sx={{ margin: 0, fontWeight: 700, color: '#333' }}><SpaIcon fontSize="inherit" /> My Plants Collection</Typography>
          <button className="btn primary" onClick={handleAddPlantClick}>
            + Add Plant
          </button>
        </div>

        {loading ? (
          <p className="loading-text">Loading plants...</p>
        ) : plants.length === 0 ? (
          <p className="no-plants">No plants yet. Add your first plant to get started!</p>
        ) : (
          <motion.div className="plants-grid" variants={staggerContainer} initial="initial" animate="animate">
            {plants.map(plant => (
              <PlantCard
                key={plant.id}
                plant={plant}
                onWater={handleWaterPlant}
                onEdit={handleEditPlant}
                onDelete={handleDeletePlant}
                isWatered={wateredPlants.has(plant.id)}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Edit Modal */}
      {editingPlant && (
        <motion.div className="modal-overlay" onClick={handleCancelEdit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <motion.div className="modal-card" onClick={e => e.stopPropagation()} initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
            <div className="modal-header">
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: '#333', margin: 0 }}><EditIcon fontSize="inherit" /> Edit Plant</Typography>
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
        <motion.div className="modal-overlay" onClick={() => { setShowAddPlantModal(false); setActionError(''); }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <motion.div className="modal-card" onClick={e => e.stopPropagation()} initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
            <div className="modal-header">
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: '#333', margin: 0 }}><SpaIcon fontSize="inherit" /> Add New Plant</Typography>
              <button className="modal-close" onClick={() => { setShowAddPlantModal(false); setActionError(''); }} title="Close"><CloseIcon fontSize="inherit" /></button>
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
              <button className="modal-btn cancel" onClick={() => { setShowAddPlantModal(false); setActionError(''); }}>Cancel</button>
              <button className="modal-btn save" onClick={handleSaveNewPlant}>Add Plant</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AppLayout>
  );
};

// Subcomponent to use the real-time timer hook per plant card
const PlantCard = ({
  plant,
  onWater,
  onEdit,
  onDelete,
  isWatered,
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
        <span className="plant-icon"><SpaIcon fontSize="inherit" /></span>
        <span className={`plant-status ${needsWater ? 'warning' : ''}`}>
          {needsWater ? <><WarningIcon fontSize="inherit" /> Needs Water</> : <><CheckCircleIcon fontSize="inherit" /> Healthy</>}
        </span>
      </div>
      <Typography variant="h6" component="h3" sx={{ margin: '0 0 4px 0', fontWeight: 700, color: '#333' }}>{plant.name}</Typography>
      <Typography variant="caption" sx={{ color: '#888', fontStyle: 'italic', margin: '0 0 16px 0', display: 'block' }}>{plant.species}</Typography>

      <div className="plant-info">
        <div className="info-item">
          <span className="info-icon"><WaterDropIcon fontSize="inherit" /></span>
          <div>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, margin: 0, display: 'block' }}>Watering</Typography>
            <Typography variant="body2" sx={{ color: '#333', fontWeight: 600, margin: 0 }}>Every {plant.wateringSchedule} day{plant.wateringSchedule !== 1 ? 's' : ''}</Typography>
          </div>
        </div>
        <div className="info-item">
          <span className="info-icon"><CalendarMonthIcon fontSize="inherit" /></span>
          <div>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, margin: 0, display: 'block' }}>Last Watered</Typography>
            <Typography variant="body2" sx={{ color: '#333', fontWeight: 600, margin: 0 }}>{timer}</Typography>
          </div>
        </div>
        <div className="info-item">
          <span className="info-icon"><NotificationsIcon fontSize="inherit" /></span>
          <div>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, margin: 0, display: 'block' }}>Next Watering</Typography>
            <Typography variant="body2" sx={{ color: '#333', fontWeight: 600, margin: 0 }}>{nextWatering}</Typography>
          </div>
        </div>
        <div className="info-item">
          <span className="info-icon"><FavoriteIcon fontSize="inherit" /></span>
          <div>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, margin: 0, display: 'block' }}>Health</Typography>
            <Typography variant="body2" sx={{ color: '#333', fontWeight: 600, margin: 0 }}>{health}%</Typography>
          </div>
        </div>
      </div>

      <div className="plant-actions">
        <button
          className="action-btn primary"
          onClick={() => onWater(plant.id)}
          disabled={isWatered}
        >
          {isWatered ? <><CheckCircleIcon fontSize="inherit" /> Watered!</> : <><WaterDropIcon fontSize="inherit" /> Water Now</>}
        </button>
        <button className="action-btn secondary" onClick={() => onEdit(plant.id)}>
          <EditIcon fontSize="inherit" /> Edit
        </button>
        <button className="action-btn danger" onClick={() => onDelete(plant.id)} title="Delete plant">
          <DeleteIcon fontSize="inherit" />
        </button>
      </div>
    </motion.div>
  );
};

export default MyPlants;
