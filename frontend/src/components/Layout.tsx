import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { 
  Gift, 
  Gamepad2, 
  User, 
  LogIn, 
  LogOut, 
  Menu, 
  X,
  Settings,
  BarChart3,
  Users,
  Package,
  LayoutDashboard,
  FileText
} from 'lucide-react'
import { useState } from 'react'

const Layout = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const navLinks = [
    { path: '/', label: '首页', icon: Gift },
    { path: '/games', label: '游戏', icon: Gamepad2 },
  ]

  const adminNavLinks = [
    { path: '/admin/dashboard', label: '仪表盘', icon: LayoutDashboard },
    { path: '/admin/gifts', label: '礼包管理', icon: Package },
    { path: '/admin/games', label: '游戏管理', icon: Gamepad2 },
    { path: '/admin/users', label: '用户管理', icon: Users },
    { path: '/admin/statistics', label: '数据统计', icon: BarChart3 },
    { path: '/admin/logs', label: '日志管理', icon: FileText },
  ]

  const isAdminPage = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen bg-gray-50">
      {isAdminPage && isAdmin ? (
        <>
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
            <div className="flex items-center h-16 px-6 border-b border-gray-200">
              <Gift className="w-8 h-8 text-primary-500" />
              <span className="ml-3 text-lg font-bold text-gray-900">运营后台</span>
            </div>
            <nav className="p-4 space-y-1">
              {adminNavLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive(link.path)
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <Link
                to="/"
                className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5 mr-3" />
                返回前台
              </Link>
            </div>
          </aside>
          <main className="ml-64">
            <header className="h-16 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between h-full px-6">
                <h1 className="text-lg font-semibold text-gray-900">
                  {adminNavLinks.find(l => isActive(l.path))?.label || '运营后台'}
                </h1>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    管理员：{user?.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    退出
                  </button>
                </div>
              </div>
            </header>
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </>
      ) : (
        <>
          <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="container-page py-0">
              <div className="flex items-center justify-between h-16">
                <Link to="/" className="flex items-center">
                  <Gift className="w-8 h-8 text-primary-500" />
                  <span className="ml-2 text-xl font-bold text-gray-900">游戏礼包中心</span>
                </Link>

                <nav className="hidden md:flex items-center space-x-8">
                  {navLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center text-sm font-medium transition-colors ${
                          isActive(link.path)
                            ? 'text-primary-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-1.5" />
                        {link.label}
                      </Link>
                    )
                  })}
                  {isAuthenticated && (
                    <Link
                      to="/my-gifts"
                      className={`flex items-center text-sm font-medium transition-colors ${
                        isActive('/my-gifts')
                          ? 'text-primary-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Package className="w-4 h-4 mr-1.5" />
                      我的礼包
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-1.5" />
                      运营后台
                    </Link>
                  )}
                </nav>

                <div className="hidden md:flex items-center space-x-4">
                  {isAuthenticated ? (
                    <div className="relative">
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-600" />
                        </div>
                        <span>{user?.username}</span>
                      </button>
                      {userMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setUserMenuOpen(false)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                            <Link
                              to="/my-gifts"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              我的礼包
                            </Link>
                            <hr className="my-1" />
                            <button
                              onClick={handleLogout}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              退出登录
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <LogIn className="w-4 h-4 mr-1.5" />
                        登录
                      </Link>
                      <Link
                        to="/register"
                        className="btn-primary"
                      >
                        注册
                      </Link>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </header>

          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
              <div className="fixed inset-y-0 left-0 w-64 bg-white">
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                  <Link to="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                    <Gift className="w-8 h-8 text-primary-500" />
                    <span className="ml-2 text-lg font-bold text-gray-900">游戏礼包中心</span>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="p-4 space-y-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive(link.path)
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {link.label}
                      </Link>
                    )
                  })}
                  {isAuthenticated && (
                    <>
                      <Link
                        to="/my-gifts"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive('/my-gifts')
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Package className="w-5 h-5 mr-3" />
                        我的礼包
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-sm font-medium text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <Settings className="w-5 h-5 mr-3" />
                      运营后台
                    </Link>
                  )}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                          {user?.phone && (
                            <p className="text-xs text-gray-500">{user.phone}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout()
                          setMobileMenuOpen(false)
                        }}
                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-1.5" />
                        退出登录
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <LogIn className="w-4 h-4 mr-1.5" />
                        登录
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full btn-primary"
                      >
                        注册
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <main>
            <Outlet />
          </main>

          <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="container-page py-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <Gift className="w-6 h-6 text-primary-500" />
                  <span className="ml-2 text-sm font-semibold text-gray-900">游戏礼包中心</span>
                </div>
                <p className="text-sm text-gray-500">
                  © 2024 游戏礼包中心. 保留所有权利.
                </p>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  )
}

export default Layout
