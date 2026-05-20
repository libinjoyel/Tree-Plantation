import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyPlants from './pages/MyPlants';
import CareTips from './pages/CareTips';
import Settings from './pages/Settings';
import Schedule from './pages/Schedule';
import Analytics from './pages/Analytics';
import './styles/App.css';

function App() {
  useEffect(() => {
    // Apply dark mode on initial load
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
      document.documentElement.style.colorScheme = 'dark';
      document.body.classList.add('dark-mode');
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-plants" element={<MyPlants />} />
        <Route path="/care-tips" element={<CareTips />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/analytics" element={<Analytics />} />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
