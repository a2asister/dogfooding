import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Gamepad2,
  Users,
  Gift,
  TrendingUp,
  BarChart3,
  FileText,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'
import axios from 'axios'

interface DashboardStats {
  overview: {
    totalGifts: number
    activeGifts: number
    totalGames: number
    activeGames: number
    totalUsers: number
    adminUsers: number
    totalClaims: number
  }
  dailyClaims: Array<{
    date: string
    count: number
  }>
  topGifts: Array<{
    id: number
    name: string
    claimCount: number
    totalCount: number
    claimedCount: number
  }>
  topGames: Array<{
    id: number
    name: string
    claimCount: number
  }>
}

const AdminDashboard = () => {
  const { data, isLoading } = useQuery<DashboardStats>(
    'adminDashboard',
    async () => {
      const response = await axios.get('/api/statistics/dashboard')
      return response.data.data
    }
  )

  const stats = data?.overview
  const topGifts = data?.topGifts || []
  const topGames = data?.topGames || []

  const statCards = [
    {
      title: '总礼包数',
      value: stats?.totalGifts || 0,
      change: `(${stats?.activeGifts || 0} 个活跃)`,
      icon: Package,
      color: 'primary',
      link: '/admin/gifts',
    },
    {
      title: '总游戏数',
      value: stats?.totalGames || 0,
      change: `(${stats?.activeGames || 0} 个活跃)`,
      icon: Gamepad2,
      color: 'success',
      link: '/admin/games',
    },
    {
      title: '总用户数',
      value: stats?.totalUsers || 0,
      change: `(${stats?.adminUsers || 0} 个管理员)`,
      icon: Users,
      color: 'warning',
      link: '/admin/users',
    },
    {
      title: '总领取数',
      value: stats?.totalClaims || 0,
      change: '累计礼包领取',
      icon: Gift,
      color: 'danger',
      link: '/admin/statistics',
    },
  ]

  const quickLinks = [
    {
      title: '礼包管理',
      description: '创建和管理游戏礼包',
      icon: Package,
      link: '/admin/gifts',
    },
    {
      title: '游戏管理',
      description: '管理游戏和分类',
      icon: Gamepad2,
      link: '/admin/games',
    },
    {
      title: '用户管理',
      description: '查看和管理用户',
      icon: Users,
      link: '/admin/users',
    },
    {
      title: '数据统计',
      description: '查看领取数据',
      icon: BarChart3,
      link: '/admin/statistics',
    },
    {
      title: '日志管理',
      description: '查看系统日志',
      icon: FileText,
      link: '/admin/logs',
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          <LayoutDashboard className="inline w-7 h-7 mr-2 text-primary-500" />
          运营仪表盘
        </h1>
        <p className="mt-1 text-gray-600">
          查看游戏礼包中心运营数据
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-24 bg-gray-100 rounded"></div>
                </div>
              ))
          : statCards.map((stat, index) => {
              const Icon = stat.icon
              const colorClasses = {
                primary: 'bg-primary-50 text-primary-600',
                success: 'bg-success-50 text-success-600',
                warning: 'bg-warning-50 text-warning-600',
                danger: 'bg-danger-50 text-danger-600',
              }
              return (
                <Link
                  key={index}
                  to={stat.link}
                  className="card p-6 card-hover group"
                >
                  <div
                    className={`inline-flex p-3 rounded-lg mb-4 ${colorClasses[stat.color as keyof typeof colorClasses]}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {stat.title}
                    <span className="ml-1 text-gray-400">
                      {stat.change}
                    </span>
                  </p>
                  <div className="mt-4 text-sm text-primary-600 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    查看详情 <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              )
            })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary-500" />
            热门礼包
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
            </div>
          ) : topGifts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              暂无领取数据
            </p>
          ) : (
            <div className="space-y-3">
              {topGifts.slice(0, 5).map((gift, index) => (
                <Link
                  key={gift.id}
                  to="/admin/gifts"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : index === 1
                          ? 'bg-gray-100 text-gray-700'
                          : index === 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{gift.name}</p>
                      <p className="text-xs text-gray-500">
                        已领取 {gift.claimedCount}/{gift.totalCount}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-600">
                      {gift.claimCount}
                    </p>
                    <p className="text-xs text-gray-500">次领取</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <Link
            to="/admin/statistics"
            className="mt-4 text-sm text-primary-600 hover:text-primary-700 flex items-center justify-center"
          >
            查看更多 <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Gamepad2 className="w-5 h-5 mr-2 text-primary-500" />
            热门游戏
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
            </div>
          ) : topGames.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              暂无游戏数据
            </p>
          ) : (
            <div className="space-y-3">
              {topGames.slice(0, 5).map((game, index) => (
                <Link
                  key={game.id}
                  to="/admin/games"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : index === 1
                          ? 'bg-gray-100 text-gray-700'
                          : index === 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <p className="font-medium text-gray-900">{game.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-600">
                      {game.claimCount}
                    </p>
                    <p className="text-xs text-gray-500">次领取</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <Link
            to="/admin/statistics"
            className="mt-4 text-sm text-primary-600 hover:text-primary-700 flex items-center justify-center"
          >
            查看更多 <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickLinks.map((link, index) => {
            const Icon = link.icon
            return (
              <Link
                key={index}
                to={link.link}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
              >
                <Icon className="w-8 h-8 mx-auto mb-2 text-primary-500" />
                <p className="font-medium text-gray-900">{link.title}</p>
                <p className="text-xs text-gray-500 mt-1">{link.description}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
