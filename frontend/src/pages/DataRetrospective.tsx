import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  RefreshCw,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend
} from 'recharts';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import { cn } from '../utils/cn';
import { waterQualityApi } from '../services/api';

const mockPoints: { value: string; label: string }[] = [
  { value: 'all', label: '全部监测点' },
  { value: '1', label: '北京通州监测点' },
  { value: '2', label: '天津武清监测点' },
  { value: '3', label: '河北沧州监测点' },
  { value: '4', label: '山东德州监测点' },
  { value: '5', label: '江苏淮安监测点' },
  { value: '6', label: '浙江杭州监测点' },
];

const mockWaterQualityHistory: any[] = [
  { date: '01-01', ph: 7.2, temperature: 18.5, turbidity: 3.2, dissolvedOxygen: 8.1 },
  { date: '01-02', ph: 7.1, temperature: 18.2, turbidity: 2.9, dissolvedOxygen: 8.0 },
  { date: '01-03', ph: 7.3, temperature: 19.0, turbidity: 3.5, dissolvedOxygen: 8.3 },
  { date: '01-04', ph: 7.4, temperature: 20.5, turbidity: 4.1, dissolvedOxygen: 8.5 },
  { date: '01-05', ph: 7.2, temperature: 19.8, turbidity: 3.8, dissolvedOxygen: 8.2 },
  { date: '01-06', ph: 7.1, temperature: 18.9, turbidity: 3.4, dissolvedOxygen: 8.0 },
  { date: '01-07', ph: 7.0, temperature: 17.8, turbidity: 3.0, dissolvedOxygen: 7.8 },
  { date: '01-08', ph: 7.3, temperature: 18.5, turbidity: 2.8, dissolvedOxygen: 8.2 },
  { date: '01-09', ph: 7.2, temperature: 19.2, turbidity: 3.1, dissolvedOxygen: 8.1 },
  { date: '01-10', ph: 7.4, temperature: 20.1, turbidity: 3.6, dissolvedOxygen: 8.4 },
];

const mockDetailedData: any[] = [
  { id: 1, pointName: '北京通州监测点', ph: 7.2, temperature: 18.5, turbidity: 3.2, dissolvedOxygen: 8.1, conductivity: 450, ammoniaNitrogen: 0.25, totalPhosphorus: 0.05, collectedAt: '2024-01-15 14:00:00' },
  { id: 2, pointName: '天津武清监测点', ph: 7.1, temperature: 17.8, turbidity: 5.8, dissolvedOxygen: 7.5, conductivity: 520, ammoniaNitrogen: 0.45, totalPhosphorus: 0.08, collectedAt: '2024-01-15 14:00:00' },
  { id: 3, pointName: '河北沧州监测点', ph: 7.3, temperature: 19.2, turbidity: 2.9, dissolvedOxygen: 8.3, conductivity: 420, ammoniaNitrogen: 0.20, totalPhosphorus: 0.04, collectedAt: '2024-01-15 14:00:00' },
  { id: 4, pointName: '山东德州监测点', ph: 6.8, temperature: 20.1, turbidity: 12.5, dissolvedOxygen: 5.2, conductivity: 680, ammoniaNitrogen: 1.20, totalPhosphorus: 0.15, collectedAt: '2024-01-15 14:00:00' },
  { id: 5, pointName: '江苏淮安监测点', ph: 7.2, temperature: 20.8, turbidity: 3.5, dissolvedOxygen: 8.0, conductivity: 440, ammoniaNitrogen: 0.28, totalPhosphorus: 0.06, collectedAt: '2024-01-15 14:00:00' },
  { id: 6, pointName: '浙江杭州监测点', ph: 7.1, temperature: 21.5, turbidity: 2.8, dissolvedOxygen: 8.5, conductivity: 410, ammoniaNitrogen: 0.18, totalPhosphorus: 0.03, collectedAt: '2024-01-15 14:00:00' },
];

const getStatusFromValue = (value: number, type: string): 'normal' | 'warning' | 'danger' => {
  switch (type) {
    case 'ph':
      if (value >= 6.5 && value <= 8.5) return 'normal';
      if (value >= 6.0 && value <= 9.0) return 'warning';
      return 'danger';
    case 'turbidity':
      if (value <= 5) return 'normal';
      if (value <= 10) return 'warning';
      return 'danger';
    case 'dissolvedOxygen':
      if (value >= 6) return 'normal';
      if (value >= 3) return 'warning';
      return 'danger';
    case 'ammoniaNitrogen':
      if (value <= 0.5) return 'normal';
      if (value <= 1.0) return 'warning';
      return 'danger';
    default:
      return 'normal';
  }
};

