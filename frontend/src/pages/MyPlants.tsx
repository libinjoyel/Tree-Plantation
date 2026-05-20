import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Plant } from '../types';
import '../styles/Dashboard.css';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export const MyPlants = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('plants');
  const [showAddPlantModal, setShowAddPlantModal] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', species: '', wateringSchedule: '' });
  const [newPlantData, setNewPlantData] = useState({ name: '', species: '', wateringSchedule: '' });
  const [wateredPlants, setWateredPlants] = useState<Set<string>>(new Set());

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

  const handleAddPlantClick = () => {
    setShowAddPlantModal(true);
    setNewPlantData({ name: '', species: '', wateringSchedule: '' });
  };

  const handleSaveNewPlant = () => {
    if (newPlantData.name && newPlantData.species && newPlantData.wateringSchedule) {
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
    alert(`✅ ${plantName} has been watered!`);
    setTimeout(() => {
      setWateredPlants((prev) => {
        const next = new Set(prev);
        next.delete(plantId);
        return next;
      });
    }, 3000);
  };

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
            <h1>My Plants</h1>
          </div>
        </nav>

        <main className="content">
          <div className="section">
            <div className="section-header">
              <h2>🌱 My Plants Collection</h2>
              <button className="btn primary" onClick={handleAddPlantClick}>
                + Add Plant
              </button>
            </div>

            <div className="plants-grid">
              {plants.map((plant) => (
                <div key={plant.id} className="plant-card healthy">
                  <div className="plant-header">
                    <span className="plant-icon">🪴</span>
                    <span className="plant-status">✅ Healthy</span>
                  </div>
                  <h3>{plant.name}</h3>
                  <p className="plant-species">{plant.species}</p>

                  <div className="plant-info">
                    <div className="info-item">
                      <span className="info-icon">💧</span>
                      <div>
                        <p>Watering</p>
                        <p className="info-value">{plant.wateringSchedule}</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">📅</span>
                      <div>
                        <p>Last Watered</p>
                        <p className="info-value">
                          {Math.floor((Date.now() - plant.lastWatered.getTime()) / (1000 * 60 * 60 * 24))} days ago
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="plant-actions">
                    <button
                      className="action-btn primary"
                      onClick={() => handleWaterPlant(plant.id, plant.name)}
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
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {editingPlant && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>📝 Edit Plant</h2>
              <button className="modal-close" onClick={handleCancelEdit} title="Close">
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="edit-plant-name">Plant Name</label>
                <input
                  id="edit-plant-name"
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Enter plant name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-plant-species">Species</label>
                <input
                  id="edit-plant-species"
                  type="text"
                  value={editFormData.species}
                  onChange={(e) => setEditFormData({ ...editFormData, species: e.target.value })}
                  placeholder="Enter plant species"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-watering-schedule">Watering Schedule</label>
                <input
                  id="edit-watering-schedule"
                  type="text"
                  value={editFormData.wateringSchedule}
                  onChange={(e) => setEditFormData({ ...editFormData, wateringSchedule: e.target.value })}
                  placeholder="e.g., Every 7 days"
                  className="form-input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={handleCancelEdit}>
                Cancel
              </button>
              <button className="modal-btn save" onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Plant Modal */}
      {showAddPlantModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>🌱 Add New Plant</h2>
              <button className="modal-close" onClick={handleCancelAddPlant} title="Close">
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
              <button className="modal-btn cancel" onClick={handleCancelAddPlant}>
                Cancel
              </button>
              <button className="modal-btn save" onClick={handleSaveNewPlant}>
                Add Plant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPlants;
