import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Search,
  User,
  LogOut,
  Menu,
  ChevronDown,
  Plus,
  Cloud,
  CloudOff,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useQuery } from 'react-query'
import { syncApi } from '../lib/api'
import { cn } from '../lib/utils'

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: syncStatus } = useQuery('syncStatus', () => syncApi.getStatus(), {
    refetchInterval: 30000,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleCreateNote = () => {
    navigate('/notes/new')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isSearchPage = location.pathname === '/search'

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>

        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索笔记..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'pl-10 pr-4 py-2 w-64 border border-slate-200 rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'transition-all placeholder:text-slate-400'
            )}
          />
        </form>
      </div>

      <div className="flex items-center gap-3">
        {syncStatus && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            {syncStatus.data.pending > 0 ? (
              <>
                <CloudOff className="w-4 h-4 text-amber-500" />
                <span>{syncStatus.data.pending} 条待同步</span>
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4 text-emerald-500" />
                <span>已同步</span>
              </>
            )}
          </div>
        )}

        <button
          onClick={handleCreateNote}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'bg-primary-600 text-white hover:bg-primary-700',
            'transition-colors font-medium text-sm'
          )}
        >
          <Plus className="w-4 h-4" />
          新建笔记
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-700">
              {user?.username}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900">{user?.username}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
