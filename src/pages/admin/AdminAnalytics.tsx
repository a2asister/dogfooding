import React, { useEffect, useState } from 'react';
import {
  Eye,
  ShoppingCart,
  DollarSign,
  Users,
  ChevronDown,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Star
} from 'lucide-react';
import {
  getDailyStats,
  getPortfolios,
  getOrders,
  getReviews
} from '../../data/services';
import { ORDER_STATUSES } from '../../types';
import type { Portfolio, Order, Review, DailyStats } from '../../types';

const AdminAnalytics: React.FC = () => {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, portfoliosData, ordersData, reviewsData] = await Promise.all([
          getDailyStats(),
          getPortfolios(),
          getOrders(),
          getReviews()
        ]);

        setStats(statsData);
        setPortfolios(portfoliosData);
        setOrders(ordersData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getOrderStatusCounts = () => {
    const counts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      review: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0
    };
    orders.forEach(order => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return counts;
  };

  const getRatingDistribution = () => {
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => distribution[r.rating]++);
    return distribution;
  };

  const getTopPortfolios = () => {
    return [...portfolios]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5);
  };

  const getMonthlyRevenue = () => {
    const now = Date.now();
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const paidOrders = orders.filter(o =>
      o.paymentStatus === 'paid' && o.createdAt >= oneMonthAgo
    );
    return paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  };

  const getRecentOrders = () => {
    return [...orders]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
  };

  const orderStatusCounts = getOrderStatusCounts();
  const ratingDistribution = getRatingDistribution();
  const topPortfolios = getTopPortfolios();
  const monthlyRevenue = getMonthlyRevenue();
  const recentOrders = getRecentOrders();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">数据统计</h2>
          <p className="text-gray-500 mt-1">实时监控业务数据，掌握运营状况</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="week">本周</option>
              <option value="month">本月</option>
              <option value="year">本年</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: Eye,
            label: '总浏览量',
            value: stats?.totalViews?.toLocaleString() || '0',
            change: '+12.5%',
            trending: 'up',
            color: 'purple'
          },
          {
            icon: ShoppingCart,
            label: '订单总数',
            value: stats?.totalOrders || 0,
            change: '+8.2%',
            trending: 'up',
            color: 'blue'
          },
          {
            icon: DollarSign,
            label: '总收益',
            value: `¥${(stats?.totalRevenue || 0).toLocaleString()}`,
            change: '+15.3%',
            trending: 'up',
            color: 'green'
          },
          {
            icon: Users,
            label: '评价总数',
            value: stats?.totalReviews || 0,
            change: '+5.8%',
            trending: 'up',
            color: 'orange'
          }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                stat.trending === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trending === 'up' ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span>{stat.change}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">收益趋势</h3>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 text-sm bg-purple-100 text-purple-600 rounded-lg">订单收入</span>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="h-64 flex items-end justify-between space-x-2">
            {['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'].map((month, index) => {
              const heights = [65, 45, 78, 55, 85, 60, 92, 70, 80, 95, 75, 88];
              const maxHeight = 100;
              const height = heights[index];
              const revenue = Math.round(height * 100);

              return (
                <div key={month} className="flex-1 flex flex-col items-center group">
                  <div className="relative mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded">
                      ¥{revenue.toLocaleString()}
                    </div>
                    <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${(height / maxHeight) * 100}%`, minHeight: '4px' }}
                  />
                  <span className="text-xs text-gray-500 mt-2">{month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">订单状态分布</h3>

          {/* Simple Circle Chart */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="12"
                  strokeDasharray={`${orderStatusCounts.completed * 100 / Math.max(orders.length, 1)} ${100}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                <p className="text-sm text-gray-500">总订单</p>
              </div>
            </div>
          </div>

          {/* Status List */}
          <div className="space-y-3">
            {ORDER_STATUSES.map((status) => {
              const count = orderStatusCounts[status.value] || 0;
              const percentage = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;

              const getStatusColor = (color: string) => {
                switch (color) {
                  case 'yellow': return 'bg-yellow-500';
                  case 'blue': return 'bg-blue-500';
                  case 'purple': return 'bg-purple-500';
                  case 'orange': return 'bg-orange-500';
                  case 'green': return 'bg-green-500';
                  case 'red': return 'bg-red-500';
                  default: return 'bg-gray-500';
                }
              };

              return (
                <div key={status.value} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status.color)}`} />
                    <span className="text-sm text-gray-600">{status.label}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                    <span className="text-xs text-gray-400">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Portfolios */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">热门作品</h3>
            <span className="text-sm text-gray-500">按浏览量排序</span>
          </div>

          <div className="space-y-4">
            {topPortfolios.length > 0 ? topPortfolios.map((portfolio, index) => (
              <div key={portfolio.id} className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-600' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {portfolio.images[0] ? (
                    <img src={portfolio.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Eye className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{portfolio.title}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{portfolio.viewCount.toLocaleString()} 浏览</span>
                    <span>{portfolio.likeCount.toLocaleString()} 喜欢</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-green-600">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {Math.round((portfolio.viewCount / Math.max(...portfolios.map(p => p.viewCount), 1)) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">占比</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">暂无作品数据</p>
              </div>
            )}
          </div>
        </div>

        {/* Rating Distribution & Recent Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">评价分布</h3>

          <div className="space-y-3 mb-8">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = ratingDistribution[rating];
              const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;

              return (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-12">
                    <Star className={`w-4 h-4 ${rating > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    <span className="text-sm text-gray-600">{rating}</span>
                  </div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                    <span className="text-xs text-gray-400 ml-1">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-900 mb-4">最近订单</h4>
            <div className="space-y-3">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">¥{order.totalAmount.toLocaleString()}</span>
                </div>
              )) : (
                <p className="text-center text-gray-500 text-sm py-4">暂无订单</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">收益明细</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
            <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">¥{(stats?.totalRevenue || 0).toLocaleString()}</p>
            <p className="text-sm text-gray-500">总收益</p>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
            <ShoppingCart className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'completed').length}</p>
            <p className="text-sm text-gray-500">已完成订单</p>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
            <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">¥{monthlyRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-500">本月收益</p>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
            <DollarSign className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              ¥{orders.length > 0 ? Math.round(stats?.totalRevenue / orders.length).toLocaleString() : 0}
            </p>
            <p className="text-sm text-gray-500">平均客单价</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
