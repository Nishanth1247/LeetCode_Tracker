import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="navbar-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-title">LeetCode Team Tracker</span>
          <span className={`role-badge ${isAdmin ? 'badge-admin' : 'badge-member'}`}>
            {user?.role}
          </span>
        </Link>

        <nav className="navbar-links">
          {isAdmin ? (
            <Link
              to="/admin"
              className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          )}

          <Link
            to="/leaderboard"
            className={`nav-item ${location.pathname === '/leaderboard' ? 'active' : ''}`}
          >
            Leaderboard
          </Link>

          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <div className="user-profile-badge">
            <span className="user-name">👤 {user?.name}</span>
          </div>

          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
