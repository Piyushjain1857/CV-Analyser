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
  const { toggleMobileSidebar, addToast } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard Overview';
    if (path.includes('/upload')) return 'Upload & Analyze Resume';
    if (path.includes('/results')) return 'ATS Analysis Results';
    if (path.includes('/history')) return 'Resume Audit History';
    if (path.includes('/profile')) return 'Profile & Settings';
    return 'Dashboard';
  };

  const handleLogout = async () => {
    await logout();
    addToast('Logged out', 'info', 'Session ended securely');
    navigate('/login');
  };

  const notifications = [
    { id: 1, title: 'Session restored via secure cookie', time: 'Just now', unread: true },
    { id: 2, title: 'PostgreSQL database connected (1ms)', time: '10m ago', unread: false },
    { id: 3, title: 'Prisma schema synchronized', time: '1h ago', unread: false },
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

      {/* Right: Quick Scan, Live Health, Notifications, User Menu */}
      <div className="header-right">
        <Button
          variant="outline"
          size="sm"
          icon={PlusCircle}
          onClick={() => navigate('/dashboard/upload')}
          className="header-scan-btn"
        >
          New Analysis
        </Button>

        <HealthBadge showDetails={false} />

        {/* Notifications */}
        <div className="header-notif-wrapper">
          <button
            className="header-icon-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="notif-unread-dot" />
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notif-header">
                <span className="notif-title">Notifications</span>
                <span className="notif-badge">1 new</span>
              </div>
              <div className="notif-list">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notif-item ${n.unread ? 'unread' : ''}`}
                    onClick={() => {
                      addToast('Notification viewed', 'info', n.title);
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
                  <User size={15} />
                  <span>Profile Settings</span>
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
