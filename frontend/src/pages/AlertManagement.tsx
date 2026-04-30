import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Bell, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock,
  MapPin,
  Filter,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Info,
  AlertCircle,
  X
} from 'lucide-react';
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
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import { cn } from '../utils/cn';
import { alertApi, Alert } from '../services/api';

const mockAlerts: (Alert & { pointName?: string })[] = [
  { id: 1, monitoring_point_id: 4, pollution_event_id: 1, alert_type: 'danger', message: '山东德州监测点检测到漂浮垃圾污染', level: 'high', is_read: false, is_handled: false, triggered_at: '2024-01-15 14:23:15', created_at: '2024-01-15 14:23:15', pointName: '山东德州监测点' },
  { id: 2, monitoring_point_id: 2, pollution_event_id: 2, alert_type: 'warning', message: '天津武清监测点水质浊度超标', level: 'medium', is_read: false, is_handled: false, triggered_at: '2024-01-15 14:18:00', created_at: '2024-01-15 14:18:00', pointName: '天津武清监测点' },
  { id: 3, monitoring_point_id: 1, alert_type: 'info', message: '北京通州监测点设备正常运行', level: 'low', is_read: true, is_handled: true, triggered_at: '2024-01-15 14:00:00', handled_at: '2024-01-15 14:05:00', created_at: '2024-01-15 14:00:00', pointName: '北京通州监测点' },
  { id: 4, monitoring_point_id: 5, pollution_event_id: 3, alert_type: 'warning', message: '江苏淮安监测点溶解氧略低', level: 'medium', is_read: true, is_handled: false, triggered_at: '2024-01-15 13:45:20', created_at: '2024-01-15 13:45:20', pointName: '江苏淮安监测点' },
  { id: 5, monitoring_point_id: 4, pollution_event_id: 4, alert_type: 'danger', message: '山东德州监测点氨氮浓度超标', level: 'high', is_read: false, is_handled: false, triggered_at: '2024-01-15 13:30:00', created_at: '2024-01-15 13:30:00', pointName: '山东德州监测点' },
  { id: 6, monitoring_point_id: 3, alert_type: 'info', message: '河北沧州监测点数据采集正常', level: 'low', is_read: true, is_handled: true, triggered_at: '2024-01-15 12:00:00', handled_at: '2024-01-15 12:01:00', created_at: '2024-01-15 12:00:00', pointName: '河北沧州监测点' },
  { id: 7, monitoring_point_id: 6, alert_type: 'warning', message: '浙江杭州监测点pH值波动较大', level: 'medium', is_read: false, is_handled: false, triggered_at: '2024-01-15 11:30:00', created_at: '2024-01-15 11:30:00', pointName: '浙江杭州监测点' },
  { id: 8, monitoring_point_id: 2, alert_type: 'info', message: '天津武清监测点设备维护完成', level: 'low', is_read: true, is_handled: true, triggered_at: '2024-01-15 10:00:00', handled_at: '2024-01-15 10:02:00', created_at: '2024-01-15 10:00:00', pointName: '天津武清监测点' },
];

const mockAlertTrendData = [
  { hour: '00:00', info: 1, warning: 0, danger: 0 },
  { hour: '04:00', info: 0, warning: 1, danger: 0 },
  { hour: '08:00', info: 2, warning: 0, danger: 0 },
  { hour: '12:00', info: 1, warning: 2, danger: 0 },
  { hour: '14:00', info: 0, warning: 2, danger: 2 },
  { hour: '16:00', info: 1, warning: 1, danger: 0 },
];

const mockAlertTypeData = [
  { name: '漂浮垃圾', value: 35, color: '#ef4444' },
  { name: '水质超标', value: 30, color: '#f59e0b' },
  { name: '溶解氧异常', value: 15, color: '#3b82f6' },
  { name: '设备故障', value: 10, color: '#10b981' },
  { name: '其他', value: 10, color: '#6366f1' },
];

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, color }) => (
  <Card className="flex items-center gap-4">
    <div className={cn('p-3 rounded-lg', color)}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-slate-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </Card>
);

