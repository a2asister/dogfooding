import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, History, Percent, Tag, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, Select, TextArea } from '@/components/ui/Input';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, getRoomTypeName, getPriceTypeName } from '@/utils';
import type { PriceStrategy, RoomType, PriceType } from '@/types';
import { ROOM_TYPE_NAMES, PRICE_TYPE_NAMES } from '@/types';
import { mockPriceHistory } from '@/data/mockData';

const Pricing: React.FC = () => {
  const { priceStrategies, discounts, updatePriceStrategy, updateDiscount } = useData();
  const { hasPermission } = useAuth();
  
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');
  const [selectedPriceType, setSelectedPriceType] = useState<string>('all');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<PriceStrategy | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredStrategies = priceStrategies.filter(strategy => {
    const matchesRoomType = selectedRoomType === 'all' || strategy.roomType === selectedRoomType;
    const matchesPriceType = selectedPriceType === 'all' || strategy.priceType === selectedPriceType;
    return matchesRoomType && matchesPriceType;
  });

  const roomTypeOptions = [
    { value: 'all', label: '全部类型' },
    ...Object.entries(ROOM_TYPE_NAMES).map(([value, label]) => ({ value, label })),
  ];

  const priceTypeOptions = [
    { value: 'all', label: '全部价格类型' },
    ...Object.entries(PRICE_TYPE_NAMES).map(([value, label]) => ({ value, label })),
  ];

  const getPriceTypeIcon = (type: PriceType) => {
    switch (type) {
      case 'base': return <Tag className="w-5 h-5" />;
      case 'weekend': return <Percent className="w-5 h-5" />;
      case 'holiday': return <TrendingUp className="w-5 h-5" />;
      default: return <Tag className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">价格管理</h1>
          <p className="text-gray-500 mt-1">管理价格策略、优惠活动和调价记录</p>
        </div>
        {hasPermission(['admin', 'manager']) && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowHistoryModal(true)}>
              <History className="w-4 h-4 mr-2" />
              调价记录
            </Button>
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              新增价格策略
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基础价格</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['standard', 'king', 'deluxe', 'suite'].map(type => {
                const strategy = priceStrategies.find(s => s.roomType === type && s.priceType === 'base');
                return (
                  <div key={type} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-700">{getRoomTypeName(type as RoomType)}</span>
                    <span className="font-semibold text-gray-900">
                      {strategy ? formatCurrency(strategy.basePrice) : '-'}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">周末价格</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['standard', 'king', 'deluxe', 'suite'].map(type => {
                const strategy = priceStrategies.find(s => s.roomType === type && s.priceType === 'weekend');
                const base = priceStrategies.find(s => s.roomType === type && s.priceType === 'base');
                const markup = strategy && base ? Math.round(((strategy.basePrice - base.basePrice) / base.basePrice) * 100) : 0;
                return (
                  <div key={type} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <span className="text-gray-700">{getRoomTypeName(type as RoomType)}</span>
                      {markup > 0 && (
                        <span className="ml-2 text-xs text-orange-600">+{markup}%</span>
                      )}
                    </div>
                    <span className="font-semibold text-gray-900">
                      {strategy ? formatCurrency(strategy.basePrice) : '-'}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">优惠活动</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {discounts.slice(0, 4).map(discount => (
                <div key={discount.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{discount.name}</p>
                      <p className="text-sm text-gray-500">
                        {discount.type === 'percentage' ? `${discount.value}%` : formatCurrency(discount.value)}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      discount.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {discount.isActive ? '进行中' : '已结束'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <h3 className="font-semibold text-gray-900">价格策略列表</h3>
            <div className="flex-1" />
            <Select
              value={selectedRoomType}
              onChange={(e) => setSelectedRoomType(e.target.value)}
              options={roomTypeOptions}
              className="w-40"
            />
            <Select
              value={selectedPriceType}
              onChange={(e) => setSelectedPriceType(e.target.value)}
              options={priceTypeOptions}
              className="w-40"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">策略名称</th>
                <th className="px-4 py-3 font-medium">房间类型</th>
                <th className="px-4 py-3 font-medium">价格类型</th>
                <th className="px-4 py-3 font-medium">基础价格</th>
                <th className="px-4 py-3 font-medium">适用时间</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStrategies.map(strategy => (
                <tr key={strategy.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        {getPriceTypeIcon(strategy.priceType)}
                      </div>
                      <span className="font-medium text-gray-900">{strategy.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {getRoomTypeName(strategy.roomType)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {getPriceTypeName(strategy.priceType)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-900">{formatCurrency(strategy.basePrice)}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {strategy.startDate && strategy.endDate
                      ? `${strategy.startDate} ~ ${strategy.endDate}`
                      : strategy.daysOfWeek
                      ? `每周 ${strategy.daysOfWeek.map(d => ['日', '一', '二', '三', '四', '五', '六'][d]).join(',')}`
                      : strategy.minDays
                      ? `≥${strategy.minDays}天`
                      : '长期有效'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      strategy.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {strategy.isActive ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setSelectedStrategy(strategy);
                        setShowEditModal(true);
                      }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="价格调整历史"
        size="lg"
      >
        <div className="space-y-4">
          {mockPriceHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">暂无调价记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mockPriceHistory.map(history => (
                <div key={history.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{getRoomTypeName(history.roomType)}</span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                          {getPriceTypeName(history.priceType)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{history.reason}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 line-through">{formatCurrency(history.oldPrice)}</span>
                        <span className="text-lg font-semibold text-primary">
                          {formatCurrency(history.newPrice)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(history.changedAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Pricing;
