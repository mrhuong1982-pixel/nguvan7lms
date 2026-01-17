
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BellIcon, LogOutIcon } from '../icons';

const Topbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-700">
          {user?.role === 'teacher' ? 'Giao diện Giáo viên' : 'Giao diện Học sinh'}
        </h2>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-slate-100">
          <BellIcon className="h-6 w-6 text-slate-500" />
        </button>

        <div className="flex items-center">
          <span className="text-slate-600 font-medium mr-3">{user?.name}</span>
          <button onClick={handleLogout} className="p-2 rounded-full hover:bg-slate-100" title="Đăng xuất">
            <LogOutIcon className="h-6 w-6 text-slate-500" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
