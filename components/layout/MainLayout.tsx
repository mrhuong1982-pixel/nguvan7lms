
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../core/types';

interface MainLayoutProps {
    allowedRole: UserRole;
}

const MainLayout: React.FC<MainLayoutProps> = ({ allowedRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (user.role !== allowedRole) {
    // Redirect if user role doesn't match the layout's required role
    const targetPath = user.role === 'teacher' ? '/admin' : '/app';
    return <Navigate to={targetPath} replace />;
  }

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
