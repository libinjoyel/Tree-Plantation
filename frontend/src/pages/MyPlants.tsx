import { useState, useEffect } from 'react';
import type { Plant } from '../types';
import plantService from '../services/plantService';
import { calculateHealth } from '../utils/helpers';
import { useRealtimeTimer } from '../hooks';
import AppLayout from '../components/AppLayout';
import '../styles/Dashboard.css';

export const MyPlants = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPlantModal, setShowAddPlantModal] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', species: '', wateringSchedule: '' });
  const [newPlantData, setNewPlantData] = useState({ name: '', species: '', wateringSchedule: '' });
  const [wateredPlants, setWateredPlants] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    setLoading(true);
    const response = await plantService.getAllPlants();
    if (response.success && response.data?.plants) {
      setPlants(response.data.plants);
    }
    setLoading(false);
  };

  const getDaysSince = (date: Date): number =>
    Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));

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

  const handleDeletePlant = async (plantId: string) => {
    if (!window.confirm('Are you sure you want to delete this plant?')) return;
    const response = await plantService.deletePlant(plantId);
    if (response.success) {
      setPlants(prev => prev.filter(p => p.id !== plantId));
    }
  };

  const handleWaterPlant = async (plantId: string) => {
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
  };

  return (
    <AppLayout activeMenu="plants" pageTitle="🌱 My Plants">
      <div className="section">
        <div className="section-header">
          <h2>🌱 My Plants Collection</h2>
          <button className="btn primary" onClick={handleAddPlantClick}>
            + Add Plant
          </button>
        </div>

        {loading ? (
          <p className="loading-text">Loading plants...</p>
        ) : plants.length === 0 ? (
          <p className="no-plants">No plants yet. Add your first plant to get started!</p>
        ) : (
          <div className="plants-grid">
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
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingPlant && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📝 Edit Plant</h2>
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
        <div className="modal-overlay" onClick={() => { setShowAddPlantModal(false); setActionError(''); }}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🌱 Add New Plant</h2>
              <button className="modal-close" onClick={() => { setShowAddPlantModal(false); setActionError(''); }} title="Close">✕</button>
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
          </div>
        </div>
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
}: {
  plant: Plant;
  onWater: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isWatered: boolean;
}) => {
  const timer = useRealtimeTimer(plant.lastWatered);
  const health = calculateHealth(plant.lastWatered, plant.wateringSchedule);
  const needsWater = health <= 0;

  return (
    <div className={`plant-card ${needsWater ? 'needs-water' : 'healthy'}`}>
      <div className="plant-header">
        <span className="plant-icon">🪴</span>
        <span className={`plant-status ${needsWater ? 'warning' : ''}`}>
          {needsWater ? '⚠️ Needs Water' : '✅ Healthy'}
        </span>
      </div>
      <h3>{plant.name}</h3>
      <p className="plant-species">{plant.species}</p>

      <div className="plant-info">
        <div className="info-item">
          <span className="info-icon">💧</span>
          <div>
            <p>Watering</p>
            <p className="info-value">Every {plant.wateringSchedule} day{plant.wateringSchedule !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="info-item">
          <span className="info-icon">📅</span>
          <div>
            <p>Last Watered</p>
            <p className="info-value">{timer}</p>
          </div>
        </div>
        <div className="info-item">
          <span className="info-icon">❤️</span>
          <div>
            <p>Health</p>
            <p className="info-value">{health}%</p>
          </div>
        </div>
      </div>

      <div className="plant-actions">
        <button
          className="action-btn primary"
          onClick={() => onWater(plant.id)}
          disabled={isWatered}
        >
          {isWatered ? '✅ Watered!' : '💧 Water Now'}
        </button>
        <button className="action-btn secondary" onClick={() => onEdit(plant.id)}>
          📝 Edit
        </button>
        <button className="action-btn danger" onClick={() => onDelete(plant.id)}>
          🗑️
        </button>
      </div>
    </div>
  );
};

export default MyPlants;
