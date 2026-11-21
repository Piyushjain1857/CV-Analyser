import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  Sun,
  Moon,
} from 'lucide-react';
import HealthBadge from '../common/HealthBadge';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import './Navbar.css';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { addToast, theme, toggleTheme } = useApp();

  const handleLogout = async () => {
    await logout();
    addToast('Logged out', 'info', 'Your session has been securely closed');
    navigate('/');
  };

  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon-box">
            <Sparkles size={20} className="brand-icon" />
          </div>
          <div className="brand-text-group">
            <span className="brand-name">CV Insight <span className="brand-ai">AI</span></span>
            <span className="brand-sub">ATS Intelligence SaaS</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="nav-links-desktop">
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#privacy" className="nav-link">Privacy & Security</a>
          <a href="#faqs" className="nav-link">FAQs</a>
          {isAuthenticated && (
            <Link to="/dashboard" className="nav-link highlight">Dashboard</Link>
          )}
        </nav>

        {/* Right CTA & Health Status & Theme Switcher */}
        <div className="nav-actions-desktop">
          <HealthBadge showDetails={false} />

          {/* Theme switcher */}
          <button
            type="button"
            className="navbar-theme-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={17} className="text-amber" /> : <Moon size={17} className="text-violet" />}
          </button>

          {isAuthenticated ? (
            <div className="nav-user-cluster">
              <Link to="/dashboard" className="nav-user-chip">
                <div className="nav-user-avatar">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="nav-user-name">{user?.name || 'Account'}</span>
              </Link>
              <button
                type="button"
                className="nav-logout-btn"
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <Link to="/login" className="nav-signin-link">
                Sign In
              </Link>
              <Button
                variant="primary"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/signup')}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="mobile-hamburger-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="navbar-mobile-drawer">
          <a href="#features" onClick={() => setMobileOpen(false)} className="mobile-nav-link">Features</a>
          <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="mobile-nav-link">How It Works</a>
          <a href="#privacy" onClick={() => setMobileOpen(false)} className="mobile-nav-link">Privacy & Security</a>
          <a href="#faqs" onClick={() => setMobileOpen(false)} className="mobile-nav-link">FAQs</a>

          <div className="mobile-theme-row">
            <span>Interface Theme</span>
            <button
              type="button"
              className="navbar-theme-btn"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun size={17} className="text-amber" /> : <Moon size={17} className="text-violet" />}
              <span style={{ fontSize: '0.8rem', marginLeft: '6px' }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
          
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="mobile-nav-link highlight">
                Open Dashboard
              </Link>
              <button
                type="button"
                className="mobile-nav-link text-rose"
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
              >
                Log Out ({user?.name})
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="mobile-nav-link">
                Sign In
              </Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)} className="mobile-nav-link highlight">
                Create Account
              </Link>
            </>
          )}

          <div className="mobile-actions">
            <HealthBadge showDetails={true} />
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                setMobileOpen(false);
                navigate(isAuthenticated ? '/dashboard/upload' : '/signup');
              }}
            >
              {isAuthenticated ? 'Analyze Resume Now' : 'Start Free Audit'}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
