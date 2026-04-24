import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Save,
  Trash2,
  CreditCard,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, Select, TextArea } from '@/components/ui/Input';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import {
  formatCurrency,
  getOrderStatusName,
  getOrderStatusColor,
  getRoomTypeName,
  getPaymentStatusText,
  getPaymentStatusColor,
  getChannelText,
  formatDate,
  generateId,
  generateOrderNumber,
} from '@/utils';
import type { Order, OrderStatus, RoomType } from '@/types';
import { mockRooms } from '@/data/mockData';

const Orders: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { orders, updateOrder, addOrder, rooms, updateRoom, customers } = useData();
  const { hasPermission } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || order.channel === channelFilter;
    return matchesSearch && matchesStatus && matchesChannel;
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleCheckIn = (order: Order) => {
    if (order.status === 'confirmed') {
      const updatedOrder: Order = {
        ...order,
        status: 'checked_in',
        checkedInAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updateOrder(updatedOrder);
      
      if (order.roomId) {
        const room = rooms.find(r => r.id === order.roomId);
        if (room) {
          updateRoom({ ...room, status: 'occupied' });
        }
      }
    }
  };

  const handleCheckOut = (order: Order) => {
    if (order.status === 'checked_in') {
      const updatedOrder: Order = {
        ...order,
        status: 'checked_out',
        checkedOutAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updateOrder(updatedOrder);
      
      if (order.roomId) {
        const room = rooms.find(r => r.id === order.roomId);
        if (room) {
          updateRoom({ ...room, status: 'cleaning' });
        }
      }
    }
  };

  const handleCancelOrder = (order: Order) => {
    if (['pending', 'confirmed'].includes(order.status)) {
      const updatedOrder: Order = {
        ...order,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updateOrder(updatedOrder);
      
      if (order.roomId && order.status !== 'checked_in') {
        const room = rooms.find(r => r.id === order.roomId);
        if (room) {
          updateRoom({ ...room, status: 'available' });
        }
      }
    }
  };

  if (id) {
    const order = orders.find(o => o.id === id);
    if (!order) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </div>
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">订单不存在</p>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">订单详情</h1>
              <p className="text-gray-500 mt-1">{order.orderNumber}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {order.status === 'confirmed' && hasPermission(['admin', 'manager', 'reception']) && (
              <Button variant="success" onClick={() => handleCheckIn(order)}>
                <CheckCircle className="w-4 h-4 mr-2" />
                办理入住
              </Button>
            )}
            {order.status === 'checked_in' && hasPermission(['admin', 'manager', 'reception']) && (
              <Button variant="primary" onClick={() => handleCheckOut(order)}>
                <XCircle className="w-4 h-4 mr-2" />
                办理退房
              </Button>
            )}
            {['pending', 'confirmed'].includes(order.status) && hasPermission(['admin', 'manager', 'reception']) && (
              <Button variant="danger" onClick={() => handleCancelOrder(order)}>
                <Trash2 className="w-4 h-4 mr-2" />
                取消订单
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">订单编号</p>
                  <p className="font-medium mt-1">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">订单状态</p>
                  <span className={`inline-block text-sm px-2 py-1 rounded-full mt-1 ${getOrderStatusColor(order.status)}`}>
                    {getOrderStatusName(order.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">预订渠道</p>
                  <p className="font-medium mt-1">{getChannelText(order.channel)}{order.source ? ` - ${order.source}` : ''}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">支付状态</p>
                  <span className={`inline-block text-sm px-2 py-1 rounded-full mt-1 ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {getPaymentStatusText(order.paymentStatus)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">创建时间</p>
                  <p className="font-medium mt-1">{formatDate(order.createdAt, 'yyyy-MM-dd HH:mm')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">更新时间</p>
                  <p className="font-medium mt-1">{formatDate(order.updatedAt, 'yyyy-MM-dd HH:mm')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>客户信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">客户姓名</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">联系电话</p>
                <p className="font-medium">{order.customerPhone}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>入住信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">房间类型</p>
                  <p className="font-medium mt-1">{getRoomTypeName(order.roomType)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">房间号</p>
                  <p className="font-medium mt-1">{order.roomNumber || '未分配'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">入住日期</p>
                  <p className="font-medium mt-1">{order.checkInDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">退房日期</p>
                  <p className="font-medium mt-1">{order.checkOutDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">入住天数</p>
                  <p className="font-medium mt-1">{order.nights} 晚</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">入住人数</p>
                  <p className="font-medium mt-1">{order.guests} 人</p>
                </div>
              </div>
              
              {order.specialRequests && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800 font-medium">特殊需求</p>
                  <p className="text-sm text-yellow-700 mt-1">{order.specialRequests}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>费用明细</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">房费 ({order.nights}晚)</span>
                <span className="font-medium">{formatCurrency(order.baseAmount)}</span>
              </div>
              
              {order.extraCharges.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">额外费用</p>
                  {order.extraCharges.map(charge => (
                    <div key={charge.id} className="flex justify-between">
                      <span className="text-gray-600">{charge.name} ({charge.quantity}{charge.unit})</span>
                      <span className="font-medium">{formatCurrency(charge.amount * charge.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {order.discountAmount > 0 && (
                <div className="flex justify-between py-3 border-b border-gray-100 text-green-600">
                  <span>优惠减免</span>
                  <span className="font-medium">-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between py-3 bg-blue-50 rounded-lg px-4">
                <span className="font-medium text-gray-900">合计</span>
                <span className="font-bold text-lg text-primary">{formatCurrency(order.totalAmount)}</span>
              </div>
              
              <div className="flex justify-between pt-4">
                <span className="text-gray-600">已支付</span>
                <span className="font-medium text-green-600">{formatCurrency(order.paidAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">待支付</span>
                <span className={`font-medium ${order.totalAmount - order.paidAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatCurrency(order.totalAmount - order.paidAmount)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
          <p className="text-gray-500 mt-1">管理所有订单、办理入住退房</p>
        </div>
        {hasPermission(['admin', 'manager', 'reception']) && (
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            新建订单
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
                  placeholder="搜索订单号、客户姓名、电话..."
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
                { value: 'pending', label: '待确认' },
                { value: 'confirmed', label: '已确认' },
                { value: 'checked_in', label: '已入住' },
                { value: 'checked_out', label: '已退房' },
                { value: 'cancelled', label: '已取消' },
              ]}
              className="w-40"
            />
            <Select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              options={[
                { value: 'all', label: '全部渠道' },
                { value: 'online', label: '线上' },
                { value: 'offline', label: '线下' },
                { value: 'third_party', label: '第三方' },
              ]}
              className="w-40"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">订单号</th>
                <th className="px-4 py-3 font-medium">客户</th>
                <th className="px-4 py-3 font-medium">房间</th>
                <th className="px-4 py-3 font-medium">入住日期</th>
                <th className="px-4 py-3 font-medium">退房日期</th>
                <th className="px-4 py-3 font-medium">金额</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">渠道</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-primary">{order.orderNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-sm text-gray-500">{order.customerPhone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{getRoomTypeName(order.roomType)}</p>
                      <p className="text-sm text-gray-500">{order.roomNumber || '未分配'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.checkInDate}</td>
                  <td className="px-4 py-3 text-gray-600">{order.checkOutDate}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{formatCurrency(order.totalAmount)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs px-2 py-1 rounded-full ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusName(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {getChannelText(order.channel)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {order.status === 'confirmed' && (
                        <Button variant="success" size="sm" onClick={() => handleCheckIn(order)}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {order.status === 'checked_in' && (
                        <Button variant="primary" size="sm" onClick={() => handleCheckOut(order)}>
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">没有找到匹配的订单</p>
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`订单详情 - ${selectedOrder?.orderNumber}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">客户姓名</p>
                <p className="font-medium">{selectedOrder.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">联系电话</p>
                <p className="font-medium">{selectedOrder.customerPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">房间类型</p>
                <p className="font-medium">{getRoomTypeName(selectedOrder.roomType)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">房间号</p>
                <p className="font-medium">{selectedOrder.roomNumber || '未分配'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">入住日期</p>
                <p className="font-medium">{selectedOrder.checkInDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">退房日期</p>
                <p className="font-medium">{selectedOrder.checkOutDate}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">房费</span>
                <span>{formatCurrency(selectedOrder.baseAmount)}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>优惠</span>
                  <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200 font-medium">
                <span>合计</span>
                <span className="text-primary">{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowDetailModal(false)}>
                关闭
              </Button>
              {['pending', 'confirmed'].includes(selectedOrder.status) && (
                <Button variant="danger" onClick={() => handleCancelOrder(selectedOrder)}>
                  取消订单
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="新建订单"
        size="lg"
      >
        <CreateOrderForm
          onSubmit={(order) => {
            addOrder(order);
            setShowCreateModal(false);
          }}
          onCancel={() => setShowCreateModal(false)}
          availableRooms={rooms.filter(r => r.status === 'available')}
          customers={customers}
        />
      </Modal>
    </div>
  );
};

interface CreateOrderFormProps {
  onSubmit: (order: Order) => void;
  onCancel: () => void;
  availableRooms: typeof mockRooms;
  customers: any[];
}

const CreateOrderForm: React.FC<CreateOrderFormProps> = ({ onSubmit, onCancel, availableRooms, customers }) => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerId: '',
    roomType: 'standard' as RoomType,
    roomId: '',
    checkInDate: today,
    checkOutDate: tomorrow,
    guests: 2,
    baseAmount: 288,
    discountAmount: 0,
    channel: 'offline' as const,
    source: '',
    specialRequests: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedRoom = availableRooms.find(r => r.id === formData.roomId);
    const nights = Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24));
    
    const newOrder: Order = {
      id: generateId(),
      orderNumber: generateOrderNumber(),
      customerId: formData.customerId || generateId(),
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      roomId: formData.roomId || undefined,
      roomNumber: selectedRoom?.roomNumber,
      roomType: formData.roomType,
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate,
      nights: nights || 1,
      guests: formData.guests,
      baseAmount: formData.baseAmount,
      discountAmount: formData.discountAmount,
      extraCharges: [],
      totalAmount: formData.baseAmount - formData.discountAmount,
      paidAmount: 0,
      paymentStatus: 'pending',
      status: 'pending',
      channel: formData.channel,
      source: formData.source || undefined,
      specialRequests: formData.specialRequests || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    onSubmit(newOrder);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="客户姓名"
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
          placeholder="请输入客户姓名"
          required
        />
        <Input
          label="联系电话"
          value={formData.customerPhone}
          onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
          placeholder="请输入联系电话"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="房间类型"
          value={formData.roomType}
          onChange={(e) => setFormData({ ...formData, roomType: e.target.value as RoomType })}
          options={[
            { value: 'standard', label: '标准间' },
            { value: 'king', label: '大床房' },
            { value: 'deluxe', label: '豪华间' },
            { value: 'suite', label: '套房' },
          ]}
        />
        <Select
          label="分配房间 (可选)"
          value={formData.roomId}
          onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
          options={[
            { value: '', label: '暂不分配' },
            ...availableRooms.map(r => ({ value: r.id, label: `${r.roomNumber} - ${getRoomTypeName(r.type)} (${formatCurrency(r.basePrice)}/晚)` })),
          ]}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="入住日期"
          type="date"
          value={formData.checkInDate}
          onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
          required
        />
        <Input
          label="退房日期"
          type="date"
          value={formData.checkOutDate}
          onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="入住人数"
          type="number"
          value={formData.guests}
          onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) || 1 })}
          min={1}
          required
        />
        <Select
          label="预订渠道"
          value={formData.channel}
          onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
          options={[
            { value: 'online', label: '线上' },
            { value: 'offline', label: '线下' },
            { value: 'third_party', label: '第三方' },
          ]}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="房费金额"
          type="number"
          value={formData.baseAmount}
          onChange={(e) => setFormData({ ...formData, baseAmount: parseInt(e.target.value) || 0 })}
          required
        />
        <Input
          label="优惠金额"
          type="number"
          value={formData.discountAmount}
          onChange={(e) => setFormData({ ...formData, discountAmount: parseInt(e.target.value) || 0 })}
        />
      </div>
      
      <TextArea
        label="特殊需求"
        value={formData.specialRequests}
        onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
        placeholder="例如：无烟房、加床、延迟退房等"
        rows={2}
      />
      
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" variant="primary">
          创建订单
        </Button>
      </div>
    </form>
  );
};

export default Orders;
