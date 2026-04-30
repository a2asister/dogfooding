import { useEffect, useState } from 'react'
import { TrendingUp, ShoppingCart, DollarSign, Clock, ArrowUpRight, ArrowDownRight, Users, FileText, UtensilsCrossed } from 'lucide-react'
import type { Statistics } from '@/types'
import { statisticsApi } from '@/api/admin'

const mockStatistics: Statistics = {
  todayOrders: 24,
  todayRevenue: 1680,
  totalOrders: 1256,
  totalRevenue: 89600,
  pendingOrders: 3,
  preparingOrders: 5,
  deliveringOrders: 2,
  topProducts: [
    { id: 1, name: '招牌红烧肉套餐', count: 45 },
    { id: 2, name: '广式早茶套餐', count: 38 },
    { id: 3, name: '日式鳗鱼饭', count: 32 },
    { id: 4, name: '黑椒牛排套餐', count: 28 },
    { id: 5, name: '佛跳墙', count: 15 },
  ],
  recentOrders: [],
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Statistics>(mockStatistics)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    setLoading(true)
    try {
      const response = await statisticsApi.getDashboard()
      if (response.data.code === 200) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: '今日订单',
      value: stats.todayOrders,
      icon: ShoppingCart,
      change: '+12%',
      up: true,
      color: 'bg-blue-500',
    },
    {
      title: '今日营收',
      value: `¥${stats.todayRevenue}`,
      icon: DollarSign,
      change: '+8%',
      up: true,
      color: 'bg-green-500',
    },
    {
      title: '总订单数',
      value: stats.totalOrders,
      icon: TrendingUp,
      change: '+5%',
      up: true,
      color: 'bg-purple-500',
    },
    {
      title: '总营收',
      value: `¥${stats.totalRevenue}`,
      icon: DollarSign,
      change: '+10%',
      up: true,
      color: 'bg-orange-500',
    },
  ]

  const orderStatusCards = [
    { title: '待支付', count: stats.pendingOrders, color: 'bg-yellow-100 text-yellow-800' },
    { title: '制作中', count: stats.preparingOrders, color: 'bg-purple-100 text-purple-800' },
    { title: '配送中', count: stats.deliveringOrders, color: 'bg-orange-100 text-orange-800' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <button
          onClick={fetchStatistics}
          disabled={loading}
          className="btn-primary"
        >
          刷新数据
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {card.up ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${card.up ? 'text-green-500' : 'text-red-500'}`}>
                  {card.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">较昨日</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {orderStatusCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.count}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-300" />
            </div>
            <div className={`mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${card.color}`}>
              需要处理
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">热销餐品排行</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      index < 3 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-gray-900">{product.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{product.count}份</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">快速操作</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center cursor-pointer hover:bg-blue-100 transition-colors">
              <UtensilsCrossed className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <span className="text-sm font-medium text-blue-700">添加餐品</span>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center cursor-pointer hover:bg-green-100 transition-colors">
              <ShoppingCart className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <span className="text-sm font-medium text-green-700">处理订单</span>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center cursor-pointer hover:bg-purple-100 transition-colors">
              <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <span className="text-sm font-medium text-purple-700">用户管理</span>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg text-center cursor-pointer hover:bg-orange-100 transition-colors">
              <FileText className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <span className="text-sm font-medium text-orange-700">操作日志</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
