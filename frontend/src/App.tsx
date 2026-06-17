import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import MyPlants from './pages/MyPlants';
import CareTips from './pages/CareTips';
import Settings from './pages/Settings';
import Schedule from './pages/Schedule';
import Analytics from './pages/Analytics';
import PrivateRoute from './components/PrivateRoute';
import { Toaster } from 'react-hot-toast';
import './styles/App.css';

function App() {
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
      document.documentElement.style.colorScheme = 'dark';
      document.body.classList.add('dark-mode');
    }
  }, []);

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          },
          success: {
            iconTheme: { primary: '#2d8659', secondary: '#fff' },
            style: { border: '1px solid #d4edda', color: '#155724' },
          },
          error: {
            iconTheme: { primary: '#dc3545', secondary: '#fff' },
            style: { border: '1px solid #f5c6cb', color: '#721c24' },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/my-plants" element={<PrivateRoute><MyPlants /></PrivateRoute>} />
        <Route path="/care-tips" element={<PrivateRoute><CareTips /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/schedule" element={<PrivateRoute><Schedule /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
