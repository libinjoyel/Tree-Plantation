import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Typography from '@mui/material/Typography';
import '../styles/Auth.css';
import SpaIcon from '@mui/icons-material/Spa';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid reset link. No token provided.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword(token, password);
      if (response.success) {
        setSuccess('Password reset successfully!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(response.error || 'Failed to reset password');
      }
    } catch {
      setError('Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo"><SpaIcon sx={{ fontSize: 40 }} /></div>
            <Typography variant="h4" component="h1" sx={{ margin: 0, fontWeight: 700, color: '#333' }}>PlantCare</Typography>
            <Typography variant="body2" sx={{ color: '#666', margin: '8px 0 0 0' }}>Invalid reset link</Typography>
          </div>
          <div className="error-message">
            This password reset link is invalid or missing a token.
          </div>
          <div className="auth-footer">
            <p><Link to="/forgot-password" className="link">Request a new reset link</Link></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo"><SpaIcon sx={{ fontSize: 40 }} /></div>
          <Typography variant="h4" component="h1" sx={{ margin: 0, fontWeight: 700, color: '#333' }}>PlantCare</Typography>
          <Typography variant="body2" sx={{ color: '#666', margin: '8px 0 0 0' }}>Enter your new password</Typography>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message-reset">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="form-input"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="form-input"
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <Link to="/login" className="link">Back to Login</Link>
          </p>
        </div>
      </div>

      <style>{`
        .success-message-reset {
          background: linear-gradient(135deg, #2d8659 0%, #1b5a3d 100%);
          color: white;
          padding: 14px 16px;
          border-radius: 10px;
          margin-bottom: 24px;
          font-weight: 500;
          font-size: 14px;
          animation: slideIn 0.3s ease-out;
          box-shadow: 0 4px 15px rgba(45, 134, 89, 0.3);
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;
