import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/Auth.css';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setResetToken('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSuccess('If an account with that email exists, a reset link has been sent.');
        if ((response as any).resetToken) {
          setResetToken((response as any).resetToken);
        }
      } else {
        setError(response.error || 'Something went wrong');
      }
    } catch {
      setError('Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">🌱</div>
          <h1>PlantCare AI</h1>
          <p className="subtitle">Reset your password</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {resetToken && (
          <div className="reset-token-box">
            <p className="token-label">Development mode — use this link to reset:</p>
            <a href={`/reset-password?token=${resetToken}`} className="token-link">
              Reset Password →
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="form-input"
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="link">Back to Login</Link>
          </p>
        </div>
      </div>

      <style>{`
        .success-message {
          background: linear-gradient(135deg, #2d8659 0%, #1b5a3d 100%);
          color: white;
          padding: 14px 16px;
          border-radius: 10px;
          margin-bottom: 24px;
          font-weight: 500;
          font-size: 14px;
          animation: slideIn 0.3s ease-out;
          box-shadow: 0 4px 15px rgba(45, 134, 89, 0.3);
        }
        .reset-token-box {
          background: #f0fdf4;
          border: 2px solid #2d8659;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 24px;
          text-align: center;
        }
        .token-label {
          font-size: 13px;
          color: #666;
          margin: 0 0 8px;
        }
        .token-link {
          display: inline-block;
          background: linear-gradient(135deg, #2d8659, #1b5a3d);
          color: white;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          font-size: 14px;
          transition: all 0.3s;
        }
        .token-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(45,134,89,0.4);
        }
        body.dark-mode .reset-token-box {
          background: #1a2e22;
          border-color: #2d8659;
        }
        body.dark-mode .token-label {
          color: #aaa;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
