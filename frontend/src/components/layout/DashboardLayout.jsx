import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import ToastContainer from '../common/Toast';
import { useApp } from '../../context/AppContext';
import './DashboardLayout.css';

export function DashboardLayout() {
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useApp();

  return (
    <div className="dashboard-layout-root">
      <Sidebar collapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />
      <div className="dashboard-layout-main">
        <DashboardHeader />
        <main className="dashboard-content-area">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default DashboardLayout;
