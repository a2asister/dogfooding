import { useQuery } from 'react-query'
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Gamepad2, 
  Users, 
  Gift, 
  Download,
  Calendar,
  Filter
} from 'lucide-react'
import axios from 'axios'

interface StatsData {
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
  giftTypes: Array<{
    id: number
    name: string
    giftCount: number
  }>
}

const AdminStatistics = () => {
  const { data, isLoading } = useQuery<StatsData>(
    'adminStatistics',
    async () => {
      const response = await axios.get('/api/statistics/dashboard')
      return response.data.data
    }
  )

  const stats = data?.overview
  const dailyClaims = data?.dailyClaims || []
  const topGifts = data?.topGifts || []
  const topGames = data?.topGames || []
  const giftTypes = data?.giftTypes || []

  const statCards = [
    {
      title: '总礼包数',
      value: stats?.totalGifts || 0,
      subtitle: `活跃: ${stats?.activeGifts || 0}`,
      icon: Package,
      color: 'primary',
    },
    {
      title: '总游戏数',
      value: stats?.totalGames || 0,
      subtitle: `活跃: ${stats?.activeGames || 0}`,
      icon: Gamepad2,
      color: 'success',
    },
    {
      title: '总用户数',
      value: stats?.totalUsers || 0,
      subtitle: `管理员: ${stats?.adminUsers || 0}`,
      icon: Users,
      color: 'warning',
    },
    {
      title: '总领取数',
      value: stats?.totalClaims || 0,
      subtitle: '累计礼包领取',
      icon: Gift,
      color: 'danger',
    },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <BarChart3 className="inline w-7 h-7 mr-2 text-primary-500" />
            数据统计
          </h1>
          <p className="mt-1 text-gray-600">
            查看礼包领取数据统计
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="btn-outline flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            选择日期
          </button>
          <button className="btn-outline flex items-center">
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </button>
        </div>
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
                <div key={index} className="card p-6">
                  <div className={`inline-flex p-3 rounded-lg mb-4 ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {stat.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {stat.subtitle}
                  </p>
                </div>
              )
            })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary-500" />
            领取趋势
          </h2>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : dailyClaims.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              暂无领取数据
            </div>
          ) : (
            <div className="h-64 overflow-x-auto">
              <div className="flex items-end justify-between h-full min-w-max px-2">
                {dailyClaims.slice(-14).map((item, index) => {
                  const maxCount = Math.max(...dailyClaims.map(d => d.count), 1)
                  const height = (item.count / maxCount) * 100
                  return (
                    <div key={index} className="flex flex-col items-center mx-2">
                      <span className="text-xs text-gray-600 mb-2">{item.count}</span>
                      <div
                        className="w-8 bg-primary-500 rounded-t transition-all duration-300 hover:bg-primary-600"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      ></div>
                      <span className="text-xs text-gray-400 mt-2">
                        {item.date?.slice(5) || ''}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-primary-500" />
            礼包类型分布
          </h2>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : giftTypes.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              暂无数据
            </div>
          ) : (
            <div className="space-y-3">
              {giftTypes.map((type, index) => {
                const totalGiftCount = giftTypes.reduce((sum, t) => sum + (t.giftCount || 0), 0)
                const percentage = totalGiftCount > 0 ? ((type.giftCount || 0) / totalGiftCount) * 100 : 0
                const colors = [
                  'bg-primary-500',
                  'bg-success-500',
                  'bg-warning-500',
                  'bg-danger-500',
                  'bg-purple-500',
                  'bg-pink-500',
                ]
                return (
                  <div key={type.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {type.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {type.giftCount || 0} 个礼包
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${colors[index % colors.length]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-primary-500" />
            热门礼包 TOP 10
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
            <div className="py-12 text-center text-gray-500">
              暂无领取数据
            </div>
          ) : (
            <div className="space-y-3">
              {topGifts.slice(0, 10).map((gift, index) => (
                <div
                  key={gift.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : index === 1
                          ? 'bg-gray-200 text-gray-700'
                          : index === 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {gift.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        已领取 {gift.claimedCount || 0}/{gift.totalCount || 0}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-600">
                      {gift.claimCount || 0}
                    </p>
                    <p className="text-xs text-gray-500">次领取</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Gamepad2 className="w-5 h-5 mr-2 text-primary-500" />
            热门游戏 TOP 10
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
            <div className="py-12 text-center text-gray-500">
              暂无游戏数据
            </div>
          ) : (
            <div className="space-y-3">
              {topGames.slice(0, 10).map((game, index) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : index === 1
                          ? 'bg-gray-200 text-gray-700'
                          : index === 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <p className="font-medium text-gray-900">
                      {game.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-600">
                      {game.claimCount || 0}
                    </p>
                    <p className="text-xs text-gray-500">次领取</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminStatistics
