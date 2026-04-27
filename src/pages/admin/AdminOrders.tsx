import React, { useEffect, useState } from 'react';
import {
  Search,
  Eye,
  X,
  Loader2,
  ChevronDown,
  Clock,
  Package,
  User,
  FileText,
  History,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import {
  getOrders,
  updateOrder,
  getOrderHistories
} from '../../data/services';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../../types';
import type { Order, OrderHistory } from '../../types';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const ordersData = await getOrders();
        setOrders(ordersData);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clientEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesPayment = filterPaymentStatus === 'all' || order.paymentStatus === filterPaymentStatus;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleViewDetail = async (order: Order) => {
    setSelectedOrder(order);
    try {
      const history = await getOrderHistories(order.id);
      setOrderHistory(history);
    } catch (error) {
      console.error('Failed to load order history:', error);
      setOrderHistory([]);
    }
    setShowDetail(true);
  };

  const handleUpdateStatus = async (newStatus: Order['status'], description: string) => {
    if (!selectedOrder) return;
    setSaving(true);

    try {
      const updated: Order = {
        ...selectedOrder,
        status: newStatus
      };
      await updateOrder(updated, {
        newStatus,
        description,
        createdBy: 'admin'
      });
      setSelectedOrder(updated);
      setOrders(orders.map(o => o.id === selectedOrder.id ? updated : o));
      
      const history = await getOrderHistories(selectedOrder.id);
      setOrderHistory(history);
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('更新失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status);
    switch (statusConfig?.color) {
      case 'yellow': return 'bg-yellow-100 text-yellow-700';
      case 'blue': return 'bg-blue-100 text-blue-700';
      case 'purple': return 'bg-purple-100 text-purple-700';
      case 'orange': return 'bg-orange-100 text-orange-700';
      case 'green': return 'bg-green-100 text-green-700';
      case 'red': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    const statusConfig = PAYMENT_STATUSES.find(s => s.value === status);
    switch (statusConfig?.color) {
      case 'yellow': return 'bg-yellow-100 text-yellow-700';
      case 'green': return 'bg-green-100 text-green-700';
      case 'blue': return 'bg-blue-100 text-blue-700';
      case 'red': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    return ORDER_STATUSES.find(s => s.value === status)?.label || status;
  };

  const getPaymentStatusLabel = (status: string) => {
    return PAYMENT_STATUSES.find(s => s.value === status)?.label || status;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">订单管理</h2>
          <p className="text-gray-500 mt-1">查看和管理所有设计服务订单</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总订单数</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待处理</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">进行中</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'in_progress').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总收益</p>
              <p className="text-2xl font-bold text-gray-900">
                ¥{orders
                  .filter(o => o.paymentStatus === 'paid')
                  .reduce((sum, o) => sum + o.totalAmount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索订单号、客户名称或邮箱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">全部状态</option>
                  {ORDER_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={filterPaymentStatus}
                  onChange={(e) => setFilterPaymentStatus(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">全部付款状态</option>
                  {PAYMENT_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {order.packageName}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.clientName}</p>
                        <p className="text-sm text-gray-500">{order.clientEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-lg font-semibold text-gray-900">
                        ¥{order.totalAmount.toLocaleString()}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}
                      >
                        {getPaymentStatusLabel(order.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                      {order.revisionsUsed > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          已修改 {order.revisionsUsed} 次
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewDetail(order)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">详情</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订单</h3>
                    <p className="text-gray-500">
                      {searchQuery || filterStatus !== 'all' || filterPaymentStatus !== 'all'
                        ? '没有找到匹配的订单，请尝试其他搜索条件'
                        : '暂无订单数据'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDetail && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDetail(false)} />

            <div className="relative bg-white rounded-2xl shadow-xl transform transition-all sm:my-8 sm:max-w-3xl sm:w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  订单详情 - {selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => setShowDetail(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-6 text-left max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      客户信息
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm"><span className="text-gray-500">姓名：</span>{selectedOrder.clientName}</p>
                      <p className="text-sm"><span className="text-gray-500">邮箱：</span>{selectedOrder.clientEmail}</p>
                      <p className="text-sm"><span className="text-gray-500">电话：</span>{selectedOrder.clientPhone || '-'}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      订单信息
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-gray-500">服务套餐：</span>
                        {selectedOrder.packageName}
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">订单状态：</span>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusLabel(selectedOrder.status)}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">付款状态：</span>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                          {getPaymentStatusLabel(selectedOrder.paymentStatus)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    金额信息
                  </h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">套餐价格</p>
                      <p className="text-lg font-semibold">¥{selectedOrder.packagePrice.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">订单总额</p>
                      <p className="text-2xl font-bold text-purple-600">¥{selectedOrder.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {selectedOrder.requirements && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      项目需求
                    </h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedOrder.requirements}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">更新订单状态</h4>
                  <div className="flex flex-wrap gap-2">
                    {ORDER_STATUSES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => handleUpdateStatus(s.value as Order['status'], `状态更新为：${s.label}`)}
                        disabled={saving || selectedOrder.status === s.value}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          selectedOrder.status === s.value
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <History className="w-4 h-4 mr-2" />
                    订单历史
                  </h4>
                  <div className="space-y-3">
                    {orderHistory.length > 0 ? (
                      orderHistory.map((item, index) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-purple-500' : 'bg-gray-300'}`} />
                            {index < orderHistory.length - 1 && (
                              <div className="w-0.5 h-8 bg-gray-200" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="text-sm font-medium text-gray-900">
                              {item.description}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <span>操作人：{item.createdBy}</span>
                              <span>•</span>
                              <span>{formatDate(item.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">暂无订单历史记录</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowDetail(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
