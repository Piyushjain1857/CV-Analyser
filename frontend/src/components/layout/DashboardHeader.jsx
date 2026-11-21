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
  Cpu,
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
  const [notifFilter, setNotifFilter] = useState('all');
  const [clearedNotifIds, setClearedNotifIds] = useState(new Set());

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

  // Dynamic user & system notifications
  const rawNotifications = [
    {
      id: 'notif-welcome',
      title: resumes.length === 0
        ? 'Welcome to CV Insight AI! Upload your first resume to unlock 10-dimension ATS audits.'
        : `Latest Audit: ${resumes[0].title || resumes[0].fileName || 'Resume'} analyzed.`,
      description: resumes.length === 0
        ? 'Get Google XYZ bullet rewrites and ATS score calibration.'
        : `Scored against enterprise ATS rubrics (${resumes[0].analyses?.[0]?.overallScore || 82}/100 ATS).`,
      time: resumes.length === 0 ? 'Just now' : 'Recent',
      category: resumes.length === 0 ? 'Getting Started' : 'ATS Audit',
      icon: Sparkles,
      type: 'purple',
      link: resumes.length === 0 ? '/dashboard/upload' : '/dashboard/history',
    },
    {
      id: 'notif-engine',
      title: `Gemini 2.5 engine calibrated for ${user?.role || 'Technical Professional'}.`,
      description: 'Rubric weighted for keyword matching, impact metrics, and brevity.',
      time: '5m ago',
      category: 'AI Engine',
      icon: Cpu,
      type: 'cyan',
      link: '/dashboard/job-match',
    },
    {
      id: 'notif-db',
      title: health.operational
        ? `PostgreSQL secure vault active (${health.latencyMs ?? 1}ms latency)`
        : 'Connecting to PostgreSQL database...',
      description: 'Tenant-isolated records with encrypted AES-256 storage.',
      time: 'Live status',
      category: 'Database Vault',
      icon: Database,
      type: health.operational ? 'emerald' : 'amber',
      link: null,
    },
    {
      id: 'notif-auth',
      title: `Session active for ${user?.email || 'authenticated user'}`,
      description: 'Protected with HTTP-only secure cookie and JWT signature.',
      time: 'Verified',
      category: 'Security',
      icon: ShieldCheck,
      type: 'emerald',
      link: '/dashboard/profile',
    },
  ];

  const activeNotifications = rawNotifications.filter((n) => !clearedNotifIds.has(n.id));
  const unreadCount = activeNotifications.filter((n) => !readNotifIds.has(n.id)).length;

  const displayedNotifications = activeNotifications.filter((n) => {
    if (notifFilter === 'unread') return !readNotifIds.has(n.id);
    return true;
  });

  const markAllRead = () => {
    setReadNotifIds(new Set(activeNotifications.map((n) => n.id)));
    addToast('All notifications marked as read', 'success');
  };

  const clearAllNotifications = () => {
    setClearedNotifIds(new Set(rawNotifications.map((n) => n.id)));
    addToast('Notification center cleared', 'info');
  };

  const handleNotificationClick = (n) => {
    setReadNotifIds((prev) => new Set([...prev, n.id]));
    if (n.link) {
      setShowNotifications(false);
      navigate(n.link);
    } else {
      addToast(n.title, 'info', n.description);
    }
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
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notif-unread-dot" />}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown animate-fade-in">
              <div className="notif-header">
                <div className="notif-header-title-row">
                  <div className="notif-title-group">
                    <span className="notif-title">Notifications</span>
                    <span className={`notif-badge ${unreadCount === 0 ? 'all-read' : ''}`}>
                      {unreadCount === 0 ? 'All caught up' : `${unreadCount} unread`}
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="notif-mark-read-btn"
                      onClick={markAllRead}
                    >
                      <Check size={12} />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="notif-tabs-bar">
                <button
                  type="button"
                  className={`notif-tab-item ${notifFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setNotifFilter('all')}
                >
                  All ({activeNotifications.length})
                </button>
                <button
                  type="button"
                  className={`notif-tab-item ${notifFilter === 'unread' ? 'active' : ''}`}
                  onClick={() => setNotifFilter('unread')}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Notification List */}
              <div className="notif-list">
                {displayedNotifications.length === 0 ? (
                  <div className="notif-empty-state">
                    <div className="notif-empty-icon-wrap">
                      <CheckCircle2 size={22} className="text-emerald" />
                    </div>
                    <h4>All caught up!</h4>
                    <p>No unread notifications to review.</p>
                  </div>
                ) : (
                  displayedNotifications.map((n) => {
                    const isRead = readNotifIds.has(n.id);
                    const IconComponent = n.icon;
                    return (
                      <div
                        key={n.id}
                        className={`notif-item ${isRead ? 'read' : 'unread'}`}
                        onClick={() => handleNotificationClick(n)}
                      >
                        <div className={`notif-item-icon-wrap type-${n.type}`}>
                          <IconComponent size={15} />
                        </div>
                        <div className="notif-item-body">
                          <div className="notif-item-top">
                            <span className="notif-item-cat">{n.category}</span>
                            <span className="notif-item-time">{n.time}</span>
                          </div>
                          <p className="notif-item-title">{n.title}</p>
                          {n.description && (
                            <p className="notif-item-desc">{n.description}</p>
                          )}
                        </div>
                        {!isRead && <span className="notif-unread-dot-badge" />}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="notif-footer">
                <Link
                  to="/dashboard/history"
                  className="notif-footer-link"
                  onClick={() => setShowNotifications(false)}
                >
                  <span>Audit History</span>
                  <ChevronRight size={13} />
                </Link>
                {activeNotifications.length > 0 && (
                  <button
                    type="button"
                    className="notif-clear-btn"
                    onClick={clearAllNotifications}
                  >
                    Clear all
                  </button>
                )}
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
