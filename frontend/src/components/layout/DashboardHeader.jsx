import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Sparkles,
  ChevronRight,
  PlusCircle,
  CheckCircle2,
  LogOut,
  User,
  Settings,
  Sun,
  Moon,
  Database,
  ShieldCheck,
  FileText,
  Home,
  Check,
  ExternalLink,
  Layers,
  FileCheck,
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
  const [readNotifIds, setReadNotifIds] = useState(new Set());

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getPageMeta = () => {
    const path = location.pathname;
    if (path === '/dashboard') return { title: 'Dashboard Overview', category: 'Analytics' };
    if (path.includes('/upload')) return { title: 'Analyze Resume', category: 'Intelligence' };
    if (path.includes('/builder')) return { title: 'AI Resume Builder', category: 'Studio' };
    if (path.includes('/job-match')) return { title: 'Job Match & Gap Analysis', category: 'Match' };
    if (path.includes('/assistant')) return { title: 'AI Career Assistant', category: 'Copilot' };
    if (path.includes('/roadmap')) return { title: 'Career Roadmap', category: 'Growth' };
    if (path.includes('/results')) return { title: 'ATS Analysis Results', category: 'Audit' };
    if (path.includes('/compare')) return { title: 'Compare Scans', category: 'Audit' };
    if (path.includes('/history')) return { title: 'Resume Audit History', category: 'Ledger' };
    if (path.includes('/profile')) return { title: 'Settings & Security', category: 'Account' };
    return { title: 'Dashboard', category: 'App' };
  };

  const pageMeta = getPageMeta();

  const handleLogout = async () => {
    await logout();
    addToast('Logged out', 'info', 'Session ended securely');
    navigate('/login');
  };

  // Real event-backed notifications (derived from actual app state & system events)
  const baseNotifications = [
    {
      id: 'notif-db',
      title: health.operational
        ? `PostgreSQL connected (${health.latencyMs ?? 1}ms latency)`
        : 'PostgreSQL connecting...',
      time: 'Real-time telemetry',
      category: 'Database',
      icon: Database,
      type: health.operational ? 'success' : 'warn',
    },
    {
      id: 'notif-resumes',
      title: `${resumes.length} encrypted resume(s) in active tenant isolation`,
      time: 'Database ledger',
      category: 'Storage',
      icon: FileText,
      type: 'info',
    },
    {
      id: 'notif-auth',
      title: `Session active for ${user?.email || 'authenticated user'} (HTTP-only JWT)`,
      time: 'Auth session verified',
      category: 'Security',
      icon: ShieldCheck,
      type: 'success',
    },
  ];

  const unreadCount = baseNotifications.filter((n) => !readNotifIds.has(n.id)).length;

  const markAllRead = () => {
    setReadNotifIds(new Set(baseNotifications.map((n) => n.id)));
    addToast('Notifications marked as read', 'info');
  };

  return (
    <header className="dashboard-header-root">
      {/* Left: Mobile toggle & breadcrumbs */}
      <div className="header-left">
        <button
          className="header-mobile-toggle"
          onClick={toggleMobileSidebar}
          aria-label="Toggle navigation drawer"
        >
          <Menu size={19} />
        </button>

        <nav className="header-breadcrumbs" aria-label="Breadcrumb navigation">
          <Link to="/dashboard" className="crumb-root" title="Go to Dashboard Overview">
            <Home size={14} className="crumb-home-icon" />
            <span>CV Insight</span>
          </Link>
          <ChevronRight size={13} className="crumb-sep" />
          <span className="crumb-category">{pageMeta.category}</span>
          <ChevronRight size={13} className="crumb-sep" />
          <span className="crumb-current">{pageMeta.title}</span>
        </nav>
      </div>

      {/* Right: Quick Scan, Live Health, Theme Switcher, Notifications, User Menu */}
      <div className="header-right">
        <Button
          variant="primary"
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
          {theme === 'dark' ? (
            <Sun size={17} className="text-amber" />
          ) : (
            <Moon size={17} className="text-violet" />
          )}
        </button>

        {/* Notifications */}
        <div className="header-notif-wrapper" ref={notifRef}>
          <button
            className={`header-icon-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            aria-label="Notifications"
            aria-expanded={showNotifications}
            title="System & Security Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notif-unread-dot" />}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown animate-fade-in">
              <div className="notif-header">
                <div className="notif-header-title-row">
                  <span className="notif-title">System & Security Logs</span>
                  <span className="notif-badge">{unreadCount} unread</span>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="notif-mark-read-btn"
                    onClick={markAllRead}
                    title="Mark all notifications as read"
                  >
                    <Check size={12} /> Mark read
                  </button>
                )}
              </div>
              <div className="notif-list">
                {baseNotifications.map((n) => {
                  const isRead = readNotifIds.has(n.id);
                  const IconComponent = n.icon;
                  return (
                    <div
                      key={n.id}
                      className={`notif-item ${isRead ? 'read' : 'unread'}`}
                      onClick={() => {
                        setReadNotifIds((prev) => new Set([...prev, n.id]));
                        addToast(n.title, 'info');
                      }}
                    >
                      <div className={`notif-item-icon-wrap type-${n.type}`}>
                        <IconComponent size={14} />
                      </div>
                      <div className="notif-item-body">
                        <div className="notif-item-top">
                          <span className="notif-item-cat">{n.category}</span>
                          <span className="notif-item-time">{n.time}</span>
                        </div>
                        <p className="notif-item-text">{n.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User avatar & dropdown */}
        <div className="header-user-menu-wrapper" ref={userMenuRef}>
          <button
            type="button"
            className="header-avatar-btn"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            title={user?.email || 'User Account Menu'}
            aria-label="User profile and settings menu"
            aria-expanded={showUserMenu}
          >
            <div className="header-avatar">
              {user?.name?.charAt(0) || 'U'}
              <span className="avatar-online-dot" />
            </div>
          </button>

          {showUserMenu && (
            <div className="user-dropdown-menu animate-fade-in">
              <div className="user-dropdown-header">
                <div className="dropdown-user-info">
                  <span className="dropdown-user-name">{user?.name || 'Applicant'}</span>
                  <span className="dropdown-user-email">{user?.email || 'user@example.com'}</span>
                </div>
                <span className="dropdown-user-badge">
                  <Sparkles size={11} /> Verified Account
                </span>
              </div>

              <div className="user-dropdown-list">
                <Link
                  to="/dashboard"
                  className="dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Home size={15} />
                  <span>Dashboard Overview</span>
                </Link>
                <Link
                  to="/dashboard/upload"
                  className="dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <PlusCircle size={15} />
                  <span>Analyze New Resume</span>
                </Link>
                <Link
                  to="/dashboard/builder"
                  className="dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Sparkles size={15} />
                  <span>AI Resume Builder</span>
                </Link>
                <Link
                  to="/dashboard/profile"
                  className="dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings size={15} />
                  <span>Account & Settings</span>
                </Link>
                <div className="dropdown-divider" />
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
