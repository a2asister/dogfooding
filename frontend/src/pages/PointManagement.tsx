import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  Eye, 
  MapPin, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import { monitoringPointApi, MonitoringPoint } from '../services/api';

interface PointFormData {
  name: string;
  latitude: string;
  longitude: string;
  status: 'normal' | 'warning' | 'danger';
  location: string;
}

const PointManagement: React.FC = () => {
  const [points, setPoints] = useState<MonitoringPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<MonitoringPoint | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [deletePoint, setDeletePoint] = useState<MonitoringPoint | null>(null);

  const loadPoints = async () => {
    try {
      setLoading(true);
      const result = await monitoringPointApi.getAll({ limit: 100 });
      const response = result as any;
      if (response.success && response.data?.points) {
        setPoints(response.data.points);
      }
    } catch (error) {
      console.error('加载监测点失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPoints();
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setSelectedPoint(null);
    setIsEdit(false);
    setFormData({
      name: '',
      latitude: '',
      longitude: '',
      status: 'normal',
      location: '',
    });
  };

  const [formData, setFormData] = useState<PointFormData>({
    name: '',
    latitude: '',
    longitude: '',
    status: 'normal',
    location: '',
  });

  const filteredPoints = points.filter(point => {
    const matchesSearch = point.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      point.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || point.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setIsEdit(false);
    setSelectedPoint(null);
    setFormData({
      name: '',
      latitude: '',
      longitude: '',
      status: 'normal',
      location: '',
    });
    setShowModal(true);
  };

  const handleEdit = (point: MonitoringPoint) => {
    setIsEdit(true);
    setSelectedPoint(point);
    setFormData({
      name: point.name,
      latitude: point.latitude.toString(),
      longitude: point.longitude.toString(),
      status: point.status,
      location: point.location || '',
    });
    setShowModal(true);
  };

  const handleView = (point: MonitoringPoint) => {
    setSelectedPoint(point);
    setIsEdit(false);
    setShowModal(true);
  };

  const handleDelete = (point: MonitoringPoint) => {
    setDeletePoint(point);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deletePoint) {
      try {
        setLoading(true);
        await monitoringPointApi.delete(deletePoint.id);
        setShowDeleteModal(false);
        setDeletePoint(null);
        await loadPoints();
      } catch (error) {
        console.error('删除失败:', error);
        setShowDeleteModal(false);
        setDeletePoint(null);
        await loadPoints();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data: any = {
        name: formData.name,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        status: formData.status,
        location: formData.location,
      };

      if (isEdit && selectedPoint) {
        await monitoringPointApi.update(selectedPoint.id, data);
      } else {
        await monitoringPointApi.create(data);
      }
      
      closeModal();
      await loadPoints();
    } catch (error) {
      console.error('保存失败:', error);
      closeModal();
      await loadPoints();
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'danger': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">点位管理</h1>
          <p className="text-slate-400 text-sm mt-1">管理京杭大运河各监测点位</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加监测点
        </button>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索监测点名称或位置..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark border border-dark-light rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-dark border border-dark-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">全部状态</option>
              <option value="normal">正常</option>
              <option value="warning">警告</option>
              <option value="danger">危险</option>
            </select>
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); loadPoints(); }}
              className="flex items-center gap-1 text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-dark transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              重置
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-light">
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">监测点名称</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">位置</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">坐标</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">状态</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">更新时间</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredPoints.map((point) => (
                <tr
                  key={point.id}
                  className="border-b border-dark-light hover:bg-dark transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium">{point.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-sm">{point.location || '-'}</td>
                  <td className="py-3 px-4 text-slate-400 text-sm font-mono">
                    {Number(point.latitude).toFixed(4)}, {Number(point.longitude).toFixed(4)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(point.status)}
                      <StatusBadge status={point.status as 'normal' | 'warning' | 'danger'} />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-sm">
                    {point.updated_at.split('T')[0]}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(point)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-dark rounded transition-colors"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(point)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-dark rounded transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(point)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-dark rounded transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPoints.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <p className="text-slate-400">暂无匹配的监测点</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <p className="text-slate-400 text-sm">
            共 {filteredPoints.length} 个监测点
          </p>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {isEdit ? '编辑监测点' : selectedPoint ? '监测点详情' : '添加监测点'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-dark rounded transition-colors"
              >
                <XCircle className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {(selectedPoint && !isEdit) ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">监测点名称</p>
                    <p className="font-medium mt-1">{selectedPoint.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">状态</p>
                    <div className="mt-1">
                      <StatusBadge status={selectedPoint.status as 'normal' | 'warning' | 'danger'} size="md" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">纬度</p>
                    <p className="font-mono mt-1">{selectedPoint.latitude}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">经度</p>
                    <p className="font-mono mt-1">{selectedPoint.longitude}</p>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">位置描述</p>
                  <p className="mt-1">{selectedPoint.location || '-'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">创建时间</p>
                    <p className="mt-1">{selectedPoint.created_at.split('T')[0]}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">更新时间</p>
                    <p className="mt-1">{selectedPoint.updated_at.split('T')[0]}</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    监测点名称 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-dark border border-dark-light rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="请输入监测点名称"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      纬度 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="w-full bg-dark border border-dark-light rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                      placeholder="例如: 39.9042"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      经度 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      className="w-full bg-dark border border-dark-light rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                      placeholder="例如: 116.4074"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    状态 <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'normal' | 'warning' | 'danger' })}
                    className="w-full bg-dark border border-dark-light rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="normal">正常</option>
                    <option value="warning">警告</option>
                    <option value="danger">危险</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    位置描述
                  </label>
                  <textarea
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    rows={3}
                    className="w-full bg-dark border border-dark-light rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="请输入监测点位置描述"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-slate-400 hover:text-white hover:bg-dark rounded-lg transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '保存中...' : isEdit ? '更新' : '创建'}
                  </button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}

      {showDeleteModal && deletePoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/20 rounded-full">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">确认删除</h3>
                <p className="text-slate-400 text-sm">此操作不可撤销</p>
              </div>
            </div>
            <p className="text-slate-300 mb-6">
              确定要删除监测点 "<span className="font-medium text-white">{deletePoint.name}</span>" 吗？
              相关的水质数据和预警记录可能会受到影响。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white hover:bg-dark rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '删除中...' : '确认删除'}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PointManagement;
