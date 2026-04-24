import React, { useState } from 'react';
import { Plus, AlertTriangle, CheckCircle, Clock, MessageSquare, Wrench, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, Select, TextArea } from '@/components/ui/Input';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { formatDateTime, generateId } from '@/utils';
import type { ExceptionReport } from '@/types';

const Exceptions: React.FC = () => {
  const { exceptionReports, updateExceptionReport, addExceptionReport } = useData();
  const { hasPermission, currentUser } = useAuth();

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ExceptionReport | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const [formData, setFormData] = useState({
    roomNumber: '',
    type: 'damage' as 'damage' | 'complaint' | 'other',
    title: '',
    description: '',
  });

  const filteredReports = exceptionReports.filter(report => {
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    const matchesType = selectedType === 'all' || report.type === selectedType;
    return matchesStatus && matchesType;
  });

  const stats = {
    open: exceptionReports.filter(r => r.status === 'open').length,
    inProgress: exceptionReports.filter(r => r.status === 'in_progress').length,
    resolved: exceptionReports.filter(r => r.status === 'resolved').length,
  };

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'open', label: '待处理' },
    { value: 'in_progress', label: '处理中' },
    { value: 'resolved', label: '已解决' },
  ];

  const typeOptions = [
    { value: 'all', label: '全部类型' },
    { value: 'damage', label: '设施损坏' },
    { value: 'complaint', label: '客户投诉' },
    { value: 'other', label: '其他' },
  ];

  const getStatusColor = (status: 'open' | 'in_progress' | 'resolved'): string => {
    const colorMap = {
      open: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
    };
    return colorMap[status];
  };

  const getStatusText = (status: 'open' | 'in_progress' | 'resolved'): string => {
    const textMap = {
      open: '待处理',
      in_progress: '处理中',
      resolved: '已解决',
    };
    return textMap[status];
  };

  const getTypeColor = (type: 'damage' | 'complaint' | 'other'): string => {
    const colorMap = {
      damage: 'bg-orange-100 text-orange-800',
      complaint: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colorMap[type];
  };

  const getTypeText = (type: 'damage' | 'complaint' | 'other'): string => {
    const textMap = {
      damage: '设施损坏',
      complaint: '客户投诉',
      other: '其他',
    };
    return textMap[type];
  };

  const handleCreateReport = () => {
    if (!formData.roomNumber || !formData.title || !formData.description) return;

    const newReport: ExceptionReport = {
      id: `ex_${generateId().slice(0, 6)}`,
      roomId: '',
      roomNumber: formData.roomNumber,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      reporter: currentUser?.id || '',
      status: 'open',
      createdAt: new Date().toISOString(),
      images: [],
    };

    addExceptionReport(newReport);
    setShowCreateModal(false);
    setFormData({
      roomNumber: '',
      type: 'damage',
      title: '',
      description: '',
    });
  };

  const handleStartProcessing = (report: ExceptionReport) => {
    updateExceptionReport({
      ...report,
      status: 'in_progress',
    });
  };

  const handleResolve = (report: ExceptionReport, resolution: string) => {
    updateExceptionReport({
      ...report,
      status: 'resolved',
      resolution,
      resolvedAt: new Date().toISOString(),
    });
    setShowDetailModal(false);
    setResolutionText('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">异常报告</h1>
          <p className="text-gray-500 mt-1">管理设施损坏、客户投诉等异常情况</p>
        </div>
        {hasPermission(['admin', 'manager', 'reception', 'housekeeping']) && (
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            新建报告
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">总报告数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{exceptionReports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">待处理</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">处理中</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Wrench className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">已解决</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <h3 className="font-semibold text-gray-900">异常报告列表</h3>
            <div className="flex-1" />
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={statusOptions}
              className="w-36"
            />
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={typeOptions}
              className="w-36"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">报告标题</th>
                <th className="px-4 py-3 font-medium">房间号</th>
                <th className="px-4 py-3 font-medium">类型</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">创建时间</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReports.map(report => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        report.type === 'damage' ? 'bg-orange-50 text-orange-600' :
                        report.type === 'complaint' ? 'bg-red-50 text-red-600' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {report.type === 'damage'
                          ? <Wrench className="w-5 h-5" />
                          : report.type === 'complaint'
                          ? <MessageSquare className="w-5 h-5" />
                          : <AlertTriangle className="w-5 h-5" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{report.title}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{report.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{report.roomNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(report.type)}`}>
                      {getTypeText(report.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}>
                      {getStatusText(report.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDateTime(report.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowDetailModal(true);
                        }}
                      >
                        查看详情
                      </Button>
                      {report.status === 'open' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStartProcessing(report)}
                        >
                          开始处理
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">暂无异常报告</p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="新建异常报告"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">房间号</label>
              <Input
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="例如：101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">异常类型</label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'damage' | 'complaint' | 'other' })}
                options={[
                  { value: 'damage', label: '设施损坏' },
                  { value: 'complaint', label: '客户投诉' },
                  { value: 'other', label: '其他' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">报告标题</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="简要描述异常情况"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">详细描述</label>
            <TextArea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请详细描述异常情况..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleCreateReport}>
              提交报告
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="异常报告详情"
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">报告编号</p>
                <p className="font-medium text-gray-900 mt-1">{selectedReport.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">房间号</p>
                <p className="font-medium text-gray-900 mt-1">{selectedReport.roomNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">异常类型</p>
                <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${getTypeColor(selectedReport.type)}`}>
                  {getTypeText(selectedReport.type)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">状态</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${getStatusColor(selectedReport.status)}`}>
                  {getStatusText(selectedReport.status)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">创建时间</p>
                <p className="font-medium text-gray-900 mt-1">{formatDateTime(selectedReport.createdAt)}</p>
              </div>
              {selectedReport.resolvedAt && (
                <div>
                  <p className="text-sm text-gray-500">解决时间</p>
                  <p className="font-medium text-gray-900 mt-1">{formatDateTime(selectedReport.resolvedAt)}</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">报告标题</p>
              <p className="font-medium text-gray-900 mt-1">{selectedReport.title}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">详细描述</p>
              <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{selectedReport.description}</p>
            </div>

            {selectedReport.resolution && (
              <div>
                <p className="text-sm text-gray-500">解决方案</p>
                <p className="text-gray-900 mt-1 p-3 bg-green-50 rounded-lg border border-green-200">
                  {selectedReport.resolution}
                </p>
              </div>
            )}

            {selectedReport.status !== 'resolved' && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">解决方案</p>
                <TextArea
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="请输入解决方案..."
                  rows={3}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              {selectedReport.status === 'open' && (
                <Button
                  variant="primary"
                  onClick={() => {
                    handleStartProcessing(selectedReport);
                    setShowDetailModal(false);
                  }}
                >
                  开始处理
                </Button>
              )}
              {selectedReport.status === 'in_progress' && resolutionText && (
                <Button
                  variant="success"
                  onClick={() => handleResolve(selectedReport, resolutionText)}
                >
                  标记解决
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                关闭
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Exceptions;
