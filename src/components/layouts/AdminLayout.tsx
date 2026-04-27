import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Home,
  Briefcase,
  FolderOpen,
  ShoppingCart,
  Package,
  MessageSquare,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAppStore } from '../../store';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const sidebarOpen = useAppStore(state => state.sidebarOpen);
  const setSidebarOpen = useAppStore(state => state.setSidebarOpen);
  const currentUser = useAppStore(state => state.currentUser);
  const logout = useAppStore(state => state.logout);

  const navItems = [
    { label: '工作台', path: '/admin', icon: Home, exact: true },
    { label: '作品管理', path: '/admin/portfolios', icon: Briefcase },
    { label: '案例管理', path: '/admin/cases', icon: FolderOpen },
    { label: '订单管理', path: '/admin/orders', icon: ShoppingCart },
    { label: '服务套餐', path: '/admin/packages', icon: Package },
    { label: '素材管理', path: '/admin/materials', icon: FolderOpen },
    { label: '消息中心', path: '/admin/messages', icon: MessageSquare },
    { label: '评价管理', path: '/admin/reviews', icon: FolderOpen },
    { label: '数据统计', path: '/admin/analytics', icon: BarChart3 },
    { label: '账号管理', path: '/admin/users', icon: Users },
    { label: '系统设置', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`bg-gray-900 text-white flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {sidebarOpen && (
            <Link to="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-lg font-semibold">管理后台</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${isActive(item.path, item.exact) ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">
                {currentUser?.username.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {currentUser?.username || 'Admin'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {currentUser?.role || '管理员'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors mt-1"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">退出登录</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900">
              {navItems.find(item => isActive(item.path, item.exact))?.label || '工作台'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              查看前台
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
