import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Droplets,
  AlertTriangle,
  MapPin,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend
} from 'recharts';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import { cn } from '../utils/cn';
import { monitoringPointApi, waterQualityApi, alertApi } from '../services/api';

const mockMonthlyData = [
  { month: '1月', ph: 7.2, temperature: 18.5, turbidity: 3.2, dissolvedOxygen: 8.1, alerts: 2 },
  { month: '2月', ph: 7.1, temperature: 12.8, turbidity: 2.9, dissolvedOxygen: 8.0, alerts: 1 },
  { month: '3月', ph: 7.3, temperature: 15.0, turbidity: 3.5, dissolvedOxygen: 8.3, alerts: 3 },
  { month: '4月', ph: 7.4, temperature: 22.5, turbidity: 4.1, dissolvedOxygen: 8.5, alerts: 5 },
  { month: '5月', ph: 7.2, temperature: 25.8, turbidity: 3.8, dissolvedOxygen: 8.2, alerts: 4 },
  { month: '6月', ph: 7.1, temperature: 28.9, turbidity: 3.4, dissolvedOxygen: 8.0, alerts: 3 },
  { month: '7月', ph: 7.0, temperature: 31.8, turbidity: 3.0, dissolvedOxygen: 7.8, alerts: 6 },
  { month: '8月', ph: 7.3, temperature: 30.5, turbidity: 2.8, dissolvedOxygen: 8.2, alerts: 4 },
  { month: '9月', ph: 7.2, temperature: 24.2, turbidity: 3.1, dissolvedOxygen: 8.1, alerts: 2 },
  { month: '10月', ph: 7.4, temperature: 18.1, turbidity: 3.6, dissolvedOxygen: 8.4, alerts: 1 },
  { month: '11月', ph: 7.2, temperature: 12.0, turbidity: 3.3, dissolvedOxygen: 8.2, alerts: 2 },
  { month: '12月', ph: 7.1, temperature: 8.5, turbidity: 2.9, dissolvedOxygen: 8.0, alerts: 1 },
];

const mockPointComparison = [
  { name: '北京通州', ph: 7.2, turbidity: 3.2, dissolvedOxygen: 8.1, temperature: 18.5 },
  { name: '天津武清', ph: 7.1, turbidity: 5.8, dissolvedOxygen: 7.5, temperature: 17.8 },
  { name: '河北沧州', ph: 7.3, turbidity: 2.9, dissolvedOxygen: 8.3, temperature: 19.2 },
  { name: '山东德州', ph: 6.8, turbidity: 12.5, dissolvedOxygen: 5.2, temperature: 20.1 },
  { name: '江苏淮安', ph: 7.2, turbidity: 3.5, dissolvedOxygen: 8.0, temperature: 20.8 },
  { name: '浙江杭州', ph: 7.1, turbidity: 2.8, dissolvedOxygen: 8.5, temperature: 21.5 },
];

const mockPollutionTypeData = [
  { name: '漂浮垃圾', value: 35, color: '#ef4444' },
  { name: '化学污染', value: 15, color: '#f59e0b' },
  { name: '悬浮物', value: 20, color: '#3b82f6' },
  { name: '藻类爆发', value: 10, color: '#10b981' },
  { name: '其他', value: 20, color: '#6366f1' },
];

