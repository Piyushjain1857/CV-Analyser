import React, { useState, useEffect, useRef } from 'react';
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
  LayoutDashboard,
  Shield,
  HelpCircle,
  Zap,
} from 'lucide-react';
import HealthBadge from '../common/HealthBadge';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import './Navbar.css';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileRef = useRef(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { addToast, theme, toggleTheme } = useApp();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    const handleClickOutside = (e) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target) && !e.target.closest('.mobile-hamburger-btn')) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    addToast('Logged out', 'info', 'Your session has been securely closed');
    navigate('/');
  };

  return (
    <header className={`navbar-wrapper ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" aria-label="CV Insight AI Home">
          <div className="brand-icon-box">
            <Sparkles size={19} className="brand-icon" />
          </div>
          <div className="brand-text-group">
            <span className="brand-name">
              CV Insight <span className="brand-ai">AI</span>
            </span>
            <span className="brand-sub">ATS Intelligence SaaS</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="nav-links-desktop" aria-label="Main Navigation">
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#privacy" className="nav-link">Privacy & Security</a>
          <a href="#faqs" className="nav-link">FAQs</a>
          {isAuthenticated && (
            <Link to="/dashboard" className="nav-link highlight">
              <LayoutDashboard size={14} className="nav-link-icon" />
              <span>Dashboard</span>
            </Link>
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
            {theme === 'dark' ? <Sun size={16} className="text-amber" /> : <Moon size={16} className="text-violet" />}
          </button>

          {isAuthenticated ? (
            <div className="nav-user-cluster">
              <Link to="/dashboard" className="nav-user-chip" title="Go to Dashboard">
                <div className="nav-user-avatar">
                  {user?.name?.charAt(0) || 'U'}
                  <span className="avatar-online-dot" />
                </div>
                <span className="nav-user-name">{user?.name || 'Account'}</span>
              </Link>
              <Button
                variant="primary"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/dashboard')}
                className="nav-dash-cta"
              >
                Dashboard
              </Button>
              <button
                type="button"
                className="nav-logout-btn"
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={15} />
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
                className="nav-get-started-btn"
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
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="navbar-mobile-drawer animate-fade-in" ref={mobileRef}>
          <div className="mobile-nav-group">
            <a href="#features" onClick={() => setMobileOpen(false)} className="mobile-nav-link">
              <Zap size={16} className="mobile-link-icon text-violet" />
              <span>Features</span>
            </a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="mobile-nav-link">
              <Sparkles size={16} className="mobile-link-icon text-cyan" />
              <span>How It Works</span>
            </a>
            <a href="#privacy" onClick={() => setMobileOpen(false)} className="mobile-nav-link">
              <Shield size={16} className="mobile-link-icon text-emerald" />
              <span>Privacy & Security</span>
            </a>
            <a href="#faqs" onClick={() => setMobileOpen(false)} className="mobile-nav-link">
              <HelpCircle size={16} className="mobile-link-icon text-amber" />
              <span>FAQs</span>
            </a>
          </div>

          <div className="mobile-theme-row">
            <span>Interface Theme</span>
            <button
              type="button"
              className="navbar-theme-btn"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun size={16} className="text-amber" /> : <Moon size={16} className="text-violet" />}
              <span style={{ fontSize: '0.8rem', marginLeft: '6px' }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          {isAuthenticated ? (
            <div className="mobile-auth-section">
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="mobile-nav-link highlight">
                <LayoutDashboard size={16} />
                <span>Open Dashboard</span>
              </Link>
              <button
                type="button"
                className="mobile-nav-link text-rose logout"
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
              >
                <LogOut size={16} />
                <span>Log Out ({user?.name || 'Account'})</span>
              </button>
            </div>
          ) : (
            <div className="mobile-auth-section">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="mobile-nav-link">
                <LogIn size={16} />
                <span>Sign In</span>
              </Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)} className="mobile-nav-link highlight">
                <Sparkles size={16} />
                <span>Create Account</span>
              </Link>
            </div>
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
