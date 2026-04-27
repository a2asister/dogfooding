import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, User, Briefcase, FolderOpen, MessageSquare, Settings, Bell, Menu, X, Search } from 'lucide-react';
import { useAppStore } from '../store';

interface HeaderProps {
  isAdmin?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAdmin = false }) => {
  const navigate = useNavigate();
  const mobileMenuOpen = useAppStore(state => state.mobileMenuOpen);
  const setMobileMenuOpen = useAppStore(state => state.setMobileMenuOpen);
  const unreadMessageCount = useAppStore(state => state.unreadMessageCount);
  const currentUser = useAppStore(state => state.currentUser);
  const isAuthenticated = useAppStore(state => state.isAuthenticated);

  const publicNavItems = [
    { label: '首页', path: '/', icon: Home },
    { label: '作品', path: '/portfolio', icon: Briefcase },
    { label: '案例', path: '/cases', icon: FolderOpen },
    { label: '素材', path: '/materials', icon: FolderOpen },
    { label: '关于我', path: '/about', icon: User },
  ];

  const adminNavItems = [
    { label: '工作台', path: '/admin', icon: Home },
    { label: '作品管理', path: '/admin/portfolios', icon: Briefcase },
    { label: '案例管理', path: '/admin/cases', icon: FolderOpen },
    { label: '订单管理', path: '/admin/orders', icon: FolderOpen },
    { label: '素材管理', path: '/admin/materials', icon: FolderOpen },
    { label: '消息中心', path: '/admin/messages', icon: MessageSquare },
    { label: '数据统计', path: '/admin/analytics', icon: Settings },
    { label: '账号管理', path: '/admin/users', icon: User },
  ];

  const navItems = isAdmin ? adminNavItems : publicNavItems;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isAdmin ? '/admin' : '/'} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">
              {isAdmin ? '设计师后台' : '设计工作室'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            {!isAdmin && (
              <button className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors">
                <Search className="w-4 h-4" />
                <span className="text-sm">搜索...</span>
              </button>
            )}

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {unreadMessageCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadMessageCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated && currentUser ? (
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={() => navigate(isAdmin ? '/admin/profile' : '/profile')}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700">{currentUser.username}</span>
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  登录
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  注册
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
