import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import ToastContainer from '../common/Toast';
import './DashboardLayout.css';

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-layout-root">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
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
