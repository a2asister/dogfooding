import React from 'react';
import { Link } from 'react-router-dom';
import {
  BedDouble,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useData } from '@/context/DataContext';
import { mockDailyStats } from '@/data/mockData';
import { formatCurrency, getRoomStatusName, getOrderStatusName, getOrderStatusColor, getRoomStatusDot } from '@/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const Dashboard: React.FC = () => {
  const { rooms, orders, customers } = useData();

  const todayStats = mockDailyStats[mockDailyStats.length - 1];

  const statsCards = [
    {
      title: '今日入住率',
      value: `${todayStats.occupancyRate}%`,
      change: '+2.5%',
      trend: 'up' as const,
      icon: BedDouble,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: '今日订单',
      value: todayStats.checkIns + todayStats.checkOuts,
      change: '+3笔',
      trend: 'up' as const,
      icon: ShoppingCart,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: '今日营收',
      value: formatCurrency(todayStats.totalRevenue),
      change: '+15%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      title: '在住客户',
      value: todayStats.occupiedRooms,
      change: '无变化',
      trend: 'neutral' as const,
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  const roomStatusCounts = {
    available: rooms.filter(r => r.status === 'available').length,
    booked: rooms.filter(r => r.status === 'booked').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  const recentOrders = orders.slice(0, 5);

  const occupancyData = mockDailyStats.slice(-14).map(stat => ({
    date: stat.date.slice(5),
    入住率: stat.occupancyRate,
    预订率: stat.bookingRate,
  }));

  const revenueData = mockDailyStats.slice(-7).map(stat => ({
    date: stat.date.slice(5),
    营收: stat.totalRevenue,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
          <p className="text-gray-500 mt-1">欢迎回来，查看今日运营概况</p>
        </div>
        <Button variant="primary">
          <ShoppingCart className="w-4 h-4 mr-2" />
          新建订单
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className={`text-sm mt-2 ${
                  stat.trend === 'up' ? 'text-green-600' : 
                  stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-4 h-4 inline mr-1" /> : null}
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>客房状态概览</CardTitle>
              <Link to="/rooms" className="text-primary text-sm hover:underline flex items-center">
                查看全部 <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4 mb-6">
              {Object.entries(roomStatusCounts).map(([status, count]) => (
                <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${getRoomStatusDot(status as any)}`}></div>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-500">{getRoomStatusName(status as any)}</p>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {rooms.filter(r => r.status === 'occupied').slice(0, 6).map(room => (
                <div key={room.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-blue-900">{room.roomNumber}</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {room.type === 'standard' ? '标准' : room.type === 'king' ? '大床' : room.type === 'deluxe' ? '豪华' : '套房'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近订单</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map(order => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusName(order.status)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>入住率趋势（近14天）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Line type="monotone" dataKey="入住率" stroke="#1e40af" strokeWidth={2} dot={{ fill: '#1e40af' }} />
                  <Line type="monotone" dataKey="预订率" stroke="#64748b" strokeWidth={2} dot={{ fill: '#64748b' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>营收趋势（近7天）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: number) => [formatCurrency(value), '营收']}
                  />
                  <Bar dataKey="营收" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>今日待办</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900">待确认订单</p>
                  <p className="text-sm text-gray-500">{orders.filter(o => o.status === 'pending').length} 笔</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-gray-900">今日入住</p>
                  <p className="text-sm text-gray-500">{todayStats.checkIns} 位客人</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <XCircle className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">今日退房</p>
                  <p className="text-sm text-gray-500">{todayStats.checkOuts} 位客人</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>VIP客户</CardTitle>
              <Link to="/customers" className="text-primary text-sm hover:underline flex items-center">
                查看全部 <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">客户姓名</th>
                    <th className="pb-3 font-medium">电话</th>
                    <th className="pb-3 font-medium">入住次数</th>
                    <th className="pb-3 font-medium">累计消费</th>
                    <th className="pb-3 font-medium">上次入住</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.filter(c => c.type === 'vip').map(customer => (
                    <tr key={customer.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-yellow-600 font-medium text-sm">{customer.name[0]}</span>
                          </div>
                          <span className="font-medium text-gray-900">{customer.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-600">{customer.phone}</td>
                      <td className="py-3 text-gray-600">{customer.totalStays} 次</td>
                      <td className="py-3 font-medium text-gray-900">{formatCurrency(customer.totalSpent)}</td>
                      <td className="py-3 text-gray-500">{customer.lastStayDate || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
