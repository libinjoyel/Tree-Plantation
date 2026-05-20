import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

interface ScheduleItem {
  id: string;
  plantName: string;
  task: string;
  dueDate: string;
  time: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export const Schedule = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('schedule');
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    {
      id: '1',
      plantName: 'Monstera Deliciosa',
      task: 'Water Plant',
      dueDate: '2026-05-18',
      time: '09:00 AM',
      completed: false,
      priority: 'high',
    },
    {
      id: '2',
      plantName: 'Snake Plant',
      task: 'Water Plant',
      dueDate: '2026-05-20',
      time: '10:00 AM',
      completed: false,
      priority: 'medium',
    },
    {
      id: '3',
      plantName: 'Pothos',
      task: 'Fertilize',
      dueDate: '2026-05-22',
      time: '02:00 PM',
      completed: true,
      priority: 'low',
    },
    {
      id: '4',
      plantName: 'Spider Plant',
      task: 'Repot',
      dueDate: '2026-05-25',
      time: '03:00 PM',
      completed: false,
      priority: 'high',
    },
    {
      id: '5',
      plantName: 'Monstera Deliciosa',
      task: 'Prune Leaves',
      dueDate: '2026-05-30',
      time: '11:00 AM',
      completed: false,
      priority: 'medium',
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

  const toggleTaskCompletion = (id: string) => {
    setScheduleItems(items =>
      items.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ff6b6b';
      case 'medium':
        return '#ffa500';
      case 'low':
        return '#2d8659';
      default:
        return '#999';
    }
  };

  const upcomingTasks = scheduleItems.filter(item => !item.completed);
  const completedTasks = scheduleItems.filter(item => item.completed);

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
            <h1>📅 Schedule</h1>
          </div>
        </nav>

        <main className="content">
          {/* Upcoming Tasks */}
          <div className="section">
            <h2>📋 Upcoming Tasks ({upcomingTasks.length})</h2>
            <div className="schedule-list">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <div key={task.id} className="schedule-item">
                    <div className="schedule-left">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task.id)}
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
                      <div
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                      >
                        {task.priority}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No upcoming tasks!</p>
              )}
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="section">
            <h2>✅ Completed Tasks ({completedTasks.length})</h2>
            <div className="schedule-list">
              {completedTasks.length > 0 ? (
                completedTasks.map((task) => (
                  <div key={task.id} className="schedule-item completed">
                    <div className="schedule-left">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task.id)}
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
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No completed tasks yet!</p>
              )}
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
                  <p className="summary-value">
                    {upcomingTasks.filter(t => t.priority === 'high').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Working Scenario */}
          <div className="section">
            <h2>🎯 Working Scenario</h2>
            <div className="scenario-container">
              <div className="scenario-step">
                <div className="scenario-number">1</div>
                <div className="scenario-content">
                  <h4>Review Upcoming Tasks</h4>
                  <p>Check the Upcoming Tasks list daily. High priority tasks should be completed first to maintain plant health.</p>
                </div>
              </div>
              <div className="scenario-step">
                <div className="scenario-number">2</div>
                <div className="scenario-content">
                  <h4>Prioritize by Urgency</h4>
                  <p>Red (High) priority tasks need immediate attention. Yellow (Medium) tasks should be done within a few days.</p>
                </div>
              </div>
              <div className="scenario-step">
                <div className="scenario-number">3</div>
                <div className="scenario-content">
                  <h4>Complete and Track</h4>
                  <p>Check the checkbox when you complete a task. Completed tasks move to the Completed Tasks section for record keeping.</p>
                </div>
              </div>
              <div className="scenario-step">
                <div className="scenario-number">4</div>
                <div className="scenario-content">
                  <h4>Monitor Progress</h4>
                  <p>Use the Schedule Summary to stay on top of pending tasks. Aim to complete high priority tasks first each day.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Schedule;
