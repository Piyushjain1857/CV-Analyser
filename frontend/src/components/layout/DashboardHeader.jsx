import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Sparkles,
  ChevronRight,
  PlusCircle,
  CheckCircle,
  LogOut,
  User,
  Settings,
  Sun,
  Moon,
  Database,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import HealthBadge from '../common/HealthBadge';
import Button from '../common/Button';
import './DashboardHeader.css';

export function DashboardHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toggleMobileSidebar, addToast, theme, toggleTheme, health, resumes } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard Overview';
    if (path.includes('/upload')) return 'Analyze Resume';
    if (path.includes('/builder')) return 'AI Resume Builder';
    if (path.includes('/job-match')) return 'Job Match & Gap Analysis';
    if (path.includes('/assistant')) return 'AI Career Assistant';
    if (path.includes('/roadmap')) return 'Career Roadmap';
    if (path.includes('/results')) return 'ATS Analysis Results';
    if (path.includes('/compare')) return 'Compare Scans';
    if (path.includes('/history')) return 'Resume Audit History';
    if (path.includes('/profile')) return 'Settings & Account';
    return 'Dashboard';
  };

  const handleLogout = async () => {
    await logout();
    addToast('Logged out', 'info', 'Session ended securely');
    navigate('/login');
  };

  // Real event-backed notifications (derived from actual app state & system events)
  const realNotifications = [
    {
      id: 'notif-db',
      title: health.operational
        ? `PostgreSQL connected (${health.latencyMs ?? 1}ms latency)`
        : 'PostgreSQL connecting...',
      time: 'Real-time telemetry',
      type: health.operational ? 'success' : 'warn',
      unread: false,
    },
    {
      id: 'notif-resumes',
      title: `${resumes.length} encrypted resume(s) in active tenant isolation`,
      time: 'Database ledger',
      type: 'info',
      unread: false,
    },
    {
      id: 'notif-auth',
      title: `Session active for ${user?.email || 'authenticated user'} (HTTP-only JWT)`,
      time: 'Auth session verified',
      type: 'success',
      unread: true,
    },
  ];

  return (
    <header className="dashboard-header-root">
      {/* Left: Mobile toggle & breadcrumbs */}
      <div className="header-left">
        <button
          className="header-mobile-toggle"
          onClick={toggleMobileSidebar}
          aria-label="Toggle navigation drawer"
        >
          <Menu size={20} />
        </button>

        <div className="header-breadcrumbs">
          <Link to="/dashboard" className="crumb-root">CV Insight</Link>
          <ChevronRight size={14} className="crumb-sep" />
          <span className="crumb-current">{getPageTitle()}</span>
        </div>
      </div>

      {/* Right: Quick Scan, Live Health, Theme Switcher, Notifications, User Menu */}
      <div className="header-right">
        <Button
          variant="outline"
          size="sm"
          icon={PlusCircle}
          onClick={() => navigate('/dashboard/upload')}
          className="header-scan-btn"
        >
          Analyze Resume
        </Button>

        <HealthBadge showDetails={false} />

        {/* Theme Switcher Button */}
        <button
          type="button"
          className="header-icon-btn theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
        >
          {theme === 'dark' ? <Sun size={17} className="text-amber" /> : <Moon size={17} className="text-violet" />}
        </button>

        {/* Notifications */}
        <div className="header-notif-wrapper">
          <button
            className="header-icon-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            aria-label="Notifications"
            title="System & Security Notifications"
          >
            <Bell size={18} />
            <span className="notif-unread-dot" />
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notif-header">
                <span className="notif-title">System & Security Logs</span>
                <span className="notif-badge">Live events</span>
              </div>
              <div className="notif-list">
                {realNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notif-item ${n.unread ? 'unread' : ''}`}
                    onClick={() => {
                      addToast(n.title, 'info');
                      setShowNotifications(false);
                    }}
                  >
                    <CheckCircle size={14} className="notif-item-icon" />
                    <div className="notif-item-body">
                      <p className="notif-item-text">{n.title}</p>
                      <span className="notif-item-time">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User avatar & dropdown */}
        <div className="header-user-menu-wrapper">
          <button
            type="button"
            className="header-avatar-btn"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            title={user?.email || 'User Menu'}
            aria-label="User profile and settings menu"
          >
            <div className="header-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </button>

          {showUserMenu && (
            <div className="user-dropdown-menu">
              <div className="user-dropdown-header">
                <span className="dropdown-user-name">{user?.name || 'Applicant'}</span>
                <span className="dropdown-user-email">{user?.email || 'user@example.com'}</span>
                <span className="dropdown-user-role">{user?.role || 'Software Engineer'}</span>
              </div>

              <div className="user-dropdown-list">
                <Link
                  to="/dashboard/profile"
                  className="dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings size={15} />
                  <span>Account & Settings</span>
                </Link>
                <Link
                  to="/dashboard/builder"
                  className="dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Sparkles size={15} />
                  <span>AI Resume Builder</span>
                </Link>
                <button
                  type="button"
                  className="dropdown-item logout text-rose"
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={15} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
