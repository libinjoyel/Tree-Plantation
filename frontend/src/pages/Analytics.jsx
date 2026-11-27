import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import plantService from '../services/plantService';
import scheduleService from '../services/scheduleService';
import { calculateHealth, formatTimeSince } from '../utils/helpers';
import AppLayout from '../components/AppLayout';
import MotionCard from '../components/MotionCard';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import '../styles/Dashboard.css';
import { staggerContainer } from '../utils/animations';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import WarningIcon from '@mui/icons-material/Warning';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SpaIcon from '@mui/icons-material/Spa';
import SyncIcon from '@mui/icons-material/Sync';
import InsightsIcon from '@mui/icons-material/Insights';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';

export const Analytics = () => {
  const [plants, setPlants] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } catch (err) {
        setError(err.message || 'An error occurred while loading analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getHealthColor = (health) => {
    if (health >= 90) return '#2d8659';
    if (health >= 75) return '#ffa500';
    return '#ff6b6b';
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

  const getPlantHealth = (p) => calculateHealth(p.lastWatered, p.wateringSchedule);

  const avgHealth = totalPlants
    ? Math.round(plants.reduce((sum, p) => sum + getPlantHealth(p), 0) / totalPlants)
    : 100;

  const totalCareTasks = schedules.length;

  const avgWateringFreq = totalPlants
    ? Math.round((plants.reduce((sum, p) => sum + p.wateringSchedule, 0) / totalPlants) * 10) / 10
    : 0;

  const plantsAtGoal = plants.filter(p => getPlantHealth(p) >= 85).length;

  const careConsistencyRate = totalCareTasks
    ? Math.round((completedSchedules.length / totalCareTasks) * 100)
    : 100;

  // Find top performer plant
  const topPerformer = totalPlants
    ? plants.reduce((top, p) => (getPlantHealth(p) > getPlantHealth(top) ? p : top), plants[0])
    : null;

  // Chart data computations
  const healthTrendData = plants.map(p => ({
    name: p.name,
    health: getPlantHealth(p),
    species: p.species,
  }));

  const chartColor = '#2d8659';

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      date: dateStr,
      label,
      waterings: completedSchedules.filter(s => s.dueDate === dateStr).length,
    };
  });

  const healthyCount = plants.filter(p => getPlantHealth(p) >= 75).length;
  const attentionCount = plants.filter(p => {
    const h = getPlantHealth(p);
    return h > 0 && h < 75;
  }).length;
  const criticalCount = plants.filter(p => getPlantHealth(p) <= 0).length;

  const pieData = [
    { name: 'Healthy', value: healthyCount, color: '#2d8659' },
    { name: 'Needs Attention', value: attentionCount, color: '#ffa500' },
    { name: 'Critical', value: criticalCount, color: '#ff6b6b' },
  ].filter(d => d.value > 0);

  // Dynamic Recommendations
  const recommendations = [];

  // 1. Identify unhealthy plants
  const unhealthyPlants = plants.filter(p => getPlantHealth(p) < 85);
  unhealthyPlants.forEach(plant => {
    recommendations.push({
      icon: <WarningIcon fontSize="inherit" />,
      title: `Monitor ${plant.name}`,
      description: `Health score at ${getPlantHealth(plant)}%. Consider adjusting watering or fertilizing.`
    });
  });

  // 2. Identify plants that need watering today
  const needyPlants = plants.filter(plant => getPlantHealth(plant) <= 0);
  needyPlants.forEach(plant => {
    recommendations.push({
      icon: <WaterDropIcon fontSize="inherit" />,
      title: `Water ${plant.name} Today`,
      description: `Due for watering based on its ${plant.wateringSchedule}-day schedule.`
    });
  });

  // 3. Fallback recommendations if none exists
  if (recommendations.length === 0) {
    if (totalPlants > 0) {
      recommendations.push({
        icon: <AutoAwesomeIcon fontSize="inherit" />,
        title: 'Great Job!',
        description: `You've maintained ${avgHealth}% average plant health. Keep it up!`
      });
    } else {
      recommendations.push({
        icon: <SpaIcon fontSize="inherit" />,
        title: 'Add your first plant',
        description: 'Go to the Dashboard or My Plants to register a new plant and start tracking analytics.'
      });
    }
    recommendations.push({
      icon: <SyncIcon fontSize="inherit" />,
      title: 'Seasonal Rotation',
      description: 'Rotate your plants every few weeks to ensure even light exposure on all sides.'
    });
  }

  return (
    <AppLayout activeMenu="charts" pageTitle="Analytics">
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p><CloseIcon fontSize="inherit" /> Error: {error}</p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="section">
            <Typography variant="h5" component="h2" sx={{ margin: '0 0 24px 0', fontWeight: 700, color: '#333', paddingBottom: '12px', borderBottom: '2px solid #e0e0e0' }}><DashboardIcon fontSize="inherit" /> Overview</Typography>
            <motion.div className="analytics-cards" variants={staggerContainer} initial="initial" animate="animate">
              <MotionCard className="analytics-card">
                <div className="card-icon"><SpaIcon fontSize="inherit" /></div>
                <div className="card-content">
                  <Typography variant="caption" sx={{ color: '#666', margin: 0, fontWeight: 500 }}>Total Plants</Typography>
                  <Typography variant="h4" component="p" sx={{ margin: '4px 0 0 0', fontWeight: 700, color: '#2d8659' }}>{totalPlants}</Typography>
                </div>
              </MotionCard>
              <MotionCard className="analytics-card">
                <div className="card-icon"><WaterDropIcon fontSize="inherit" /></div>
                <div className="card-content">
                  <Typography variant="caption" sx={{ color: '#666', margin: 0, fontWeight: 500 }}>Waterings This Month</Typography>
                  <Typography variant="h4" component="p" sx={{ margin: '4px 0 0 0', fontWeight: 700, color: '#2d8659' }}>{wateringsThisMonth}</Typography>
                </div>
              </MotionCard>
              <MotionCard className="analytics-card">
                <div className="card-icon"><TrackChangesIcon fontSize="inherit" /></div>
                <div className="card-content">
                  <Typography variant="caption" sx={{ color: '#666', margin: 0, fontWeight: 500 }}>Average Health</Typography>
                  <Typography variant="h4" component="p" sx={{ margin: '4px 0 0 0', fontWeight: 700, color: '#2d8659' }}>{avgHealth}%</Typography>
                </div>
              </MotionCard>
              <MotionCard className="analytics-card">
                <div className="card-icon"><StarIcon fontSize="inherit" /></div>
                <div className="card-content">
                  <Typography variant="caption" sx={{ color: '#666', margin: 0, fontWeight: 500 }}>Care Tasks</Typography>
                  <Typography variant="h4" component="p" sx={{ margin: '4px 0 0 0', fontWeight: 700, color: '#2d8659' }}>{totalCareTasks}</Typography>
                </div>
              </MotionCard>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="section">
            <Typography variant="h5" component="h2" sx={{ margin: '0 0 24px 0', fontWeight: 700, color: '#333', paddingBottom: '12px', borderBottom: '2px solid #e0e0e0' }}><InsightsIcon fontSize="inherit" /> Plant Analytics</Typography>
            <div className="charts-grid">
              <Card sx={{ borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1)', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 8px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)' } }}>
                <CardContent sx={{ p: '24px !important' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrackChangesIcon fontSize="inherit" /> Plant Health Trend
                  </Typography>
                  {plants.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', py: 4 }}>No plants to display</Typography>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={healthTrendData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#888' }} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', padding: '8px 12px' }}
                          labelStyle={{ fontWeight: 600, color: '#333', marginBottom: 4 }}
                        />
                        <Line type="monotone" dataKey="health" stroke={chartColor} strokeWidth={2.5} dot={{ r: 4, fill: chartColor, strokeWidth: 0 }} activeDot={{ r: 6, fill: chartColor }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1)', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 8px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)' } }}>
                <CardContent sx={{ p: '24px !important' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WaterDropIcon fontSize="inherit" /> Watering History (14 Days)
                  </Typography>
                  {last14Days.every(d => d.waterings === 0) ? (
                    <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', py: 4 }}>No watering data yet</Typography>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={last14Days} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#888' }} tickLine={false} interval={1} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#888' }} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', padding: '8px 12px' }}
                          labelStyle={{ fontWeight: 600, color: '#333', marginBottom: 4 }}
                        />
                        <Bar dataKey="waterings" fill={chartColor} radius={[6, 6, 0, 0]} maxBarSize={36} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1)', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 8px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)' } }}>
                <CardContent sx={{ p: '24px !important' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SpaIcon fontSize="inherit" /> Plant Status Overview
                  </Typography>
                  {plants.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', py: 4 }}>No plants to display</Typography>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={{ stroke: '#ccc', strokeWidth: 1 }}>
                          {pieData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', padding: '8px 12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Plant Health */}
          <div className="section">
            <Typography variant="h5" component="h2" sx={{ margin: '0 0 24px 0', fontWeight: 700, color: '#333', paddingBottom: '12px', borderBottom: '2px solid #e0e0e0' }}><LocalHospitalIcon fontSize="inherit" /> Plant Health Status</Typography>
            <motion.div className="health-stats" variants={staggerContainer} initial="initial" animate="animate">
              {plants.length === 0 ? (
                <div className="empty-plants-msg">
                  <p>No plants registered yet. Add a plant to view health status.</p>
                </div>
              ) : (
                plants.map((plant) => {
                  const healthVal = getPlantHealth(plant);
                  return (
                    <MotionCard key={plant.id} className="health-item">
                      <div className="health-name">
                        <Typography variant="body1" component="strong" sx={{ fontWeight: 600, color: '#333' }}>{plant.name}</Typography> <Typography variant="caption" component="span" sx={{ fontWeight: 400, color: '#666' }}>({plant.species})</Typography>
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
                        <Typography variant="body2" component="span" sx={{ fontWeight: 700, color: getHealthColor(healthVal) }}>{healthVal}% Health</Typography>
                        <Typography variant="caption" component="span" sx={{ color: '#888' }}>
                          {formatTimeSince(plant.lastWatered)}
                        </Typography>
                      </div>
                    </MotionCard>
                  );
                })
              )}
            </motion.div>
          </div>

          {/* Statistics */}
          <div className="section">
            <Typography variant="h5" component="h2" sx={{ margin: '0 0 24px 0', fontWeight: 700, color: '#333', paddingBottom: '12px', borderBottom: '2px solid #e0e0e0' }}><InsightsIcon fontSize="inherit" /> Statistics</Typography>
            <motion.div className="stats-grid" variants={staggerContainer} initial="initial" animate="animate">
              <MotionCard className="stat-box">
                <Typography variant="subtitle2" component="h4" sx={{ margin: '0 0 12px 0', fontWeight: 600, color: '#333' }}><WaterDropIcon fontSize="inherit" /> Watering Frequency</Typography>
                <Typography variant="body2" sx={{ margin: '0 0 4px 0', fontWeight: 600, color: '#2d8659' }}>Average every {avgWateringFreq} days</Typography>
                <Typography variant="caption" sx={{ color: '#888', margin: 0 }}>{totalPlants} plants tracked</Typography>
              </MotionCard>
              <MotionCard className="stat-box">
                <Typography variant="subtitle2" component="h4" sx={{ margin: '0 0 12px 0', fontWeight: 600, color: '#333' }}><TrackChangesIcon fontSize="inherit" /> Health Goal</Typography>
                <Typography variant="body2" sx={{ margin: '0 0 4px 0', fontWeight: 600, color: '#2d8659' }}>Keep all plants 85%+ health</Typography>
                <Typography variant="caption" sx={{ color: '#888', margin: 0 }}>{plantsAtGoal}/{totalPlants} plants at goal</Typography>
              </MotionCard>
              <MotionCard className="stat-box">
                <Typography variant="subtitle2" component="h4" sx={{ margin: '0 0 12px 0', fontWeight: 600, color: '#333' }}><DashboardIcon fontSize="inherit" /> Care Consistency</Typography>
                <Typography variant="body2" sx={{ margin: '0 0 4px 0', fontWeight: 600, color: '#2d8659' }}>{careConsistencyRate}% consistency rate</Typography>
                <Typography variant="caption" sx={{ color: '#888', margin: 0 }}>Based on all schedule tasks</Typography>
              </MotionCard>
              <MotionCard className="stat-box">
                <Typography variant="subtitle2" component="h4" sx={{ margin: '0 0 12px 0', fontWeight: 600, color: '#333' }}><EmojiEventsIcon fontSize="inherit" /> Top Performer</Typography>
                <Typography variant="body2" sx={{ margin: '0 0 4px 0', fontWeight: 600, color: '#2d8659' }}>{topPerformer ? topPerformer.name : 'N/A'}</Typography>
                <Typography variant="caption" sx={{ color: '#888', margin: 0 }}>
                  {topPerformer ? `${getPlantHealth(topPerformer)}% health score` : 'Add plants to begin'}
                </Typography>
              </MotionCard>
            </motion.div>
          </div>

          {/* Recommendations */}
          <div className="section">
            <Typography variant="h5" component="h2" sx={{ margin: '0 0 24px 0', fontWeight: 700, color: '#333', paddingBottom: '12px', borderBottom: '2px solid #e0e0e0' }}><LightbulbIcon fontSize="inherit" /> Recommendations</Typography>
            <motion.div className="recommendations" variants={staggerContainer} initial="initial" animate="animate">
              {recommendations.map((rec, index) => (
                <MotionCard key={index} className="recommendation-item">
                  <span className="rec-icon">{rec.icon}</span>
                  <div className="rec-content">
                    <Typography variant="subtitle2" component="h4" sx={{ margin: '0 0 4px 0', fontWeight: 600, color: '#333' }}>{rec.title}</Typography>
                    <Typography variant="caption" sx={{ color: '#666', margin: 0, lineHeight: 1.5 }}>{rec.description}</Typography>
                  </div>
                </MotionCard>
              ))}
            </motion.div>
          </div>

          {/* Working Scenario */}
          <div className="section">
            <Typography variant="h5" component="h2" sx={{ margin: '0 0 24px 0', fontWeight: 700, color: '#333', paddingBottom: '12px', borderBottom: '2px solid #e0e0e0' }}><TrackChangesIcon fontSize="inherit" /> Working Scenario</Typography>
            <motion.div className="scenario-container" variants={staggerContainer} initial="initial" animate="animate">
              <MotionCard className="scenario-step">
                <div className="scenario-number">1</div>
                <div className="scenario-content">
                  <Typography variant="subtitle2" component="h4" sx={{ margin: '0 0 8px 0', fontWeight: 600, color: '#333' }}>Monitor Plant Health</Typography>
                  <Typography variant="body2" sx={{ margin: 0, color: '#666', lineHeight: 1.5 }}>Check the Plant Health Status section to see how your plants are doing. A plant below 85% may need attention.</Typography>
                </div>
              </MotionCard>
              <MotionCard className="scenario-step">
                <div className="scenario-number">2</div>
                <div className="scenario-content">
                  <Typography variant="subtitle2" component="h4" sx={{ margin: '0 0 8px 0', fontWeight: 600, color: '#333' }}>Check Health Trends</Typography>
                  <Typography variant="body2" sx={{ margin: 0, color: '#666', lineHeight: 1.5 }}>Review each plant's health percentage and watering history. Identify which plants need attention and adjust your care routine accordingly.</Typography>
                </div>
              </MotionCard>
              <MotionCard className="scenario-step">
                <div className="scenario-number">3</div>
                <div className="scenario-content">
                  <Typography variant="subtitle2" component="h4" sx={{ margin: '0 0 8px 0', fontWeight: 600, color: '#333' }}>Analyze Statistics</Typography>
                  <Typography variant="body2" sx={{ margin: 0, color: '#666', lineHeight: 1.5 }}>Review watering frequency, consistency rate, and care goals. These help you understand your plant care patterns.</Typography>
                </div>
              </MotionCard>
              <MotionCard className="scenario-step">
                <div className="scenario-number">4</div>
                <div className="scenario-content">
                  <Typography variant="subtitle2" component="h4" sx={{ margin: '0 0 8px 0', fontWeight: 600, color: '#333' }}>Take Action</Typography>
                  <Typography variant="body2" sx={{ margin: 0, color: '#666', lineHeight: 1.5 }}>Use recommendations to adjust your care routine. Go to Schedule or My Plants to implement changes based on your analytics.</Typography>
                </div>
              </MotionCard>
            </motion.div>
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
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 24px;
        }
        @media (max-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AppLayout>
  );
};

export default Analytics;
