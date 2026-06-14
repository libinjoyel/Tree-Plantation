import { useState, useEffect } from 'react';
import type { Plant, ScheduleItem } from '../types';
import plantService from '../services/plantService';
import scheduleService from '../services/scheduleService';
import AppLayout from '../components/AppLayout';
import '../styles/Dashboard.css';

export const Analytics = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [plantsResponse, schedulesResponse] = await Promise.all([
          plantService.getAllPlants(),
          scheduleService.getAllSchedules()
        ]);

        if (plantsResponse.success && plantsResponse.data) {
          setPlants(plantsResponse.data.plants);
        } else {
          setError(plantsResponse.error || 'Failed to fetch plants');
        }

        if (schedulesResponse.success && schedulesResponse.data) {
          setSchedules(schedulesResponse.data.schedules);
        } else {
          setError(schedulesResponse.error || 'Failed to fetch schedules');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getHealthColor = (health: number) => {
    if (health >= 90) return '#2d8659';
    if (health >= 75) return '#ffa500';
    return '#ff6b6b';
  };

  // Helper to calculate days since last watered
  const getDaysSinceWatered = (lastWateredDateString: string | Date) => {
    const lastWateredDate = new Date(lastWateredDateString);
    const diffTime = Math.abs(Date.now() - lastWateredDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Dynamic Statistics Calculations
  const totalPlants = plants.length;

  const completedSchedules = schedules.filter(s => s.completed);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const wateringsThisMonth = completedSchedules.filter(s => {
    if (!s.dueDate) return false;
    const date = new Date(s.dueDate);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const avgHealth = totalPlants
    ? Math.round(plants.reduce((sum, p) => sum + (p.health !== undefined ? p.health : 100), 0) / totalPlants)
    : 100;

  const totalCareTasks = schedules.length;

  const avgWateringFreq = totalPlants
    ? Math.round((plants.reduce((sum, p) => sum + p.wateringSchedule, 0) / totalPlants) * 10) / 10
    : 0;

  const plantsAtGoal = plants.filter(p => (p.health !== undefined ? p.health : 100) >= 85).length;

  const careConsistencyRate = totalCareTasks
    ? Math.round((completedSchedules.length / totalCareTasks) * 100)
    : 100;

  // Find top performer plant
  const topPerformer = totalPlants
    ? plants.reduce((top, p) => ((p.health !== undefined ? p.health : 100) > (top.health !== undefined ? top.health : 100) ? p : top), plants[0])
    : null;

  // Dynamic Recommendations
  const recommendations: { icon: string; title: string; description: string }[] = [];

  // 1. Identify unhealthy plants
  const unhealthyPlants = plants.filter(p => (p.health !== undefined ? p.health : 100) < 85);
  unhealthyPlants.forEach(plant => {
    recommendations.push({
      icon: '⚠️',
      title: `Monitor ${plant.name}`,
      description: `Health score at ${plant.health}%. Consider adjusting watering or fertilizing.`
    });
  });

  // 2. Identify plants that need watering today
  const needyPlants = plants.filter(plant => {
    const daysSince = getDaysSinceWatered(plant.lastWatered);
    return daysSince >= plant.wateringSchedule;
  });
  needyPlants.forEach(plant => {
    recommendations.push({
      icon: '💧',
      title: `Water ${plant.name} Today`,
      description: `Due for watering based on its ${plant.wateringSchedule}-day schedule.`
    });
  });

  // 3. Fallback recommendations if none exists
  if (recommendations.length === 0) {
    if (totalPlants > 0) {
      recommendations.push({
        icon: '✨',
        title: 'Great Job!',
        description: `You've maintained ${avgHealth}% average plant health. Keep it up!`
      });
    } else {
      recommendations.push({
        icon: '🌱',
        title: 'Add your first plant',
        description: 'Go to the Dashboard or My Plants to register a new plant and start tracking analytics.'
      });
    }
    recommendations.push({
      icon: '🔄',
      title: 'Seasonal Rotation',
      description: 'Rotate your plants every few weeks to ensure even light exposure on all sides.'
    });
  }

  return (
    <AppLayout activeMenu="charts" pageTitle="📈 Analytics">
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>❌ Error: {error}</p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="section">
            <h2>📊 Overview</h2>
            <div className="analytics-cards">
              <div className="analytics-card">
                <div className="card-icon">🌱</div>
                <div className="card-content">
                  <p className="card-label">Total Plants</p>
                  <p className="card-value">{totalPlants}</p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">💧</div>
                <div className="card-content">
                  <p className="card-label">Waterings This Month</p>
                  <p className="card-value">{wateringsThisMonth}</p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">🎯</div>
                <div className="card-content">
                  <p className="card-label">Average Health</p>
                  <p className="card-value">{avgHealth}%</p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">⭐</div>
                <div className="card-content">
                  <p className="card-label">Care Tasks</p>
                  <p className="card-value">{totalCareTasks}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Plant Health */}
          <div className="section">
            <h2>🏥 Plant Health Status</h2>
            <div className="health-stats">
              {plants.length === 0 ? (
                <div className="empty-plants-msg">
                  <p>No plants registered yet. Add a plant to view health status.</p>
                </div>
              ) : (
                plants.map((plant) => {
                  const healthVal = plant.health !== undefined ? plant.health : 100;
                  const daysSince = getDaysSinceWatered(plant.lastWatered);
                  return (
                    <div key={plant.id} className="health-item">
                      <div className="health-name">
                        <strong>{plant.name}</strong> <span className="species-tag">({plant.species})</span>
                      </div>
                      <div className="health-bar">
                        <div
                          className="health-fill"
                          style={{
                            width: `${healthVal}%`,
                            backgroundColor: getHealthColor(healthVal),
                          }}
                        ></div>
                      </div>
                      <div className="health-info">
                        <span className="health-percent">{healthVal}% Health</span>
                        <span className="health-watered">
                          Last watered: {daysSince === 0 ? 'Today' : `${daysSince}d ago`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="section">
            <h2>📈 Statistics</h2>
            <div className="stats-grid">
              <div className="stat-box">
                <h4>💧 Watering Frequency</h4>
                <p className="stat-text">Average every {avgWateringFreq} days</p>
                <p className="stat-subtext">{totalPlants} plants tracked</p>
              </div>
              <div className="stat-box">
                <h4>🎯 Health Goal</h4>
                <p className="stat-text">Keep all plants 85%+ health</p>
                <p className="stat-subtext">{plantsAtGoal}/{totalPlants} plants at goal</p>
              </div>
              <div className="stat-box">
                <h4>📊 Care Consistency</h4>
                <p className="stat-text">{careConsistencyRate}% consistency rate</p>
                <p className="stat-subtext">Based on all schedule tasks</p>
              </div>
              <div className="stat-box">
                <h4>🏆 Top Performer</h4>
                <p className="stat-text">{topPerformer ? topPerformer.name : 'N/A'}</p>
                <p className="stat-subtext">
                  {topPerformer ? `${topPerformer.health !== undefined ? topPerformer.health : 100}% health score` : 'Add plants to begin'}
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="section">
            <h2>💡 Recommendations</h2>
            <div className="recommendations">
              {recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <span className="rec-icon">{rec.icon}</span>
                  <div className="rec-content">
                    <h4>{rec.title}</h4>
                    <p>{rec.description}</p>
                  </div>
                </div>
              ))}
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
        </>
      )}

      <style>{`
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
        .empty-plants-msg {
          padding: 24px;
          text-align: center;
          color: #666;
          font-style: italic;
        }
        .species-tag {
          font-weight: normal;
          color: #666;
          font-size: 14px;
        }
      `}</style>
    </AppLayout>
  );
};

export default Analytics;
