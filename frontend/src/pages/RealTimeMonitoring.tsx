import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Activity, 
  AlertTriangle, 
  Droplets, 
  MapPin, 
  TrendingUp, 
  Filter, 
  Search 
} from 'lucide-react';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import { cn } from '../utils/cn';
import { monitoringPointApi, alertApi } from '../services/api';

const mockWaterQualityData = [
  { time: '00:00', ph: 7.2, temperature: 18.5, turbidity: 3.2, dissolvedOxygen: 8.1 },
  { time: '04:00', ph: 7.1, temperature: 17.8, turbidity: 2.8, dissolvedOxygen: 7.9 },
  { time: '08:00', ph: 7.3, temperature: 19.2, turbidity: 3.5, dissolvedOxygen: 8.3 },
  { time: '12:00', ph: 7.4, temperature: 21.5, turbidity: 4.1, dissolvedOxygen: 8.5 },
  { time: '16:00', ph: 7.2, temperature: 20.8, turbidity: 3.8, dissolvedOxygen: 8.2 },
  { time: '20:00', ph: 7.1, temperature: 19.5, turbidity: 3.4, dissolvedOxygen: 8.0 },
  { time: '24:00', ph: 7.0, temperature: 18.2, turbidity: 3.0, dissolvedOxygen: 7.8 },
];

const mockPollutionDistribution = [
  { name: '漂浮垃圾', value: 35, color: '#ef4444' },
  { name: '化学污染', value: 15, color: '#f59e0b' },
  { name: '悬浮物', value: 20, color: '#3b82f6' },
  { name: '藻类爆发', value: 10, color: '#10b981' },
  { name: '其他', value: 20, color: '#6366f1' },
];

const mockMonitoringPoints = [
  { id: 1, name: '北京通州监测点', status: 'normal', lat: 39.9042, lng: 116.4074, lastUpdate: '5分钟前' },
  { id: 2, name: '天津武清监测点', status: 'warning', lat: 39.4000, lng: 117.0000, lastUpdate: '3分钟前' },
  { id: 3, name: '河北沧州监测点', status: 'normal', lat: 38.3000, lng: 116.8300, lastUpdate: '8分钟前' },
  { id: 4, name: '山东德州监测点', status: 'danger', lat: 37.4500, lng: 116.2900, lastUpdate: '1分钟前' },
  { id: 5, name: '江苏淮安监测点', status: 'normal', lat: 33.5000, lng: 119.0200, lastUpdate: '10分钟前' },
  { id: 6, name: '浙江杭州监测点', status: 'normal', lat: 30.2500, lng: 120.1500, lastUpdate: '6分钟前' },
];

const mockAlerts = [
  { id: 1, type: 'danger', message: '山东德州监测点检测到漂浮垃圾污染', time: '2024-01-15 14:23:15', level: 'high' },
  { id: 2, type: 'warning', message: '天津武清监测点水质浊度超标', time: '2024-01-15 14:18:00', level: 'medium' },
  { id: 3, type: 'info', message: '北京通州监测点设备正常运行', time: '2024-01-15 14:00:00', level: 'low' },
  { id: 4, type: 'warning', message: '江苏淮安监测点溶解氧略低', time: '2024-01-15 13:45:20', level: 'medium' },
];

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, trend, trendDirection = 'down' }) => (
  <Card className="flex items-center gap-4">
    <div className={cn(
      'p-3 rounded-lg',
      trendDirection === 'up' ? 'bg-red-500/20' : 'bg-green-500/20'
    )}>
      <Icon className={cn(
        'w-6 h-6',
        trendDirection === 'up' ? 'text-red-400' : 'text-green-400'
      )} />
    </div>
    <div>
      <p className="text-slate-400 text-sm">{title}</p>
      <div className="flex items-center gap-2">
        <p className="text-2xl font-bold text-white">{value}</p>
        {trend && (
          <span className={cn(
            'text-xs font-medium',
            trendDirection === 'up' ? 'text-red-400' : 'text-green-400'
          )}>
            {trendDirection === 'up' ? '↑' : '↓'} {trend}%
          </span>
        )}
      </div>
    </div>
  </Card>
);

const RealTimeMonitoring: React.FC = () => {
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredAlerts = mockAlerts.filter(alert =>
    alert.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await monitoringPointApi.getStatistics();
        await alertApi.getStatistics();
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">实时监控</h1>
          <p className="text-slate-400 text-sm mt-1">实时监测京杭大运河各点位水质状态</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          title="总监测点数"
          value="6"
          trend="0"
          trendDirection="down"
        />
        <StatCard
          icon={AlertTriangle}
          title="今日预警数"
          value="2"
          trend="15"
          trendDirection="up"
        />
        <StatCard
          icon={Droplets}
          title="水质达标率"
          value="83.3%"
          trend="5.2"
          trendDirection="down"
        />
        <StatCard
          icon={TrendingUp}
          title="数据采集频率"
          value="1s/次"
          trend="0"
          trendDirection="down"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">实时水质监测趋势</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select className="bg-dark border border-dark-light rounded px-2 py-1 text-sm">
                <option>24小时</option>
                <option>7天</option>
                <option>30天</option>
              </select>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockWaterQualityData}>
                <defs>
                  <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="ph"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorPh)"
                  name="pH值"
                />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorTemp)"
                  name="温度(°C)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">污染类型分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockPollutionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockPollutionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {mockPollutionDistribution.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-slate-400">{item.name}</span>
                <span className="ml-auto font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">监测点位状态</h3>
            <button className="text-primary text-sm hover:underline">查看全部</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-light">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">监测点名称</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">状态</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">最后更新</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">操作</th>
                </tr>
              </thead>
              <tbody>
                {mockMonitoringPoints.map((point) => (
                  <tr
                    key={point.id}
                    className={cn(
                      'border-b border-dark-light hover:bg-dark cursor-pointer transition-colors',
                      activePoint === point.id ? 'bg-dark' : ''
                    )}
                    onClick={() => setActivePoint(point.id)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{point.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={point.status as 'normal' | 'warning' | 'danger'} />
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-sm">{point.lastUpdate}</td>
                    <td className="py-3 px-4">
                      <button className="text-primary hover:underline text-sm">详情</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">实时预警</h3>
            <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-medium">
              {mockAlerts.length} 条
            </span>
          </div>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索预警信息..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark border border-dark-light rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'p-3 rounded-lg border-l-4',
                  alert.type === 'danger'
                    ? 'bg-red-500/10 border-red-500'
                    : alert.type === 'warning'
                    ? 'bg-yellow-500/10 border-yellow-500'
                    : 'bg-blue-500/10 border-blue-500'
                )}
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <AlertTriangle className={cn(
                    'w-4 h-4',
                    alert.type === 'danger'
                      ? 'text-red-400'
                      : alert.type === 'warning'
                      ? 'text-yellow-400'
                      : 'text-blue-400'
                  )} />
                </div>
                <p className="text-xs text-slate-400">{alert.time}</p>
                <div className="mt-2">
                  <StatusBadge status={alert.level as 'low' | 'medium' | 'high'} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeMonitoring;
