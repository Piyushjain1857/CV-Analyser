import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {LayoutDashboard,UploadCloud,Sparkles,Target,Cpu,Compass,History,Settings,FileCheck2,GitCompare,ChevronLeft,ChevronRight,Zap,LogOut,Sun,Moon,HelpCircle,TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import './Sidebar.css';

export function Sidebar({ collapsed, setCollapsed }) {
  const { isMobileSidebarOpen, setIsMobileSidebarOpen, theme, toggleTheme } = useApp();
  const { user, logout } = useAuth();
  const { addToast } = useApp();
  const navigate = useNavigate();

  // 8 Primary Navigation Items requested in Prompt 8
  const primaryNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/dashboard/upload', label: 'Analyze Resume', icon: UploadCloud},
    { to: '/dashboard/builder', label: 'AI Resume Builder', icon: Sparkles, pill: 'PRO' },
    { to: '/dashboard/job-match', label: 'Job Match', icon: Target },
    { to: '/dashboard/assistant', label: 'AI Career Assistant', icon: Cpu },
    { to: '/dashboard/roadmap', label: 'Career Roadmap', icon: Compass },
    { to: '/dashboard/history', label: 'History', icon: History },
    { to: '/dashboard/profile', label: 'Settings', icon: Settings },
  ];

  // Secondary analysis views
  const secondaryNavItems = [
    { to: '/dashboard/interview', label: 'Interview Prep', icon: HelpCircle, pill: 'AI' },
    { to: '/dashboard/analytics', label: 'Career Analytics', icon: TrendingUp },
    { to: '/dashboard/results', label: 'Analysis Results', icon: FileCheck2 },
    { to: '/dashboard/compare', label: 'Compare Scans', icon: GitCompare },
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
                <span className="brand-title">CV Insight AI</span>
                <span className="brand-badge">Enterprise SaaS</span>
              </div>
            )}
          </Link>

          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-section-title">
            {!collapsed && <span>MAIN NAVIGATION</span>}
          </div>
          {primaryNavItems.map((item) => {
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
                {item.pill && !collapsed && (
                  <span className="sidebar-new-pill">{item.pill}</span>
                )}
              </NavLink>
            );
          })}

          <div className="sidebar-nav-section-title" style={{ marginTop: '8px' }}>
            {!collapsed && <span>AUDIT VIEWS</span>}
          </div>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon size={16} className="sidebar-nav-icon" />
                {!collapsed && (
                  <span className="sidebar-nav-label">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ATS Health & Target Role Widget (when expanded) */}
        {!collapsed && (
          <div className="sidebar-pro-widget">
            <div className="widget-header">
              <div className="widget-title-wrap">
                <Zap size={13} className="widget-icon" />
                <span className="widget-title">Target ATS Index</span>
              </div>
              <span className="widget-meta-pill">
                <span className="widget-score-num">{user?.targetScore || 90}</span>
                <span className="widget-score-denom">/100</span>
                <span className="widget-high">Ready</span>
              </span>
            </div>
            <div className="widget-progress">
              <div className="widget-bar" style={{ width: `${user?.targetScore || 90}%` }} />
            </div>
          </div>
        )}

        {/* Sidebar Footer / User snapshot & Quick Theme & Logout */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-row">
            <Link
              to="/dashboard/profile"
              className="sidebar-user-card"
              onClick={handleLinkClick}
              title={user?.email || 'User Settings'}
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
