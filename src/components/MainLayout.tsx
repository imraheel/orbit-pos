import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useSettings } from '../store/useSettings';
import { useUI } from '../store/useUI';

export const MainLayout: React.FC = () => {
  const { fetchSettings } = useSettings();
  const { setSidebarOpen } = useUI();
  const location = useLocation();

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (location.pathname === '/pos') {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