const DataRetrospective: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('2024-01-01');
  const [endDate, setEndDate] = useState<string>('2024-01-15');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedDataType, setSelectedDataType] = useState<string>('ph');

  const dataTypes = [
    { value: 'ph', label: 'pH值' },
    { value: 'temperature', label: '温度' },
    { value: 'turbidity', label: '浊度' },
    { value: 'dissolvedOxygen', label: '溶解氧' },
  ];

  const handleSearch = async () => {
    setLoading(true);
    try {
      await waterQualityApi.getAll({
        monitoringPointId: selectedPoint !== 'all' ? parseInt(selectedPoint) : undefined,
        startDate,
        endDate,
      });
    } catch (error) {
      console.error('查询失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    console.log('导出数据...');
    alert('数据导出功能已触发，请稍后查看下载文件');
  };

  const handleViewDetail = (item: any) => {
    console.log('查看详情:', item);
    alert(`查看 ${item.pointName} 的详细数据`);
  };

  const totalPages = Math.ceil(mockDetailedData.length / itemsPerPage);
  const paginatedData = mockDetailedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">数据回溯</h1>
          <p className="text-slate-400 text-sm mt-1">查询和分析历史水质监测数据</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          导出数据
        </button>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">查询条件</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              监测点
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedPoint}
                onChange={(e) => setSelectedPoint(e.target.value)}
                className="w-full bg-dark border border-dark-light rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {mockPoints.map(point => (
                  <option key={point.value} value={point.value}>{point.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              开始日期
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-dark border border-dark-light rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              结束日期
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-dark border border-dark-light rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              数据类型
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedDataType}
                onChange={(e) => setSelectedDataType(e.target.value)}
                className="w-full bg-dark border border-dark-light rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {dataTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setSelectedPoint('all');
              setStartDate('2024-01-01');
              setEndDate('2024-01-15');
              setSelectedDataType('ph');
              setCurrentPage(1);
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-dark transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            重置
          </button>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="w-4 h-4" />
            {loading ? '查询中...' : '查询'}
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">趋势变化图表</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockWaterQualityHistory}>
                <defs>
                  <linearGradient id="colorData" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
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
                  dataKey={selectedDataType}
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorData)"
                  name={dataTypes.find(t => t.value === selectedDataType)?.label}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">数据统计</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'pH值', value: '7.2', unit: '', status: 'normal' },
              { label: '平均温度', value: '19.2', unit: '°C', status: 'normal' },
              { label: '平均浊度', value: '4.1', unit: 'NTU', status: 'warning' },
              { label: '平均溶解氧', value: '8.1', unit: 'mg/L', status: 'normal' },
            ].map((item, index) => (
              <div key={index} className="p-4 bg-dark rounded-lg">
                <p className="text-slate-400 text-sm">{item.label}</p>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-2xl font-bold text-white">{item.value}</span>
                  <span className="text-slate-400 text-sm mb-1">{item.unit}</span>
                </div>
                <StatusBadge status={item.status as 'normal' | 'warning' | 'danger'} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">详细数据记录</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-light">
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">监测点</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">pH值</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">温度</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">浊度</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">溶解氧</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">氨氮</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">总磷</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">采集时间</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr key={item.id} className="border-b border-dark-light hover:bg-dark transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium">{item.pointName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span>{item.ph}</span>
                      <StatusBadge status={getStatusFromValue(item.ph, 'ph')} />
                    </div>
                  </td>
                  <td className="py-3 px-4">{item.temperature}°C</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span>{item.turbidity}</span>
                      <StatusBadge status={getStatusFromValue(item.turbidity, 'turbidity')} />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span>{item.dissolvedOxygen}</span>
                      <StatusBadge status={getStatusFromValue(item.dissolvedOxygen, 'dissolvedOxygen')} />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span>{item.ammoniaNitrogen}</span>
                      <StatusBadge status={getStatusFromValue(item.ammoniaNitrogen, 'ammoniaNitrogen')} />
                    </div>
                  </td>
                  <td className="py-3 px-4">{item.totalPhosphorus}</td>
                  <td className="py-3 px-4 text-slate-400 text-sm">{item.collectedAt}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleViewDetail(item)}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-dark rounded transition-colors"
                      title="查看详情"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <p className="text-slate-400 text-sm">
            共 {mockDetailedData.length} 条记录，第 {currentPage}/{totalPages} 页
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-slate-400 hover:text-white hover:bg-dark rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'w-8 h-8 rounded text-sm transition-colors',
                  currentPage === page
                    ? 'bg-primary text-white'
                    : 'text-slate-400 hover:text-white hover:bg-dark'
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-slate-400 hover:text-white hover:bg-dark rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DataRetrospective;
