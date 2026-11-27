import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import scheduleService from '../services/scheduleService';
import plantService from '../services/plantService';
import AppLayout from '../components/AppLayout';
import MotionCard from '../components/MotionCard';
import Typography from '@mui/material/Typography';
import '../styles/Dashboard.css';
import { fadeInUp, staggerContainer } from '../utils/animations';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InsightsIcon from '@mui/icons-material/Insights';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import WarningIcon from '@mui/icons-material/Warning';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';

const formatDueDate = (dueDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  const diff = due.getTime() - today.getTime();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return { text: `Overdue by ${Math.abs(days)}d`, isOverdue: true };
  if (days === 0) return { text: 'Due today', isOverdue: false };
  if (days === 1) return { text: 'Due tomorrow', isOverdue: false };
  return { text: `Due in ${days}d`, isOverdue: false };
};

export const Schedule = () => {
  const [scheduleItems, setScheduleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plants, setPlants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [actionError, setActionError] = useState('');
  const [formData, setFormData] = useState({
    plantId: '',
    plantName: '',
    task: '',
    dueDate: '',
    time: '09:00 AM',
    priority: 'medium',
  });

  useEffect(() => {
    Promise.all([
      scheduleService.getAllSchedules(),
      plantService.getAllPlants(),
    ]).then(([schedRes, plantRes]) => {
      if (schedRes.success && schedRes.data?.schedules) {
        setScheduleItems(schedRes.data.schedules);
      }
      if (plantRes.success && plantRes.data?.plants) {
        setPlants(plantRes.data.plants);
      }
      setLoading(false);
    });
  }, []);

  const toggleTaskCompletion = async (item) => {
    const newCompleted = !item.completed;
    setScheduleItems(prev =>
      prev.map(s => s.id === item.id ? { ...s, completed: newCompleted } : s)
    );
    const response = await scheduleService.toggleCompletion(item.id, newCompleted);
    if (!response.success) {
      setScheduleItems(prev =>
        prev.map(s => s.id === item.id ? { ...s, completed: item.completed } : s)
      );
    }
  };

  const openAddModal = () => {
    setEditingTask(null);
    setFormData({ plantId: '', plantName: '', task: '', dueDate: '', time: '09:00 AM', priority: 'medium' });
    setActionError('');
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      plantId: task.plantId,
      plantName: task.plantName,
      task: task.task,
      dueDate: task.dueDate,
      time: task.time,
      priority: task.priority,
    });
    setActionError('');
    setShowModal(true);
  };

  const handlePlantChange = (plantId) => {
    const plant = plants.find(p => p.id === plantId);
    setFormData({
      ...formData,
      plantId,
      plantName: plant ? plant.name : '',
    });
  };

  const handleSave = async () => {
    if (!formData.plantId || !formData.task || !formData.dueDate) {
      setActionError('Plant, task description, and due date are required.');
      return;
    }

    if (editingTask) {
      const response = await scheduleService.updateSchedule(editingTask.id, {
        task: formData.task,
        dueDate: formData.dueDate,
        time: formData.time,
        priority: formData.priority,
      });
      if (response.success && response.data?.schedule) {
        setScheduleItems(prev =>
          prev.map(s => s.id === editingTask.id ? response.data.schedule : s)
        );
        setShowModal(false);
      } else {
        setActionError(response.error || 'Failed to update task');
      }
    } else {
      const response = await scheduleService.createSchedule({
        plantId: formData.plantId,
        plantName: formData.plantName,
        task: formData.task,
        dueDate: formData.dueDate,
        time: formData.time,
        priority: formData.priority,
      });
      if (response.success && response.data?.schedule) {
        setScheduleItems(prev => [...prev, response.data.schedule]);
        setShowModal(false);
      } else {
        setActionError(response.error || 'Failed to create task');
      }
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    const response = await scheduleService.deleteSchedule(taskId);
    if (response.success) {
      setScheduleItems(prev => prev.filter(s => s.id !== taskId));
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffa500';
      case 'low': return '#2d8659';
      default: return '#999';
    }
  };

  const upcomingTasks = scheduleItems.filter(item => !item.completed);
  const completedTasks = scheduleItems.filter(item => item.completed);
  const highPriorityCount = upcomingTasks.filter(t => t.priority === 'high').length;

  const renderTaskRow = (task) => {
    const dueInfo = formatDueDate(task.dueDate);
    return (
      <motion.div
        key={task.id}
        className={`schedule-item ${task.completed ? 'completed' : ''}`}
        variants={fadeInUp}
        whileHover={{ y: -2, x: 4 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        style={{ willChange: 'transform' }}
      >
        <div className="schedule-left">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleTaskCompletion(task)}
            className="schedule-checkbox"
          />
          <div className="schedule-info">
            <Typography variant="subtitle2" component="h4" sx={{ margin: 0, fontWeight: 600, color: '#333' }}>{task.plantName}</Typography>
            <Typography variant="caption" sx={{ margin: '4px 0 0 0', color: '#666', display: 'block' }}>{task.task}</Typography>
          </div>
        </div>
        <div className="schedule-right">
          <div className="schedule-date">
            <span className="date-icon"><CalendarMonthIcon fontSize="inherit" /></span>
            <span>{task.dueDate}</span>
          </div>
          <div className="schedule-time">
            <span className="time-icon"><AccessTimeIcon fontSize="inherit" /></span>
            <span>{task.time}</span>
          </div>
          {!task.completed && (
            <>
              <div className="priority-badge" style={{ backgroundColor: getPriorityColor(task.priority) }}>
                {task.priority}
              </div>
              <span className={`due-badge ${dueInfo.isOverdue ? 'overdue' : 'pending'}`}>
                {dueInfo.text}
              </span>
            </>
          )}
          <button className="small-btn edit-btn" onClick={() => openEditModal(task)} title="Edit">
            <EditIcon fontSize="inherit" />
          </button>
          <button className="small-btn delete-btn" onClick={() => handleDelete(task.id)} title="Delete">
            <DeleteIcon fontSize="inherit" />
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <AppLayout activeMenu="schedule" pageTitle="Schedule">
      {loading ? (
        <p className="loading-text">Loading schedules...</p>
      ) : (
        <>
          {/* Upcoming Tasks */}
          <div className="section">
            <div className="section-header">
              <Typography variant="h5" component="h2" sx={{ margin: 0, fontWeight: 700, color: '#333' }}><FormatListBulletedIcon fontSize="inherit" /> Upcoming Tasks ({upcomingTasks.length})</Typography>
              <button className="add-btn" onClick={openAddModal}>
                + Add Task
              </button>
            </div>
            <motion.div className="schedule-list" variants={staggerContainer} initial="initial" animate="animate">
              {upcomingTasks.length > 0
                ? upcomingTasks.map(renderTaskRow)
                : <p className="no-data">No upcoming tasks! <CelebrationIcon fontSize="inherit" /></p>
              }
            </motion.div>
          </div>

          {/* Completed Tasks */}
          <div className="section">
            <Typography variant="h5" component="h2" sx={{ margin: '0 0 24px 0', fontWeight: 700, color: '#333' }}><CheckCircleIcon fontSize="inherit" /> Completed Tasks ({completedTasks.length})</Typography>
            <motion.div className="schedule-list" variants={staggerContainer} initial="initial" animate="animate">
              {completedTasks.length > 0
                ? completedTasks.map(renderTaskRow)
                : <p className="no-data">No completed tasks yet!</p>
              }
            </motion.div>
          </div>

          {/* Schedule Summary */}
          <div className="section">
            <Typography variant="h5" component="h2" sx={{ margin: '0 0 24px 0', fontWeight: 700, color: '#333' }}><InsightsIcon fontSize="inherit" /> Schedule Summary</Typography>
            <motion.div className="summary-cards" variants={staggerContainer} initial="initial" animate="animate">
              <MotionCard className="summary-card">
                <div className="summary-icon"><CalendarMonthIcon fontSize="inherit" /></div>
                <div className="summary-content">
                  <Typography variant="caption" sx={{ color: '#666', margin: 0, fontWeight: 500 }}>Total Tasks</Typography>
                  <Typography variant="h5" component="p" sx={{ margin: '4px 0 0 0', fontWeight: 700, color: '#2d8659' }}>{scheduleItems.length}</Typography>
                </div>
              </MotionCard>
              <MotionCard className="summary-card">
                <div className="summary-icon"><RocketLaunchIcon fontSize="inherit" /></div>
                <div className="summary-content">
                  <Typography variant="caption" sx={{ color: '#666', margin: 0, fontWeight: 500 }}>Pending</Typography>
                  <Typography variant="h5" component="p" sx={{ margin: '4px 0 0 0', fontWeight: 700, color: '#2d8659' }}>{upcomingTasks.length}</Typography>
                </div>
              </MotionCard>
              <MotionCard className="summary-card">
                <div className="summary-icon"><CheckCircleIcon fontSize="inherit" /></div>
                <div className="summary-content">
                  <Typography variant="caption" sx={{ color: '#666', margin: 0, fontWeight: 500 }}>Completed</Typography>
                  <Typography variant="h5" component="p" sx={{ margin: '4px 0 0 0', fontWeight: 700, color: '#2d8659' }}>{completedTasks.length}</Typography>
                </div>
              </MotionCard>
              <MotionCard className="summary-card">
                <div className="summary-icon"><WarningIcon fontSize="inherit" /></div>
                <div className="summary-content">
                  <Typography variant="caption" sx={{ color: '#666', margin: 0, fontWeight: 500 }}>High Priority</Typography>
                  <Typography variant="h5" component="p" sx={{ margin: '4px 0 0 0', fontWeight: 700, color: '#2d8659' }}>{highPriorityCount}</Typography>
                </div>
              </MotionCard>
            </motion.div>
          </div>

          {/* Working Scenario */}
          <div className="section">
            <Typography variant="h5" component="h2" sx={{ margin: '0 0 24px 0', fontWeight: 700, color: '#333' }}><TrackChangesIcon fontSize="inherit" /> How to Use Schedule</Typography>
            <motion.div className="scenario-container" variants={staggerContainer} initial="initial" animate="animate">
              {[
                { n: 1, title: 'Review Upcoming Tasks', desc: 'Check the Upcoming Tasks list daily. High priority tasks should be completed first.' },
                { n: 2, title: 'Prioritize by Urgency', desc: 'Red (High) priority tasks need immediate attention. Yellow (Medium) tasks should be done within a few days.' },
                { n: 3, title: 'Complete and Track', desc: 'Check the checkbox when you complete a task. It moves to the Completed section.' },
                { n: 4, title: 'Monitor Progress', desc: 'Use the Schedule Summary to stay on top of pending tasks.' },
              ].map(step => (
                <MotionCard key={step.n} className="scenario-step">
                  <div className="scenario-number">{step.n}</div>
                  <div className="scenario-content">
                    <Typography variant="subtitle2" component="h4" sx={{ margin: '0 0 8px 0', fontWeight: 600, color: '#333' }}>{step.title}</Typography>
                    <Typography variant="body2" sx={{ margin: 0, color: '#666', lineHeight: 1.5 }}>{step.desc}</Typography>
                  </div>
                </MotionCard>
              ))}
            </motion.div>
          </div>

          {/* Add/Edit Modal */}
          {showModal && (
            <motion.div className="modal-overlay" onClick={() => setShowModal(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <motion.div className="modal-card" onClick={e => e.stopPropagation()} initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
                <div className="modal-header">
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: '#333', margin: 0 }}>{editingTask ? <><EditIcon fontSize="inherit" /> Edit Task</> : <><AddCircleIcon fontSize="inherit" /> Add Task</>}</Typography>
                  <button className="modal-close" onClick={() => setShowModal(false)} title="Close"><CloseIcon fontSize="inherit" /></button>
                </div>
                <div className="modal-body">
                  {actionError && <p className="error-text" style={{ marginBottom: 12 }}>{actionError}</p>}

                  <div className="form-group">
                    <label htmlFor="task-plant">Plant</label>
                    <select
                      id="task-plant"
                      value={formData.plantId}
                      onChange={e => handlePlantChange(e.target.value)}
                      className="form-input"
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">-- Select a plant --</option>
                      {plants.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="task-desc">Task Description</label>
                    <input
                      id="task-desc"
                      type="text"
                      value={formData.task}
                      onChange={e => setFormData({ ...formData, task: e.target.value })}
                      placeholder="e.g. Water the rose plant"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="task-date">Due Date</label>
                    <input
                      id="task-date"
                      type="date"
                      value={formData.dueDate}
                      onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="task-time">Time</label>
                    <input
                      id="task-time"
                      type="text"
                      value={formData.time}
                      onChange={e => setFormData({ ...formData, time: e.target.value })}
                      placeholder="e.g. 09:00 AM"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="task-priority">Priority</label>
                    <select
                      id="task-priority"
                      value={formData.priority}
                      onChange={e => setFormData({ ...formData, priority: e.target.value })}
                      className="form-input"
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="modal-btn cancel" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="modal-btn save" onClick={handleSave}>
                    {editingTask ? 'Save Changes' : 'Add Task'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </>
      )}

      <style>{`
        .due-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }
        .due-badge.overdue {
          background: #ffe6e6;
          color: #cc0000;
        }
        .due-badge.pending {
          background: #e6f7e6;
          color: #2d8659;
        }
        .small-btn.delete-btn {
          background: #fff0f0;
          color: #cc0000;
          border: 1px solid #ffcccc;
        }
        .small-btn.delete-btn:hover {
          background: #ffe0e0;
        }
        .schedule-right {
          gap: 10px;
        }
        .schedule-right button {
          font-size: 14px;
          padding: 6px 8px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .schedule-right button:hover {
          transform: scale(1.1);
        }
      `}</style>
    </AppLayout>
  );
};

export default Schedule;
