import React, { useState } from 'react';
import {
  TrendingUp,
  BedDouble,
  DollarSign,
  Users,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Clock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { useData } from '@/context/DataContext';
import { mockDailyStats } from '@/data/mockData';
import { formatCurrency } from '@/utils';
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
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from 'recharts';

const Analytics: React.FC = () => {
  const { rooms, orders, customers } = useData();
  const [timeRange, setTimeRange] = useState<string>('month');

  const todayStats = mockDailyStats[mockDailyStats.length - 1];

  const timeRangeOptions = [
    { value: 'day', label: '今日' },
    { value: 'week', label: '本周' },
    { value: 'month', label: '本月' },
    { value: 'quarter', label: '本季度' },
  ];

  const getDataByTimeRange = () => {
    switch (timeRange) {
      case 'day':
        return mockDailyStats.slice(-1);
      case 'week':
        return mockDailyStats.slice(-7);
      case 'month':
        return mockDailyStats.slice(-30);
      case 'quarter':
        return mockDailyStats;
      default:
        return mockDailyStats.slice(-30);
    }
  };

  const chartData = getDataByTimeRange();

  const occupancyTrendData = chartData.map(stat => ({
    date: stat.date.slice(5),
    入住率: stat.occupancyRate,
    预订率: stat.bookingRate,
    空房率: 100 - stat.occupancyRate,
  }));

  const revenueTrendData = chartData.map(stat => ({
    date: stat.date.slice(5),
    客房营收: stat.totalRevenue,
    平均房价: stat.avgDailyRate,
  }));

  const roomTypeDistribution = [
    { name: '标准间', value: rooms.filter(r => r.type === 'standard').length, color: '#3b82f6' },
    { name: '大床房', value: rooms.filter(r => r.type === 'king').length, color: '#10b981' },
    { name: '豪华间', value: rooms.filter(r => r.type === 'deluxe').length, color: '#f59e0b' },
    { name: '套房', value: rooms.filter(r => r.type === 'suite').length, color: '#8b5cf6' },
  ];

  const orderChannelData = [
    { name: '线上', value: orders.filter(o => o.channel === 'online').length, color: '#3b82f6' },
    { name: '线下', value: orders.filter(o => o.channel === 'offline').length, color: '#10b981' },
    { name: '第三方', value: orders.filter(o => o.channel === 'third_party').length, color: '#f59e0b' },
  ];

  const customerTypeData = [
    { name: '新客户', value: customers.filter(c => c.type === 'new').length, color: '#3b82f6' },
    { name: '老客户', value: customers.filter(c => c.type === 'regular').length, color: '#10b981' },
    { name: 'VIP客户', value: customers.filter(c => c.type === 'vip').length, color: '#f59e0b' },
  ];

  const totalRevenue = chartData.reduce((sum, stat) => sum + stat.totalRevenue, 0);
  const avgOccupancyRate = Math.round(chartData.reduce((sum, stat) => sum + stat.occupancyRate, 0) / chartData.length);
  const avgDailyRate = Math.round(chartData.reduce((sum, stat) => sum + stat.avgDailyRate, 0) / chartData.length);

  const statsCards = [
    {
      title: '总营收',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: '平均入住率',
      value: `${avgOccupancyRate}%`,
      icon: BedDouble,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: '平均房价',
      value: formatCurrency(avgDailyRate),
      icon: TrendingUp,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      title: '客户总数',
      value: customers.length,
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  const handleExportCSV = () => {
    const exportData = chartData.map(stat => ({
      日期: stat.date,
      总房数: stat.totalRooms,
      已入住: stat.occupiedRooms,
      已预订: stat.bookedRooms,
      空闲: stat.availableRooms,
      入住率: `${stat.occupancyRate}%`,
      预订率: `${stat.bookingRate}%`,
      营收: stat.totalRevenue,
      平均房价: stat.avgDailyRate,
    }));
    alert('数据导出功能已准备就绪（可在系统设置中配置）');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据统计</h1>
          <p className="text-gray-500 mt-1">实时查看酒店运营数据和统计分析</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            options={timeRangeOptions}
            className="w-32"
          />
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>入住率趋势</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <LineChart className="w-4 h-4" />
                <span>趋势分析</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={occupancyTrendData}>
                  <defs>
                    <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e40af" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1e40af" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBooking" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Legend />
                  <Area type="monotone" dataKey="入住率" stroke="#1e40af" fill="url(#colorOccupancy)" strokeWidth={2} />
                  <Area type="monotone" dataKey="预订率" stroke="#64748b" fill="url(#colorBooking)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>营收趋势</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <BarChart3 className="w-4 h-4" />
                <span>营收分析</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrendData}>
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
                    formatter={(value: number) => [formatCurrency(value), '']}
                  />
                  <Legend />
                  <Bar dataKey="客房营收" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="平均房价" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>客房类型分布</CardTitle>
              <PieChart className="w-4 h-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={roomTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {roomTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>订单渠道分布</CardTitle>
              <PieChart className="w-4 h-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={orderChannelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {orderChannelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>客户类型分布</CardTitle>
              <PieChart className="w-4 h-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={customerTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {customerTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">详细统计数据</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">日期</th>
                <th className="px-4 py-3 font-medium">总房数</th>
                <th className="px-4 py-3 font-medium">已入住</th>
                <th className="px-4 py-3 font-medium">已预订</th>
                <th className="px-4 py-3 font-medium">空闲</th>
                <th className="px-4 py-3 font-medium">入住率</th>
                <th className="px-4 py-3 font-medium">营收</th>
                <th className="px-4 py-3 font-medium">平均房价</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {chartData.slice().reverse().slice(0, 10).map((stat, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{stat.date}</td>
                  <td className="px-4 py-3 text-gray-600">{stat.totalRooms}</td>
                  <td className="px-4 py-3 text-gray-600">{stat.occupiedRooms}</td>
                  <td className="px-4 py-3 text-gray-600">{stat.bookedRooms}</td>
                  <td className="px-4 py-3 text-gray-600">{stat.availableRooms}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      stat.occupancyRate >= 70 ? 'bg-green-100 text-green-800' :
                      stat.occupancyRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {stat.occupancyRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(stat.totalRevenue)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatCurrency(stat.avgDailyRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
