import { useQuery } from 'react-query'
import { Gift, Gamepad2, Trophy, TrendingUp } from 'lucide-react'
import axios from 'axios'
import { Link } from 'react-router-dom'

interface GiftItem {
  id: number
  name: string
  description: string
  icon: string | null
  totalCount: number
  claimedCount: number
  game: {
    id: number
    name: string
  }
  type: {
    id: number
    name: string
  }
}

interface GameItem {
  id: number
  name: string
  icon: string | null
  description: string
  category: {
    id: number
    name: string
  }
}

interface Stats {
  totalGifts: number
  totalGames: number
  totalClaims: number
  todayClaims: number
}

const Home = () => {
  const { data: gifts, isLoading: giftsLoading } = useQuery<GiftItem[]>(
    'featuredGifts',
    async () => {
      const response = await axios.get('/api/gifts/featured')
      return response.data
    }
  )

  const { data: games, isLoading: gamesLoading } = useQuery<GameItem[]>(
    'featuredGames',
    async () => {
      const response = await axios.get('/api/games/featured')
      return response.data
    }
  )

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>(
    'stats',
    async () => {
      const response = await axios.get('/api/statistics/overview')
      return response.data
    }
  )

  const statsCards = [
    {
      title: '可用礼包',
      value: stats?.totalGifts || 0,
      icon: Gift,
      color: 'primary',
    },
    {
      title: '游戏数量',
      value: stats?.totalGames || 0,
      icon: Gamepad2,
      color: 'success',
    },
    {
      title: '累计领取',
      value: stats?.totalClaims || 0,
      icon: Trophy,
      color: 'warning',
    },
    {
      title: '今日领取',
      value: stats?.todayClaims || 0,
      icon: TrendingUp,
      color: 'danger',
    },
  ]

  const getRemaining = (total: number, claimed: number) => {
    const remaining = total - claimed
    return remaining > 0 ? remaining : 0
  }

  return (
    <div className="container-page">
      <section className="mb-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 to-primary-700 p-8 md:p-12 text-white">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              游戏礼包中心
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-6 max-w-2xl">
              一站式游戏礼包管理平台，海量游戏礼包等你领取，支持手机号验证、领取记录查询、礼包激活使用
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/games"
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                浏览游戏
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                登录领取
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white bg-opacity-5 rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white bg-opacity-5 rounded-full -ml-32 -mb-32" />
        </div>
      </section>

      <section className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {statsLoading ? (
            Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg mb-4" />
                  <div className="h-8 w-20 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-16 bg-gray-100 rounded" />
                </div>
              ))
          ) : (
            statsCards.map((stat, index) => {
              const Icon = stat.icon
              const colorClasses = {
                primary: 'bg-primary-50 text-primary-600',
                success: 'bg-success-50 text-success-600',
                warning: 'bg-warning-50 text-warning-600',
                danger: 'bg-danger-50 text-danger-600',
              }
              return (
                <div key={index} className="card p-6 card-hover">
                  <div
                    className={`inline-flex p-3 rounded-lg mb-4 ${colorClasses[stat.color as keyof typeof colorClasses]}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              )
            })
          )}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="title-section mb-0">热门礼包</h2>
          <Link
            to="/games"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
          >
            查看全部
            <Gift className="w-4 h-4 ml-1" />
          </Link>
        </div>
        {giftsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
                    <div className="h-4 bg-gray-100 rounded mb-4 w-full" />
                    <div className="flex justify-between">
                      <div className="h-4 w-20 bg-gray-100 rounded" />
                      <div className="h-4 w-16 bg-gray-100 rounded" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : gifts && gifts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gifts.map((gift) => (
              <Link
                key={gift.id}
                to={`/gifts/${gift.id}`}
                className="card overflow-hidden card-hover group"
              >
                <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  {gift.icon ? (
                    <img
                      src={gift.icon}
                      alt={gift.name}
                      className="w-24 h-24 object-contain"
                    />
                  ) : (
                    <Gift className="w-16 h-16 text-primary-500" />
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="badge badge-primary">
                      {gift.type.name}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {gift.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {gift.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{gift.game.name}</span>
                    <span className="text-primary-600 font-medium">
                      剩余: {getRemaining(gift.totalCount, gift.claimedCount)}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            (gift.claimedCount / gift.totalCount) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      已领取 {gift.claimedCount}/{gift.totalCount}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无可用礼包</p>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="title-section mb-0">热门游戏</h2>
          <Link
            to="/games"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
          >
            查看全部
            <Gamepad2 className="w-4 h-4 ml-1" />
          </Link>
        </div>
        {gamesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-32 bg-gray-200" />
                  <div className="p-3">
                    <div className="h-4 bg-gray-200 rounded mb-1" />
                    <div className="h-3 w-16 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
          </div>
        ) : games && games.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {games.map((game) => (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="card overflow-hidden card-hover group"
              >
                <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  {game.icon ? (
                    <img
                      src={game.icon}
                      alt={game.name}
                      className="w-20 h-20 object-contain"
                    />
                  ) : (
                    <Gamepad2 className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-primary-600 transition-colors truncate">
                    {game.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {game.category.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <Gamepad2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无游戏</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
