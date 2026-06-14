import { useState, useEffect } from 'react';
import type { ScheduleItem } from '../types';
import scheduleService from '../services/scheduleService';
import AppLayout from '../components/AppLayout';
import '../styles/Dashboard.css';

export const Schedule = () => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    const response = await scheduleService.getAllSchedules();
    if (response.success && response.data?.schedules) {
      setScheduleItems(response.data.schedules);
    }
    setLoading(false);
  };

  const toggleTaskCompletion = async (item: ScheduleItem) => {
    const newCompleted = !item.completed;
    // Optimistic update
    setScheduleItems(prev =>
      prev.map(s => s.id === item.id ? { ...s, completed: newCompleted } : s)
    );
    const response = await scheduleService.toggleCompletion(item.id, newCompleted);
    if (!response.success) {
      // Revert on failure
      setScheduleItems(prev =>
        prev.map(s => s.id === item.id ? { ...s, completed: item.completed } : s)
      );
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

  const renderTaskRow = (task: ScheduleItem) => (
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
          <div className="priority-badge" style={{ backgroundColor: getPriorityColor(task.priority) }}>
            {task.priority}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AppLayout activeMenu="schedule" pageTitle="📅 Schedule">
      {loading ? (
        <p className="loading-text">Loading schedules...</p>
      ) : (
        <>
          {/* Upcoming Tasks */}
          <div className="section">
            <h2>📋 Upcoming Tasks ({upcomingTasks.length})</h2>
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
        </>
      )}
    </AppLayout>
  );
};

export default Schedule;
