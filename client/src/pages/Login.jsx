import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, googleLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleGoogleCallback = async (response) => {
    if (!response.credential) return;
    try {
      setIsSubmitting(true);
      setError('');
      const data = await googleLogin(response.credential);
      if (data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (googleClientId && window.google?.accounts?.id && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCallback,
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: theme === 'dark' ? 'filled_black' : 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
        });
      } catch (e) {
        console.error('Failed to render Google Sign-In button:', e);
      }
    }
  }, [googleClientId, theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await login(email, password);

      if (data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Invalid credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-theme-toggle">
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your LeetCode Team Tracker account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="e.g. arun@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>

          {googleClientId && (
            <div style={{ marginTop: '1.25rem' }}>
              <div
                className="divider"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  textAlign: 'center',
                  marginBottom: '1.25rem',
                  color: 'var(--muted)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}
              >
                <span style={{ flex: 1, borderBottom: '1px solid var(--border)' }}></span>
                <span style={{ padding: '0 0.75rem' }}>OR</span>
                <span style={{ flex: 1, borderBottom: '1px solid var(--border)' }}></span>
              </div>
              <div
                ref={googleBtnRef}
                style={{
                  width: '100%',
                  minHeight: '40px',
                  display: 'flex',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              ></div>
            </div>
          )}
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
