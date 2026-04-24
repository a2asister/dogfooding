import React, { useState } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Eye, MoreHorizontal, Wrench, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, Select, TextArea } from '@/components/ui/Input';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import {
  formatCurrency,
  getRoomStatusName,
  getRoomStatusColor,
  getRoomTypeName,
  getRoomStatusDot,
  generateId,
} from '@/utils';
import type { Room, RoomType, RoomStatus } from '@/types';

const Rooms: React.FC = () => {
  const { rooms, updateRoom, addWorkOrder } = useData();
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [workOrderType, setWorkOrderType] = useState<'cleaning' | 'maintenance'>('cleaning');
  const [workOrderTitle, setWorkOrderTitle] = useState('');
  const [workOrderDesc, setWorkOrderDesc] = useState('');
  const [workOrderPriority, setWorkOrderPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editForm, setEditForm] = useState({
    roomNumber: '',
    type: 'standard' as RoomType,
    floor: 1,
    area: 25,
    capacity: 2,
    facilities: '',
    orientation: '朝南',
    basePrice: 288,
    description: '',
  });

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesType = typeFilter === 'all' || room.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewRoom = (room: Room) => {
    setSelectedRoom(room);
    setShowDetailModal(true);
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setEditForm({
      roomNumber: room.roomNumber,
      type: room.type,
      floor: room.floor,
      area: room.area,
      capacity: room.capacity,
      facilities: room.facilities.join(', '),
      orientation: room.orientation,
      basePrice: room.basePrice,
      description: room.description,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (selectedRoom) {
      const updatedRoom: Room = {
        ...selectedRoom,
        roomNumber: editForm.roomNumber,
        type: editForm.type,
        floor: editForm.floor,
        area: editForm.area,
        capacity: editForm.capacity,
        facilities: editForm.facilities.split(',').map(f => f.trim()).filter(Boolean),
        orientation: editForm.orientation,
        basePrice: editForm.basePrice,
        description: editForm.description,
      };
      updateRoom(updatedRoom);
      setShowEditModal(false);
    }
  };

  const handleCreateWorkOrder = () => {
    if (selectedRoom && workOrderTitle) {
      const newWorkOrder = {
        id: generateId(),
        roomId: selectedRoom.id,
        roomNumber: selectedRoom.roomNumber,
        type: workOrderType,
        status: 'pending' as const,
        priority: workOrderPriority,
        title: workOrderTitle,
        description: workOrderDesc,
        createdBy: 'current_user',
        createdAt: new Date().toISOString(),
      };
      addWorkOrder(newWorkOrder as any);
      setShowWorkOrderModal(false);
      setWorkOrderTitle('');
      setWorkOrderDesc('');
    }
  };

  const handleStatusChange = (room: Room, newStatus: RoomStatus) => {
    const updatedRoom = { ...room, status: newStatus };
    updateRoom(updatedRoom);
    if (selectedRoom?.id === room.id) {
      setSelectedRoom(updatedRoom);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">客房管理</h1>
          <p className="text-gray-500 mt-1">管理所有客房信息、状态和工单</p>
        </div>
        {hasPermission(['admin', 'manager']) && (
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            新增客房
          </Button>
        )}
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索房间号或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'available', label: '空闲' },
                { value: 'booked', label: '已预订' },
                { value: 'occupied', label: '已入住' },
                { value: 'cleaning', label: '待清洁' },
                { value: 'maintenance', label: '维修中' },
              ]}
              className="w-40"
            />
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'all', label: '全部类型' },
                { value: 'standard', label: '标准间' },
                { value: 'king', label: '大床房' },
                { value: 'deluxe', label: '豪华间' },
                { value: 'suite', label: '套房' },
              ]}
              className="w-40"
            />
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRooms.map(room => (
              <div
                key={room.id}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900">{room.roomNumber}</span>
                    <span className={`w-3 h-3 rounded-full ${getRoomStatusDot(room.status)}`}></span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">{getRoomTypeName(room.type)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getRoomStatusColor(room.status)}`}>
                      {getRoomStatusName(room.status)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <div className="flex justify-between">
                      <span>楼层</span>
                      <span>{room.floor}F</span>
                    </div>
                    <div className="flex justify-between">
                      <span>面积</span>
                      <span>{room.area}㎡</span>
                    </div>
                    <div className="flex justify-between">
                      <span>可住人数</span>
                      <span>{room.capacity}人</span>
                    </div>
                    <div className="flex justify-between font-medium mt-2">
                      <span>价格</span>
                      <span className="text-primary">{formatCurrency(room.basePrice)}/晚</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {room.facilities.slice(0, 4).map((facility, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {facility}
                      </span>
                    ))}
                    {room.facilities.length > 4 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        +{room.facilities.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewRoom(room)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      详情
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditRoom(room)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      编辑
                    </Button>
                    <div className="relative group">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[140px] whitespace-nowrap">
                        <button
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                          onClick={() => {
                            setSelectedRoom(room);
                            setWorkOrderType('cleaning');
                            setWorkOrderTitle('客房清洁');
                            setShowWorkOrderModal(true);
                          }}
                        >
                          <Sparkles className="w-4 h-4" />
                          清洁工单
                        </button>
                        <button
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-b-lg"
                          onClick={() => {
                            setSelectedRoom(room);
                            setWorkOrderType('maintenance');
                            setWorkOrderTitle('');
                            setShowWorkOrderModal(true);
                          }}
                        >
                          <Wrench className="w-4 h-4" />
                          维修工单
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredRooms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">没有找到匹配的客房</p>
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`客房详情 - ${selectedRoom?.roomNumber}`}
        size="lg"
      >
        {selectedRoom && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">房间类型</p>
                <p className="font-medium">{getRoomTypeName(selectedRoom.type)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">当前状态</p>
                <span className={`inline-block text-sm px-2 py-1 rounded-full ${getRoomStatusColor(selectedRoom.status)}`}>
                  {getRoomStatusName(selectedRoom.status)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">楼层</p>
                <p className="font-medium">{selectedRoom.floor}F</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">面积</p>
                <p className="font-medium">{selectedRoom.area} 平方米</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">可住人数</p>
                <p className="font-medium">{selectedRoom.capacity} 人</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">朝向</p>
                <p className="font-medium">{selectedRoom.orientation}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">基础价格</p>
                <p className="font-medium text-lg text-primary">{formatCurrency(selectedRoom.basePrice)}/晚</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">设施配置</p>
              <div className="flex flex-wrap gap-2">
                {selectedRoom.facilities.map((facility, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {facility}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">房间描述</p>
              <p className="text-gray-700">{selectedRoom.description}</p>
            </div>

            {(selectedRoom.lastCleaned || selectedRoom.maintenanceDate) && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                {selectedRoom.lastCleaned && (
                  <div>
                    <p className="text-sm text-gray-500">上次清洁</p>
                    <p className="font-medium">{selectedRoom.lastCleaned}</p>
                  </div>
                )}
                {selectedRoom.maintenanceDate && (
                  <div>
                    <p className="text-sm text-gray-500">维护日期</p>
                    <p className="font-medium">{selectedRoom.maintenanceDate}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Select
                label="更新房间状态"
                value={selectedRoom.status}
                onChange={(e) => handleStatusChange(selectedRoom, e.target.value as RoomStatus)}
                options={[
                  { value: 'available', label: '空闲' },
                  { value: 'booked', label: '已预订' },
                  { value: 'occupied', label: '已入住' },
                  { value: 'cleaning', label: '待清洁' },
                  { value: 'maintenance', label: '维修中' },
                ]}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`编辑客房 - ${selectedRoom?.roomNumber}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="房间号"
              value={editForm.roomNumber}
              onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })}
            />
            <Select
              label="房间类型"
              value={editForm.type}
              onChange={(e) => setEditForm({ ...editForm, type: e.target.value as RoomType })}
              options={[
                { value: 'standard', label: '标准间' },
                { value: 'king', label: '大床房' },
                { value: 'deluxe', label: '豪华间' },
                { value: 'suite', label: '套房' },
              ]}
            />
            <Input
              label="楼层"
              type="number"
              value={editForm.floor}
              onChange={(e) => setEditForm({ ...editForm, floor: parseInt(e.target.value) || 1 })}
            />
            <Input
              label="面积 (㎡)"
              type="number"
              value={editForm.area}
              onChange={(e) => setEditForm({ ...editForm, area: parseInt(e.target.value) || 25 })}
            />
            <Input
              label="可住人数"
              type="number"
              value={editForm.capacity}
              onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) || 2 })}
            />
            <Select
              label="朝向"
              value={editForm.orientation}
              onChange={(e) => setEditForm({ ...editForm, orientation: e.target.value })}
              options={[
                { value: '朝南', label: '朝南' },
                { value: '朝北', label: '朝北' },
                { value: '朝东', label: '朝东' },
                { value: '朝西', label: '朝西' },
              ]}
            />
            <Input
              label="基础价格 (元/晚)"
              type="number"
              value={editForm.basePrice}
              onChange={(e) => setEditForm({ ...editForm, basePrice: parseInt(e.target.value) || 0 })}
            />
          </div>
          <Input
            label="设施配置 (用逗号分隔)"
            value={editForm.facilities}
            onChange={(e) => setEditForm({ ...editForm, facilities: e.target.value })}
            hint="例如: WiFi, 空调, 电视, 独立卫浴"
          />
          <TextArea
            label="房间描述"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            rows={3}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowEditModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              保存修改
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showWorkOrderModal}
        onClose={() => setShowWorkOrderModal(false)}
        title={`创建工单 - ${selectedRoom?.roomNumber}`}
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="工单类型"
            value={workOrderType}
            onChange={(e) => setWorkOrderType(e.target.value as 'cleaning' | 'maintenance')}
            options={[
              { value: 'cleaning', label: '清洁工单' },
              { value: 'maintenance', label: '维修工单' },
            ]}
          />
          <Select
            label="优先级"
            value={workOrderPriority}
            onChange={(e) => setWorkOrderPriority(e.target.value as 'low' | 'medium' | 'high')}
            options={[
              { value: 'low', label: '低' },
              { value: 'medium', label: '中' },
              { value: 'high', label: '高' },
            ]}
          />
          <Input
            label="工单标题"
            value={workOrderTitle}
            onChange={(e) => setWorkOrderTitle(e.target.value)}
            placeholder="请输入工单标题"
          />
          <TextArea
            label="详细描述"
            value={workOrderDesc}
            onChange={(e) => setWorkOrderDesc(e.target.value)}
            placeholder="请详细描述问题或需求..."
            rows={4}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowWorkOrderModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleCreateWorkOrder}>
              创建工单
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Rooms;
