
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HomeIcon, BookOpenIcon, UsersIcon, FileTextIcon, BarChartIcon, BellIcon, ClipboardListIcon } from '../icons';

interface NavItem {
  path: string;
  name: string;
  icon: React.ElementType;
}

const teacherNavItems: NavItem[] = [
  { path: '/admin/dashboard', name: 'Bảng điều khiển', icon: HomeIcon },
  { path: '/admin/classes', name: 'Quản lý Lớp học', icon: UsersIcon },
  { path: '/admin/students', name: 'Quản lý Học sinh', icon: UsersIcon },
  { path: '/admin/lessons', name: 'Quản lý Bài giảng', icon: BookOpenIcon },
  { path: '/admin/question-bank', name: 'Ngân hàng Câu hỏi', icon: ClipboardListIcon },
  { path: '/admin/assignments', name: 'Quản lý Bài tập', icon: FileTextIcon },
  { path: '/admin/announcements', name: 'Quản lý Thông báo', icon: BellIcon },
  { path: '/admin/gradebook', name: 'Sổ điểm', icon: BarChartIcon },
  { path: '/admin/reports', name: 'Báo cáo & Thống kê', icon: BarChartIcon },
];

const studentNavItems: NavItem[] = [
  { path: '/app/dashboard', name: 'Bảng điều khiển', icon: HomeIcon },
  { path: '/app/lessons', name: 'Bài giảng', icon: BookOpenIcon },
  { path: '/app/assignments', name: 'Bài tập của tôi', icon: FileTextIcon },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const navItems = user?.role === 'teacher' ? teacherNavItems : studentNavItems;

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside className="w-64 bg-slate-800 text-slate-100 flex flex-col">
      <div className="h-16 flex items-center justify-center px-4 border-b border-slate-700">
        <BookOpenIcon className="h-8 w-8 text-sky-400" />
        <h1 className="text-xl font-bold ml-2">LMS Ngữ Văn</h1>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive: navIsActive }) =>
                  `flex items-center px-4 py-3 my-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-sky-500 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
