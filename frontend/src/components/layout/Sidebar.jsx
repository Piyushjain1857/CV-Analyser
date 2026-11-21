import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  FileCheck2,
  GitCompare,
  History,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import HealthBadge from '../common/HealthBadge';
import './Sidebar.css';

export function Sidebar({ collapsed, setCollapsed }) {
  const { isMobileSidebarOpen, setIsMobileSidebarOpen } = useApp();
  const { user, logout } = useAuth();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
    { to: '/dashboard/upload', label: 'Upload & Scan', icon: UploadCloud },
    { to: '/dashboard/results', label: 'Analysis Results', icon: FileCheck2 },
    { to: '/dashboard/compare', label: 'Compare Scans', icon: GitCompare },
    { to: '/dashboard/history', label: 'Audit History', icon: History },
    { to: '/dashboard/profile', label: 'Profile & Settings', icon: UserCheck },
  ];

  const handleLinkClick = () => {
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    addToast('Logged out successfully', 'info');
    navigate('/login');
  };

  return (
    <>
      {isMobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`sidebar-root ${collapsed ? 'collapsed' : ''} ${
          isMobileSidebarOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand" onClick={handleLinkClick}>
            <div className="sidebar-brand-icon">
              <Sparkles size={18} />
            </div>
            {!collapsed && (
              <div className="sidebar-brand-text">
                <span className="brand-title">CV Insight</span>
                <span className="brand-badge">SaaS AI</span>
              </div>
            )}
          </Link>

          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-section-title">
            {!collapsed && <span>MAIN NAVIGATION</span>}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className="sidebar-nav-icon" />
                {!collapsed && (
                  <span className="sidebar-nav-label">{item.label}</span>
                )}
                {item.to === '/dashboard/upload' && !collapsed && (
                  <span className="sidebar-new-pill">Scan</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ATS Health & Target Role Widget (when expanded) */}
        {!collapsed && (
          <div className="sidebar-pro-widget">
            <div className="widget-header">
              <Zap size={14} className="widget-icon" />
              <span className="widget-title">Target ATS Index</span>
            </div>
            <p className="widget-desc">
              Calibrated for {user?.role || 'Senior Software Engineer'}.
            </p>
            <div className="widget-progress">
              <div className="widget-bar" style={{ width: `${user?.targetScore || 90}%` }} />
            </div>
            <div className="widget-meta">
              <span>Goal: {user?.targetScore || 90}/100</span>
              <span className="widget-high">Personalized</span>
            </div>
          </div>
        )}

        {/* Sidebar Footer / User snapshot & Logout */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-row">
            <Link
              to="/dashboard/profile"
              className="sidebar-user-card"
              onClick={handleLinkClick}
              title={user?.email || 'User Profile'}
            >
              <div className="sidebar-user-avatar">
                {user?.name?.charAt(0) || 'U'}
              </div>
              {!collapsed && (
                <div className="sidebar-user-info">
                  <span className="sidebar-user-name">
                    {user?.name || 'Applicant'}
                  </span>
                  <span className="sidebar-user-role">
                    {user?.role || 'Software Engineer'}
                  </span>
                </div>
              )}
            </Link>

            {!collapsed && (
              <button
                type="button"
                className="sidebar-logout-icon-btn"
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
