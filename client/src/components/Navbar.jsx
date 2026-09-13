import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="navbar-brand" onClick={closeMenu}>
            <span className="brand-title">LeetCode Analyser</span>
            <span className={`role-badge ${isAdmin ? 'badge-admin' : 'badge-member'}`}>
              {user?.role}
            </span>
          </Link>
        </div>

        <button
          className="mobile-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-content ${menuOpen ? 'is-open' : ''}`}>
          <div className="navbar-scroll-area">
            <nav className="navbar-nav">
              {isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/teams"
                    className={`nav-item ${location.pathname.startsWith('/admin/teams') ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    Teams
                  </Link>
                  <Link
                    to="/admin/challenges"
                    className={`nav-item ${location.pathname === '/admin/challenges' ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    Challenges
                  </Link>
                  <Link
                    to="/admin/solved-problems"
                    className={`nav-item ${location.pathname === '/admin/solved-problems' ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    Solved History
                  </Link>
                  <Link
                    to="/admin/streaks"
                    className={`nav-item ${location.pathname.startsWith('/admin/streaks') ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    Streaks
                  </Link>
                  <Link
                    to="/admin/team-performance"
                    className={`nav-item ${location.pathname.startsWith('/admin/team-performance') ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    Team Performance
                  </Link>
                  <Link
                    to="/admin/member-performance"
                    className={`nav-item ${location.pathname.startsWith('/admin/member-performance') ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    Member Performance
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`nav-item ${location.pathname.startsWith('/admin/users') ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    Users
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/my-team"
                    className={`nav-item ${location.pathname === '/my-team' ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    My Team
                  </Link>
                </>
              )}

              <Link
                to="/leaderboard"
                className={`nav-item ${location.pathname === '/leaderboard' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Leaderboard
              </Link>

              <Link
                to="/analytics"
                className={`nav-item ${location.pathname === '/analytics' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Analytics
              </Link>
            </nav>
          </div>

          <div className="navbar-actions">
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
