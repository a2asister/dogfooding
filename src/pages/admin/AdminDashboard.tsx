import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FolderOpen,
  ShoppingCart,
  MessageSquare,
  Users,
  Eye,
  ArrowRight,
  Star
} from 'lucide-react';
import { useAppStore } from '../../store';
import {
  getDailyStats,
  getPortfolios,
  getOrders,
  getChatSessions,
  getReviews,
  getCaseStudies
} from '../../data/services';
import { ORDER_STATUSES } from '../../types';
import type { Order, ChatSession, Review, DailyStats } from '../../types';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = useAppStore(state => state.currentUser);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          statsData,
          ,
          ordersData,
          sessionsData,
          reviewsData,
          
        ] = await Promise.all([
          getDailyStats(),
          getPortfolios({ limit: 5 }),
          getOrders({ limit: 5 }),
          getChatSessions({ limit: 5 }),
          getReviews({ limit: 3 }),
          getCaseStudies({ limit: 3 })
        ]);

        setStats(statsData);
        setOrders(ordersData);
        setSessions(sessionsData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status);
    switch (statusConfig?.color) {
      case 'yellow': return 'bg-yellow-100 text-yellow-700';
      case 'blue': return 'bg-blue-100 text-blue-700';
      case 'purple': return 'bg-purple-100 text-purple-700';
      case 'orange': return 'bg-orange-100 text-orange-700';
      case 'green': return 'bg-green-100 text-green-700';
      case 'red': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    return ORDER_STATUSES.find(s => s.value === status)?.label || status;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              欢迎回来，{currentUser?.username || '设计师'}！
            </h2>
            <p className="text-white">
              {new Date().toLocaleDateString('zh-CN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="hidden md:block">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <span>查看前台</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: Briefcase,
            label: '作品总数',
            value: stats?.totalPortfolios || 0,
            change: '+12%',
            color: 'purple',
            link: '/admin/portfolios'
          },
          {
            icon: Eye,
            label: '总浏览量',
            value: stats?.totalViews?.toLocaleString() || '0',
            change: '+8%',
            color: 'blue',
            link: '/admin/portfolios'
          },
          {
            icon: ShoppingCart,
            label: '订单总数',
            value: stats?.totalOrders || 0,
            change: '+15%',
            color: 'green',
            link: '/admin/orders'
          },
          {
            icon: MessageSquare,
            label: '未读消息',
            value: sessions.reduce((sum, s) => sum + s.unreadCount, 0),
            change: '新消息',
            color: 'pink',
            link: '/admin/messages'
          },
        ].map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm mt-2 text-${stat.color}-600`}>
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Revenue & Orders Chart Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">收益概览</h3>
            <div className="flex items-center space-x-2 text-sm">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">本周</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded cursor-pointer">本月</span>
            </div>
          </div>

          {/* Simple Chart Placeholder */}
          <div className="h-48 flex items-end justify-between space-x-2">
            {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => {
              const heights = [40, 65, 30, 80, 55, 90, 70];
              return (
                <div key={day} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${heights[index]}%` }}
                  />
                  <span className="text-xs text-gray-500 mt-2">{day}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">总收益</p>
              <p className="text-xl font-bold text-gray-900">
                ¥{(stats?.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">已完成订单</p>
              <p className="text-xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'completed').length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">平均客单价</p>
              <p className="text-xl font-bold text-gray-900">
                ¥{stats?.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString() : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">快捷操作</h3>
          <div className="space-y-3">
            {[
              { icon: Briefcase, label: '添加作品', path: '/admin/portfolios', color: 'purple' },
              { icon: FolderOpen, label: '添加案例', path: '/admin/cases', color: 'blue' },
              { icon: ShoppingCart, label: '查看订单', path: '/admin/orders', color: 'green' },
              { icon: MessageSquare, label: '回复消息', path: '/admin/messages', color: 'pink' },
              { icon: Users, label: '账号设置', path: '/admin/users', color: 'orange' },
            ].map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`w-10 h-10 bg-${action.color}-100 rounded-lg flex items-center justify-center`}>
                  <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                </div>
                <span className="text-gray-700 font-medium">{action.label}</span>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders & Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">最近订单</h3>
            <Link
              to="/admin/orders"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              查看全部
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">暂无订单</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.clientName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">¥{order.totalAmount.toLocaleString()}</p>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">最近消息</h3>
            <Link
              to="/admin/messages"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              查看全部
            </Link>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">暂无消息</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.slice(0, 5).map((session) => (
                <Link
                  key={session.id}
                  to="/admin/messages"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {session.participantName.charAt(0)}
                        </span>
                      </div>
                      {session.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {session.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">{session.participantName}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{session.lastMessage}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {new Date(session.lastMessageTime).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Reviews */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">用户评价</h3>
            <Link
              to="/admin/reviews"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              查看全部
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-1 mb-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`w-4 h-4 ${index < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">{review.content}</p>
                <div className="flex items-center space-x-2">
                  <img
                    src={review.clientAvatar || 'https://i.pravatar.cc/32?img=1'}
                    alt={review.clientName}
                    className="w-8 h-8 rounded-full bg-gray-200"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{review.clientName}</p>
                    <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
