import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { Home, UtensilsCrossed, ShoppingCart, ClipboardList, User, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore, selectTotalItems } from '@/stores/cartStore'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const totalItems = useCartStore(selectTotalItems)

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/menu', icon: UtensilsCrossed, label: '菜单' },
    { path: '/cart', icon: ShoppingCart, label: '购物车', badge: totalItems },
    { path: '/orders', icon: ClipboardList, label: '订单' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <UtensilsCrossed className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-gray-900">酒店订餐中心</span>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.name || user?.username}</span>
                {user?.roomNumber && (
                  <span className="text-sm text-gray-500">({user.roomNumber}房)</span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500"
              >
                <LogOut className="h-4 w-4" />
                <span>退出</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 py-3 border-b-2 ${
                    isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
