import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import ToastContainer from '../common/Toast';
import { useApp } from '../../context/AppContext';
import './DashboardLayout.css';

export function DashboardLayout() {
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useApp();
  const location = useLocation();
  const isDashboardHome = location.pathname === '/dashboard';

  return (
    <div className="dashboard-layout-root">
      <Sidebar collapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />
      <div className={`dashboard-layout-main ${isDashboardHome ? 'no-page-scroll' : ''}`}>
        <DashboardHeader />
        <main className={`dashboard-content-area ${isDashboardHome ? 'dashboard-home-fit' : ''}`}>
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default DashboardLayout;
