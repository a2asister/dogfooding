import React, { useState } from 'react';
import { Plus, Clock, Wrench, Sparkles, CheckCircle2, AlertTriangle, Eye, Edit, ClipboardList } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, Select, TextArea } from '@/components/ui/Input';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { formatDateTime, generateId } from '@/utils';
import type { WorkOrder, WorkOrderStatus, WorkOrderType } from '@/types';

const WorkOrders: React.FC = () => {
  const { workOrders, updateWorkOrder, addWorkOrder } = useData();
  const { hasPermission, currentUser } = useAuth();

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({
    roomNumber: '',
    type: 'cleaning' as WorkOrderType,
    priority: 'medium' as 'low' | 'medium' | 'high',
    title: '',
    description: '',
  });

  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesStatus = selectedStatus === 'all' || wo.status === selectedStatus;
    const matchesType = selectedType === 'all' || wo.type === selectedType;
    return matchesStatus && matchesType;
  });

  const stats = {
    pending: workOrders.filter(wo => wo.status === 'pending').length,
    inProgress: workOrders.filter(wo => wo.status === 'in_progress').length,
    completed: workOrders.filter(wo => wo.status === 'completed').length,
  };

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'pending', label: '待处理' },
    { value: 'in_progress', label: '处理中' },
    { value: 'completed', label: '已完成' },
  ];

  const typeOptions = [
    { value: 'all', label: '全部类型' },
    { value: 'cleaning', label: '清洁工单' },
    { value: 'maintenance', label: '维修工单' },
  ];

  const priorityOptions = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
  ];

  const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
    const colorMap = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colorMap[priority];
  };

  const getPriorityText = (priority: 'low' | 'medium' | 'high'): string => {
    const textMap = {
      low: '低优先级',
      medium: '中优先级',
      high: '高优先级',
    };
    return textMap[priority];
  };

  const getStatusColor = (status: WorkOrderStatus): string => {
    const colorMap: Record<WorkOrderStatus, string> = {
      pending: 'bg-orange-100 text-orange-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colorMap[status];
  };

  const getStatusText = (status: WorkOrderStatus): string => {
    const textMap: Record<WorkOrderStatus, string> = {
      pending: '待处理',
      in_progress: '处理中',
      completed: '已完成',
    };
    return textMap[status];
  };

  const handleCreateWorkOrder = () => {
    if (!formData.roomNumber || !formData.title || !formData.description) return;

    const newWorkOrder: WorkOrder = {
      id: `wo_${generateId().slice(0, 6)}`,
      roomId: '',
      roomNumber: formData.roomNumber,
      type: formData.type,
      status: 'pending',
      priority: formData.priority,
      title: formData.title,
      description: formData.description,
      createdBy: currentUser?.id || '',
      createdAt: new Date().toISOString(),
      notes: [],
    };

    addWorkOrder(newWorkOrder);
    setShowCreateModal(false);
    setFormData({
      roomNumber: '',
      type: 'cleaning',
      priority: 'medium',
      title: '',
      description: '',
    });
  };

  const handleStartWorkOrder = (workOrder: WorkOrder) => {
    updateWorkOrder({
      ...workOrder,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      assignedTo: currentUser?.id,
    });
  };

  const handleCompleteWorkOrder = (workOrder: WorkOrder) => {
    updateWorkOrder({
      ...workOrder,
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">工单管理</h1>
          <p className="text-gray-500 mt-1">管理客房清洁和维修工单</p>
        </div>
        {hasPermission(['admin', 'manager', 'housekeeping']) && (
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            新增工单
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">总工单数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{workOrders.length}</p>
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
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
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
              <div className="p-3 bg-blue-100 rounded-lg">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">已完成</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <h3 className="font-semibold text-gray-900">工单列表</h3>
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
                <th className="px-4 py-3 font-medium">工单信息</th>
                <th className="px-4 py-3 font-medium">房间号</th>
                <th className="px-4 py-3 font-medium">类型</th>
                <th className="px-4 py-3 font-medium">优先级</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">创建时间</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWorkOrders.map(workOrder => (
                <tr key={workOrder.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        workOrder.type === 'cleaning' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {workOrder.type === 'cleaning'
                          ? <Sparkles className="w-5 h-5" />
                          : <Wrench className="w-5 h-5" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{workOrder.title}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{workOrder.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{workOrder.roomNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      workOrder.type === 'cleaning' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {workOrder.type === 'cleaning' ? '清洁工单' : '维修工单'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(workOrder.priority)}`}>
                      {getPriorityText(workOrder.priority)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(workOrder.status)}`}>
                      {getStatusText(workOrder.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDateTime(workOrder.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedWorkOrder(workOrder);
                          setShowDetailModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {workOrder.status === 'pending' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStartWorkOrder(workOrder)}
                        >
                          开始处理
                        </Button>
                      )}
                      {workOrder.status === 'in_progress' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleCompleteWorkOrder(workOrder)}
                        >
                          完成
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredWorkOrders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">暂无工单数据</p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="新增工单"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">工单类型</label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as WorkOrderType })}
                options={[
                  { value: 'cleaning', label: '清洁工单' },
                  { value: 'maintenance', label: '维修工单' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
            <Select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
              options={priorityOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">工单标题</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="简要描述问题"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">详细描述</label>
            <TextArea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="详细描述需要处理的问题..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleCreateWorkOrder}>
              创建工单
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="工单详情"
        size="lg"
      >
        {selectedWorkOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">工单编号</p>
                <p className="font-medium text-gray-900 mt-1">{selectedWorkOrder.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">房间号</p>
                <p className="font-medium text-gray-900 mt-1">{selectedWorkOrder.roomNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">工单类型</p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedWorkOrder.type === 'cleaning' ? '清洁工单' : '维修工单'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">优先级</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${getPriorityColor(selectedWorkOrder.priority)}`}>
                  {getPriorityText(selectedWorkOrder.priority)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">状态</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${getStatusColor(selectedWorkOrder.status)}`}>
                  {getStatusText(selectedWorkOrder.status)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">创建时间</p>
                <p className="font-medium text-gray-900 mt-1">{formatDateTime(selectedWorkOrder.createdAt)}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">工单标题</p>
              <p className="font-medium text-gray-900 mt-1">{selectedWorkOrder.title}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">详细描述</p>
              <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{selectedWorkOrder.description}</p>
            </div>

            {selectedWorkOrder.notes && selectedWorkOrder.notes.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">处理记录</p>
                <div className="space-y-2">
                  {selectedWorkOrder.notes.map((note, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-gray-900">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              {selectedWorkOrder.status === 'pending' && (
                <Button
                  variant="primary"
                  onClick={() => {
                    handleStartWorkOrder(selectedWorkOrder);
                    setShowDetailModal(false);
                  }}
                >
                  开始处理
                </Button>
              )}
              {selectedWorkOrder.status === 'in_progress' && (
                <Button
                  variant="success"
                  onClick={() => {
                    handleCompleteWorkOrder(selectedWorkOrder);
                    setShowDetailModal(false);
                  }}
                >
                  标记完成
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

export default WorkOrders;