const AlertManagement: React.FC = () => {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<(Alert & { pointName?: string }) | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const loadData = async () => {
    setLoading(true);
    try {
      await alertApi.getStatistics();
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.pointName?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'all' || alert.alert_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'unread' && !alert.is_read) ||
      (statusFilter === 'read' && alert.is_read && !alert.is_handled) ||
      (statusFilter === 'handled' && alert.is_handled);
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetail = (alert: Alert & { pointName?: string }) => {
    setSelectedAlert(alert);
    setShowDetailModal(true);
  };

  const handleMarkAsRead = async (alertId: number) => {
    try {
      await alertApi.markAsRead(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a));
    } catch (error) {
      console.error('标记已读失败:', error);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a));
    }
  };

  const handleMarkAsHandled = async (alertId: number) => {
    try {
      await alertApi.handle(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_handled: true, handled_at: new Date().toISOString() } : a));
    } catch (error) {
      console.error('标记处理失败:', error);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_handled: true, handled_at: new Date().toISOString() } : a));
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'danger': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
      default: return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const getAlertBorderColor = (type: string) => {
    switch (type) {
      case 'danger': return 'border-l-red-500 bg-red-500/10';
      case 'warning': return 'border-l-yellow-500 bg-yellow-500/10';
      case 'info': return 'border-l-blue-500 bg-blue-500/10';
      default: return 'border-l-slate-500 bg-slate-500/10';
    }
  };

  const totalAlerts = alerts.length;
  const unreadAlerts = alerts.filter(a => !a.is_read).length;
  const unhandledAlerts = alerts.filter(a => !a.is_handled).length;
  const highPriorityAlerts = alerts.filter(a => a.level === 'high').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">预警管理</h1>
          <p className="text-slate-400 text-sm mt-1">管理和处理京杭大运河各监测点位预警信息</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Bell}
          title="预警总数"
          value={totalAlerts.toString()}
          color="bg-blue-500/20"
        />
        <StatCard
          icon={AlertTriangle}
          title="未读预警"
          value={unreadAlerts.toString()}
          color="bg-yellow-500/20"
        />
        <StatCard
          icon={XCircle}
          title="待处理预警"
          value={unhandledAlerts.toString()}
          color="bg-red-500/20"
        />
        <StatCard
          icon={AlertCircle}
          title="高优先级预警"
          value={highPriorityAlerts.toString()}
          color="bg-orange-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">今日预警趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockAlertTrendData}>
                <defs>
                  <linearGradient id="colorInfo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDanger" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="hour" stroke="#94a3b8" />
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
                  dataKey="info"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorInfo)"
                  name="信息"
                />
                <Area
                  type="monotone"
                  dataKey="warning"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorWarning)"
                  name="警告"
                />
                <Area
                  type="monotone"
                  dataKey="danger"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorDanger)"
                  name="危险"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">预警类型分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockAlertTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#94a3b8' }}
                >
                  {mockAlertTypeData.map((entry, index) => (
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
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索预警信息或监测点..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-dark border border-dark-light rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="bg-dark border border-dark-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">全部类型</option>
              <option value="info">信息</option>
              <option value="warning">警告</option>
              <option value="danger">危险</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-dark border border-dark-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">全部状态</option>
              <option value="unread">未读</option>
              <option value="read">已读(未处理)</option>
              <option value="handled">已处理</option>
            </select>
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="flex items-center gap-1 text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-dark transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              重置
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {paginatedAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'border-l-4 rounded-lg p-4 transition-colors',
                getAlertBorderColor(alert.alert_type),
                !alert.is_read && 'ring-1 ring-inset ring-primary/30'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={cn(
                    'p-2 rounded-lg flex-shrink-0',
                    alert.alert_type === 'danger' ? 'bg-red-500/20' :
                    alert.alert_type === 'warning' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                  )}>
                    {getAlertIcon(alert.alert_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{alert.message}</span>
                      {!alert.is_read && (
                        <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                      {alert.pointName && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {alert.pointName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.triggered_at}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={alert.alert_type} type="alert" />
                      <StatusBadge status={alert.level} type="level" />
                      {alert.is_handled && (
                        <span className="flex items-center gap-1 text-green-400 text-xs">
                          <CheckCircle className="w-3 h-3" />
                          已处理
                        </span>
                      )}
                      {alert.is_read && !alert.is_handled && (
                        <span className="flex items-center gap-1 text-blue-400 text-xs">
                          <Eye className="w-3 h-3" />
                          已读
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleViewDetail(alert)}
                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-dark rounded transition-colors"
                    title="查看详情"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {!alert.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(alert.id)}
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-dark rounded transition-colors"
                      title="标记已读"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {!alert.is_handled && (
                    <button
                      onClick={() => handleMarkAsHandled(alert.id)}
                      className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-dark rounded transition-colors"
                      title="标记处理"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredAlerts.length === 0 && (
            <div className="py-12 text-center">
              <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">暂无匹配的预警信息</p>
            </div>
          )}
        </div>

        {filteredAlerts.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-dark-light">
            <p className="text-slate-400 text-sm">
              共 {filteredAlerts.length} 条预警，第 {currentPage}/{totalPages} 页
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
        )}
      </Card>

      {showDetailModal && selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">预警详情</h2>
              <button
                onClick={() => { setShowDetailModal(false); setSelectedAlert(null); }}
                className="p-1 hover:bg-dark rounded transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-3 rounded-lg',
                  selectedAlert.alert_type === 'danger' ? 'bg-red-500/20' :
                  selectedAlert.alert_type === 'warning' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                )}>
                  {getAlertIcon(selectedAlert.alert_type)}
                </div>
                <div>
                  <p className="font-medium text-lg">{selectedAlert.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={selectedAlert.alert_type} type="alert" size="md" />
                    <StatusBadge status={selectedAlert.level} type="level" size="md" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">监测点</p>
                  <p className="font-medium mt-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    {selectedAlert.pointName || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">触发时间</p>
                  <p className="font-medium mt-1 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-primary" />
                    {selectedAlert.triggered_at}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">阅读状态</p>
                  <p className="font-medium mt-1">
                    {selectedAlert.is_read ? (
                      <span className="text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> 已读
                      </span>
                    ) : (
                      <span className="text-yellow-400 flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> 未读
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">处理状态</p>
                  <p className="font-medium mt-1">
                    {selectedAlert.is_handled ? (
                      <span className="text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> 已处理
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> 待处理
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {selectedAlert.handled_at && (
                <div>
                  <p className="text-slate-400 text-sm">处理时间</p>
                  <p className="font-medium mt-1">{selectedAlert.handled_at}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                {!selectedAlert.is_read && (
                  <button
                    onClick={() => {
                      handleMarkAsRead(selectedAlert.id);
                      setSelectedAlert({ ...selectedAlert, is_read: true });
                    }}
                    className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors"
                  >
                    标记已读
                  </button>
                )}
                {!selectedAlert.is_handled && (
                  <button
                    onClick={() => {
                      handleMarkAsHandled(selectedAlert.id);
                      setSelectedAlert({ ...selectedAlert, is_handled: true, handled_at: new Date().toISOString() });
                    }}
                    className="px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors"
                  >
                    标记处理
                  </button>
                )}
                <button
                  onClick={() => { setShowDetailModal(false); setSelectedAlert(null); }}
                  className="px-4 py-2 text-slate-400 hover:text-white hover:bg-dark rounded-lg transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AlertManagement;
