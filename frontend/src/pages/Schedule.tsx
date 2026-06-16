import { useState, useEffect } from 'react';
import type { ScheduleItem, Plant } from '../types';
import scheduleService from '../services/scheduleService';
import plantService from '../services/plantService';
import AppLayout from '../components/AppLayout';
import '../styles/Dashboard.css';

const formatDueDate = (dueDate: string): { text: string; isOverdue: boolean } => {
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
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduleItem | null>(null);
  const [actionError, setActionError] = useState('');
  const [formData, setFormData] = useState({
    plantId: '',
    plantName: '',
    task: '',
    dueDate: '',
    time: '09:00 AM',
    priority: 'medium' as 'high' | 'medium' | 'low',
  });

  useEffect(() => {
    Promise.all([loadSchedules(), loadPlants()]);
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    const response = await scheduleService.getAllSchedules();
    if (response.success && response.data?.schedules) {
      setScheduleItems(response.data.schedules);
    }
    setLoading(false);
  };

  const loadPlants = async () => {
    const response = await plantService.getAllPlants();
    if (response.success && response.data?.plants) {
      setPlants(response.data.plants);
    }
  };

  const toggleTaskCompletion = async (item: ScheduleItem) => {
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

  const openEditModal = (task: ScheduleItem) => {
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

  const handlePlantChange = (plantId: string) => {
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
          prev.map(s => s.id === editingTask.id ? response.data!.schedule : s)
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
        setScheduleItems(prev => [...prev, response.data!.schedule]);
        setShowModal(false);
      } else {
        setActionError(response.error || 'Failed to create task');
      }
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return;
    const response = await scheduleService.deleteSchedule(taskId);
    if (response.success) {
      setScheduleItems(prev => prev.filter(s => s.id !== taskId));
    }
  };

  const getPriorityColor = (priority: string) => {
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

  const renderTaskRow = (task: ScheduleItem) => {
    const dueInfo = formatDueDate(task.dueDate);
    return (
      <div key={task.id} className={`schedule-item ${task.completed ? 'completed' : ''}`}>
        <div className="schedule-left">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleTaskCompletion(task)}
            className="schedule-checkbox"
          />
          <div className="schedule-info">
            <h4>{task.plantName}</h4>
            <p className="task-description">{task.task}</p>
          </div>
        </div>
        <div className="schedule-right">
          <div className="schedule-date">
            <span className="date-icon">📅</span>
            <span>{task.dueDate}</span>
          </div>
          <div className="schedule-time">
            <span className="time-icon">🕐</span>
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
            📝
          </button>
          <button className="small-btn delete-btn" onClick={() => handleDelete(task.id)} title="Delete">
            🗑️
          </button>
        </div>
      </div>
    );
  };

  return (
    <AppLayout activeMenu="schedule" pageTitle="📅 Schedule">
      {loading ? (
        <p className="loading-text">Loading schedules...</p>
      ) : (
        <>
          {/* Upcoming Tasks */}
          <div className="section">
            <div className="section-header">
              <h2>📋 Upcoming Tasks ({upcomingTasks.length})</h2>
              <button className="add-btn" onClick={openAddModal}>
                + Add Task
              </button>
            </div>
            <div className="schedule-list">
              {upcomingTasks.length > 0
                ? upcomingTasks.map(renderTaskRow)
                : <p className="no-data">No upcoming tasks! 🎉</p>
              }
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="section">
            <h2>✅ Completed Tasks ({completedTasks.length})</h2>
            <div className="schedule-list">
              {completedTasks.length > 0
                ? completedTasks.map(renderTaskRow)
                : <p className="no-data">No completed tasks yet!</p>
              }
            </div>
          </div>

          {/* Schedule Summary */}
          <div className="section">
            <h2>📊 Schedule Summary</h2>
            <div className="summary-cards">
              <div className="summary-card">
                <div className="summary-icon">📅</div>
                <div className="summary-content">
                  <p className="summary-label">Total Tasks</p>
                  <p className="summary-value">{scheduleItems.length}</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">🚀</div>
                <div className="summary-content">
                  <p className="summary-label">Pending</p>
                  <p className="summary-value">{upcomingTasks.length}</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">✅</div>
                <div className="summary-content">
                  <p className="summary-label">Completed</p>
                  <p className="summary-value">{completedTasks.length}</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">⚠️</div>
                <div className="summary-content">
                  <p className="summary-label">High Priority</p>
                  <p className="summary-value">{highPriorityCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Working Scenario */}
          <div className="section">
            <h2>🎯 How to Use Schedule</h2>
            <div className="scenario-container">
              {[
                { n: 1, title: 'Review Upcoming Tasks', desc: 'Check the Upcoming Tasks list daily. High priority tasks should be completed first.' },
                { n: 2, title: 'Prioritize by Urgency', desc: 'Red (High) priority tasks need immediate attention. Yellow (Medium) tasks should be done within a few days.' },
                { n: 3, title: 'Complete and Track', desc: 'Check the checkbox when you complete a task. It moves to the Completed section.' },
                { n: 4, title: 'Monitor Progress', desc: 'Use the Schedule Summary to stay on top of pending tasks.' },
              ].map(step => (
                <div key={step.n} className="scenario-step">
                  <div className="scenario-number">{step.n}</div>
                  <div className="scenario-content">
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add/Edit Modal */}
          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-card" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{editingTask ? '📝 Edit Task' : '➕ Add Task'}</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)} title="Close">✕</button>
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
                      onChange={e => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
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
              </div>
            </div>
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
        }
        .schedule-right button:hover {
          transform: scale(1.1);
        }
      `}</style>
    </AppLayout>
  );
};

export default Schedule;