const mockAlertTrendData = [
  { month: '1月', high: 1, medium: 5, low: 3 },
  { month: '2月', high: 0, medium: 3, low: 2 },
  { month: '3月', high: 2, medium: 6, low: 4 },
  { month: '4月', high: 3, medium: 8, low: 5 },
  { month: '5月', high: 2, medium: 7, low: 4 },
  { month: '6月', high: 1, medium: 5, low: 3 },
  { month: '7月', high: 4, medium: 9, low: 6 },
  { month: '8月', high: 3, medium: 7, low: 5 },
  { month: '9月', high: 1, medium: 4, low: 3 },
  { month: '10月', high: 0, medium: 3, low: 2 },
  { month: '11月', high: 1, medium: 5, low: 3 },
  { month: '12月', high: 0, medium: 2, low: 2 },
];

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  trend?: number;
  trendDirection?: 'up' | 'down';
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, trend, trendDirection = 'down', color }) => (
  <Card className="flex items-center gap-4">
    <div className={cn('p-3 rounded-lg', color)}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="flex-1">
      <p className="text-slate-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
    {trend !== undefined && (
      <div className={cn(
        'flex items-center gap-1 text-sm',
        trendDirection === 'up' ? 'text-red-400' : 'text-green-400'
      )}>
        {trendDirection === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span>{Math.abs(trend)}%</span>
      </div>
    )}
  </Card>
);

const DataAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('year');

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        monitoringPointApi.getStatistics(),
        waterQualityApi.getStatistics(),
        alertApi.getStatistics(),
      ]);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getAverageValue = (key: keyof typeof mockPointComparison[0]) => {
    const sum = mockPointComparison.reduce((acc, item) => acc + (item[key] as number), 0);
    return (sum / mockPointComparison.length).toFixed(2);
  };

  const totalAlerts = mockAlertTrendData.reduce((acc, item) => acc + item.high + item.medium + item.low, 0);
  const criticalAlerts = mockAlertTrendData.reduce((acc, item) => acc + item.high, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">数据分析</h1>
          <p className="text-slate-400 text-sm mt-1">多维度分析京杭大运河水质监测数据</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-dark border border-dark-light rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="month">近30天</option>
              <option value="quarter">近90天</option>
              <option value="year">近一年</option>
            </select>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-dark transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            刷新
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          title="总监测点数"
          value="6"
          color="bg-blue-500/20"
        />
        <StatCard
          icon={Droplets}
          title="平均水质达标率"
          value="83.3%"
          trend={5.2}
          trendDirection="down"
          color="bg-green-500/20"
        />
        <StatCard
          icon={AlertTriangle}
          title="年度预警总数"
          value={totalAlerts.toString()}
          trend={15}
          trendDirection="up"
          color="bg-yellow-500/20"
        />
        <StatCard
          icon={AlertTriangle}
          title="高优先级预警"
          value={criticalAlerts.toString()}
          color="bg-red-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">年度水质变化趋势</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mockMonthlyData}>
                <defs>
                  <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDO" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis yAxisId="left" stroke="#94a3b8" />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
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
                  yAxisId="left"
                  type="monotone"
                  dataKey="ph"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorPh)"
                  name="pH值"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="dissolvedOxygen"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorDO)"
                  name="溶解氧(mg/L)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ef4444"
                  name="温度(°C)"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">各监测点水质对比</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockPointComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="ph" name="pH值" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="turbidity" name="浊度" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">污染类型分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockPollutionTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#94a3b8' }}
                >
                  {mockPollutionTypeData.map((entry, index) => (
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
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">预警趋势分析</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockAlertTrendData}>
                <defs>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
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
                  dataKey="high"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorHigh)"
                  name="高优先级"
                />
                <Area
                  type="monotone"
                  dataKey="medium"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorMedium)"
                  name="中优先级"
                />
                <Area
                  type="monotone"
                  dataKey="low"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorLow)"
                  name="低优先级"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">各监测点详细指标</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-light">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">监测点</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">pH值</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">温度</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">浊度</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">溶解氧</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">综合评价</th>
                </tr>
              </thead>
              <tbody>
                {mockPointComparison.map((point, index) => {
                  const isNormal = point.turbidity <= 5 && point.dissolvedOxygen >= 6 && point.ph >= 6.5 && point.ph <= 8.5;
                  const isWarning = point.turbidity <= 10 && point.dissolvedOxygen >= 3 && point.ph >= 6.0 && point.ph <= 9.0;
                  const status = isNormal ? 'normal' : isWarning ? 'warning' : 'danger';
                  
                  return (
                    <tr key={index} className="border-b border-dark-light hover:bg-dark transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="font-medium">{point.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{point.ph}</td>
                      <td className="py-3 px-4">{point.temperature}°C</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span>{point.turbidity}</span>
                          <StatusBadge status={point.turbidity <= 5 ? 'normal' : point.turbidity <= 10 ? 'warning' : 'danger'} />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span>{point.dissolvedOxygen}</span>
                          <StatusBadge status={point.dissolvedOxygen >= 6 ? 'normal' : point.dissolvedOxygen >= 3 ? 'warning' : 'danger'} />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={status as 'normal' | 'warning' | 'danger'} size="md" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: '平均pH值', value: getAverageValue('ph'), trend: 2.1, trendDirection: 'up', unit: '' },
          { label: '平均溶解氧', value: getAverageValue('dissolvedOxygen'), trend: 3.5, trendDirection: 'down', unit: 'mg/L' },
          { label: '平均浊度', value: getAverageValue('turbidity'), trend: 8.2, trendDirection: 'up', unit: 'NTU' },
        ].map((item, index) => (
          <Card key={index}>
            <p className="text-slate-400 text-sm">{item.label}</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-3xl font-bold text-white">{item.value}</span>
              <span className="text-slate-400 text-sm mb-1">{item.unit}</span>
              <span className={cn(
                'ml-auto flex items-center gap-1 text-sm',
                item.trendDirection === 'up' ? 'text-red-400' : 'text-green-400'
              )}>
                {item.trendDirection === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{Math.abs(item.trend)}%</span>
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DataAnalysis;
