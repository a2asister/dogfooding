import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  BedDouble,
  ShoppingCart,
  Users,
  DollarSign,
  BarChart3,
  ClipboardList,
  AlertTriangle,
  LogOut,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLE_NAMES } from '@/types';

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { currentUser, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/',
      label: '仪表盘',
      icon: Home,
      roles: ['admin', 'manager', 'reception', 'housekeeping'] as const,
    },
    {
      path: '/rooms',
      label: '客房管理',
      icon: BedDouble,
      roles: ['admin', 'manager', 'reception', 'housekeeping'] as const,
    },
    {
      path: '/work-orders',
      label: '工单管理',
      icon: ClipboardList,
      roles: ['admin', 'manager', 'housekeeping'] as const,
    },
    {
      path: '/orders',
      label: '订单管理',
      icon: ShoppingCart,
      roles: ['admin', 'manager', 'reception'] as const,
    },
    {
      path: '/customers',
      label: '客户管理',
      icon: Users,
      roles: ['admin', 'manager', 'reception'] as const,
    },
    {
      path: '/pricing',
      label: '价格管理',
      icon: DollarSign,
      roles: ['admin', 'manager'] as const,
    },
    {
      path: '/exceptions',
      label: '异常报告',
      icon: AlertTriangle,
      roles: ['admin', 'manager', 'reception', 'housekeeping'] as const,
    },
    {
      path: '/analytics',
      label: '数据统计',
      icon: BarChart3,
      roles: ['admin', 'manager'] as const,
    },
    {
      path: '/settings',
      label: '系统设置',
      icon: Settings,
      roles: ['admin'] as const,
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => hasPermission(item.roles));

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-primary-dark flex flex-col transition-all duration-300 z-40 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center justify-center border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <span className="text-primary-dark font-bold text-xl">H</span>
          </div>
          {!isCollapsed && (
            <span className="text-white font-bold text-lg">酒店管理系统</span>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
        <ul className="space-y-1 px-3">
          {filteredMenuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-blue-800 p-3">
        {!isCollapsed && currentUser && (
          <div className="mb-3 px-3">
            <p className="text-white text-sm font-medium">{currentUser.name}</p>
            <p className="text-blue-300 text-xs">{USER_ROLE_NAMES[currentUser.role]}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white transition-all duration-200 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">退出登录</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
